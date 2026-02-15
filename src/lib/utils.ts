import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// Tailwind Class Utility
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Currency Formatting
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `R${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `R${(amount / 1000).toFixed(0)}K`;
  }
  return `R${amount}`;
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDateShort(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateRange(startDate: Date | number, endDate: Date | number): string {
  const start = typeof startDate === 'number' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'number' ? new Date(endDate) : endDate;
  
  const startStr = new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
  }).format(start);
  
  const endStr = new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end);
  
  return `${startStr} - ${endStr}`;
}

// ============================================
// Duration Calculations
// ============================================

export function calculateDays(startDate: Date | number, endDate: Date | number): number {
  const start = typeof startDate === 'number' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'number' ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Minimum 1 day
}

// ============================================
// Quote Calculations
// ============================================

export function calculateLineTotal(dailyRate: number, quantity: number, days: number): number {
  return dailyRate * quantity * days;
}

export function calculateQuoteTotal(
  items: { dailyRate: number; quantity: number }[],
  days: number,
  deliveryFee: number = 0,
  discount: number = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.dailyRate, item.quantity, days),
    0
  );
  const total = subtotal + deliveryFee - discount;
  return { subtotal, total };
}

// ============================================
// Guest Count Recommendations
// ============================================

export function getRecommendedToiletCount(guestCount: number): number {
  return Math.ceil(guestCount / 50);
}

export function getRecommendedGeneratorSize(guestCount: number): string {
  if (guestCount <= 50) return '5kW';
  if (guestCount <= 100) return '8kW';
  if (guestCount <= 200) return '15kW';
  return '25kW+';
}

// ============================================
// Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ============================================
// String Utilities
// ============================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// ID Generation
// ============================================

export function generateQuoteId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `Q-${year}-${random}`;
}

// ============================================
// Debounce Utility
// ============================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
