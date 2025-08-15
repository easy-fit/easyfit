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
