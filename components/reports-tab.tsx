"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { formatCurrency } from "@/utils/currency"

export default function ReportsTab() {
  const { state } = useInventory()
  const { products, suppliers, purchaseOrders, inventoryMovements, businessSettings } = state

  const currency = businessSettings?.currency || "LKR"

  // Calculate statistics
  const totalProducts = products.length
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderPoint)
  const outOfStockProducts = products.filter((p) => p.currentStock === 0)
  const pendingOrders = purchaseOrders.filter((po) => po.status === "Pending").length
  const totalInventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0)

  // Stock status data for pie chart
  const stockStatusData = [
    { name: "In Stock", value: products.filter((p) => p.currentStock > p.reorderPoint).length, color: "#22c55e" },
    { name: "Low Stock", value: lowStockProducts.length, color: "#f59e0b" },
    { name: "Out of Stock", value: outOfStockProducts.length, color: "#ef4444" },
  ]

  // Category distribution
  const categoryData = products.reduce(
    (acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, value: 0 }
      }
      acc[category].count += 1
      acc[category].value += product.currentStock * product.costPrice
      return acc
    },
    {} as Record<string, { name: string; count: number; value: number }>,
  )

  const categoryChartData = Object.values(categoryData)

  // Recent movements summary
  const recentMovements = inventoryMovements
    .sort((a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Overview of your inventory performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">Suppliers in network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue, currency)}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
            <CardDescription>Current stock levels across all products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Product count by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground">No low stock items</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{product.currentStock} remaining</div>
                      <Badge variant="destructive" className="text-xs">
                        Reorder at {product.reorderPoint}
                      </Badge>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    And {lowStockProducts.length - 5} more items need attention
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inventory Movements</CardTitle>
            <CardDescription>Latest stock changes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-muted-foreground">No recent movements</p>
            ) : (
              <div className="space-y-2">
                {recentMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{movement.productName}</div>
                      <div className="text-sm text-muted-foreground">{movement.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {movement.type === "Stock In" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
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
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {movement.date} {movement.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Detailed breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Product Count</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Avg. Value per Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryChartData.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.count}</TableCell>
                  <TableCell>{formatCurrency(category.value, currency)}</TableCell>
                  <TableCell>{formatCurrency(category.value / category.count, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
