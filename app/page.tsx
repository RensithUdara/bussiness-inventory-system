"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryProvider, useInventory } from "@/contexts/inventory-context"
import SystemSetup from "@/components/system-setup"
import Dashboard from "@/components/dashboard"
import ProductsTab from "@/components/products-tab"
import InventoryTab from "@/components/inventory-tab"
import SuppliersTab from "@/components/suppliers-tab"
import PurchaseOrdersTab from "@/components/purchase-orders-tab"
import ReportsTab from "@/components/reports-tab"
import ReturnsTab from "@/components/returns-tab"
import { Package, BarChart3, Users, ShoppingCart, FileText, RotateCcw } from "lucide-react"

function InventoryApp() {
  const { state } = useInventory()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Show setup screen if system is not configured
  if (!state.isSetupComplete) {
    return <SystemSetup />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {state.businessSettings.companyName}
                </h1>
                <p className="text-sm text-slate-600">Inventory Management System</p>
              </div>
            </div>
            <div className="text-sm text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200/60">
              {state.businessSettings.district && <div>{state.businessSettings.district}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 bg-white/60 backdrop-blur-sm border border-slate-200/60 p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Returns</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard />
            </TabsContent>
            <TabsContent value="products" className="space-y-6">
              <ProductsTab />
            </TabsContent>
            <TabsContent value="inventory" className="space-y-6">
              <InventoryTab />
            </TabsContent>
            <TabsContent value="suppliers" className="space-y-6">
              <SuppliersTab />
            </TabsContent>
            <TabsContent value="orders" className="space-y-6">
              <PurchaseOrdersTab />
            </TabsContent>
            <TabsContent value="returns" className="space-y-6">
              <ReturnsTab />
            </TabsContent>
            <TabsContent value="reports" className="space-y-6">
              <ReportsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  )
}
