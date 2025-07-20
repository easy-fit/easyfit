import { Types } from 'mongoose';

export type ProductStatus = 'published' | 'archived' | 'deleted';
export type ProductCategory = 'clothing' | 'accessories' | 'footwear' | 'fragrance';

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Product {
  storeId: Types.ObjectId;
  title: string;
  description: string;
  status: ProductStatus;
  category: ProductCategory;
  slug: string;
}

export interface CreateProductDTO {
  title: string;
  description?: string;
  status?: ProductStatus;
  category: ProductCategory;
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  slug?: string;
}
