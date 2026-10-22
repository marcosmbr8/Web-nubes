import React from 'react';
import { motion } from 'motion/react';
import { Cloud, Compass, LogIn, ChevronDown, Sparkles, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onExploreClick: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenRegister, onOpenLogin }) => {
  const { user, isAuthenticated, theme, toggleTheme } = useAuth();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-16 pb-20 select-none">
      {/* Floating Top-Right Hero Controls (Image 1 style: Quick Theme & Quick Access) */}
      <div className="absolute top-20 right-4 sm:right-8 z-30 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-slate-700/80 text-[#263B54] dark:text-[#B9DDF5] shadow-xs cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Cambiar a cielo diurno' : 'Cambiar a noche cósmica'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#263B54]" />}
        </motion.button>

        {!isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-slate-700/80 text-[#263B54] dark:text-white text-xs font-semibold shadow-xs cursor-pointer hover:bg-white transition-colors"
          >
            Acceso
          </motion.button>
        )}
      </div>
      {/* Background Layer: Realistic Day Cloud Sky or Deep Cosmic Night Sky */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700">
        {theme === 'light' ? (
          // Day Sky: Blue clear sky with fluffy white clouds
          <div
            key="day-sky"
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-cloud-slow"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=2400&q=90")',
            }}
          >
            {/* Soft translucent daylight overlay for perfect legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/45 to-white/70 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#B9DDF5]/20 to-[#D9EDFA]/40" />
          </div>
        ) : (
          // Dark Sky: Cosmic deep night sky with stars & Milky Way
          <div
            key="night-sky"
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-cloud-slow bg-[#070B14]"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=90")',
            }}
          >
            {/* Deep space cosmic overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/85 via-[#0B111E]/75 to-[#070B14]/95 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-radial from-transparent via-purple-950/20 to-[#070B14]/60" />
            {/* Star sparkle accents */}
            <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-twinkle" />
            <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-purple-200 shadow-[0_0_10px_#d8b4fe] animate-twinkle" style={{ animationDelay: '1s' }} />
            <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-blue-100 shadow-[0_0_8px_#93c5fd] animate-twinkle" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-twinkle" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_8px_#a5f3fc] animate-twinkle" style={{ animationDelay: '2.5s' }} />
          </div>
        )}
      </div>

      {/* Floating subtle ambient cloud particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-white/30 dark:bg-indigo-900/20 blur-3xl animate-cloud-slow" />
        <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-[#B9DDF5]/25 dark:bg-purple-900/25 blur-3xl animate-cloud-reverse" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Top Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-xs mb-6"
        >
          <div className="w-4 h-4 rounded-full bg-[#B9DDF5] dark:bg-indigo-500/60 flex items-center justify-center">
            <Cloud className="w-2.5 h-2.5 text-[#263B54] dark:text-[#E2ECF8]" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#263B54] dark:text-[#E2ECF8]">
            ONLYCLOUD <span className="opacity-40">·</span> Comunidad Visual
          </span>
        </motion.div>

        {/* Headline strictly structured into 2 clean lines */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#263B54] dark:text-white leading-[1.18] mb-5 font-['Plus_Jakarta_Sans'] max-w-4xl"
        >
          <span className="block">«El cielo es de todos.</span>
          <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-[#263B54] via-[#4A6482] to-[#263B54] dark:from-[#FFFFFF] dark:via-[#DCD5F5] dark:to-[#B9DDF5] bg-clip-text text-transparent">
            Comparte tu perspectiva».
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-base sm:text-lg md:text-xl text-[#71849A] dark:text-[#B4C6DA] max-w-2xl font-normal leading-relaxed mb-8"
        >
          Descubre fotografías increíbles, comparte tus cielos favoritos y conecta con personas que miran al cielo como tú.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-5"
        >
          {/* Button 1: Explorar Fotografías */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold bg-[#263B54] hover:bg-[#1E3045] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0B111E] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#B9DDF5] dark:text-[#263B54]" />
            <span>Explorar fotografías</span>
          </motion.button>

          {/* Button 2: Iniciar Sesión / Mi Perfil */}
          {isAuthenticated && user ? (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-[#263B54] dark:text-white border border-white/80 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#71849A] dark:text-[#B9DDF5]" />
              <span>Ver mi feed (@{user.username})</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-[#263B54] dark:text-white border border-white/80 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#71849A] dark:text-[#B9DDF5]" />
              <span>Iniciar sesión</span>
            </motion.button>
          )}
        </motion.div>

        {/* Sub-links */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-1.5 text-xs text-[#71849A] dark:text-[#9FB3C8]"
          >
            <p>
              ¿Aún no tienes cuenta?{' '}
              <button
                onClick={onOpenRegister}
                className="font-semibold text-[#263B54] dark:text-white underline underline-offset-3 hover:text-indigo-600 dark:hover:text-[#B9DDF5] cursor-pointer transition-colors"
              >
                Crear una cuenta gratis
              </button>
            </p>
            <p className="text-[11px] opacity-80">
              Modo de libre visualización permitida <span className="opacity-40">—</span> Acceso directo sin registro
            </p>
          </motion.div>
        )}
      </div>

      {/* Down arrow scroll indicator */}
      <motion.button
        onClick={onExploreClick}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 rounded-full text-[#71849A] dark:text-[#9FB3C8] hover:text-[#263B54] dark:hover:text-white transition-colors cursor-pointer"
        aria-label="Desplazarse hacia abajo y descubrir la comunidad"
      >
        <ChevronDown className="w-6 h-6 stroke-[1.8]" />
      </motion.button>
    </div>
  );
};
