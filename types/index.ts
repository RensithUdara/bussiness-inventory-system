export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  supplier: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  reorderPoint: number
  status: "Active" | "Low Stock" | "Out of Stock" | "Discontinued"
  barcode?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  district: string
  category: string
  paymentTerms: string
  status: "Active" | "Inactive"
  totalOrders: number
  lastOrderDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrder {
  id: string
  supplier: string
  orderDate: string
  expectedDate: string
  status: "Pending" | "Shipped" | "Received" | "Cancelled"
  totalAmount: number
  items: PurchaseOrderItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  productId: string
  product: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  sku: string
  type: "Stock In" | "Stock Out" | "Stock Adjustment"
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  notes?: string
  date: string
  time: string
  createdBy?: string
}

export interface ReturnItem {
  id: string
  type: "Customer Return" | "Supplier Return"
  productId: string
  product: string
  sku: string
  quantity: number
  reason: string
  status: "Pending" | "Approved" | "Processed" | "Rejected"
  returnDate: string
  refundAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BusinessSettings {
  companyName: string
  address: string
  district: string
  phone: string
  email: string
  currency: string
  taxRate: number
  lowStockThreshold: number
  reorderPointDefault: number
  language: "en" | "si" | "ta"
  dateFormat: string
  timeFormat: "12h" | "24h"
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
  createdAt: string
}

export interface SystemData {
  products: Product[]
  suppliers: Supplier[]
  categories: Category[]
  purchaseOrders: PurchaseOrder[]
  inventoryMovements: InventoryMovement[]
  returns: ReturnItem[]
  businessSettings: BusinessSettings
  isSetupComplete: boolean
}
