import { api } from '@/lib/api/client';
import type { ProductFormValues } from '@/components/products/edit/schemas';
import type { ProductCategory } from '@/types/product';
import type { SignedUrl } from '@/types/global';

export interface VariantOperationResult {
  successfulOperations: number;
  failedOperations: number;
}

export interface VariantOperationCallbacks {
  onUpdate: (message: string) => void;
  onProgressUpdate?: (message: string, description?: string) => void;
  onSuccess: (message: string, description?: string) => void;
  onWarning: (message: string, description?: string) => void;
  onError: (message: string, description?: string) => void;
  uploadImages: (files: File[], signedUrls: SignedUrl[]) => Promise<any>;
}

export async function updateProductData(
  productId: string,
  data: ProductFormValues,
  updateProductMutation: any,
  callbacks: VariantOperationCallbacks,
): Promise<void> {
  const productUpdatePayload = {
    title: data.title,
    description: data.description || '',
    category: data.category as ProductCategory,
    status: data.status,
  };

  await updateProductMutation.mutateAsync(productUpdatePayload);
  callbacks.onUpdate('Procesando variantes...');
}

export async function processExistingVariant(
  productId: string,
  variant: any,
  callbacks: VariantOperationCallbacks,
): Promise<boolean> {
  try {
    const existingImages = variant.images.filter((img: any) => !img.isNew);
    const newImages = variant.images.filter((img: any) => img.isNew && img.file);

    // Update variant with existing images only
    const updateVariantPayload = {
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      price: Math.round(variant.price), // Price as whole amount
      sku: variant.sku,
      isDefault: variant.isDefault,
      images: existingImages
        .filter((img: any) => img.key) // Filter out images without keys
        .map((img: any) => ({
          key: img.key!,
          altText: img.altText || '',
          order: img.order || 0,
          contentType: img.contentType || 'image/jpeg',
        })),
    };

    await api.products.updateVariant(productId, variant._id, updateVariantPayload);

    // Handle new images separately if any
    if (newImages.length > 0) {
      await uploadVariantImages(productId, variant._id, newImages, callbacks);
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function processNewVariant(
  productId: string,
  variant: any,
  createVariantMutation: any,
  callbacks: VariantOperationCallbacks,
): Promise<boolean> {
  try {
    const createVariantPayload = {
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      price: Math.round(variant.price), // Price as whole amount
      sku: variant.sku,
      isDefault: variant.isDefault,
      images: variant.images.map((img: any, index: number) => ({
        key: `${Math.random().toString(36).substr(2, 9)}.jpg`,
        contentType: img.file?.type || 'image/jpeg',
        altText: img.altText || 'Imagen del producto',
        order: index + 1,
      })),
    };

    const result = await createVariantMutation.mutateAsync(createVariantPayload);

    // Handle new images for this variant if any
    const newImages = variant.images.filter((img: any) => img.isNew && img.file);
    if (newImages.length > 0 && result.data.signedUrls && result.data.signedUrls.length > 0) {
      const files = newImages.map((img: any) => img.file!);
      const signedUrlObjects = result.data.signedUrls as SignedUrl[];

      const uploadResult = await callbacks.uploadImages(files, signedUrlObjects);
      if (!uploadResult.allSuccessful) {
        callbacks.onWarning('Algunas imágenes de variante fallaron', `${uploadResult.failedCount} imágenes no se pudieron subir`);
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function uploadVariantImages(
  productId: string,
  variantId: string,
  newImages: any[],
  callbacks: VariantOperationCallbacks,
): Promise<void> {
  let uploadedCount = 0;

  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];

    try {
      const imagePayload = {
        key: `${Math.random().toString(36).substr(2, 9)}.jpg`,
        contentType: img.file?.type || 'image/jpeg',
        altText: img.altText || 'Imagen del producto',
      };

      const imageResponse = await api.products.addImageToProduct(productId, variantId, imagePayload);
      const signedUrlInfo = imageResponse.data.uploadInfo;

      const uploadResult = await callbacks.uploadImages(
        [img.file!],
        [{ url: signedUrlInfo.url, key_img: signedUrlInfo.key }],
      );

      if (uploadResult.allSuccessful) {
        uploadedCount++;
      }
    } catch (error) {
      // Continue with next image
    }
  }

  if (uploadedCount > 0) {
    callbacks.onSuccess('Imágenes nuevas agregadas', `${uploadedCount} imagen${uploadedCount > 1 ? 'es' : ''} agregada${uploadedCount > 1 ? 's' : ''} exitosamente`);
  }

  if (uploadedCount < newImages.length) {
    callbacks.onWarning('Algunas imágenes fallaron', `${newImages.length - uploadedCount} imagen${newImages.length - uploadedCount > 1 ? 'es' : ''} no se pudo${newImages.length - uploadedCount > 1 ? 'ieron' : ''} subir`);
  }
}

export async function processAllVariants(
  productId: string,
  variants: any[],
  createVariantMutation: any,
  callbacks: VariantOperationCallbacks,
): Promise<VariantOperationResult> {
  let successfulOperations = 0;
  let failedOperations = 0;

  for (const variant of variants) {
    let success = false;

    if (variant._id) {
      success = await processExistingVariant(productId, variant, callbacks);
    } else {
      success = await processNewVariant(productId, variant, createVariantMutation, callbacks);
    }

    if (success) {
      successfulOperations++;
    } else {
      failedOperations++;
    }
  }

  return { successfulOperations, failedOperations };
}

export function showResults(
  result: VariantOperationResult,
  callbacks: VariantOperationCallbacks,
): void {
  if (result.failedOperations === 0) {
    callbacks.onSuccess('Producto actualizado completamente', 'Todos los cambios se guardaron exitosamente');
  } else {
    callbacks.onWarning('Actualización parcial', `${result.successfulOperations} operaciones exitosas, ${result.failedOperations} fallaron`);
  }
}