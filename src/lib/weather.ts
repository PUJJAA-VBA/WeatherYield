const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;


export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  rain: number;
  pop?: number; // ✅ ADD THIS LINE
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  if (!API_KEY) throw new Error("API key missing");

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );

  if (!res.ok) throw new Error("Failed to fetch weather");

  const d = await res.json();

  return {
    temp: d.main.temp,
    feels_like: d.main.feels_like,
    humidity: d.main.humidity,
    wind_speed: d.wind.speed,
    description: d.weather[0].description,
    icon: d.weather[0].icon,
    city: d.name,
    country: d.sys.country,
    pressure: d.main.pressure,
    visibility: d.visibility,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  if (!API_KEY) throw new Error("API key missing");

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );

  if (!res.ok) throw new Error("Failed to fetch forecast");

  const d = await res.json();

  const days = new Map<string, any>();

  for (const item of d.list) {
    const date = item.dt_txt.split(" ")[0];

    if (!days.has(date)) {
      const dt = new Date(date);

      days.set(date, {
        date,
        day: dt.toLocaleDateString("en", { weekday: "short" }),
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        rain: item.rain?.["3h"] || 0,
        pop: item.pop || 0,
      });
    } else {
      const existing = days.get(date)!;
      existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
      existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
      existing.rain += item.rain?.["3h"] || 0;
    }
  }

  return Array.from(days.values()).slice(0, 7);
}

export function getWeatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
