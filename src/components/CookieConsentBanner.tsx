import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, Settings, X, ExternalLink } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

export const CookieConsentBanner: React.FC = () => {
  const { bannerVisible, acceptAllCookies, rejectOptionalCookies, openPoliciesModal, closeBanner } =
    useCookieConsent();

  if (!bannerVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5 pointer-events-none"
      >
        <div className="max-w-5xl mx-auto bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Left: Icon & Description */}
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-[#1E293B] dark:to-[#312E81] flex items-center justify-center flex-shrink-0 text-[#263B54] dark:text-[#E2ECF8] shadow-xs">
                <Cookie className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-[#263B54] dark:text-white">
                    Gestión de Cookies y Privacidad en OnlyCloud
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider border border-emerald-500/20">
                    RGPD / AEPD España
                  </span>
                </div>
                <p className="text-xs text-[#71849A] dark:text-[#9FB3C8] leading-relaxed">
                  Utilizamos cookies técnicas necesarias para el funcionamiento del servicio (sesión y autenticación) y, solo con tu consentimiento, cookies funcionales de geolocalización y análisis de rendimiento para optimizar la visualización de cielos y eventos astronómicos. No activamos ninguna cookie opcional sin tu aprobación expresa.
                </p>
                <div className="pt-0.5">
                  <button
                    onClick={() => openPoliciesModal('cookies')}
                    className="text-[11px] font-semibold text-[#263B54] dark:text-[#B9DDF5] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Configurar o leer la Política de Datos y Cookies completa</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
              <button
                onClick={() => openPoliciesModal('cookies')}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#71849A] dark:text-[#9FB3C8] hover:text-[#263B54] dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Personalizar</span>
              </button>

              <button
                onClick={rejectOptionalCookies}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#263B54] dark:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Rechazar opcionales
              </button>

              <button
                onClick={acceptAllCookies}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:from-[#A8D3F2] hover:to-[#CEC3F2] text-[#263B54] dark:from-sky-500 dark:to-indigo-600 dark:text-white shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
