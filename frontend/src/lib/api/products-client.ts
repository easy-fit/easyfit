import { BaseApiClient } from './base-client';
import {
  CreateProductDTO,
  GetProductsResponse,
  UpdateProductDTO,
  ProductFilterOptions,
  CreateProductResponse,
  ProductCommonResponse,
  ProductsByStoreResponse,
} from '@/types/product';
import { CreateVariantDTO, createVariantResponse } from '@/types/variant';
import { imageUploadBody } from '@/types/global';
import { AddImageToVariant } from '@/types/variant';
import { buildQueryString } from '@/lib/utils';

export class ProductsClient extends BaseApiClient {
  public async getProducts(filters?: ProductFilterOptions): Promise<GetProductsResponse> {
    const queryString = filters ? buildQueryString(filters) : '';
    return this.fetchApi<GetProductsResponse>(`/products${queryString}`);
  }

  public async getProduct(id: string): Promise<ProductCommonResponse> {
    return this.fetchApi<ProductCommonResponse>(`/products/id/${id}`);
  }

  public async getProductBySlug(storeSlug: string, slug: string): Promise<ProductCommonResponse> {
    return this.fetchApi<ProductCommonResponse>(`/products/${storeSlug}/${slug}`);
  }

  public async getProductsByStore(storeSlug: string): Promise<ProductsByStoreResponse> {
    return this.fetchApi<ProductsByStoreResponse>(`/products/${storeSlug}/products`);
  }

  public async createProduct(product: CreateProductDTO): Promise<CreateProductResponse> {
    return this.fetchApi<CreateProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  public async updateProduct(id: string, product: UpdateProductDTO): Promise<CreateProductResponse> {
    return this.fetchApi<CreateProductResponse>(`/products/id/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  public async deleteProduct(id: string): Promise<void> {
    return this.fetchApi<void>(`/products/id/${id}`, { method: 'DELETE' });
  }

  public async createVariant(id: string, variant: CreateVariantDTO): Promise<createVariantResponse> {
    return this.fetchApi<createVariantResponse>(`/products/${id}/variants`, {
      method: 'POST',
      body: JSON.stringify(variant),
    });
  }

  public async updateVariant(id: string, variantId: string, variant: CreateVariantDTO): Promise<createVariantResponse> {
    return this.fetchApi<createVariantResponse>(`/products/${id}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(variant),
    });
  }

  public async addImageToProduct(
    productId: string,
    variantId: string,
    data: { key: string; contentType: string; altText?: string },
  ): Promise<AddImageToVariant> {
    return this.fetchApi<AddImageToVariant>(`/products/${productId}/variants/${variantId}/images`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deleteImageFromProduct(productId: string, variantId: string, key: string): Promise<void> {
    return this.fetchApi<void>(`/products/${productId}/variants/${variantId}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ key }),
    });
  }
}
