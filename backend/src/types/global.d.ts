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
    coordinates: [number, number]; // [longitude, latitude] - MongoDB GeoJSON standard
  };
}
