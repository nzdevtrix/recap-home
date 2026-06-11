import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    PRIVATE: 'bg-blue-100 text-blue-800',
    RIDER: 'bg-green-100 text-green-800',
    BUSINESS: 'bg-purple-100 text-purple-800',
    DEVELOPER: 'bg-orange-100 text-orange-800',
    SYSTEM_OPERATOR: 'bg-red-100 text-red-800',
    CUSTOMER_CARE: 'bg-cyan-100 text-cyan-800',
    REGIONAL_OPERATOR: 'bg-indigo-100 text-indigo-800',
    LOCAL_RIDER_MONITOR: 'bg-emerald-100 text-emerald-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

export function getStatusColor(status: string, type?: 'order' | 'business' | 'rider'): string {
  const orderColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    IN_TRANSIT: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const businessColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    DEACTIVATED: 'bg-red-100 text-red-800',
  }

  const riderColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  if (type === 'order') return orderColors[status] || 'bg-gray-100 text-gray-800'
  if (type === 'business') return businessColors[status] || 'bg-gray-100 text-gray-800'
  if (type === 'rider') return riderColors[status] || 'bg-gray-100 text-gray-800'
  
  return 'bg-gray-100 text-gray-800'
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }
  return colors[severity] || 'bg-gray-100 text-gray-800'
}

export function isAdminRole(role: string): boolean {
  const adminRoles = [
    'SYSTEM_OPERATOR',
    'DEVELOPER',
    'CUSTOMER_CARE',
    'REGIONAL_OPERATOR',
    'LOCAL_RIDER_MONITOR'
  ]
  return adminRoles.includes(role)
}

export function canManageUsers(role: string): boolean {
  const allowedRoles = ['SYSTEM_OPERATOR', 'DEVELOPER', 'REGIONAL_OPERATOR']
  return allowedRoles.includes(role)
}

export function canManageRiders(role: string): boolean {
  const allowedRoles = [
    'SYSTEM_OPERATOR',
    'DEVELOPER',
    'CUSTOMER_CARE',
    'REGIONAL_OPERATOR',
    'LOCAL_RIDER_MONITOR'
  ]
  return allowedRoles.includes(role)
}

export function canManageBusinesses(role: string): boolean {
  const allowedRoles = ['SYSTEM_OPERATOR', 'DEVELOPER', 'REGIONAL_OPERATOR']
  return allowedRoles.includes(role)
}

export function canManageOrders(role: string): boolean {
  const allowedRoles = [
    'SYSTEM_OPERATOR',
    'DEVELOPER',
    'CUSTOMER_CARE',
    'REGIONAL_OPERATOR',
    'LOCAL_RIDER_MONITOR'
  ]
  return allowedRoles.includes(role)
}
