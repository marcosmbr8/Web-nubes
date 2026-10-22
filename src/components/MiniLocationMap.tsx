import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MiniLocationMapProps {
  lat: number;
  lng: number;
  locationName: string;
  distanceKm?: number | null;
}

export const MiniLocationMap: React.FC<MiniLocationMapProps> = ({
  lat,
  lng,
  locationName,
  distanceKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { theme } = useAuth();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    const pinHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-sky-400/30 animate-ping"></span>
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'mini-photo-pin',
      html: pinHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(`<strong style="font-size: 11px;">${locationName}</strong>`);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, locationName, theme]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 space-y-2">
      <div ref={mapContainerRef} className="w-full h-36 relative z-0" />
      <div className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-[#0E1626]">
        <div>
          <span className="font-semibold text-[#263B54] dark:text-white block truncate max-w-[200px]">
            {locationName}
          </span>
          <span className="text-[10px] text-[#71849A]">
            {lat.toFixed(4)}, {lng.toFixed(4)}
            {distanceKm !== undefined && distanceKm !== null && ` · A ${distanceKm} km`}
          </span>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 font-semibold text-[11px] flex items-center gap-1 hover:opacity-90"
        >
          <span>Cómo llegar</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
