"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { Supplier } from "@/types"
import { SRI_LANKAN_DISTRICTS, PAYMENT_TERMS } from "@/constants/sri-lanka"
import { validateSriLankanPhone, validateEmail, formatSriLankanPhone } from "@/utils/validation"

export default function SuppliersTab() {
  const { state, dispatch } = useInventory()
  const { suppliers, categories } = state

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    category: "",
    paymentTerms: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Company name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!validateSriLankanPhone(formData.phone)) newErrors.phone = "Invalid Sri Lankan phone number"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.district) newErrors.district = "District is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!formData.paymentTerms) newErrors.paymentTerms = "Payment terms are required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      district: "",
      category: "",
      paymentTerms: "",
      notes: "",
    })
    setErrors({})
    setEditingSupplier(null)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const supplierData: Supplier = {
      id: editingSupplier?.id || `sup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formatSriLankanPhone(formData.phone),
      email: formData.email.trim(),
      address: formData.address.trim(),
      district: formData.district,
      category: formData.category.trim(),
      paymentTerms: formData.paymentTerms,
      status: "Active",
      totalOrders: editingSupplier?.totalOrders || 0,
      lastOrderDate: editingSupplier?.lastOrderDate || "",
      notes: formData.notes.trim(),
      createdAt: editingSupplier?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingSupplier) {
      dispatch({ type: "UPDATE_SUPPLIER", payload: supplierData })
    } else {
      dispatch({ type: "ADD_SUPPLIER", payload: supplierData })
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      district: supplier.district,
      category: supplier.category,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      dispatch({ type: "DELETE_SUPPLIER", payload: id })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground">Manage your supplier relationships</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Enter supplier details"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lanka Rice Mills"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g., Mr. Perera"
                    className={errors.contactPerson ? "border-red-500" : ""}
                  />
                  {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+94 11 234 5678"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@example.lk"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                  >
                    <SelectTrigger className={errors.district ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SRI_LANKAN_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.isActive)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms *</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                  >
                    <SelectTrigger className={errors.paymentTerms ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentTerms && <p className="text-sm text-red-500">{errors.paymentTerms}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the supplier"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingSupplier ? "Update Supplier" : "Add Supplier"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No suppliers yet</h3>
            <p className="text-muted-foreground">Add your first supplier to get started</p>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.category}</CardDescription>
                  </div>
                  <Badge variant={supplier.status === "Active" ? "default" : "secondary"}>{supplier.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.district}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">Payment Terms</div>
                    <div className="font-medium">{supplier.paymentTerms}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Orders</div>
                    <div className="font-medium">{supplier.totalOrders}</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(supplier)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
