import { ENV } from '@/config/env';

/**
 * Build a full image URL from a key/path
 * @param imagePath - The image key or path (e.g., "products/image.jpg")
 * @param fallback - Fallback URL if imagePath is empty
 * @returns Full URL to the image
 */
export function buildImageUrl(imagePath?: string | null, fallback = '/placeholder.svg'): string {
  if (!imagePath) {
    return fallback;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${ENV.R2_PUBLIC_URL}/${cleanPath}`;
}

/**
 * Extract the domain from R2 URL for Next.js image configuration
 */
export function getR2Domain(): string {
  return new URL(ENV.R2_PUBLIC_URL).hostname;
}