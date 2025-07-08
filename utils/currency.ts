export function formatCurrency(amount: number, currency = "LKR"): string {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Fallback if currency is not supported
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and parse as float
  const cleanValue = value.replace(/[^\d.-]/g, "")
  return Number.parseFloat(cleanValue) || 0
}
