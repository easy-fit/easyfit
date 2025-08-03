'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  types: string[];
}

export interface AutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface GeocodeResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
  };
  address_components: {
    street_number: string;
    route: string;
    locality: string;
    administrative_area_level_1: string;
    country: string;
    postal_code: string;
  };
  types: string[];
}

export interface GeocodeResponse {
  result: GeocodeResult;
  status: string;
}

// Hook para autocomplete con debounce
export const usePlacesAutocomplete = (input: string, enabled = true) => {
  const [debouncedInput, setDebouncedInput] = useState(input);

  // Debounce del input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [input]);

  return useQuery({
    queryKey: ['places-autocomplete', debouncedInput],
    queryFn: async (): Promise<AutocompleteResponse> => {
      const params = new URLSearchParams({
        input: debouncedInput,
      });

      const response = await fetch(`/api/places/autocomplete?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch place suggestions');
      }

      return response.json();
    },
    enabled: enabled && debouncedInput.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para geocoding
export const useGeocode = (placeId?: string, address?: string) => {
  return useQuery({
    queryKey: ['geocode', placeId, address],
    queryFn: async (): Promise<GeocodeResponse> => {
      const params = new URLSearchParams();

      if (placeId) {
        params.append('place_id', placeId);
      } else if (address) {
        params.append('address', address);
      }

      const response = await fetch(`/api/places/geocode?${params}`);

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      return response.json();
    },
    enabled: !!(placeId || address),
    staleTime: 30 * 60 * 1000, // 30 minutos (geocoding es más estable)
  });
};
