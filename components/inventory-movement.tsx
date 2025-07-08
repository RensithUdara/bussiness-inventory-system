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
import { Plus, Minus, Package, TrendingUp, TrendingDown, Search } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { STOCK_MOVEMENT_REASONS } from "@/constants/sri-lanka"
import { formatDate } from "@/utils/date"

export default function InventoryMovement() {
  const { state, actions } = useInventory()
  const { products, movements, loading } = state

  const [searchTerm, setSearchTerm] = useState("")
  const [isStockInDialogOpen, setIsStockInDialogOpen] = useState(false)
  const [isStockOutDialogOpen, setIsStockOutDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    reason: "",
    reference: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredMovements = movements.filter((movement) => {
    const product = products.find((p) => p.id === movement.productId)
    return (
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const validateForm = (type: "in" | "out") => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) newErrors.productId = "Product is required"
    if (!formData.quantity || Number.parseInt(formData.quantity) <= 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.reason) newErrors.reason = "Reason is required"

    // For stock out, check if sufficient stock is available
    if (type === "out") {
      const product = products.find((p) => p.id === formData.productId)
      if (product && Number.parseInt(formData.quantity) > product.currentStock) {
        newErrors.quantity = `Only ${product.currentStock} units available`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: "",
      reason: "",
      reference: "",
      notes: "",
    })
    setErrors({})
  }

  const handleStockMovement = (type: "in" | "out") => {
    if (!validateForm(type)) return

    const product = products.find((p) => p.id === formData.productId)
    if (!product) return

    const quantity = type === "in" ? Number.parseInt(formData.quantity) : -Number.parseInt(formData.quantity)
    const newStock = product.currentStock + quantity

    actions.addMovement({
      productId: formData.productId,
      type: type === "in" ? "Stock In" : "Stock Out",
      quantity: quantity,
      previousStock: product.currentStock,
      newStock: newStock,
      reason: formData.reason,
      reference: formData.reference,
      notes: formData.notes,
      userId: "current-user", // In a real app, this would come from auth
    })

    resetForm()
    setIsStockInDialogOpen(false)
    setIsStockOutDialogOpen(false)
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? `${product.name} (${product.sku})` : "Unknown Product"
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Stock In":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Stock Out":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-blue-600" />
    }
  }

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case "Stock In":
        return "default"
      case "Stock Out":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Track stock movements and adjustments</p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isStockInDialogOpen}
            onOpenChange={(open) => {
              setIsStockInDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Stock In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>Record incoming inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                      {products
                        .filter((p) => p.status === "Active")
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku}) - Current: {product.currentStock}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_MOVEMENT_REASONS["Stock In"].map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g., PO001, Invoice #123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStockInDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleStockMovement("in")}>Add Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isStockOutDialogOpen}
            onOpenChange={(open) => {
              setIsStockOutDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Minus className="mr-2 h-4 w-4" />
                Stock Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Stock</DialogTitle>
                <DialogDescription>Record outgoing inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                      {products
                        .filter((p) => p.status === "Active" && p.currentStock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku}) - Available: {product.currentStock}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_MOVEMENT_REASONS["Stock Out"].map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g., Sale #123, Transfer OUT-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStockOutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleStockMovement("out")}>Remove Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.formatCurrency(state.stats.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movements Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movements.filter((m) => m.date === new Date().toISOString().split("T")[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">In/Out transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{state.stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements</CardTitle>
          <CardDescription>Latest inventory transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous Stock</TableHead>
                  <TableHead>New Stock</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(movement.date)}</div>
                          <div className="text-muted-foreground">{movement.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getProductName(movement.productId)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <Badge variant={getMovementBadgeVariant(movement.type)}>{movement.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={movement.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.previousStock}</TableCell>
                      <TableCell className="font-medium">{movement.newStock}</TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.reference || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? "No movements found matching your search" : "No stock movements recorded yet"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
