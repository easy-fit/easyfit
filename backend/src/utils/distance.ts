import axios from 'axios';
import allowedDeliveryZones from '../data/allowedDelivery.json';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DistanceResult {
  distance: number;
  duration: number;
}

export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

export const isDeliveryLocationValid = (coordinates: Coordinates): boolean => {
  const point: [number, number] = [coordinates.latitude, coordinates.longitude];

  const deliveryZone = allowedDeliveryZones.features[0];
  if (!deliveryZone || deliveryZone.geometry.type !== 'Polygon') {
    return false;
  }

  const polygonCoordinates = deliveryZone.geometry.coordinates;

  for (const ring of polygonCoordinates) {
    if (isPointInPolygon(point, ring as [number, number][])) {
      return true;
    }
  }

  return false;
};

export const calculateCityDistance = async (origin: Coordinates, destination: Coordinates): Promise<DistanceResult> => {
  try {
    const response = await axios.post(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: 'en-US',
        units: 'METRIC',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
        },
      },
    );

    const route = response.data.routes?.[0];
    if (route) {
      return {
        distance: Math.round((route.distanceMeters / 1000) * 100) / 100, // Convert to km, round to 2 decimals
        duration: Math.round(parseInt(route.duration.replace('s', '')) / 60), // Convert to minutes
      };
    }

    throw new Error('No route found');
  } catch (error) {
    const straightLineDistance = calculateDistance(origin, destination);
    return {
      distance: Math.round(straightLineDistance * 1.4 * 100) / 100, // 1.4x city factor
      duration: Math.round(straightLineDistance * 2), // Rough estimate: 2 minutes per km
    };
  }
};
