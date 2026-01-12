import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  description: string;
}

const WEATHER_ICONS: Record<number, string> = {
  0: "☀️", // Clear
  1: "🌤️", // Mainly clear
  2: "⛅", // Partly cloudy
  3: "☁️", // Overcast
  45: "🌫️", // Fog
  48: "🌫️", // Depositing rime fog
  51: "🌧️", // Light drizzle
  53: "🌧️", // Moderate drizzle
  55: "🌧️", // Dense drizzle
  61: "🌧️", // Slight rain
  63: "🌧️", // Moderate rain
  65: "🌧️", // Heavy rain
  71: "🌨️", // Slight snow
  73: "🌨️", // Moderate snow
  75: "🌨️", // Heavy snow
  80: "🌦️", // Slight rain showers
  81: "🌦️", // Moderate rain showers
  82: "⛈️", // Violent rain showers
  95: "⛈️", // Thunderstorm
};

function getWeatherIcon(code: number, isDay: boolean): string {
  // Night variants for clear/partly cloudy
  if (!isDay && code <= 2) {
    return code === 0 ? "🌙" : "🌙";
  }
  return WEATHER_ICONS[code] || "🌡️";
}

export default function SFStatus() {
  const [time, setTime] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update time immediately and every second
    const updateTime = () => {
      const now = new Date();
      const sfTime = now.toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTime(sfTime);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Fetch weather
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather");
        if (response.ok) {
          const data = await response.json();
          setWeather(data);
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  if (loading && !time) {
    return null;
  }

  return (
    <div className="text-sm text-neutral-500">
      <span>{time} in San Francisco</span>
      {weather && (
        <span className="ml-2">
          {getWeatherIcon(weather.weatherCode, weather.isDay)} {weather.temperature}°
        </span>
      )}
    </div>
  );
}
