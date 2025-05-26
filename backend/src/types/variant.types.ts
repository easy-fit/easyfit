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
