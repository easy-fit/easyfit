import type { Variant, VariantImage } from './variant';
import type { ShippingType } from './order';

export interface CartProductInfo {
  _id: string;
  title: string;
  allowedShippingTypes?: ShippingType[];
}

export interface CartVariantInfo extends Omit<Variant, 'productId' | 'images'> {
  _id: string;
  productId: CartProductInfo;
  images: VariantImage[];
  price: number;
  discount?: number;
}

export interface CartItem {
  _id: string;
  userId: string;
  variantId: CartVariantInfo;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetCartItemsResponse {
  status: string;
  data: {
    cartItems: CartItem[];
  };
}

export interface GetCartItemResponse {
  status: string;
  data: {
    cartItem: CartItem;
  };
}

export interface CreateCartItemDTO {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity?: number;
}
