import type { Variant, VariantImage } from './variant';

export interface CartProductInfo {
  _id: string;
  title: string;
}

export interface CartVariantInfo extends Omit<Variant, 'productId' | 'images'> {
  _id: string;
  productId: CartProductInfo;
  images: VariantImage[];
  price: number;
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
