"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { formatCurrency } from "@/utils/currency"

export default function Dashboard() {
  const { state } = useInventory()
  const { products, suppliers, purchaseOrders, inventoryMovements, businessSettings } = state

  const currency = businessSettings?.currency || "LKR"

  // Calculate key metrics
  const totalProducts = products.length
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderPoint)
  const outOfStockProducts = products.filter((p) => p.currentStock === 0)
  const pendingOrders = purchaseOrders.filter((po) => po.status === "Pending").length
  const totalInventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0)

  // Recent activities
  const recentMovements = inventoryMovements
    .sort((a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime())
    .slice(0, 5)

  const recentOrders = purchaseOrders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100 text-lg">
            Here's what's happening with {businessSettings?.companyName || "your inventory"} today
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full"></div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Products</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{totalProducts}</div>
            <p className="text-sm text-emerald-600 mt-1">
              {lowStockProducts.length > 0 && (
                <span className="text-orange-600">{lowStockProducts.length} low stock</span>
              )}
              {outOfStockProducts.length > 0 && (
                <span className="text-red-600 ml-2">{outOfStockProducts.length} out of stock</span>
              )}
              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && "All products in stock"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Suppliers</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{activeSuppliers}</div>
            <p className="text-sm text-purple-600 mt-1">Supplier network</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Pending Orders</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900">{pendingOrders}</div>
            <p className="text-sm text-cyan-600 mt-1">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Inventory Value</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{formatCurrency(totalInventoryValue, currency)}</div>
            <p className="text-sm text-amber-600 mt-1">Total stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outOfStockProducts.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-100 border border-red-200 rounded-xl">
                  <span className="text-red-800 font-medium">
                    {outOfStockProducts.length} products are out of stock
                  </span>
                  <Badge variant="destructive" className="bg-red-500">
                    Critical
                  </Badge>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-orange-100 border border-orange-200 rounded-xl">
                  <span className="text-orange-800 font-medium">
                    {lowStockProducts.length} products are running low
                  </span>
                  <Badge variant="secondary" className="bg-orange-500 text-white">
                    Warning
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Recent Inventory Movements
            </CardTitle>
            <CardDescription>Latest stock changes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No recent movements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${movement.type === "Stock In" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                      >
                        {movement.type === "Stock In" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{movement.productName}</div>
                        <div className="text-xs text-slate-500">{movement.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${movement.type === "Stock In" ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {movement.type === "Stock In" ? "+" : "-"}
                        {Math.abs(movement.quantity)}
                      </div>
                      <div className="text-xs text-slate-500">{movement.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              Recent Purchase Orders
            </CardTitle>
            <CardDescription>Latest orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <div className="font-medium text-sm">{order.id}</div>
                      <div className="text-xs text-slate-500">{order.supplier}</div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          order.status === "Pending" ? "secondary" : order.status === "Received" ? "default" : "outline"
                        }
                        className={
                          order.status === "Pending"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : order.status === "Received"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ""
                        }
                      >
                        {order.status}
                      </Badge>
                      <div className="text-xs text-slate-500 mt-1">{formatCurrency(order.totalAmount, currency)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products Table */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              Products Requiring Attention
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Current Stock</TableHead>
                    <TableHead className="font-semibold">Reorder Point</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.slice(0, 10).map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm bg-slate-100 rounded px-2 py-1">{product.sku}</TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${product.currentStock === 0 ? "text-red-600" : "text-orange-600"}`}
                        >
                          {product.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>{product.reorderPoint}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.currentStock === 0 ? "destructive" : "secondary"}
                          className={
                            product.currentStock === 0
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-orange-100 text-orange-700 border-orange-200"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.supplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
