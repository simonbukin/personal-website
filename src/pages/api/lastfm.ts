import type { APIRoute } from 'astro';

export const prerender = false;

const LASTFM_USERNAME = 'sbukin_';

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.LASTFM_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${apiKey}&format=json&limit=1`
    );

    if (!response.ok) {
      throw new Error('Last.FM API error');
    }

    const data = await response.json();
    const track = data.recenttracks?.track?.[0];

    if (!track) {
      return new Response(JSON.stringify({ error: 'No track found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isPlaying = track['@attr']?.nowplaying === 'true';
    const albumArt = track.image?.find((img: { size: string; '#text': string }) => img.size === 'extralarge')?.['#text'] || '';

    return new Response(JSON.stringify({
      isPlaying,
      name: track.name,
      artist: track.artist?.['#text'] || '',
      album: track.album?.['#text'] || '',
      albumArt,
      url: track.url,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
