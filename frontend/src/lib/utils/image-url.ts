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
 * Build a full image URL for store assets (logos, banners, etc.)
 * @param imagePath - The image key or path (e.g., "store-logos/logo.jpg")
 * @param fallback - Fallback URL if imagePath is empty
 * @returns Full URL to the store asset
 */
export function buildStoreAssetUrl(imagePath?: string | null, fallback = '/placeholder.svg'): string {
  if (!imagePath) {
    return fallback;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  return `${ENV.R2_PUBLIC_URL_ASSETS}/${cleanPath}`;
}

/**
 * Build a full URL for tax documents (PDFs, images, etc.)
 * @param documentPath - The document key or path (e.g., "tax-documents/doc.pdf")
 * @param fallback - Fallback URL if documentPath is empty
 * @returns Full URL to the tax document
 */
export function buildTaxDocumentUrl(documentPath?: string | null, fallback = '/placeholder.svg'): string {
  if (!documentPath) {
    return fallback;
  }

  // If it's already a full URL, return as is
  if (documentPath.startsWith('http')) {
    return documentPath;
  }

  // Remove leading slash if present
  const cleanPath = documentPath.startsWith('/') ? documentPath.slice(1) : documentPath;

  return `${ENV.R2_PUBLIC_URL_STORES_TAX}/${cleanPath}`;
}

/**
 * Extract the domain from R2 URL for Next.js image configuration
 */
export function getR2Domain(): string {
  return new URL(ENV.R2_PUBLIC_URL).hostname;
}
