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
import { Plus, Edit, Trash2, ShoppingCart, Calendar } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { PurchaseOrder, PurchaseOrderItem } from "@/types"
import { formatCurrency } from "@/utils/currency"

export default function PurchaseOrdersTab() {
  const { state, dispatch } = useInventory()
  const { purchaseOrders, suppliers, products, businessSettings } = state

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    notes: "",
  })
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([])
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currency = businessSettings?.currency || "LKR"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplier) newErrors.supplier = "Supplier is required"
    if (!formData.orderDate) newErrors.orderDate = "Order date is required"
    if (!formData.expectedDate) newErrors.expectedDate = "Expected date is required"
    if (orderItems.length === 0) newErrors.items = "At least one item is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      supplier: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: "",
      notes: "",
    })
    setOrderItems([])
    setNewItem({
      productId: "",
      quantity: "",
      unitPrice: "",
    })
    setErrors({})
    setEditingOrder(null)
  }

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) return

    const product = products.find((p) => p.id === newItem.productId)
    if (!product) return

    const quantity = Number.parseInt(newItem.quantity)
    const unitPrice = Number.parseFloat(newItem.unitPrice)
    const total = quantity * unitPrice

    const item: PurchaseOrderItem = {
      productId: product.id,
      product: product.name,
      quantity,
      unitPrice,
      total,
    }

    setOrderItems([...orderItems, item])
    setNewItem({
      productId: "",
      quantity: "",
      unitPrice: "",
    })
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const totalAmount = calculateTotal()

    const orderData: PurchaseOrder = {
      id: editingOrder?.id || `PO-${Date.now()}`,
      supplier: formData.supplier,
      orderDate: formData.orderDate,
      expectedDate: formData.expectedDate,
      status: "Pending",
      totalAmount,
      items: orderItems,
      notes: formData.notes,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingOrder) {
      dispatch({ type: "UPDATE_PURCHASE_ORDER", payload: orderData })
    } else {
      dispatch({ type: "ADD_PURCHASE_ORDER", payload: orderData })
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order)
    setFormData({
      supplier: order.supplier,
      orderDate: order.orderDate,
      expectedDate: order.expectedDate,
      notes: order.notes || "",
    })
    setOrderItems(order.items)
    setIsAddDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Shipped":
        return "default"
      case "Received":
        return "default"
      case "Cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage your purchase orders and supplier orders</p>
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
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
              <DialogDescription>
                {editingOrder ? "Update purchase order details" : "Create a new purchase order"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                  >
                    <SelectTrigger className={errors.supplier ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.status === "Active")
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && <p className="text-sm text-red-500">{errors.supplier}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className={errors.orderDate ? "border-red-500" : ""}
                  />
                  {errors.orderDate && <p className="text-sm text-red-500">{errors.orderDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Delivery Date *</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  className={errors.expectedDate ? "border-red-500" : ""}
                />
                {errors.expectedDate && <p className="text-sm text-red-500">{errors.expectedDate}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}
                </div>

                <div className="grid grid-cols-4 gap-2 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={newItem.productId}
                      onValueChange={(value) => setNewItem({ ...newItem, productId: value })}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price ({currency})</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={addItem} disabled={!newItem.productId || !newItem.quantity || !newItem.unitPrice}>
                    Add Item
                  </Button>
                </div>

                {orderItems.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.unitPrice, currency)}</TableCell>
                            <TableCell>{formatCurrency(item.total, currency)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => removeItem(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-medium">
                            Total
                          </TableCell>
                          <TableCell className="font-bold">{formatCurrency(calculateTotal(), currency)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes for the supplier"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingOrder ? "Update Order" : "Create Order"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Track your purchase orders and deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No purchase orders yet</h3>
              <p className="text-muted-foreground">Create your first purchase order to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders
                    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {order.orderDate}
                          </div>
                        </TableCell>
                        <TableCell>{order.expectedDate}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status) as any}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.totalAmount, currency)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedOrder = { ...order, status: "Received" as const }
                                dispatch({ type: "UPDATE_PURCHASE_ORDER", payload: updatedOrder })
                              }}
                              disabled={order.status === "Received" || order.status === "Cancelled"}
                            >
                              Mark Received
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
    </div>
  )
}
