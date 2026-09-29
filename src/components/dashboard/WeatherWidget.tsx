import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionHindi: string;
  icon: string;
  daily: Array<{ day: string; max: number; min: number }>;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cityInput, setCityInput] = useState('New Delhi');
  const [showSearch, setShowSearch] = useState(false);

  const fetchWeather = async (city: string = 'New Delhi') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('New Delhi');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
      setShowSearch(false);
    }
  };

  const getWeatherIcon = (name?: string) => {
    switch (name) {
      case 'Sun':
        return <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
      case 'CloudSun':
        return <CloudSun className="w-8 h-8 text-cyan-300" />;
      case 'CloudRain':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'CloudLightning':
        return <CloudLightning className="w-8 h-8 text-yellow-400 animate-bounce" />;
      default:
        return <Cloud className="w-8 h-8 text-slate-300" />;
    }
  };

  return (
    <div className="relative p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Atmospheric Radar
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 transition"
            title="Search City"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fetchWeather(weather?.city || 'New Delhi')}
            className={`p-1 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 transition ${
              loading ? 'animate-spin' : ''
            }`}
            title="Refresh Weather"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="mb-3 flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="शहर का नाम (e.g. Mumbai, Delhi, Lucknow)..."
            className="flex-1 bg-gray-950 border border-cyan-800 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1.5 rounded-lg font-mono"
          >
            Check
          </button>
        </form>
      )}

      {weather ? (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
                {weather.temp}°C
                <span className="text-xs font-normal text-slate-400">
                  (Feels like {weather.feelsLike}°C)
                </span>
              </div>
              <div className="text-sm font-medium text-cyan-300">
                {weather.conditionHindi}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {weather.city}, India
              </div>
            </div>
            <div className="p-2 rounded-xl bg-gray-950/60 border border-cyan-900/40">
              {getWeatherIcon(weather.icon)}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-cyan-950 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wind: {weather.windSpeed} km/h</span>
            </div>
          </div>

          {/* 5 Day Forecast */}
          <div className="mt-3 flex justify-between gap-1 pt-2 border-t border-cyan-950">
            {weather.daily.map((d, idx) => (
              <div
                key={idx}
                className="flex-1 text-center py-1 rounded bg-gray-950/40 border border-cyan-950/60 text-[10px] font-mono"
              >
                <div className="text-slate-400">{d.day}</div>
                <div className="text-white font-bold">{d.max}°</div>
                <div className="text-slate-500">{d.min}°</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-28 flex items-center justify-center text-xs text-cyan-500/80 animate-pulse font-mono">
          Radar scanning atmospheric satellites...
        </div>
      )}
    </div>
  );
};
