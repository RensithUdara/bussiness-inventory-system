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
import { Plus, TrendingUp, TrendingDown, RotateCcw, Package2 } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { InventoryMovement } from "@/types"

export default function InventoryTab() {
  const { state, dispatch } = useInventory()
  const { products, inventoryMovements } = state

  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false)
  const [movementForm, setMovementForm] = useState({
    productId: "",
    type: "Stock In" as "Stock In" | "Stock Out" | "Stock Adjustment",
    quantity: "",
    reason: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateMovementForm = () => {
    const newErrors: Record<string, string> = {}

    if (!movementForm.productId) newErrors.productId = "Product is required"
    if (!movementForm.quantity || Number.parseInt(movementForm.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required"
    if (!movementForm.reason.trim()) newErrors.reason = "Reason is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddMovement = () => {
    if (!validateMovementForm()) return

    const product = products.find((p) => p.id === movementForm.productId)
    if (!product) return

    const quantity = Number.parseInt(movementForm.quantity)
    const previousStock = product.currentStock
    let newStock = previousStock

    switch (movementForm.type) {
      case "Stock In":
        newStock = previousStock + quantity
        break
      case "Stock Out":
        newStock = Math.max(0, previousStock - quantity)
        break
      case "Stock Adjustment":
        newStock = quantity
        break
    }

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: movementForm.type,
      quantity: movementForm.type === "Stock Adjustment" ? newStock - previousStock : quantity,
      previousStock,
      newStock,
      reason: movementForm.reason,
      notes: movementForm.notes,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }

    dispatch({ type: "ADD_INVENTORY_MOVEMENT", payload: movement })

    setMovementForm({
      productId: "",
      type: "Stock In",
      quantity: "",
      reason: "",
      notes: "",
    })
    setErrors({})
    setIsAddMovementOpen(false)
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Stock In":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Stock Out":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "Stock Adjustment":
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <Package2 className="h-4 w-4" />
    }
  }

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case "Stock In":
        return "default"
      case "Stock Out":
        return "destructive"
      case "Stock Adjustment":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Movements</h2>
          <p className="text-muted-foreground">Track stock changes and adjustments</p>
        </div>
        <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Movement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Movement</DialogTitle>
              <DialogDescription>Record a stock movement or adjustment</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={movementForm.productId}
                  onValueChange={(value) => setMovementForm({ ...movementForm, productId: value })}
                >
                  <SelectTrigger className={errors.productId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku}) - Current: {product.currentStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-sm text-red-500">{errors.productId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Movement Type</Label>
                <Select
                  value={movementForm.type}
                  onValueChange={(value: "Stock In" | "Stock Out" | "Stock Adjustment") =>
                    setMovementForm({ ...movementForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stock In">Stock In</SelectItem>
                    <SelectItem value="Stock Out">Stock Out</SelectItem>
                    <SelectItem value="Stock Adjustment">Stock Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {movementForm.type === "Stock Adjustment" ? "New Stock Level *" : "Quantity *"}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                  placeholder="0"
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder="e.g., Purchase order, Sale, Damaged goods"
                  className={errors.reason ? "border-red-500" : ""}
                />
                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMovementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMovement}>Add Movement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Movements</CardTitle>
          <CardDescription>Latest inventory changes and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryMovements.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No movements recorded</h3>
              <p className="text-muted-foreground">Start tracking your inventory changes</p>
            </div>
          ) : (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryMovements
                    .sort(
                      (a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime(),
                    )
                    .map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div>{movement.date}</div>
                            <div className="text-muted-foreground">{movement.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.productName}</div>
                            <div className="text-sm text-muted-foreground">{movement.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            <Badge variant={getMovementBadgeVariant(movement.type) as any}>{movement.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              movement.type === "Stock In"
                                ? "text-green-600"
                                : movement.type === "Stock Out"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }
                          >
                            {movement.type === "Stock In" && "+"}
                            {movement.type === "Stock Out" && "-"}
                            {Math.abs(movement.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>{movement.previousStock}</TableCell>
                        <TableCell className="font-medium">{movement.newStock}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{movement.reason}</div>
                            {movement.notes && <div className="text-xs text-muted-foreground">{movement.notes}</div>}
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
