import { clsx, type ClassValue } from 'clsx'

/**
 * Utility for conditionally joining class names.
 * Uses clsx without tailwind-merge (install tailwindcss-merge if needed).
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
