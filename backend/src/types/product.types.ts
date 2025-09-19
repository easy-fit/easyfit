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

export interface BulkUploadRowDTO {
  TITLE: string;
  DESCRIPTION?: string;
  CATEGORY: string;
  STATUS?: string;
  SIZE: string;
  COLOR: string;
  PRICE: number;
  STOCK: number;
  SKU: string;
}

export interface BulkUploadValidationError {
  row: number;
  field: string;
  error: string;
  data: Partial<BulkUploadRowDTO>;
}

export interface BulkUploadResponse {
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    productsCreated: number;
    variantsCreated: number;
    errors: number;
  };
  errors: BulkUploadValidationError[];
  warnings: Array<{
    row: number;
    warning: string;
  }>;
}
