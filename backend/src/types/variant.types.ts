import { Types } from 'mongoose';

export interface VariantImage {
  key: string;
  altText?: string;
  order?: number;
  contentType?: string;
}

export interface Variant {
  productId: Types.ObjectId;
  size: string;
  color: string;
  stock: number;
  images: VariantImage[];
  price: number;
  discount?: number;
  isDefault?: boolean;
  isBulk?: boolean;
  sku: string;
}

export interface CreateVariantDTO {
  size: string;
  color: string;
  stock: number;
  price: number;
  discount?: number;
  images: VariantImage[];
  isDefault?: boolean;
  isBulk?: boolean;
  sku: string;
}

export interface UpdateVariantDTO {
  size?: string;
  color?: string;
  stock?: number;
  price?: number;
  discount?: number;
  images?: VariantImage[];
  isDefault?: boolean;
  sku?: string;
}

export interface BulkVariantUpdateItem {
  variantId: string;
  stock?: number;
  price?: number;
  discount?: number;
  sku?: string;
}

export interface BulkVariantUpdateDTO {
  updates: BulkVariantUpdateItem[];
  productIds?: string[];
}

export interface BulkVariantUpdateResponse {
  successful: number;
  failed: number;
  errors: Array<{
    variantId: string;
    error: string;
  }>;
  updatedVariants: Variant[];
}

export interface BulkVariantRetrievalQuery {
  productIds: string[];
  colors?: string[];
  sizes?: string[];
  search?: string;
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
}
