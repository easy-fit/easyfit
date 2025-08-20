export interface Address {
  formatted: {
    street: string;
    streetNumber: string;
    apartment?: string;
    floor?: string;
    building?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface DataResponse {
  status: string;
  data: T;
}

export interface MessageResponse {
  status: string;
  message: string;
}

export interface SignedUrl {
  key_img: string;
  url: string;
}

export interface imageUploadBody {
  key_img: string;
  altText?: string;
  contentType: string;
}
