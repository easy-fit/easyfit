export interface Address {
  formatted: {
    street: string;
    streetNumber: string;
    city: string;
    province: string;
    postalCode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}
