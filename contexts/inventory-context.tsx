"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type {
  SystemData,
  Product,
  Supplier,
  Category,
  PurchaseOrder,
  InventoryMovement,
  ReturnItem,
  BusinessSettings,
} from "@/types"

interface InventoryState extends SystemData {}

type InventoryAction =
  | { type: "LOAD_DATA"; payload: SystemData }
  | { type: "UPDATE_BUSINESS_SETTINGS"; payload: BusinessSettings }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_SUPPLIER"; payload: Supplier }
  | { type: "UPDATE_SUPPLIER"; payload: Supplier }
  | { type: "DELETE_SUPPLIER"; payload: string }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_PURCHASE_ORDER"; payload: PurchaseOrder }
  | { type: "UPDATE_PURCHASE_ORDER"; payload: PurchaseOrder }
  | { type: "ADD_INVENTORY_MOVEMENT"; payload: InventoryMovement }
  | { type: "ADD_RETURN"; payload: ReturnItem }
  | { type: "UPDATE_RETURN"; payload: ReturnItem }
  | { type: "COMPLETE_SETUP" }
  | { type: "RESET_SYSTEM" }

const initialState: InventoryState = {
  products: [],
  suppliers: [],
  categories: [],
  purchaseOrders: [],
  inventoryMovements: [],
  returns: [],
  businessSettings: {
    companyName: "",
    address: "",
    district: "",
    phone: "",
    email: "",
    currency: "LKR",
    taxRate: 0,
    lowStockThreshold: 10,
    reorderPointDefault: 20,
    language: "en",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
  },
  isSetupComplete: false,
}

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case "LOAD_DATA":
      return { ...action.payload }

    case "UPDATE_BUSINESS_SETTINGS":
      return { ...state, businessSettings: action.payload }

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] }

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) => (cat.id === action.payload.id ? action.payload : cat)),
      }

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
      }

    case "ADD_SUPPLIER":
      return { ...state, suppliers: [...state.suppliers, action.payload] }

    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((sup) => (sup.id === action.payload.id ? action.payload : sup)),
      }

    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((sup) => sup.id !== action.payload),
      }

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] }

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((prod) => (prod.id === action.payload.id ? action.payload : prod)),
      }

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((prod) => prod.id !== action.payload),
      }

    case "ADD_PURCHASE_ORDER":
      return { ...state, purchaseOrders: [...state.purchaseOrders, action.payload] }

    case "UPDATE_PURCHASE_ORDER":
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === action.payload.id ? action.payload : po)),
      }

    case "ADD_INVENTORY_MOVEMENT":
      const movement = action.payload
      const updatedProducts = state.products.map((product) => {
        if (product.id === movement.productId) {
          const newStock = movement.newStock
          const status = newStock <= 0 ? "Out of Stock" : newStock <= product.reorderPoint ? "Low Stock" : "Active"
          return { ...product, currentStock: newStock, status, updatedAt: new Date().toISOString() }
        }
        return product
      })

      return {
        ...state,
        products: updatedProducts,
        inventoryMovements: [...state.inventoryMovements, movement],
      }

    case "ADD_RETURN":
      return { ...state, returns: [...state.returns, action.payload] }

    case "UPDATE_RETURN":
      return {
        ...state,
        returns: state.returns.map((ret) => (ret.id === action.payload.id ? action.payload : ret)),
      }

    case "COMPLETE_SETUP":
      return { ...state, isSetupComplete: true }

    case "RESET_SYSTEM":
      return initialState

    default:
      return state
  }
}

interface InventoryContextType {
  state: InventoryState
  dispatch: React.Dispatch<InventoryAction>
  saveData: () => void
  loadData: () => void
  exportData: () => string
  importData: (data: string) => boolean
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState)

  const saveData = () => {
    try {
      localStorage.setItem("sri-lankan-inventory-system", JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save data:", error)
    }
  }

  const loadData = () => {
    try {
      const savedData = localStorage.getItem("sri-lankan-inventory-system")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: parsedData })
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const exportData = (): string => {
    return JSON.stringify(state, null, 2)
  }

  const importData = (data: string): boolean => {
    try {
      const parsedData = JSON.parse(data)
      dispatch({ type: "LOAD_DATA", payload: parsedData })
      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    saveData()
  }, [state])

  return (
    <InventoryContext.Provider value={{ state, dispatch, saveData, loadData, exportData, importData }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
