import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'OMR'): string {
    return new Intl.NumberFormat('ar-OM', {
        style: 'currency',
        currency,
        minimumFractionDigits: 3,
    }).format(amount);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('ar-OM').format(value);
}
