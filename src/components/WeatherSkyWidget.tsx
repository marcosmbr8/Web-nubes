import React from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  CloudSun,
  Wind,
  Droplets,
  Eye,
  Sparkles,
  RotateCw,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useGeolocation } from '../context/GeolocationContext';

export const WeatherSkyWidget: React.FC = () => {
  const { weather, isWeatherLoading, refreshWeather, userLocationName, isRealGps } = useGeolocation();

  if (!weather) {
    return (
      <div className="w-full p-6 rounded-3xl bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-center gap-3">
        <RotateCw className="w-5 h-5 text-sky-500 animate-spin" />
        <span className="text-xs text-[#71849A]">Consultando previsión y claridad del cielo...</span>
      </div>
    );
  }

  const score = weather.claridadCieloScore;
  let scoreColor = 'from-emerald-400 to-teal-500';
  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (score < 40) {
    scoreColor = 'from-slate-400 to-slate-500';
    badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  } else if (score < 70) {
    scoreColor = 'from-sky-400 to-blue-500';
    badgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
  }

  return (
    <div className="w-full bg-gradient-to-br from-white via-sky-50/30 to-purple-50/30 dark:from-[#0E1626] dark:via-[#111C30] dark:to-[#161D2E] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(38,59,84,0.06)] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#B9DDF5]/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Tiempo Previsto & Bóveda Celeste</span>
            </span>

            {isRealGps && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Tiempo local en vivo</span>
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#263B54] dark:text-white mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>{weather.ciudadOZona}</span>
          </h3>
        </div>

        {/* Refresh button */}
        <button
          onClick={refreshWeather}
          disabled={isWeatherLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#71849A] hover:text-[#263B54] dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Grid: 3 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Card 1: Sky Clarity Score Gauge */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-850/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#71849A] uppercase tracking-wider">
                Claridad del Cielo
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                {weather.calidadObservacion}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#263B54] dark:text-white tracking-tight">
                {weather.claridadCieloScore}%
              </span>
              <span className="text-xs text-[#71849A]">despejado</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weather.claridadCieloScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${scoreColor} rounded-full`}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0] mt-3 leading-relaxed">
            {weather.condicionTexto}
          </p>
        </div>

        {/* Card 2: Essential Atmosphere Metrics */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-850/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#71849A] uppercase tracking-wider mb-2">
            Condiciones de la Atmósfera
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-1.5 text-[#71849A] mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">Temperatura</span>
              </div>
              <span className="text-base font-bold text-[#263B54] dark:text-white">
                {weather.temperatura}°C
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-1.5 text-[#71849A] mb-1">
                <CloudSun className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[11px]">Nubosidad</span>
              </div>
              <span className="text-base font-bold text-[#263B54] dark:text-white">
                {weather.coberturaNubes}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-1.5 text-[#71849A] mb-1">
                <Wind className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">Viento</span>
              </div>
              <span className="text-base font-bold text-[#263B54] dark:text-white">
                {weather.velocidadViento} km/h
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-1.5 text-[#71849A] mb-1">
                <Droplets className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-[11px]">Humedad</span>
              </div>
              <span className="text-base font-bold text-[#263B54] dark:text-white">
                {weather.humedad}%
              </span>
            </div>
          </div>

          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{weather.seeingCalidad}</span>
          </div>
        </div>

        {/* Card 3: Solar & Golden Hour Schedule */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-850/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#71849A] uppercase tracking-wider mb-2">
            Horarios Celestes & Fotografía
          </span>

          <div className="space-y-2 text-xs">
            {/* Sunset */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Puesta de Sol</span>
              </div>
              <span className="font-extrabold text-amber-900 dark:text-amber-100">
                {weather.horaPuestaSol}
              </span>
            </div>

            {/* Golden Hour */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-semibold">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Hora Dorada</span>
              </div>
              <span className="font-extrabold text-purple-900 dark:text-purple-100">
                {weather.horaDorada}
              </span>
            </div>

            {/* Sunrise */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-900/40">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-semibold">
                <CloudSun className="w-4 h-4 text-sky-500" />
                <span>Amanecer</span>
              </div>
              <span className="font-extrabold text-sky-900 dark:text-sky-100">
                {weather.horaAmanecer}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#71849A] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {score >= 60
                ? 'Ventana idónea para atardecer y sesión nocturna.'
                : 'Mejores contrastes en transiciones de luz rasante.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
