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
} from '@/types/product';
import { CreateVariantDTO } from '@/types/variant';

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

export type { ProductFilterOptions };
