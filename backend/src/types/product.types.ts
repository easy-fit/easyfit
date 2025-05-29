import { Types } from 'mongoose';

export type ProductStatus = 'published' | 'archived' | 'deleted';
export type ProductCategory = 'ropa' | 'accesorio' | 'calzado' | 'fragancia';

export interface Product {
  storeId: Types.ObjectId;
  title: string;
  description: string;
  status: ProductStatus;
  category: ProductCategory;
}

export interface CreateProductDTO {
  storeId: Types.ObjectId;
  title: string;
  description?: string;
  category: ProductCategory;
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  category?: ProductCategory;
  status?: ProductStatus;
}
