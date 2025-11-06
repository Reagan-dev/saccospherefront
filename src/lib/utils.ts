import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class names or conditional class objects
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Kenyan Shilling currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "KES 1,234.56")
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  }
): string {
  const {
    showSymbol = true,
    decimals = 2,
    locale = 'en-KE',
  } = options || {}

  const formatted = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)

  return showSymbol ? `KES ${formatted}` : formatted
}
