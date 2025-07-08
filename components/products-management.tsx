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
import { Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { Product } from "@/types"

export default function ProductsManagement() {
  const { state, actions } = useInventory()
  const { products, suppliers, categories, loading } = state

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    supplierId: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    reorderPoint: "",
    minStock: "",
    maxStock: "",
    unit: "",
    barcode: "",
    location: "",
    expiryDate: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku.trim()) newErrors.sku = "SKU is required"
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.supplierId) newErrors.supplierId = "Supplier is required"
    if (!formData.costPrice || Number.parseFloat(formData.costPrice) <= 0)
      newErrors.costPrice = "Valid cost price is required"
    if (!formData.sellingPrice || Number.parseFloat(formData.sellingPrice) <= 0)
      newErrors.sellingPrice = "Valid selling price is required"
    if (!formData.currentStock || Number.parseInt(formData.currentStock) < 0)
      newErrors.currentStock = "Valid stock quantity is required"
    if (!formData.reorderPoint || Number.parseInt(formData.reorderPoint) < 0)
      newErrors.reorderPoint = "Valid reorder point is required"

    // Check if SKU already exists (for new products)
    if (!editingProduct && products.some((p) => p.sku === formData.sku.trim())) {
      newErrors.sku = "SKU already exists"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      category: "",
      supplierId: "",
      costPrice: "",
      sellingPrice: "",
      currentStock: "",
      reorderPoint: "",
      minStock: "",
      maxStock: "",
      unit: "",
      barcode: "",
      location: "",
      expiryDate: "",
    })
    setErrors({})
    setEditingProduct(null)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const productData = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      supplierId: formData.supplierId,
      costPrice: Number.parseFloat(formData.costPrice),
      sellingPrice: Number.parseFloat(formData.sellingPrice),
      currentStock: Number.parseInt(formData.currentStock),
      reorderPoint: Number.parseInt(formData.reorderPoint),
      minStock: Number.parseInt(formData.minStock) || 0,
      maxStock: Number.parseInt(formData.maxStock) || 1000,
      unit: formData.unit || state.config.defaultUnit,
      barcode: formData.barcode.trim(),
      location: formData.location.trim(),
      expiryDate: formData.expiryDate || undefined,
      status: "Active" as const,
    }

    if (editingProduct) {
      actions.updateProduct({ ...editingProduct, ...productData })
    } else {
      actions.addProduct(productData)
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      supplierId: product.supplierId,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      currentStock: product.currentStock.toString(),
      reorderPoint: product.reorderPoint.toString(),
      minStock: product.minStock.toString(),
      maxStock: product.maxStock.toString(),
      unit: product.unit,
      barcode: product.barcode || "",
      location: product.location || "",
      expiryDate: product.expiryDate || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      actions.deleteProduct(id)
    }
  }

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier?.name || "Unknown Supplier"
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) return { status: "Out of Stock", variant: "destructive" as const }
    if (product.currentStock <= product.reorderPoint) return { status: "Low Stock", variant: "destructive" as const }
    if (product.currentStock <= product.minStock) return { status: "Critical", variant: "destructive" as const }
    return { status: "In Stock", variant: "default" as const }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
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
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details below" : "Enter the product details below"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., RICE-BAS-5KG"
                    className={errors.sku ? "border-red-500" : ""}
                  />
                  {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Basmati Rice"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.status === "Active")
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price ({state.config.currency}) *</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="0.00"
                    className={errors.costPrice ? "border-red-500" : ""}
                  />
                  {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price ({state.config.currency}) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className={errors.sellingPrice ? "border-red-500" : ""}
                  />
                  {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="0"
                    className={errors.currentStock ? "border-red-500" : ""}
                  />
                  {errors.currentStock && <p className="text-sm text-red-500">{errors.currentStock}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point *</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    placeholder="0"
                    className={errors.reorderPoint ? "border-red-500" : ""}
                  />
                  {errors.reorderPoint && <p className="text-sm text-red-500">{errors.reorderPoint}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">Max Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder={state.config.defaultUnit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Shelf A1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingProduct ? "Update Product" : "Add Product"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Search and filter your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((c) => c.isActive)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground">{product.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{getSupplierName(product.supplierId)}</TableCell>
                        <TableCell>{actions.formatCurrency(product.costPrice)}</TableCell>
                        <TableCell>{actions.formatCurrency(product.sellingPrice)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              {product.currentStock} {product.unit}
                              {product.currentStock <= product.reorderPoint && (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                            <div className="text-muted-foreground">Reorder: {product.reorderPoint}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedCategory !== "all"
                          ? "No products found matching your criteria"
                          : "No products added yet"}
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
