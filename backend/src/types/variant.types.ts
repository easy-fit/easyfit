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
  isDefault?: boolean;
}

export interface CreateVariantDTO {
  size: string;
  color: string;
  stock: number;
  price: number;
  images: VariantImage[];
  isDefault?: boolean;
}

export interface UpdateVariantDTO {
  size?: string;
  color?: string;
  stock?: number;
  price?: number;
  images?: VariantImage[];
  isDefault?: boolean;
}
