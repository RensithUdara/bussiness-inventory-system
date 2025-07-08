"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useInventory } from "@/contexts/inventory-context"
import type { BusinessSettings, Category, Supplier } from "@/types"
import { SRI_LANKAN_DISTRICTS, COMMON_PRODUCT_CATEGORIES, PAYMENT_TERMS } from "@/constants/sri-lanka"
import { validateSriLankanPhone, validateEmail, formatSriLankanPhone } from "@/utils/validation"
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  Users,
  Tags,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

export default function SystemSetup() {
  const { state, dispatch } = useInventory()
  const [activeTab, setActiveTab] = useState("business")
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(state.businessSettings)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [newSupplier, setNewSupplier] = useState({
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
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")

  const handleBusinessSettingsSubmit = () => {
    dispatch({ type: "UPDATE_BUSINESS_SETTINGS", payload: businessSettings })
  }

  const handleAddCommonCategories = () => {
    COMMON_PRODUCT_CATEGORIES.forEach((categoryName) => {
      const category: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName,
        description: `Common Sri Lankan shop category: ${categoryName}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: "ADD_CATEGORY", payload: category })
    })
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return

    const category: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newCategory.name,
      description: newCategory.description,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_CATEGORY", payload: category })
    setNewCategory({ name: "", description: "" })
    setIsCategoryDialogOpen(false)
  }

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim() || !validateSriLankanPhone(newSupplier.phone) || !validateEmail(newSupplier.email))
      return

    const supplier: Supplier = {
      id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson,
      phone: formatSriLankanPhone(newSupplier.phone),
      email: newSupplier.email,
      address: newSupplier.address,
      district: newSupplier.district,
      category: newSupplier.category,
      paymentTerms: newSupplier.paymentTerms,
      status: "Active",
      totalOrders: 0,
      lastOrderDate: "",
      notes: newSupplier.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_SUPPLIER", payload: supplier })
    setNewSupplier({
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
    setIsSupplierDialogOpen(false)
  }

  const handleCompleteSetup = () => {
    if (businessSettings.companyName && state.categories.length > 0) {
      dispatch({ type: "COMPLETE_SETUP" })
    }
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `inventory-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const handleImportData = () => {
    try {
      const parsedData = JSON.parse(importData)
      dispatch({ type: "LOAD_DATA", payload: parsedData })
      setImportData("")
      alert("Data imported successfully!")
    } catch (error) {
      alert("Invalid data format. Please check your JSON file.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                System Setup
              </h1>
              <p className="text-slate-600 text-lg mt-2">Configure your inventory management system</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-200/60">
              <div
                className={`flex items-center gap-2 ${businessSettings.companyName ? "text-green-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${businessSettings.companyName ? "bg-green-100" : "bg-slate-100"}`}
                >
                  {businessSettings.companyName ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">1</span>
                  )}
                </div>
                <span className="text-sm font-medium">Business Info</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <div
                className={`flex items-center gap-2 ${state.categories.length > 0 ? "text-green-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${state.categories.length > 0 ? "bg-green-100" : "bg-slate-100"}`}
                >
                  {state.categories.length > 0 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">2</span>
                  )}
                </div>
                <span className="text-sm font-medium">Categories</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <div
                className={`flex items-center gap-2 ${state.suppliers.length > 0 ? "text-green-600" : "text-slate-400"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${state.suppliers.length > 0 ? "bg-green-100" : "bg-slate-100"}`}
                >
                  {state.suppliers.length > 0 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">3</span>
                  )}
                </div>
                <span className="text-sm font-medium">Suppliers</span>
              </div>
            </div>
          </div>

          {/* Export/Import Actions */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="bg-white/60 backdrop-blur-sm border-slate-200/60"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import System Data</DialogTitle>
                  <DialogDescription>Paste your exported JSON data below</DialogDescription>
                </DialogHeader>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste JSON data here..."
                  rows={10}
                  className="border-slate-200 focus:border-blue-500"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportData("")}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportData} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Setup Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-slate-200/60 p-1 rounded-xl">
              <TabsTrigger
                value="business"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              >
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
              >
                <Tags className="h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Suppliers
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="business">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      Business Information
                    </CardTitle>
                    <CardDescription>Configure your company details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-medium">
                          Company Name *
                        </Label>
                        <Input
                          id="companyName"
                          value={businessSettings.companyName}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, companyName: e.target.value })}
                          placeholder="Your Shop Name"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={businessSettings.phone}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                          placeholder="+94 11 234 5678"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={businessSettings.address}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                        placeholder="Complete business address"
                        className="border-slate-200 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district" className="text-sm font-medium">
                          District
                        </Label>
                        <Select
                          value={businessSettings.district}
                          onValueChange={(value) => setBusinessSettings({ ...businessSettings, district: value })}
                        >
                          <SelectTrigger className="border-slate-200 focus:border-blue-500">
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={businessSettings.email}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                          placeholder="business@example.lk"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxRate" className="text-sm font-medium">
                          Tax Rate (%)
                        </Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={businessSettings.taxRate}
                          onChange={(e) =>
                            setBusinessSettings({
                              ...businessSettings,
                              taxRate: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold" className="text-sm font-medium">
                          Low Stock Threshold
                        </Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          value={businessSettings.lowStockThreshold}
                          onChange={(e) =>
                            setBusinessSettings({
                              ...businessSettings,
                              lowStockThreshold: Number.parseInt(e.target.value) || 10,
                            })
                          }
                          placeholder="10"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reorderPointDefault" className="text-sm font-medium">
                          Default Reorder Point
                        </Label>
                        <Input
                          id="reorderPointDefault"
                          type="number"
                          value={businessSettings.reorderPointDefault}
                          onChange={(e) =>
                            setBusinessSettings({
                              ...businessSettings,
                              reorderPointDefault: Number.parseInt(e.target.value) || 20,
                            })
                          }
                          placeholder="20"
                          className="border-slate-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleBusinessSettingsSubmit}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                    >
                      Save Business Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Tags className="h-4 w-4 text-white" />
                          </div>
                          Product Categories
                        </CardTitle>
                        <CardDescription>Manage your product categories</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleAddCommonCategories}
                          className="bg-white/60 backdrop-blur-sm border-slate-200/60"
                        >
                          Add Common Categories
                        </Button>
                        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Category
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Category</DialogTitle>
                              <DialogDescription>Create a new product category</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="categoryName" className="text-sm font-medium">
                                  Category Name *
                                </Label>
                                <Input
                                  id="categoryName"
                                  value={newCategory.name}
                                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                  placeholder="e.g., Rice & Grains"
                                  className="border-slate-200 focus:border-emerald-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="categoryDescription" className="text-sm font-medium">
                                  Description
                                </Label>
                                <Textarea
                                  id="categoryDescription"
                                  value={newCategory.description}
                                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                  placeholder="Optional description"
                                  className="border-slate-200 focus:border-emerald-500"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddCategory}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500"
                              >
                                Add Category
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.categories.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Tags className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No categories yet</h3>
                        <p className="text-slate-500">Add your first product category to get started</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow>
                              <TableHead className="font-semibold">Name</TableHead>
                              <TableHead className="font-semibold">Description</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Created</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {state.categories.map((category) => (
                              <TableRow key={category.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.description || "-"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={category.isActive ? "default" : "secondary"}
                                    className={category.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
                                  >
                                    {category.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="hover:bg-blue-50 bg-transparent">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => dispatch({ type: "DELETE_CATEGORY", payload: category.id })}
                                      className="hover:bg-red-50 text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suppliers">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          Suppliers
                        </CardTitle>
                        <CardDescription>Manage your supplier information</CardDescription>
                      </div>
                      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Supplier</DialogTitle>
                            <DialogDescription>Enter supplier details</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="supplierName" className="text-sm font-medium">
                                  Company Name *
                                </Label>
                                <Input
                                  id="supplierName"
                                  value={newSupplier.name}
                                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                  placeholder="Supplier Company Name"
                                  className="border-slate-200 focus:border-purple-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contactPerson" className="text-sm font-medium">
                                  Contact Person
                                </Label>
                                <Input
                                  id="contactPerson"
                                  value={newSupplier.contactPerson}
                                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                                  placeholder="Contact person name"
                                  className="border-slate-200 focus:border-purple-500"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="supplierPhone" className="text-sm font-medium">
                                  Phone *
                                </Label>
                                <Input
                                  id="supplierPhone"
                                  value={newSupplier.phone}
                                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                  placeholder="+94 11 234 5678"
                                  className="border-slate-200 focus:border-purple-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplierEmail" className="text-sm font-medium">
                                  Email *
                                </Label>
                                <Input
                                  id="supplierEmail"
                                  type="email"
                                  value={newSupplier.email}
                                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                  placeholder="supplier@example.lk"
                                  className="border-slate-200 focus:border-purple-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="supplierAddress" className="text-sm font-medium">
                                Address
                              </Label>
                              <Textarea
                                id="supplierAddress"
                                value={newSupplier.address}
                                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                placeholder="Complete address"
                                className="border-slate-200 focus:border-purple-500"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="supplierDistrict" className="text-sm font-medium">
                                  District
                                </Label>
                                <Select
                                  value={newSupplier.district}
                                  onValueChange={(value) => setNewSupplier({ ...newSupplier, district: value })}
                                >
                                  <SelectTrigger className="border-slate-200 focus:border-purple-500">
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
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplierCategory" className="text-sm font-medium">
                                  Category
                                </Label>
                                <Select
                                  value={newSupplier.category}
                                  onValueChange={(value) => setNewSupplier({ ...newSupplier, category: value })}
                                >
                                  <SelectTrigger className="border-slate-200 focus:border-purple-500">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {state.categories.map((category) => (
                                      <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="paymentTerms" className="text-sm font-medium">
                                  Payment Terms
                                </Label>
                                <Select
                                  value={newSupplier.paymentTerms}
                                  onValueChange={(value) => setNewSupplier({ ...newSupplier, paymentTerms: value })}
                                >
                                  <SelectTrigger className="border-slate-200 focus:border-purple-500">
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
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="supplierNotes" className="text-sm font-medium">
                                Notes
                              </Label>
                              <Textarea
                                id="supplierNotes"
                                value={newSupplier.notes}
                                onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                                placeholder="Additional notes"
                                className="border-slate-200 focus:border-purple-500"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSupplierDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddSupplier}
                              className="bg-gradient-to-r from-purple-500 to-pink-500"
                            >
                              Add Supplier
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.suppliers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No suppliers yet</h3>
                        <p className="text-slate-500">Add your first supplier to get started</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {state.suppliers.map((supplier) => (
                          <Card key={supplier.id} className="bg-white/40 border-slate-200/60">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                                  <CardDescription>{supplier.category}</CardDescription>
                                </div>
                                <Badge
                                  variant={supplier.status === "Active" ? "default" : "secondary"}
                                  className={
                                    supplier.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : ""
                                  }
                                >
                                  {supplier.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-sm">
                                <strong>Contact:</strong> {supplier.contactPerson}
                              </p>
                              <p className="text-sm">
                                <strong>Phone:</strong> {supplier.phone}
                              </p>
                              <p className="text-sm">
                                <strong>Email:</strong> {supplier.email}
                              </p>
                              <p className="text-sm">
                                <strong>District:</strong> {supplier.district}
                              </p>
                              <p className="text-sm">
                                <strong>Payment:</strong> {supplier.paymentTerms}
                              </p>
                              <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1 bg-transparent hover:bg-blue-50">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => dispatch({ type: "DELETE_SUPPLIER", payload: supplier.id })}
                                  className="hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      System Settings
                    </CardTitle>
                    <CardDescription>Configure system preferences and data management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Language</Label>
                        <Select
                          value={businessSettings.language}
                          onValueChange={(value: "en" | "si" | "ta") =>
                            setBusinessSettings({ ...businessSettings, language: value })
                          }
                        >
                          <SelectTrigger className="border-slate-200 focus:border-orange-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="si">Sinhala</SelectItem>
                            <SelectItem value="ta">Tamil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Time Format</Label>
                        <Select
                          value={businessSettings.timeFormat}
                          onValueChange={(value: "12h" | "24h") =>
                            setBusinessSettings({ ...businessSettings, timeFormat: value })
                          }
                        >
                          <SelectTrigger className="border-slate-200 focus:border-orange-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 Hour</SelectItem>
                            <SelectItem value="24h">24 Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
                          <div>
                            <h4 className="font-medium text-red-800">Reset System</h4>
                            <p className="text-sm text-red-600">Clear all data and start fresh</p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Are you sure? This will delete all data.")) {
                                dispatch({ type: "RESET_SYSTEM" })
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Complete Setup */}
          {!state.isSetupComplete && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800 text-lg">Complete Setup</h3>
                    <p className="text-sm text-green-600">Finish setting up your system to start managing inventory</p>
                  </div>
                  <Button
                    onClick={handleCompleteSetup}
                    disabled={!businessSettings.companyName || state.categories.length === 0}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg disabled:opacity-50"
                  >
                    Complete Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
