import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import type { TrendDirection, TrendData } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(date: Date | string | null | undefined, formatStr: string = 'PP'): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPp');
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getDaysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(dateObj, new Date());
}

export function isOverdue(targetDate: Date | string | null | undefined): boolean {
  if (!targetDate) return false;
  const dateObj = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  return dateObj < new Date();
}

// ============================================================================
// NUMBER FORMATTING UTILITIES
// ============================================================================

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  showDecimals: boolean = false
): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

// ============================================================================
// ROI CALCULATION UTILITIES
// ============================================================================

export function calculateROI(
  totalCost: number,
  totalBenefits: number
): number {
  if (totalCost === 0) return 0;
  return ((totalBenefits - totalCost) / totalCost) * 100;
}

export function calculateTotalCost(
  implementationCost: number = 0,
  operationalCost: number = 0,
  maintenanceCost: number = 0
): number {
  return implementationCost + operationalCost + maintenanceCost;
}

export function calculateTotalBenefits(
  costSavings: number = 0,
  revenueIncrease: number = 0,
  productivityGains: number = 0
): number {
  return costSavings + revenueIncrease + productivityGains;
}

// ============================================================================
// RISK CALCULATION UTILITIES
// ============================================================================

export function calculateRiskScore(
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  likelihood: number
): number {
  const severityMap = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };
  return severityMap[severity] * likelihood;
}

export function getRiskScoreLabel(score: number): string {
  if (score >= 12) return 'Critical';
  if (score >= 8) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

export function getRiskColor(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  const colorMap = {
    LOW: 'text-green-600 bg-green-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    HIGH: 'text-orange-600 bg-orange-50',
    CRITICAL: 'text-red-600 bg-red-50',
  };
  return colorMap[severity];
}

// ============================================================================
// TREND CALCULATION UTILITIES
// ============================================================================

export function calculateTrend(
  current: number,
  previous: number
): TrendData {
  const changePercentage = previous !== 0 
    ? ((current - previous) / previous) * 100 
    : 0;

  let direction: TrendDirection = 'neutral';
  if (Math.abs(changePercentage) > 1) {
    direction = changePercentage > 0 ? 'up' : 'down';
  }

  return {
    current,
    previous,
    changePercentage,
    direction,
  };
}

export function getTrendIcon(direction: TrendDirection): string {
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  return '→';
}

export function getTrendColor(direction: TrendDirection, isPositiveGood: boolean = true): string {
  if (direction === 'neutral') return 'text-gray-600';
  if (isPositiveGood) {
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  }
  return direction === 'up' ? 'text-red-600' : 'text-green-600';
}

// ============================================================================
// STATUS & BADGE UTILITIES
// ============================================================================

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PLANNING: 'bg-gray-100 text-gray-800',
    PILOT: 'bg-blue-100 text-blue-800',
    SCALING: 'bg-purple-100 text-purple-800',
    PRODUCTION: 'bg-green-100 text-green-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    OPEN: 'bg-orange-100 text-orange-800',
    MITIGATED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-gray-100 text-gray-800',
    CLOSED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-red-100 text-red-800',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DELAYED: 'bg-red-100 text-red-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCSV(str: string): string[] {
  return str.split(',').map(item => item.trim()).filter(Boolean);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// CHART DATA UTILITIES
// ============================================================================

export function fillMissingDates(
  data: Array<{ date: string; value: number }>,
  startDate: Date,
  endDate: Date
): Array<{ date: string; value: number }> {
  const result: Array<{ date: string; value: number }> = [];
  const dataMap = new Map(data.map(d => [d.date, d.value]));
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    result.push({
      date: dateStr,
      value: dataMap.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getSeverityColor(severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'): string {
  const colorMap = {
    INFO: 'text-blue-600 bg-blue-50',
    WARNING: 'text-yellow-600 bg-yellow-50',
    ERROR: 'text-orange-600 bg-orange-50',
    CRITICAL: 'text-red-600 bg-red-50',
  };
  return colorMap[severity];
}
