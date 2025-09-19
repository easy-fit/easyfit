/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  CreateProductDTO,
  GetProductsResponse,
  UpdateProductDTO,
  ProductFilterOptions,
  ProductCommonResponse,
  ProductsByStoreResponse,
  BulkProductUpdateDTO,
} from '@/types/product';
import { CreateVariantDTO, BulkVariantUpdateDTO, BulkVariantRetrievalQuery, VariantWithProduct } from '@/types/variant';

export const useProducts = (filters?: ProductFilterOptions) => {
  return useQuery<GetProductsResponse>({
    queryKey: ['products', filters],
    queryFn: () => api.products.getProducts(filters),
  });
};

export const useProduct = (id: string) => {
  return useQuery<ProductCommonResponse>({
    queryKey: ['products', id],
    queryFn: () => api.products.getProduct(id),
    enabled: !!id,
  });
};

export const useProductBySlug = (storeSlug: string, slug: string) => {
  return useQuery<ProductCommonResponse>({
    queryKey: ['products', 'bySlug', storeSlug, slug],
    queryFn: () => api.products.getProductBySlug(storeSlug, slug),
    enabled: !!(storeSlug && slug),
  });
};

export const useProductsByStore = (storeSlug: string) => {
  return useQuery<ProductsByStoreResponse>({
    queryKey: ['products', 'byStore', storeSlug],
    queryFn: () => api.products.getProductsByStore(storeSlug),
    enabled: !!storeSlug,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: CreateProductDTO) => api.products.createProduct(product),
    onSuccess: (newProduct) => {
      queryClient.setQueryData(['products', newProduct.data.product._id], newProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: UpdateProductDTO) => api.products.updateProduct(id, product),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(['products', id], updatedProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.products.deleteProduct(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['products', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useAddImageToProduct = (productId: string, variantId: string) => {
  return useMutation({
    mutationFn: (data: { key: string; contentType: string; altText?: string }) =>
      api.products.addImageToProduct(productId, variantId, data),
  });
};

export const useDeleteImageFromProduct = (productId: string, variantId: string) => {
  return useMutation({
    mutationFn: (key: string) => api.products.deleteImageFromProduct(productId, variantId, key),
  });
};

export const useCreateVariant = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variant: CreateVariantDTO) => api.products.createVariant(productId, variant),
    onSuccess: (newVariant) => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.setQueryData(['products', productId, 'variants'], (oldVariants: any) => [
        ...(oldVariants || []),
        newVariant.data.variant,
      ]);
    },
  });
};

export const useUpdateVariant = (productId: string, variantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variant: CreateVariantDTO) => api.products.updateVariant(productId, variantId, variant),
    onSuccess: (updatedVariant) => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.setQueryData(['products', productId, 'variants'], (oldVariants: any) =>
        oldVariants.map((v: any) => (v._id === updatedVariant.data.variant._id ? updatedVariant.data.variant : v)),
      );
    },
  });
};

export const useDeleteVariant = (productId: string, variantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.products.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.setQueryData(['products', productId, 'variants'], (oldVariants: any) =>
        oldVariants.filter((v: any) => v._id !== variantId),
      );
    },
  });
};

// Bulk variant operations
export const useBulkVariants = (query: BulkVariantRetrievalQuery, enabled = false) => {
  return useQuery<{ total: number; data: VariantWithProduct[] }>({
    queryKey: ['variants', 'bulk', query],
    queryFn: () => api.products.getBulkVariants(query),
    enabled: enabled && query.productIds.length > 0,
  });
};

export const useVariantsByProducts = (productIds: string[], enabled = false) => {
  return useQuery<{ total: number; data: VariantWithProduct[] }>({
    queryKey: ['variants', 'by-products', productIds],
    queryFn: () => api.products.getVariantsByProducts(productIds),
    enabled: enabled && productIds.length > 0,
  });
};

export const useBulkUpdateVariants = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: BulkVariantUpdateDTO) => api.products.bulkUpdateVariants(updates),
    onSuccess: (result) => {
      // Invalidate all variant-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Update specific product queries if we know which products were affected
      if (result.data.updatedVariants.length > 0) {
        const affectedProductIds = [...new Set(result.data.updatedVariants.map((v) => v.productId))];
        affectedProductIds.forEach((productId) => {
          queryClient.invalidateQueries({ queryKey: ['products', productId] });
        });
      }
    },
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: BulkProductUpdateDTO) => api.products.bulkUpdateProducts(updates),
    onSuccess: () => {
      // Invalidate all product-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] }); // In case store metrics are affected
    },
  });
};

export type { ProductFilterOptions };
