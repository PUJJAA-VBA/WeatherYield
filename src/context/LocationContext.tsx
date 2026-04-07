import { createContext, useContext, useState, useEffect } from "react";

type LocationContextType = {
  city: string;
  setCity: (city: string) => void;
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider = ({ children }: any) => {
  const [city, setCity] = useState(
    localStorage.getItem("city") || ""
  );

  useEffect(() => {
    if (city) {
      localStorage.setItem("city", city); // 🔥 SAVE
    }
  }, [city]);

  return (
    <LocationContext.Provider value={{ city, setCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);

  // ✅ Safe fallback (prevents white screen crash)
  if (!context) {
    return { city: "", setCity: () => {} };
  }

  return context;
};