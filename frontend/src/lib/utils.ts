import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildQueryString<T extends Record<string, unknown>>(params: T): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((v) => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&')
        : `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return query ? `?${query}` : '';
}
