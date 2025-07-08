export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const isExpiringSoon = (expiryDate: string, daysThreshold = 30): boolean => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= daysThreshold && diffDays >= 0
}

export const isExpired = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  return expiry < today
}
