import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SkyWeatherForecast } from '../types';
import { fetchSkyWeather } from '../services/weatherService';

interface GeolocationContextType {
  userLocation: { lat: number; lng: number };
  userLocationName: string;
  isRealGps: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isLocating: boolean;
  error: string | null;
  requestGeoPermission: () => Promise<boolean>;
  setCustomLocation: (name: string, lat: number, lng: number) => void;
  calculateDistance: (lat: number, lng: number) => number;
  weather: SkyWeatherForecast | null;
  isWeatherLoading: boolean;
  refreshWeather: () => Promise<void>;
  presetHubs: { name: string; region: string; lat: number; lng: number }[];
}

const DEFAULT_COORDS = { lat: 40.4168, lng: -3.7038 }; // Madrid / Centro Peninsular
const DEFAULT_NAME = 'Madrid, España';

const PRESET_HUBS = [
  { name: 'Madrid Central', region: 'Comunidad de Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Parque Nacional del Teide', region: 'Tenerife, Canarias', lat: 28.2723, lng: -16.6425 },
  { name: 'Pirineo Aragonés (Benasque)', region: 'Huesca, Aragón', lat: 42.6053, lng: 0.5226 },
  { name: 'Sierra Nevada / Veleta', region: 'Granada, Andalucía', lat: 37.0544, lng: -3.3653 },
  { name: 'Picos de Europa', region: 'Asturias / Cantabria', lat: 43.1956, lng: -4.8383 },
  { name: 'Sierra de Gredos', region: 'Ávila, Castilla y León', lat: 40.3541, lng: -5.2934 },
  { name: 'Cap de Formentor', region: 'Mallorca, Baleares', lat: 39.9622, lng: 3.2131 },
  { name: 'Costa Brava / Cap de Creus', region: 'Girona, Catalunya', lat: 42.3188, lng: 3.3155 },
];

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

// Haversine formula to compute great-circle distance in kilometers
export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const GeolocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(() => {
    const saved = localStorage.getItem('onlycloud_geo_coords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COORDS;
      }
    }
    return DEFAULT_COORDS;
  });

  const [userLocationName, setUserLocationName] = useState<string>(() => {
    return localStorage.getItem('onlycloud_geo_name') || DEFAULT_NAME;
  });

  const [isRealGps, setIsRealGps] = useState<boolean>(() => {
    return localStorage.getItem('onlycloud_geo_is_gps') === 'true';
  });

  const [permissionStatus, setPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [weather, setWeather] = useState<SkyWeatherForecast | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Check initial permissions if browser supports it
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            setPermissionStatus('granted');
            // If already granted, refresh GPS quietly
            requestGeoPermission();
          } else if (result.state === 'denied') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }

          result.onchange = () => {
            if (result.state === 'granted') {
              setPermissionStatus('granted');
            } else if (result.state === 'denied') {
              setPermissionStatus('denied');
              setIsRealGps(false);
            } else {
              setPermissionStatus('prompt');
            }
          };
        })
        .catch(() => {
          // Ignore unsupported query
        });
    }
  }, []);

  // Fetch weather whenever location changes
  const updateWeatherForLocation = useCallback(
    async (coords: { lat: number; lng: number }, name: string) => {
      setIsWeatherLoading(true);
      try {
        const forecast = await fetchSkyWeather(coords.lat, coords.lng, name);
        setWeather(forecast);
      } catch (e) {
        console.error('Weather load error:', e);
      } finally {
        setIsWeatherLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    updateWeatherForLocation(userLocation, userLocationName);
  }, [userLocation.lat, userLocation.lng, userLocationName, updateWeatherForLocation]);

  // Reverse geocoding using OpenStreetMap Nominatim (Free, no keys/IDs)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.municipality ||
          data.address?.county ||
          data.address?.province ||
          data.address?.state;
        const country = data.address?.country || 'España';
        if (city) {
          return `${city}, ${country}`;
        }
      }
    } catch {
      // ignore network errors, fallback to closest preset
    }

    // Fallback: match closest known city
    let closestName = 'Tu ubicación (GPS)';
    let minD = Infinity;
    for (const hub of PRESET_HUBS) {
      const d = haversineDistance(lat, lng, hub.lat, hub.lng);
      if (d < minD) {
        minD = d;
        closestName = `${hub.name} (~${d} km)`;
      }
    }
    return closestName;
  };

  const requestGeoPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con este navegador.');
      setPermissionStatus('unsupported');
      return false;
    }

    setIsLocating(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCoords = { lat, lng };

          setUserLocation(newCoords);
          setIsRealGps(true);
          setPermissionStatus('granted');

          localStorage.setItem('onlycloud_geo_coords', JSON.stringify(newCoords));
          localStorage.setItem('onlycloud_geo_is_gps', 'true');

          // Find human-readable city name
          const name = await reverseGeocode(lat, lng);
          setUserLocationName(name);
          localStorage.setItem('onlycloud_geo_name', name);

          setIsLocating(false);
          resolve(true);
        },
        (err) => {
          console.warn('Geolocation permission error or rejected:', err.message);
          setIsLocating(false);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setError('Has denegado el permiso de ubicación. Puedes elegir una zona manualmente.');
          } else {
            setError('No pudimos obtener tu ubicación con precisión. Usando zona por defecto.');
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const setCustomLocation = (name: string, lat: number, lng: number) => {
    const coords = { lat, lng };
    setUserLocation(coords);
    setUserLocationName(name);
    setIsRealGps(false);
    localStorage.setItem('onlycloud_geo_coords', JSON.stringify(coords));
    localStorage.setItem('onlycloud_geo_name', name);
    localStorage.setItem('onlycloud_geo_is_gps', 'false');
  };

  const calculateDistance = (lat: number, lng: number): number => {
    return haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
  };

  const refreshWeather = async () => {
    await updateWeatherForLocation(userLocation, userLocationName);
  };

  return (
    <GeolocationContext.Provider
      value={{
        userLocation,
        userLocationName,
        isRealGps,
        permissionStatus,
        isLocating,
        error,
        requestGeoPermission,
        setCustomLocation,
        calculateDistance,
        weather,
        isWeatherLoading,
        refreshWeather,
        presetHubs: PRESET_HUBS,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
