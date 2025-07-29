import { BaseApiClient } from './base-client';
import {
  CreateProductDTO,
  GetProductsResponse,
  UpdateProductDTO,
  ProductFilterOptions,
  CreateProductResponse,
  ProductCommonResponse,
} from '@/types/product';
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

  public async getProductsByStore(storeSlug: string): Promise<ProductCommonResponse> {
    return this.fetchApi<ProductCommonResponse>(`/products/store/${storeSlug}`);
  }

  public async createProduct(product: CreateProductDTO): Promise<ProductCommonResponse> {
    return this.fetchApi<ProductCommonResponse>('/products', {
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

  public async addImageToProduct(
    productId: string,
    variantId: string,
    data: imageUploadBody,
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
