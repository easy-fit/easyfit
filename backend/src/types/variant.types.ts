import { Types } from 'mongoose';

export interface VariantImage {
  key: string;
  altText?: string;
  order?: number;
}

export interface Variant {
  productId: Types.ObjectId;
  size: string;
  color: string;
  stock: number;
  images: VariantImage[];
  price: number;
}

export interface CreateVariantDTO {
  productId: Types.ObjectId;
  size: string;
  color: string;
  stock: number;
  price: number;
  images: VariantImage[];
}

export interface UpdateVariantDTO {
  size?: string;
  color?: string;
  stock?: number;
  price?: number;
  images?: VariantImage[];
}
