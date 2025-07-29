import { Variant } from './variant';
import { SignedUrl } from './global';

export type ProductStatus = 'published' | 'archived' | 'deleted';
export type ProductCategory = 'clothing' | 'accessories' | 'footwear' | 'fragrance';

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ProductFilterOptions {
  [key: string]: unknown;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Product {
  _id: string;
  storeId: string;
  title: string;
  description: string;
  status: ProductStatus;
  category: ProductCategory;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  storeId: string;
  product: {
    title: string;
    category: string;
    status: string;
    description?: string;
  };
  variants: Variant[];
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  slug?: string;
}

export interface GetProductsResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    products: Product[];
  };
}

export interface CreateProductResponse {
  data: {
    product: Product;
    signedUrls: SignedUrl[];
  };
}

export interface ProductCommonResponse {
  total?: number;
  data: Product;
}
