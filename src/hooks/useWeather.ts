import { useState, useEffect, useCallback } from "react";
import { fetchCurrentWeather, fetchForecast, getApiKey, type CurrentWeather, type ForecastDay } from "@/lib/weather";

export function useWeather() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [hasKey, setHasKey] = useState(!!getApiKey());

  const checkKey = useCallback(() => setHasKey(!!getApiKey()), []);

  const fetchWeatherByCity = async (city: string) => {
  if (!city) return;

  setLoading(true);
  const apiKey = getApiKey();
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    if (!data.coord) {
      setError("City not found");
      return;
    }

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    // 👉 VERY IMPORTANT: this line connects everything
    const [c, f] = await Promise.all([
  fetchCurrentWeather(lat, lon),
  fetchForecast(lat, lon),
]);

setCurrent(c);
setForecast(f);

  } catch (err) {
    setError("Error fetching weather");
  }

  setLoading(false);
};

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 28.6139, lon: 77.209 }) // Default: New Delhi
    );
  }, []);

  const fetchData = useCallback(async () => {
    if (!coords || !getApiKey()) return;
    setLoading(true);
    setError(null);
    try {
      const [c, f] = await Promise.all([
        fetchCurrentWeather(coords.lat, coords.lon),
        fetchForecast(coords.lat, coords.lon),
      ]);
      setCurrent(c);
      setForecast(f);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    if (hasKey && coords) fetchData();
  }, [hasKey, coords, fetchData]);

  return { current, forecast, loading, error, hasKey, checkKey, refetch: fetchData, fetchWeatherByCity };
}
