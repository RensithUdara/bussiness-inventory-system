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
import { Search, Plus, Edit, Trash2, AlertCircle, Package, Filter } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import type { Product } from "@/types"
import { formatCurrency } from "@/utils/currency"

export default function ProductsTab() {
  const { state, dispatch } = useInventory()
  const { products, suppliers, categories, businessSettings } = state

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    supplier: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    reorderPoint: "",
    barcode: "",
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
    if (!formData.supplier) newErrors.supplier = "Supplier is required"
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
      supplier: "",
      costPrice: "",
      sellingPrice: "",
      currentStock: "",
      reorderPoint: "",
      barcode: "",
      expiryDate: "",
    })
    setErrors({})
    setEditingProduct(null)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const productData: Product = {
      id: editingProduct?.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      supplier: formData.supplier,
      costPrice: Number.parseFloat(formData.costPrice),
      sellingPrice: Number.parseFloat(formData.sellingPrice),
      currentStock: Number.parseInt(formData.currentStock),
      reorderPoint: Number.parseInt(formData.reorderPoint),
      status: "Active",
      barcode: formData.barcode.trim(),
      expiryDate: formData.expiryDate || undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update status based on stock
    if (productData.currentStock <= 0) {
      productData.status = "Out of Stock"
    } else if (productData.currentStock <= productData.reorderPoint) {
      productData.status = "Low Stock"
    }

    if (editingProduct) {
      dispatch({ type: "UPDATE_PRODUCT", payload: productData })
    } else {
      dispatch({ type: "ADD_PRODUCT", payload: productData })
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
      supplier: product.supplier,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      currentStock: product.currentStock.toString(),
      reorderPoint: product.reorderPoint.toString(),
      barcode: product.barcode || "",
      expiryDate: product.expiryDate || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dispatch({ type: "DELETE_PRODUCT", payload: id })
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0)
      return {
        status: "Out of Stock",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-700 border-red-200",
      }
    if (product.currentStock <= product.reorderPoint)
      return {
        status: "Low Stock",
        variant: "destructive" as const,
        color: "bg-orange-100 text-orange-700 border-orange-200",
      }
    return { status: "In Stock", variant: "default" as const, color: "bg-green-100 text-green-700 border-green-200" }
  }

  const currency = businessSettings?.currency || "LKR"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Products
          </h2>
          <p className="text-slate-600 mt-1">Manage your product catalog</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details below" : "Enter the product details below"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium">
                    SKU *
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., RICE-BAS-5KG"
                    className={`${errors.sku ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sku}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Basmati Rice"
                    className={`${errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  className="border-slate-200 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger
                      className={`${errors.category ? "border-red-300" : "border-slate-200"} transition-colors`}
                    >
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
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium">
                    Supplier *
                  </Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                  >
                    <SelectTrigger
                      className={`${errors.supplier ? "border-red-300" : "border-slate-200"} transition-colors`}
                    >
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
                  {errors.supplier && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.supplier}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice" className="text-sm font-medium">
                    Cost Price ({currency}) *
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="0.00"
                    className={`${errors.costPrice ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.costPrice && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.costPrice}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice" className="text-sm font-medium">
                    Selling Price ({currency}) *
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className={`${errors.sellingPrice ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.sellingPrice && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sellingPrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock" className="text-sm font-medium">
                    Current Stock *
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="0"
                    className={`${errors.currentStock ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.currentStock && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.currentStock}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint" className="text-sm font-medium">
                    Reorder Point *
                  </Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    placeholder="0"
                    className={`${errors.reorderPoint ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"} transition-colors`}
                  />
                  {errors.reorderPoint && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.reorderPoint}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-sm font-medium">
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Optional"
                    className="border-slate-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-sm font-medium">
                    Expiry Date (Optional)
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="border-slate-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            Product Catalog
          </CardTitle>
          <CardDescription>Search and filter your products</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-emerald-500 transition-colors"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-slate-200 focus:border-emerald-500">
                <Filter className="h-4 w-4 mr-2" />
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No products found</h3>
              <p className="text-slate-500">
                {searchTerm || selectedCategory !== "all"
                  ? "No products match your search criteria"
                  : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold">Cost Price</TableHead>
                    <TableHead className="font-semibold">Selling Price</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-sm bg-slate-100 rounded-md px-2 py-1 m-1 inline-block">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-slate-500 mt-1">{product.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.supplier}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.costPrice, currency)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.sellingPrice, currency)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{product.currentStock}</span>
                              {product.currentStock <= product.reorderPoint && (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                            <div className="text-slate-500">Reorder: {product.reorderPoint}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant} className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
