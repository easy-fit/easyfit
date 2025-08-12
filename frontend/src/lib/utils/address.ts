'use client';

import type { Address } from '@/types/global';
import type { GeocodeResult } from '@/hooks/api/use-places';

/**
 * Convierte un resultado de geocoding de Google Places a nuestro formato de Address
 */
export function convertGeocodeToAddress(geocodeResult: GeocodeResult): Address {
  const components = geocodeResult.address_components;

  return {
    formatted: {
      street: components.route || '',
      streetNumber: components.street_number || '',
      apartment: '', // Google no proporciona esto, se puede agregar manualmente después
      floor: '', // Google no proporciona esto, se puede agregar manualmente después
      building: '', // Google no proporciona esto, se puede agregar manualmente después
      city: components.locality || components.administrative_area_level_1 || '',
      province: components.administrative_area_level_1 || '',
      postalCode: components.postal_code || '',
    },
    location: {
      type: 'Point',
      coordinates: [
        geocodeResult.geometry.location.lng, // longitude first (MongoDB GeoJSON standard)
        geocodeResult.geometry.location.lat, // latitude second
      ],
    },
  };
}

/**
 * Formatea una dirección para mostrar en el UI
 */
export function formatAddressForDisplay(address: Address): string {
  const { formatted } = address;
  return `${formatted.street} ${formatted.streetNumber}${
    formatted.apartment ? `, Depto ${formatted.apartment}` : ''
  }, ${formatted.city}`;
}

/**
 * Crea un objeto Address básico desde un string de dirección
 * (para casos donde no tenemos geocoding completo)
 */
export function createBasicAddress(addressString: string, coordinates?: [number, number]): Address {
  // Intentar parsear la dirección básica
  const parts = addressString.split(',').map((part) => part.trim());

  return {
    formatted: {
      street: parts[0] || addressString,
      streetNumber: '',
      apartment: '',
      floor: '',
      building: '',
      city: parts[1] || 'Bahía Blanca',
      province: parts[2] || 'Buenos Aires',
      postalCode: '',
    },
    location: {
      type: 'Point',
      coordinates: coordinates || [-62.2708, -38.7183], // Default coordinates [lng, lat] (MongoDB standard)
    },
  };
}
