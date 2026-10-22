import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cloud,
  Moon,
  Sun,
  PlusCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  Compass,
  Sparkles,
  Calendar,
  MessageCircle,
  Video,
  Grid,
  Home,
  Menu,
  X,
  Bookmark,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../context/GeolocationContext';
import { useCookieConsent } from '../context/CookieConsentContext';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPublish: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenPublish }) => {
  const { user, isAuthenticated, isAdmin, theme, toggleTheme, openAuthModal, logout, requireAuth } = useAuth();
  const { userLocationName, isRealGps } = useGeolocation();
  const { openPoliciesModal } = useCookieConsent();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'videos', label: 'Cielos en Movimiento', icon: Video },
    { id: 'ia', label: 'Analizador IA', icon: Sparkles, badge: 'Aura' },
    { id: 'eventos', label: 'Quedadas & Eventos', icon: Calendar },
    { id: 'comunidad', label: 'Comunidad', icon: MessageCircle },
  ];

  // Only private administrator ADMINCLOUD sees the database console in the header
  const navItems = isAdmin
    ? [
        ...baseNavItems,
        {
          id: 'admin_database',
          label: 'Base interna',
          icon: Database,
          badge: 'ADMIN',
          isAdminOnly: true,
        },
      ]
    : baseNavItems;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePublishClick = () => {
    requireAuth(() => {
      onOpenPublish();
    }, 'Inicia sesión para compartir tus fotografías en OnlyCloud.');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#0B111E]/80 border-b border-white/60 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleTabClick('inicio')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-[#263B54] dark:to-[#4338CA] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-[#263B54] dark:text-[#E2ECF8] animate-pulse-glow" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#263B54] dark:text-[#FFFFFF] flex items-center gap-1 font-['Plus_Jakarta_Sans']">
              ONLYCLOUD
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-[#71849A] dark:text-[#8EA5C0] -mt-1">
              Comunidad Visual
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdminItem = (item as any).isAdminOnly;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? isAdminItem
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-500/20 dark:bg-amber-500/20 font-bold shadow-xs border border-amber-500/50'
                      : 'text-[#263B54] dark:text-white bg-[#B9DDF5]/40 dark:bg-slate-800 font-semibold shadow-xs'
                    : isAdminItem
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 font-semibold'
                    : 'text-[#71849A] dark:text-[#9FB3C8] hover:text-[#263B54] dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isAdminItem
                      ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                      : isActive
                      ? 'text-[#263B54] dark:text-[#B9DDF5]'
                      : ''
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isAdminItem
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className={`absolute inset-0 rounded-full border pointer-events-none ${
                      isAdminItem
                        ? 'border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'border-[#B9DDF5]/70 dark:border-indigo-400/30'
                    }`}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Publicar Cielo Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePublishClick}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:from-[#A8D3F2] hover:to-[#CEC3F2] text-[#263B54] shadow-xs cursor-pointer transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Publicar cielo</span>
          </motion.button>

          {/* Quick Location Pill */}
          <button
            onClick={() => handleTabClick('eventos')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs text-[#263B54] dark:text-[#E2ECF8] transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
            title="Tu zona actual y mapa de quedadas"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealGps ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'
              }`}
            />
            <span className="max-w-[110px] truncate font-medium">
              {userLocationName.split(',')[0]}
            </span>
          </button>

          {/* Theme Toggle (Day sky vs Cosmic night sky) */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a cielo diurno' : 'Cambiar a cielo estrellado'}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 flex items-center justify-center text-[#71849A] dark:text-[#B9DDF5] transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
            title={theme === 'dark' ? 'Modo Día (Cielo Luminoso)' : 'Modo Noche (Cosmos & Estrellas)'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#263B54]" />}
          </button>

          {/* User Profile or Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#B9DDF5] dark:ring-indigo-500/60"
                />
                <span className="hidden md:block text-xs font-medium text-[#263B54] dark:text-[#E2ECF8] max-w-[100px] truncate">
                  {user.displayName}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121B2D] shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-[#263B54] dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0] truncate">
                        @{user.username}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('perfil');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#263B54] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#71849A]" />
                      <span>Mi Perfil & Fotografías</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('perfil');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#263B54] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#71849A]" />
                      <span>Fotografías Favoritas</span>
                    </button>

                    {/* Apartado Datos - Políticas (Privacidad, Cookies, RGPD) */}
                    <button
                      onClick={() => {
                        openPoliciesModal('cookies');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#263B54] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-medium">Datos - Políticas</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wider">
                        Cookies & RGPD
                      </span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin_database');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-600 dark:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-between cursor-pointer border-t border-amber-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span className="font-semibold">Base interna</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold uppercase">
                          ADMIN
                        </span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#B9DDF5]/30 dark:bg-slate-800 text-[#263B54] dark:text-[#E2ECF8] hover:bg-[#B9DDF5]/50 dark:hover:bg-slate-700/80 border border-[#B9DDF5]/60 dark:border-slate-700 cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#263B54] dark:text-[#B9DDF5]" />
              <span>Iniciar sesión</span>
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-white/95 dark:bg-[#0B111E]/95 border-b border-slate-200 dark:border-slate-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-[#B9DDF5]/40 dark:bg-slate-800 text-[#263B54] dark:text-white font-semibold'
                    : 'text-[#71849A] dark:text-[#9FB3C8] hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handlePublishClick();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] text-[#263B54] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar fotografía de cielo</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openPoliciesModal('cookies');
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[#263B54] dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Datos - Políticas y Cookies</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                RGPD
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
