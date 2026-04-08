import { useState, useEffect, useCallback } from "react";
import {
  fetchCurrentWeather,
  fetchForecast,
  type CurrentWeather,
  type ForecastDay,
} from "@/lib/weather";

export function useWeather(city?: string) {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [manualLocation, setManualLocation] = useState(false);

  const fetchDataByCoords = async (lat: number, lon: number) => {
    try {
      const [c, f] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
      ]);

      setCurrent(c);
      setForecast(f);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchWeatherByCity = async (city: string) => {
    if (!city.trim()) return;

    setError(null);
    setManualLocation(true);
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );

      const data = await res.json();

      if (!data.coord) {
        setError("City not found");
        return;
      }

      await fetchDataByCoords(data.coord.lat, data.coord.lon);
    } catch {
      setError("Error fetching weather");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (city) {
      fetchWeatherByCity(city);
    }
  }, [city]);

  useEffect(() => {
    if (city) return;

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => setCoords({ lat: 28.6139, lon: 77.209 })
    );
  }, [city]);

  const fetchData = useCallback(async () => {
    if (!coords) return;

    setLoading(true);
    setError(null);

    try {
      await fetchDataByCoords(coords.lat, coords.lon);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    if (manualLocation) return;
    if (coords) fetchData();
  }, [coords, fetchData, manualLocation]);

  return {
    current,
    forecast,
    loading,
    error,
    fetchWeatherByCity,
    resetToCurrentLocation: () => {
      setManualLocation(false);
      navigator.geolocation.getCurrentPosition((pos) =>
        fetchDataByCoords(pos.coords.latitude, pos.coords.longitude)
      );
    },
  };
}