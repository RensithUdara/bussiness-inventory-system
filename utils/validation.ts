export function validateSriLankanPhone(phone: string): boolean {
  // Sri Lankan phone number patterns
  const patterns = [
    /^\+94\s?[1-9]\d{8}$/, // +94 format
    /^0[1-9]\d{8}$/, // Local format starting with 0
  ]

  return patterns.some((pattern) => pattern.test(phone.replace(/\s/g, "")))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatSriLankanPhone(phone: string): string {
  // Remove all spaces and special characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")

  // If it starts with 0, replace with +94
  if (cleaned.startsWith("0")) {
    return "+94 " + cleaned.substring(1)
  }

  // If it already has +94, format it properly
  if (cleaned.startsWith("+94")) {
    const number = cleaned.substring(3)
    return "+94 " + number.substring(0, 2) + " " + number.substring(2, 5) + " " + number.substring(5)
  }

  return phone
}

export function validateSKU(sku: string): boolean {
  // SKU should be alphanumeric with hyphens, 3-20 characters
  const skuRegex = /^[A-Z0-9-]{3,20}$/
  return skuRegex.test(sku.toUpperCase())
}
