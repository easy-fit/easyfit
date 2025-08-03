import { type NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');

    if (!input || input.trim().length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = ENV.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Configuramos la búsqueda para Argentina y priorizamos direcciones
    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      types: 'address',
      components: 'country:ar', // Restringir a Argentina
      language: 'es', // Respuestas en español
    });

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    // Formatear las predicciones para nuestro frontend
    const formattedPredictions =
      data.predictions?.map(
        (prediction: {
          place_id: string;
          description: string;
          structured_formatting: { main_text: string; secondary_text: string };
          types: string[];
        }) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          main_text: prediction.structured_formatting?.main_text || '',
          secondary_text: prediction.structured_formatting?.secondary_text || '',
          types: prediction.types,
        }),
      ) || [];

    return NextResponse.json({
      predictions: formattedPredictions,
      status: data.status,
    });
  } catch (error) {
    console.error('Places Autocomplete API error:', error);
    return NextResponse.json({ error: 'Failed to fetch place suggestions' }, { status: 500 });
  }
}
