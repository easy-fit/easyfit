export interface Address {
  formatted: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}
