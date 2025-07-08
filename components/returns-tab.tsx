"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, RotateCcw, RefreshCw } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { ReturnItem } from "@/types"
import { formatCurrency } from "@/utils/currency"

export default function ReturnsTab() {
  const { state, dispatch } = useInventory()
  const { returns, products, businessSettings } = state

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingReturn, setEditingReturn] = useState<ReturnItem | null>(null)
  const [formData, setFormData] = useState({
    type: "Customer Return" as "Customer Return" | "Supplier Return",
    productId: "",
    quantity: "",
    reason: "",
    refundAmount: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currency = businessSettings?.currency || "LKR"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) newErrors.productId = "Product is required"
    if (!formData.quantity || Number.parseInt(formData.quantity) <= 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    if (!formData.refundAmount || Number.parseFloat(formData.refundAmount) < 0)
      newErrors.refundAmount = "Valid refund amount is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      type: "Customer Return",
      productId: "",
      quantity: "",
      reason: "",
      refundAmount: "",
      notes: "",
    })
    setErrors({})
    setEditingReturn(null)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const product = products.find((p) => p.id === formData.productId)
    if (!product) return

    const returnData: ReturnItem = {
      id: editingReturn?.id || `RET-${Date.now()}`,
      type: formData.type,
      productId: product.id,
      product: product.name,
      sku: product.sku,
      quantity: Number.parseInt(formData.quantity),
      reason: formData.reason,
      status: "Pending",
      returnDate: new Date().toISOString().split("T")[0],
      refundAmount: Number.parseFloat(formData.refundAmount),
      notes: formData.notes,
      createdAt: editingReturn?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingReturn) {
      dispatch({ type: "UPDATE_RETURN", payload: returnData })
    } else {
      dispatch({ type: "ADD_RETURN", payload: returnData })
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (returnItem: ReturnItem) => {
    setEditingReturn(returnItem)
    setFormData({
      type: returnItem.type,
      productId: returnItem.productId,
      quantity: returnItem.quantity.toString(),
      reason: returnItem.reason,
      refundAmount: returnItem.refundAmount.toString(),
      notes: returnItem.notes || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleStatusUpdate = (returnItem: ReturnItem, newStatus: "Approved" | "Processed" | "Rejected") => {
    const updatedReturn = { ...returnItem, status: newStatus, updatedAt: new Date().toISOString() }
    dispatch({ type: "UPDATE_RETURN", payload: updatedReturn })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Approved":
        return "default"
      case "Processed":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "Customer Return" ? <RotateCcw className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Returns Management</h2>
          <p className="text-muted-foreground">Handle customer and supplier returns</p>
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
              Add Return
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReturn ? "Edit Return" : "Add New Return"}</DialogTitle>
              <DialogDescription>
                {editingReturn ? "Update return details" : "Record a new product return"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Return Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Customer Return" | "Supplier Return") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Return">Customer Return</SelectItem>
                    <SelectItem value="Supplier Return">Supplier Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger className={errors.productId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount ({currency}) *</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    value={formData.refundAmount}
                    onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                    placeholder="0.00"
                    className={errors.refundAmount ? "border-red-500" : ""}
                  />
                  {errors.refundAmount && <p className="text-sm text-red-500">{errors.refundAmount}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Defective, Wrong item, Damaged"
                  className={errors.reason ? "border-red-500" : ""}
                />
                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the return"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingReturn ? "Update Return" : "Add Return"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Returns History</CardTitle>
          <CardDescription>Track all product returns and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No returns recorded</h3>
              <p className="text-muted-foreground">Returns will appear here when added</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns
                    .sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime())
                    .map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-mono text-sm">{returnItem.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(returnItem.type)}
                            <span className="text-sm">{returnItem.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.product}</div>
                            <div className="text-sm text-muted-foreground">{returnItem.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{returnItem.quantity}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{returnItem.reason}</div>
                            {returnItem.notes && (
                              <div className="text-xs text-muted-foreground">{returnItem.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(returnItem.refundAmount, currency)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(returnItem.status) as any}>{returnItem.status}</Badge>
                        </TableCell>
                        <TableCell>{returnItem.returnDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(returnItem)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {returnItem.status === "Pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(returnItem, "Approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(returnItem, "Rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {returnItem.status === "Approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(returnItem, "Processed")}
                              >
                                Process
                              </Button>
                            )}
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
    </div>
  )
}
