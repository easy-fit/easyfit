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
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddImageToVariant {
  data: {
    variant: Variant;
    uploadInfo: {
      signedUrls: { key_img: string; url: string };
    };
  };
}
