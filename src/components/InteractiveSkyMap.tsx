import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Compass,
  Crosshair,
  Maximize2,
  Minimize2,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  X,
  ExternalLink,
  Navigation,
  Globe,
  Satellite,
  RotateCw,
  Users,
  MessageCircle,
  UserCheck,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { SkyEvent, SkySpot } from '../types';
import { useGeolocation } from '../context/GeolocationContext';
import { useAuth } from '../context/AuthContext';
import { useFriends, FriendContact } from '../context/FriendsContext';

interface InteractiveSkyMapProps {
  events: SkyEvent[];
  spots: SkySpot[];
  selectedSpotId?: string | null;
  onSelectSpot?: (spot: SkySpot | null) => void;
  onSelectEvent?: (event: SkyEvent | null) => void;
  onStartDirectChat?: (friend: FriendContact) => void;
  onOpenAuthorProfile?: (username: string, name: string, avatar: string, id?: string) => void;
}

export const InteractiveSkyMap: React.FC<InteractiveSkyMapProps> = ({
  events,
  spots,
  selectedSpotId,
  onSelectSpot,
  onSelectEvent,
  onStartDirectChat,
  onOpenAuthorProfile,
}) => {
  const {
    userLocation,
    userLocationName,
    isRealGps,
    requestGeoPermission,
    isLocating,
    calculateDistance,
    presetHubs,
    setCustomLocation,
  } = useGeolocation();
  const { theme } = useAuth();
  const { friendsOnMap, acceptedFriends } = useFriends();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Map Provider Mode: 'leaflet_osm' | 'satellite' | 'google_maps'
  const [mapEngine, setMapEngine] = useState<'leaflet_osm' | 'satellite' | 'google_maps'>('leaflet_osm');

  // Layer filter state
  const [activeLayerFilter, setActiveLayerFilter] = useState<
    'all' | 'friends' | 'atardecer' | 'cielo_oscuro' | 'mar_de_nubes' | 'events'
  >('all');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHubPicker, setShowHubPicker] = useState(false);
  const [showFriendsRadar, setShowFriendsRadar] = useState(false);
  const [activeItem, setActiveItem] = useState<{
    type: 'spot' | 'event' | 'friend';
    data: SkySpot | SkyEvent | FriendContact;
  } | null>(null);

  const [clickedMapPoint, setClickedMapPoint] = useState<{
    lat: number;
    lng: number;
    distance: number;
  } | null>(null);

  const [tileErrorCount, setTileErrorCount] = useState(0);

  // Coordinates of current view or focus point
  const currentTargetCoords = userLocation;

  const refreshMapSize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  // Initialize or reconfigure Leaflet Map
  useEffect(() => {
    if (mapEngine === 'google_maps') return;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentTargetCoords.lat, currentTargetCoords.lng],
      zoom: 6,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tile URLs: 100% free with NO API key or token required
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri &mdash; OpenStreetMap contributors';
    let subdomains: string | string[] = 'abc';

    if (mapEngine === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri World Imagery';
    } else if (theme === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      subdomains = 'abcd';
    } else {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri & OpenStreetMap';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains,
    }).addTo(map);

    tileLayer.on('tileerror', () => {
      setTileErrorCount((prev) => prev + 1);
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Listen to map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const dist = calculateDistance(lat, lng);
      setClickedMapPoint({ lat, lng, distance: dist });
    });

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapEngine, theme]);

  // Handle ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      refreshMapSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [refreshMapSize]);

  useEffect(() => {
    const t = setTimeout(refreshMapSize, 300);
    return () => clearTimeout(t);
  }, [isFullscreen, refreshMapSize]);

  // Update User Marker on Leaflet map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapEngine === 'google_maps') return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-sky-400/40 animate-ping"></span>
        <span class="relative w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </span>
      </div>
    `;

    const userDivIcon = L.divIcon({
      className: 'user-radar-pin',
      html: userIconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userDivIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <div style="font-weight: 700; color: #263B54;">📍 Tu ubicación</div>
        <div style="color: #71849A; margin-top: 2px;">${userLocationName}</div>
        <div style="color: #0284c7; font-size: 11px; margin-top: 4px; font-weight: 600;">
          ${isRealGps ? 'GPS del dispositivo activo' : 'Zona fijada'}
        </div>
      </div>
    `);

    userMarkerRef.current = marker;
  }, [userLocation, userLocationName, isRealGps, mapEngine, theme]);

  // Update Spots, Events and Friends Markers on Leaflet map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || mapEngine === 'google_maps') return;

    markersGroup.clearLayers();

    // 1. FRIENDS WITH LOCATION PERMISSION GRANTED ("ESAS PERSONAS SI TIENEN ACEPTADO EL PERMISO DE LOCALIZACION")
    if (activeLayerFilter === 'all' || activeLayerFilter === 'friends') {
      friendsOnMap.forEach((friend) => {
        if (!friend.coordinates) return;

        const isOnline = friend.online;
        const friendHtml = `
          <div class="relative cursor-pointer group flex flex-col items-center hover:scale-115 transition-transform duration-200">
            <div class="relative">
              <span class="absolute -inset-1 rounded-full ${isOnline ? 'bg-emerald-400/60 animate-ping' : 'bg-slate-400/30'}"></span>
              <img
                src="${friend.avatar}"
                alt="${friend.name}"
                class="relative w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-xl ring-2 ring-white dark:ring-[#0E1626]"
              />
              <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'} border-2 border-white"></span>
            </div>
            <div class="px-2.5 py-0.5 rounded-full bg-[#0E1626]/90 text-white text-[10px] font-bold shadow-lg mt-1 border border-emerald-400 flex items-center gap-1 whitespace-nowrap">
              <span>👥</span>
              <span>${friend.name.split(' ')[0]}</span>
              <span class="text-[9px] text-emerald-400">· Amigo</span>
            </div>
          </div>
        `;

        const friendDivIcon = L.divIcon({
          className: 'friend-custom-marker',
          html: friendHtml,
          iconSize: [80, 56],
          iconAnchor: [40, 48],
        });

        const friendMarker = L.marker([friend.coordinates.lat, friend.coordinates.lng], {
          icon: friendDivIcon,
          zIndexOffset: 950,
        }).addTo(markersGroup);

        friendMarker.on('click', () => {
          setActiveItem({ type: 'friend', data: friend });
          if (friend.coordinates) {
            map.panTo([friend.coordinates.lat, friend.coordinates.lng]);
          }
        });
      });
    }

    // 2. Recommended Sky Spots
    if (activeLayerFilter !== 'events' && activeLayerFilter !== 'friends') {
      const filteredSpots = spots.filter((spot) => {
        if (activeLayerFilter === 'all') return true;
        return spot.tipo === activeLayerFilter;
      });

      filteredSpots.forEach((spot) => {
        const isSelected = selectedSpotId === spot.id;

        let badgeBg = 'bg-amber-500';
        let emoji = '🌅';
        if (spot.tipo === 'cielo_oscuro') {
          badgeBg = 'bg-indigo-600';
          emoji = '🌌';
        } else if (spot.tipo === 'mar_de_nubes') {
          badgeBg = 'bg-sky-500';
          emoji = '☁️';
        }

        const spotHtml = `
          <div class="relative cursor-pointer group transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-115'
          }">
            <div class="px-2.5 py-1 rounded-full ${badgeBg} text-white text-[11px] font-bold shadow-md flex items-center gap-1 border-2 ${
          isSelected ? 'border-amber-300 ring-4 ring-amber-300/40' : 'border-white'
        } whitespace-nowrap">
              <span>${emoji}</span>
              <span class="max-w-[110px] truncate">${spot.nombre.split('(')[0].trim()}</span>
            </div>
            <div class="w-2 h-2 ${badgeBg} rotate-45 mx-auto -mt-1 border-r border-b border-white"></div>
          </div>
        `;

        const spotIcon = L.divIcon({
          className: 'spot-custom-marker',
          html: spotHtml,
          iconSize: [120, 32],
          iconAnchor: [60, 30],
        });

        const spotMarker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(markersGroup);

        spotMarker.on('click', () => {
          setActiveItem({ type: 'spot', data: spot });
          onSelectSpot?.(spot);
          map.panTo([spot.lat, spot.lng]);
        });
      });
    }

    // 3. Calendar Events
    if (activeLayerFilter === 'all' || activeLayerFilter === 'events') {
      events.forEach((ev) => {
        if (!ev.coordenadas) return;

        const isNatural = ev.tipo_evento === 'acontecimiento_natural';
        const evColor = isNatural ? 'bg-purple-600' : 'bg-blue-600';
        const evIcon = isNatural ? '⭐' : '👥';

        const evHtml = `
          <div class="relative cursor-pointer hover:scale-115 transition-transform duration-200">
            <div class="px-2.5 py-1 rounded-full ${evColor} text-white text-[11px] font-bold shadow-md flex items-center gap-1 border-2 border-white whitespace-nowrap">
              <span>${evIcon}</span>
              <span class="max-w-[120px] truncate">${ev.titulo}</span>
            </div>
            <div class="w-2 h-2 ${evColor} rotate-45 mx-auto -mt-1 border-r border-b border-white"></div>
          </div>
        `;

        const evDivIcon = L.divIcon({
          className: 'event-custom-marker',
          html: evHtml,
          iconSize: [130, 32],
          iconAnchor: [65, 30],
        });

        const evMarker = L.marker([ev.coordenadas.lat, ev.coordenadas.lng], { icon: evDivIcon }).addTo(markersGroup);

        evMarker.on('click', () => {
          setActiveItem({ type: 'event', data: ev });
          onSelectEvent?.(ev);
          if (ev.coordenadas) {
            map.panTo([ev.coordenadas.lat, ev.coordenadas.lng]);
          }
        });
      });
    }
  }, [spots, events, friendsOnMap, activeLayerFilter, selectedSpotId, mapEngine]);

  // Pan to selectedSpotId if prop changes
  useEffect(() => {
    if (!selectedSpotId) return;
    const target = spots.find((s) => s.id === selectedSpotId);
    if (target) {
      if (mapInstanceRef.current && mapEngine !== 'google_maps') {
        mapInstanceRef.current.flyTo([target.lat, target.lng], 10, { duration: 1.2 });
      }
      setActiveItem({ type: 'spot', data: target });
    }
  }, [selectedSpotId, spots, mapEngine]);

  const handleCenterOnUser = async () => {
    if (!isRealGps) {
      await requestGeoPermission();
    }
    if (mapInstanceRef.current && mapEngine !== 'google_maps') {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 1 });
    }
  };

  const handlePresetSelect = (hub: (typeof presetHubs)[0]) => {
    setCustomLocation(hub.name, hub.lat, hub.lng);
    setShowHubPicker(false);
    if (mapInstanceRef.current && mapEngine !== 'google_maps') {
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 9, { duration: 1 });
    }
  };

  const flyToFriend = (friend: FriendContact) => {
    if (!friend.coordinates) return;
    setShowFriendsRadar(false);
    setActiveItem({ type: 'friend', data: friend });
    if (mapInstanceRef.current && mapEngine !== 'google_maps') {
      mapInstanceRef.current.flyTo([friend.coordinates.lat, friend.coordinates.lng], 10, { duration: 1.2 });
    }
  };

  const getGoogleMapsDirectionsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[540px] sm:h-[620px]'
      }`}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-14 z-[400] flex items-center justify-between gap-2 pointer-events-none flex-wrap">
        {/* Left: Hub Picker button & Friends radar button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowHubPicker((prev) => !prev)}
            className="px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md text-xs font-bold text-[#263B54] dark:text-white flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin-slow" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate">{userLocationName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#71849A] rotate-90" />
          </button>

          {/* Friends on Radar Button */}
          <button
            onClick={() => setShowFriendsRadar((prev) => !prev)}
            className={`px-3 py-2 rounded-full backdrop-blur-md border shadow-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              friendsOnMap.length > 0
                ? 'bg-emerald-500/95 text-white border-emerald-400 hover:bg-emerald-600'
                : 'bg-white/95 dark:bg-[#0E1626]/95 text-[#71849A] border-slate-200 dark:border-slate-700'
            }`}
            title="Ver amigos que comparten ubicación GPS"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Amigos GPS ({friendsOnMap.length})</span>
          </button>
        </div>

        {/* Engine Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md p-1 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-md">
          <button
            onClick={() => setMapEngine('leaflet_osm')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
              mapEngine === 'leaflet_osm'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
            }`}
            title="Mapa Esri / OpenStreetMap"
          >
            <Compass className="w-3 h-3" />
            <span>Calles</span>
          </button>
          <button
            onClick={() => setMapEngine('satellite')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
              mapEngine === 'satellite'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
            }`}
            title="Vista Satélite HD Esri"
          >
            <Satellite className="w-3 h-3" />
            <span>Satélite</span>
          </button>
          <button
            onClick={() => setMapEngine('google_maps')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
              mapEngine === 'google_maps'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
            }`}
            title="Modo Google Maps directo"
          >
            <Globe className="w-3 h-3" />
            <span>Google Maps</span>
          </button>
        </div>

        {/* Layer Filters Pills */}
        {mapEngine !== 'google_maps' && (
          <div className="hidden xl:flex pointer-events-auto items-center gap-1 bg-white/90 dark:bg-[#0E1626]/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setActiveLayerFilter('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                activeLayerFilter === 'all'
                  ? 'bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E]'
                  : 'text-[#71849A] hover:text-[#263B54]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveLayerFilter('friends')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                activeLayerFilter === 'friends' ? 'bg-emerald-500 text-white' : 'text-[#71849A]'
              }`}
            >
              👥 Amigos ({friendsOnMap.length})
            </button>
            <button
              onClick={() => setActiveLayerFilter('atardecer')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                activeLayerFilter === 'atardecer' ? 'bg-amber-500 text-white' : 'text-[#71849A]'
              }`}
            >
              🌅 Atardeceres
            </button>
            <button
              onClick={() => setActiveLayerFilter('cielo_oscuro')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                activeLayerFilter === 'cielo_oscuro' ? 'bg-indigo-600 text-white' : 'text-[#71849A]'
              }`}
            >
              🌌 Cielos Oscuros
            </button>
            <button
              onClick={() => setActiveLayerFilter('mar_de_nubes')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all ${
                activeLayerFilter === 'mar_de_nubes' ? 'bg-sky-500 text-white' : 'text-[#71849A]'
              }`}
            >
              ☁️ Nubes
            </button>
          </div>
        )}
      </div>

      {/* Top Right Floating Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="p-2.5 rounded-full bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md text-[#263B54] dark:text-white hover:bg-slate-50 transition-colors cursor-pointer"
          title={isFullscreen ? 'Reducir mapa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={handleCenterOnUser}
          disabled={isLocating}
          className="p-2.5 rounded-full bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md text-sky-600 hover:text-sky-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Centrar en mi ubicación GPS"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <a
          href={getGoogleMapsDirectionsUrl(currentTargetCoords.lat, currentTargetCoords.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-md text-emerald-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Abrir destino en Google Maps oficial"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Friends Radar Dropdown Modal */}
      <AnimatePresence>
        {showFriendsRadar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-3 z-[450] w-80 bg-white dark:bg-[#0E1626] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[#263B54] dark:text-white">
                  Amigos en el Mapa ({friendsOnMap.length})
                </span>
              </div>
              <button
                onClick={() => setShowFriendsRadar(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5 text-[#71849A]" />
              </button>
            </div>

            <p className="text-[11px] text-[#71849A] leading-relaxed">
              Personas que han aceptado tu invitación de amistad y tienen activo el permiso de localización:
            </p>

            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {friendsOnMap.map((friend) => {
                const dist = friend.coordinates
                  ? calculateDistance(friend.coordinates.lat, friend.coordinates.lng)
                  : null;

                return (
                  <button
                    key={friend.id}
                    onClick={() => flyToFriend(friend)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs flex items-center justify-between text-[#263B54] dark:text-slate-200 transition-colors group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                        />
                        {friend.online && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1">
                          <span>{friend.name}</span>
                          <span className="text-[10px] text-[#71849A]">@{friend.username}</span>
                        </div>
                        <div className="text-[10px] text-[#71849A] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-sky-500" />
                          <span>{friend.locationName.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        {dist !== null ? `${dist} km` : ''}
                      </span>
                      <span className="block text-[9px] text-emerald-500 font-semibold">
                        Ver pin →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Hubs Dropdown Modal */}
      <AnimatePresence>
        {showHubPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-3 z-[450] w-80 bg-white dark:bg-[#0E1626] rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-2"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-[#263B54] dark:text-white">
                Seleccionar Zona de Observación
              </span>
              <button
                onClick={() => setShowHubPicker(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5 text-[#71849A]" />
              </button>
            </div>

            <button
              onClick={async () => {
                await requestGeoPermission();
                setShowHubPicker(false);
              }}
              className="w-full text-left p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center justify-between hover:opacity-90"
            >
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Usar mi GPS real del navegador</span>
              </div>
              <span className="text-[10px] bg-sky-200 dark:bg-sky-800 px-1.5 py-0.5 rounded">
                Detectar
              </span>
            </button>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {presetHubs.map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => handlePresetSelect(hub)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs flex items-center justify-between text-[#263B54] dark:text-slate-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold">{hub.name}</div>
                    <div className="text-[10px] text-[#71849A]">{hub.region}</div>
                  </div>
                  <span className="text-[10px] text-[#71849A]">
                    {calculateDistance(hub.lat, hub.lng)} km
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAP VIEW: Either Leaflet (OSM / Satellite) OR Google Maps Embed */}
      {mapEngine === 'google_maps' ? (
        <div className="w-full h-full relative z-0 bg-slate-900">
          <iframe
            title="Google Maps Interactivo"
            src={`https://www.google.com/maps?q=${currentTargetCoords.lat},${currentTargetCoords.lng}&z=8&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-[11px] font-semibold text-[#263B54] dark:text-white border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Visualizando en Google Maps interactivo</span>
          </div>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[460px]" />
      )}

      {/* Bottom Floating Info Drawer when clicked a Spot, Event, or Friend */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-[400] bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            {activeItem.type === 'friend' ? (
              (() => {
                const friend = activeItem.data as FriendContact;
                const dist = friend.coordinates
                  ? calculateDistance(friend.coordinates.lat, friend.coordinates.lng)
                  : null;

                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                          />
                          {friend.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-max">
                            <UserCheck className="w-3 h-3" />
                            <span>Amigo Conectado</span>
                          </span>
                          <h4 className="text-sm font-bold text-[#263B54] dark:text-white mt-1">
                            {friend.name} <span className="text-xs text-[#71849A]">(@{friend.username})</span>
                          </h4>
                          <p className="text-xs text-[#71849A] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-500" />
                            <span>{friend.locationName}</span>
                            {dist !== null && (
                              <span className="font-semibold text-sky-600 dark:text-sky-400">
                                · {dist} km de ti
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveItem(null)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-medium">
                        📍 {friend.lastSeenLocation || 'Ubicación activa'}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        Permiso GPS OK
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 gap-2">
                      {onStartDirectChat && (
                        <button
                          onClick={() => onStartDirectChat(friend)}
                          className="flex-1 py-1.5 px-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chatear en Directo</span>
                        </button>
                      )}

                      {onOpenAuthorProfile && (
                        <button
                          onClick={() =>
                            onOpenAuthorProfile(
                              friend.username,
                              friend.name,
                              friend.avatar,
                              friend.id
                            )
                          }
                          className="py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#263B54] dark:text-white hover:bg-slate-50 cursor-pointer"
                        >
                          Ver Perfil
                        </button>
                      )}

                      {friend.coordinates && (
                        <a
                          href={getGoogleMapsDirectionsUrl(friend.coordinates.lat, friend.coordinates.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-[#71849A] hover:text-emerald-600"
                          title="Cómo llegar en Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : activeItem.type === 'spot' ? (
              (() => {
                const s = activeItem.data as SkySpot;
                const dist = calculateDistance(s.lat, s.lng);
                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          {s.tipo === 'atardecer'
                            ? '🌅 Atardecer Destacado'
                            : s.tipo === 'cielo_oscuro'
                            ? '🌌 Cielo Oscuro Starlight'
                            : '☁️ Mar de Nubes'}
                        </span>
                        <h4 className="text-sm font-bold text-[#263B54] dark:text-white mt-1">
                          {s.nombre}
                        </h4>
                        <p className="text-xs text-[#71849A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-500" />
                          <span>{s.ubicacionTexto}</span>
                          <span className="font-semibold text-sky-600 dark:text-sky-400">
                            · {dist} km de ti
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveItem(null)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#475569] dark:text-[#CBD5E1] line-clamp-2">
                      {s.descripcion}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        {s.altitud && (
                          <span className="text-[11px] text-[#71849A]">⛰️ {s.altitud}</span>
                        )}
                        {s.bortleEscala && (
                          <span className="text-[11px] text-[#71849A]">
                            🔭 Bortle {s.bortleEscala}
                          </span>
                        )}
                      </div>

                      <a
                        href={getGoogleMapsDirectionsUrl(s.lat, s.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <span>Cómo llegar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })()
            ) : (
              (() => {
                const ev = activeItem.data as SkyEvent;
                const dist = ev.coordenadas
                  ? calculateDistance(ev.coordenadas.lat, ev.coordenadas.lng)
                  : null;
                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          {ev.tipo_evento === 'acontecimiento_natural'
                            ? '⭐ Fenómeno Astronómico'
                            : '👥 Quedada Comunitaria'}
                        </span>
                        <h4 className="text-sm font-bold text-[#263B54] dark:text-white mt-1">
                          {ev.titulo}
                        </h4>
                        <p className="text-xs text-[#71849A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          <span>{ev.ubicacion_coordenadas_o_texto}</span>
                          {dist !== null && (
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              · {dist} km
                            </span>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveItem(null)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#475569] dark:text-[#CBD5E1] line-clamp-2">
                      {ev.descripcion}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[11px] font-semibold text-[#71849A]">
                        📅 {ev.fecha} · {ev.horario_aproximado}
                      </span>

                      {ev.coordenadas && (
                        <a
                          href={getGoogleMapsDirectionsUrl(ev.coordenadas.lat, ev.coordenadas.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <span>Ver en Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Click Marker Info (when user clicked somewhere on Leaflet) */}
      <AnimatePresence>
        {clickedMapPoint && !activeItem && mapEngine !== 'google_maps' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-sm z-[400] bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-xl rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#263B54] dark:text-white">Punto seleccionado</p>
                <p className="text-[11px] text-[#71849A]">
                  Distancia a ti: <strong className="text-sky-600">{clickedMapPoint.distance} km</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={getGoogleMapsDirectionsUrl(clickedMapPoint.lat, clickedMapPoint.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setClickedMapPoint(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
