export interface VariantImage {
  key: string;
  altText?: string;
  order?: number;
  contentType?: string;
}

export interface Variant {
  _id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  images: VariantImage[];
  price: number;
  discount: number;
  sku: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantDTO {
  size: string;
  color: string;
  stock: number;
  price: number;
  discount?: number;
  isDefault?: boolean;
  images?: VariantImage[];
}

export interface AddImageToVariant {
  data: {
    variant: Variant;
    uploadInfo: {
      key: string;
      url: string;
    };
  };
}

export interface createVariantResponse {
  data: {
    variant: Variant;
    signedUrls: { key_img: string; url: string }[];
  };
}

// Bulk operations types
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

export interface VariantWithProduct extends Variant {
  productId: {
    _id: string;
    title: string;
    slug: string;
    category: string;
    storeId?: {
      _id: string;
      name: string;
      slug: string;
    };
  };
}
