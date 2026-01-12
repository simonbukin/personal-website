import type { APIRoute } from 'astro';

export const prerender = false;

const SF_LAT = 37.7749;
const SF_LON = -122.4194;
const CACHE_TTL = 900000; // 15 minutes in ms

interface WeatherCache {
  data: WeatherResponse;
  timestamp: number;
}

interface WeatherResponse {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  description: string;
}

// WMO Weather interpretation codes
const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
};

let cache: WeatherCache | null = null;

export const GET: APIRoute = async () => {
  const now = Date.now();

  // Return cached data if still valid
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cache.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
      },
    });
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', SF_LAT.toString());
    url.searchParams.set('longitude', SF_LON.toString());
    url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('timezone', 'America/Los_Angeles');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Weather API error');
    }

    const data = await response.json();
    const current = data.current;

    const weatherResponse: WeatherResponse = {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      description: WEATHER_CODES[current.weather_code] || 'Unknown',
    };

    // Update cache
    cache = {
      data: weatherResponse,
      timestamp: now,
    };

    return new Response(JSON.stringify(weatherResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
      },
    });
  } catch (error) {
    // If we have stale cache, return it on error
    if (cache) {
      return new Response(JSON.stringify(cache.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch weather' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
