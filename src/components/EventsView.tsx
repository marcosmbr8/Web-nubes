import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Compass,
  Sparkles,
  Eye,
  CloudSun,
  Plus,
  Check,
  X,
  Send,
  RotateCw,
  Globe,
  Navigation,
  Star,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
} from 'lucide-react';
import { SKY_EVENTS, RECOMMENDED_SKY_SPOTS } from '../data/mockData';
import { SkyEvent, SkySpot } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../context/GeolocationContext';
import { InteractiveSkyMap } from './InteractiveSkyMap';
import { WeatherSkyWidget } from './WeatherSkyWidget';

interface EventsViewProps {
  onStartDirectChat?: (friend: any) => void;
  onOpenAuthorProfile?: (username: string, name: string, avatar: string, id?: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onStartDirectChat,
  onOpenAuthorProfile,
}) => {
  const { user, requireAuth } = useAuth();
  const {
    userLocation,
    userLocationName,
    isRealGps,
    permissionStatus,
    requestGeoPermission,
    isLocating,
    calculateDistance,
  } = useGeolocation();

  const [events, setEvents] = useState<SkyEvent[]>(SKY_EVENTS);
  const [filterType, setFilterType] = useState<'all' | 'natural' | 'community'>('all');
  const [spotsFilter, setSpotsFilter] = useState<'all' | 'atardecer' | 'cielo_oscuro' | 'mar_de_nubes'>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'natural') return ev.tipo_evento === 'acontecimiento_natural';
    if (filterType === 'community') return ev.tipo_evento === 'actividad_comunidad';
    return true;
  });

  const filteredSpots = RECOMMENDED_SKY_SPOTS.filter((spot) => {
    if (spotsFilter === 'all') return true;
    return spot.tipo === spotsFilter;
  });

  const handleToggleAttendance = (eventId: string) => {
    requireAuth(() => {
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id === eventId) {
            const isCurrently = ev.isAsistiendo;
            return {
              ...ev,
              isAsistiendo: !isCurrently,
              asistentes_count: isCurrently ? ev.asistentes_count - 1 : ev.asistentes_count + 1,
            };
          }
          return ev;
        })
      );
    }, 'Inicia sesión para confirmar tu asistencia a esta quedada o evento.');
  };

  const handleFocusSpotOnMap = (spotId: string) => {
    setSelectedSpotId(spotId);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleProposeEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newDate) return;

    requireAuth(async () => {
      setIsEnriching(true);
      try {
        const res = await fetch('/api/enrich-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle,
            description: newDesc,
            location: newLocation,
            date: newDate,
            userLocation: user?.location || userLocationName,
          }),
        });

        const data = await res.json();
        const enriched = data.event || {};

        const createdEvent: SkyEvent = {
          id: `ev-${Date.now()}`,
          tipo_evento: enriched.tipo_evento || 'actividad_comunidad',
          categoria_especifica: enriched.categoria_especifica || 'quedada_usuarios',
          noticia_global: enriched.noticia_global || false,
          titulo: enriched.datos_base?.titulo || newTitle,
          fecha: enriched.datos_base?.fecha || newDate,
          horario_aproximado: enriched.datos_base?.horario_aproximado || '19:00 - 22:00',
          ubicacion_coordenadas_o_texto: enriched.datos_base?.ubicacion_coordenadas_o_texto || newLocation,
          coordenadas: {
            lat: userLocation.lat + (Math.random() - 0.5) * 0.1,
            lng: userLocation.lng + (Math.random() - 0.5) * 0.1,
          },
          descripcion: enriched.datos_base?.descripcion || newDesc,
          imagen: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=800&q=80',
          asistentes_count: 1,
          isAsistiendo: true,
          capa_localizacion_usuario: {
            visible_desde_zona_usuario: true,
            nota_visibilidad:
              enriched.capa_localizacion_usuario?.nota_visibilidad ||
              `Actividad abierta en ${newLocation}.`,
          },
          meteorologia_y_entorno: {
            condiciones_ideales:
              enriched.meteorologia_y_entorno?.condiciones_ideales ||
              'Cielos despejados con horizonte visible.',
            tips_de_observacion_y_lugares:
              enriched.meteorologia_y_entorno?.tips_de_observacion_y_lugares ||
              'Llevar cámara con trípode y ropa de abrigo.',
          },
        };

        setEvents((prev) => [createdEvent, ...prev]);
        setProposeModalOpen(false);
        setNewTitle('');
        setNewLocation('');
        setNewDate('');
        setNewDesc('');
      } catch (err) {
        console.error('Event proposal error:', err);
      } finally {
        setIsEnriching(false);
      }
    }, 'Inicia sesión para proponer una quedada o evento.');
  };

  return (
    <div className="w-full py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#71849A] dark:text-[#8EA5C0] block mb-1">
            Geolocalización · Meteorología · Astronomía
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
            Quedadas, Sitios & Mapa de Cielos
          </h1>
          <p className="text-xs sm:text-sm text-[#71849A] dark:text-[#8EA5C0] mt-1.5 max-w-2xl">
            Descubre los mejores miradores para ver el atardecer, mares de nubes y cielos oscuros protegidos con previsión en vivo y geolocalización.
          </p>
        </div>

        {/* Propose Event CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            requireAuth(
              () => setProposeModalOpen(true),
              'Inicia sesión para proponer una quedada u observación.'
            )
          }
          className="self-start md:self-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Proponer Quedada / Evento</span>
        </motion.button>
      </div>

      {/* 2. Geolocation Banner if permission not active */}
      {!isRealGps && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#D9EDFA]/80 to-[#EEE9FA]/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-[#B9DDF5]/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-sky-600 dark:text-sky-400 shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#263B54] dark:text-white">
                ¿Quieres descubrir miradores y quedadas cerca de tu ubicación exacta?
              </h4>
              <p className="text-[11px] sm:text-xs text-[#71849A] dark:text-[#CBD5E1]">
                Activa el permiso de geolocalización para calcular distancias reales, ver tu posición en el mapa y consultar el tiempo exacto.
              </p>
            </div>
          </div>

          <button
            onClick={requestGeoPermission}
            disabled={isLocating}
            className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] text-xs font-bold hover:opacity-95 flex items-center gap-1.5 transition-opacity cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detectando GPS...' : 'Permitir Geolocalización'}</span>
          </button>
        </motion.div>
      )}

      {/* 3. Mini Apartado: Tiempo Previsto Claro & Previsión */}
      <div>
        <WeatherSkyWidget />
      </div>

      {/* 4. Mapa de Geolocalización Interactivo */}
      <div ref={mapSectionRef} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B54] dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-500" />
              <span>Mapa Interactivo de Cielos, Miradores & Quedadas</span>
            </h2>
            <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
              Haz clic en cualquier punto del mapa para medir distancias o explora los pines de miradores y quedadas comunitarias.
            </p>
          </div>
        </div>

        <InteractiveSkyMap
          events={events}
          spots={RECOMMENDED_SKY_SPOTS}
          selectedSpotId={selectedSpotId}
          onSelectSpot={(spot) => setSelectedSpotId(spot ? spot.id : null)}
          onStartDirectChat={onStartDirectChat}
          onOpenAuthorProfile={onOpenAuthorProfile}
        />
      </div>

      {/* 5. SECCIÓN ABAJO DEL MAPA: Lugares & Sitios Recomendados */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#71849A] block mb-0.5">
              Guía de Campo & Observación
            </span>
            <h2 className="text-2xl font-bold text-[#263B54] dark:text-white">
              Lugares Recomendados para Ver el Cielo y Atardeceres
            </h2>
          </div>

          {/* Filter Pills for Spots */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSpotsFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                spotsFilter === 'all'
                  ? 'bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 text-[#71849A] hover:text-[#263B54]'
              }`}
            >
              Todos los lugares
            </button>
            <button
              onClick={() => setSpotsFilter('atardecer')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                spotsFilter === 'atardecer'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 text-[#71849A] hover:text-amber-600'
              }`}
            >
              <span>🌅 Atardeceres</span>
            </button>
            <button
              onClick={() => setSpotsFilter('cielo_oscuro')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                spotsFilter === 'cielo_oscuro'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 text-[#71849A] hover:text-indigo-600'
              }`}
            >
              <span>🌌 Cielos Oscuros (Starlight)</span>
            </button>
            <button
              onClick={() => setSpotsFilter('mar_de_nubes')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                spotsFilter === 'mar_de_nubes'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 text-[#71849A] hover:text-sky-600'
              }`}
            >
              <span>☁️ Mares de Nubes</span>
            </button>
          </div>
        </div>

        {/* Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSpots.map((spot) => {
            const distance = calculateDistance(spot.lat, spot.lng);
            const isSelected = selectedSpotId === spot.id;

            let badgeColor = 'bg-amber-500';
            if (spot.tipo === 'cielo_oscuro') badgeColor = 'bg-indigo-600';
            else if (spot.tipo === 'mar_de_nubes') badgeColor = 'bg-sky-500';

            return (
              <motion.div
                key={spot.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden border ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                    : 'border-slate-100 dark:border-slate-800'
                } shadow-[0_4px_20px_rgba(38,59,84,0.06)] flex flex-col justify-between group`}
              >
                {/* Spot Cover Photo */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={spot.imagen}
                    alt={spot.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${badgeColor} shadow-md`}>
                      {spot.tipoLabel}
                    </span>
                  </div>

                  {/* Distance from User Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 border border-white/20">
                    <Navigation className="w-3 h-3 text-[#B9DDF5]" />
                    <span>A {distance} km</span>
                  </div>
                </div>

                {/* Spot Body */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#263B54] dark:text-white leading-snug group-hover:text-sky-600 transition-colors">
                      {spot.nombre}
                    </h3>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                      <span className="truncate">{spot.ubicacionTexto}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] line-clamp-3 leading-relaxed">
                    {spot.descripcion}
                  </p>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="text-[#71849A] block">Altitud:</span>
                      <strong className="text-[#263B54] dark:text-white">{spot.altitud}</strong>
                    </div>
                    <div>
                      <span className="text-[#71849A] block">Cielo:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        Bortle {spot.bortleEscala || 2}
                      </strong>
                    </div>
                  </div>

                  {/* Photographers Tip */}
                  <div className="text-[11px] text-[#71849A] dark:text-[#94A3B8] p-2.5 rounded-2xl bg-[#D9EDFA]/30 dark:bg-slate-800/40 border border-[#B9DDF5]/40 leading-relaxed">
                    <strong className="text-[#263B54] dark:text-slate-200">Tip:</strong>{' '}
                    {spot.consejoFotografico}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleFocusSpotOnMap(spot.id)}
                      className="flex-1 py-1.5 px-3 rounded-full text-xs font-semibold bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer text-center"
                    >
                      Ver en el mapa
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white transition-colors"
                      title="Cómo llegar con GPS"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 6. Calendario de Eventos & Quedadas Listado */}
      <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#71849A] block mb-0.5">
              Encuentros y Calendario
            </span>
            <h2 className="text-2xl font-bold text-[#263B54] dark:text-white">
              Próximas Quedadas y Fenómenos en el Calendario
            </h2>
          </div>

          {/* Filter Pills for Events */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 text-[#71849A] dark:text-[#8EA5C0]'
              }`}
            >
              Todos los eventos
            </button>
            <button
              onClick={() => setFilterType('natural')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'natural'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 text-[#71849A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Acontecimientos Naturales</span>
            </button>
            <button
              onClick={() => setFilterType('community')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'community'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 text-[#71849A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Actividades de la Comunidad</span>
            </button>
          </div>
        </div>

        {/* Events Grid (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredEvents.map((event) => {
            const isNatural = event.tipo_evento === 'acontecimiento_natural';
            const eventDistance = event.coordenadas
              ? calculateDistance(event.coordenadas.lat, event.coordenadas.lng)
              : null;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_rgba(38,59,84,0.06)] flex flex-col justify-between"
              >
                {/* Event Image Banner with badges */}
                <div className="relative aspect-[16/8] bg-slate-900 overflow-hidden">
                  <img
                    src={event.imagen}
                    alt={event.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
                        isNatural ? 'bg-purple-600/90' : 'bg-blue-600/90'
                      }`}
                    >
                      {isNatural ? 'Fenómeno Natural' : 'Quedada Comunitaria'}
                    </span>

                    {event.noticia_global && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                        <Globe className="w-3 h-3" />
                        <span>Noticia Global</span>
                      </span>
                    )}
                  </div>

                  {/* Date badge */}
                  <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                    <Calendar className="w-3.5 h-3.5 text-[#B9DDF5]" />
                    <span>{event.fecha}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans'] leading-snug">
                      {event.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] mt-1.5 leading-relaxed">
                      {event.descripcion}
                    </p>

                    {/* Location & Distance */}
                    <div className="mt-3 space-y-1 text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      <div className="flex items-center justify-between gap-1 font-medium">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#B9DDF5] flex-shrink-0" />
                          <span className="truncate">{event.ubicacion_coordenadas_o_texto}</span>
                        </div>
                        {eventDistance !== null && (
                          <span className="text-sky-600 dark:text-sky-400 font-semibold text-[11px] whitespace-nowrap pl-2">
                            A {eventDistance} km
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#71849A] pl-5">
                        Horario estimado: {event.horario_aproximado}
                      </div>
                    </div>
                  </div>

                  {/* Information Boxes */}
                  <div className="space-y-2.5 pt-2">
                    {/* Visibilidad Regional */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Visibilidad Regional</span>
                      </div>
                      <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200 leading-relaxed">
                        {event.capa_localizacion_usuario.nota_visibilidad}
                      </p>
                    </div>

                    {/* Meteorología & Tips */}
                    <div className="p-3 rounded-2xl bg-[#D9EDFA]/40 dark:bg-slate-800/60 border border-[#B9DDF5]/60 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#263B54] dark:text-[#B9DDF5] mb-0.5">
                        <CloudSun className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Condiciones y Consejos de Observación</span>
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        <strong className="text-[#263B54] dark:text-slate-200">Condiciones:</strong>{' '}
                        {event.meteorologia_y_entorno.condiciones_ideales}
                      </p>
                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed mt-1">
                        <strong className="text-[#263B54] dark:text-slate-200">Tips:</strong>{' '}
                        {event.meteorologia_y_entorno.tips_de_observacion_y_lugares}
                      </p>
                    </div>
                  </div>

                  {/* Footer Attendance & Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      <Users className="w-4 h-4 text-[#B9DDF5]" />
                      <span className="font-semibold text-[#263B54] dark:text-white">
                        {event.asistentes_count}
                      </span>{' '}
                      personas asistirán
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleToggleAttendance(event.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        event.isAsistiendo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] hover:opacity-95 shadow-xs'
                      }`}
                    >
                      {event.isAsistiendo ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Asistiendo</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Asistir</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Propose Event Modal */}
      <AnimatePresence>
        {proposeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0E1626] rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-[#263B54] dark:text-white">
                    Proponer Quedada u Observación
                  </h3>
                </div>
                <button
                  onClick={() => setProposeModalOpen(false)}
                  className="p-1 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#71849A] leading-relaxed">
                El motor inteligente de OnlyCloud enriquecerá automáticamente tu propuesta con estimaciones meteorológicas, consejos de cielo y cálculo de visibilidad local.
              </p>

              <form onSubmit={handleProposeEvent} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#263B54] dark:text-slate-200 block mb-1">
                    Título del evento / actividad *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Quedada Fotográfica: Amanecer con Mar de Nubes"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#263B54] dark:text-slate-200 block mb-1">
                      Ubicación / Punto de encuentro *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Ej: Mirador de los Buitres, Huesca"
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#263B54] dark:text-slate-200 block mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#263B54] dark:text-slate-200 block mb-1">
                    Descripción & Objetivos fotográficos
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe qué se planea observar (nubes, atardecer, estrellas), material recomendado..."
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setProposeModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isEnriching}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isEnriching ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enriqueciendo con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Publicar en Calendario</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
