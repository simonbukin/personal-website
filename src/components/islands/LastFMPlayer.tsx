import { useState, useEffect } from 'react';

interface Track {
  isPlaying: boolean;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
}

export default function LastFMPlayer() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const res = await fetch('/api/lastfm');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTrack(data);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-neutral-800 animate-pulse rounded" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-neutral-800 animate-pulse rounded" />
          <div className="h-3 w-28 bg-neutral-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return null;
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3"
    >
      {track.albumArt && (
        <img
          src={track.albumArt}
          alt={`${track.album} album art`}
          className="w-8 h-8 object-cover rounded"
        />
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {track.isPlaying && (
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-full bg-green-500 animate-pulse" />
              <span className="w-0.5 h-2/3 bg-green-500 animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1/3 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }} />
            </span>
          )}
          <span className="text-xs text-neutral-500">
            {track.isPlaying ? 'Now playing' : 'Last played'}
          </span>
        </div>
        <p className="text-sm truncate mt-0.5">
          <span className="font-medium group-hover:text-white transition-colors">{track.name}</span>
          <span className="text-neutral-500"> — {track.artist}</span>
        </p>
      </div>
    </a>
  );
}
