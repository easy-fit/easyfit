import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const address = searchParams.get('address');

    if (!placeId && !address) {
      return NextResponse.json({ error: 'Either place_id or address is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const params = new URLSearchParams({
      key: apiKey,
      language: 'es',
    });

    // Usar place_id si está disponible (más preciso), sino usar address
    if (placeId) {
      params.append('place_id', placeId);
    } else if (address) {
      params.append('address', address);
    }

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Geocoding API status: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const result = data.results[0];

    // Extraer componentes de la dirección
    const addressComponents = result.address_components;
    const getComponent = (types: string[]) => {
      const component = addressComponents.find((comp: { types: string[] }) =>
        types.some((type: string) => comp.types.includes(type)),
      );
      return component?.long_name || '';
    };

    const formattedResult = {
      place_id: result.place_id,
      formatted_address: result.formatted_address,
      geometry: {
        location: result.geometry.location,
        location_type: result.geometry.location_type,
      },
      address_components: {
        street_number: getComponent(['street_number']),
        route: getComponent(['route']),
        locality: getComponent(['locality', 'administrative_area_level_2']),
        administrative_area_level_1: getComponent(['administrative_area_level_1']),
        country: getComponent(['country']),
        postal_code: getComponent(['postal_code']),
      },
      types: result.types,
    };

    return NextResponse.json({
      result: formattedResult,
      status: data.status,
    });
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 });
  }
}
