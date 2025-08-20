import { Types } from 'mongoose';
import { ProductCategory } from './category.types';

export type ProductStatus = 'published' | 'draft' | 'deleted';

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
