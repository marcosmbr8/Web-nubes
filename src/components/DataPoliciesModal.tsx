import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Cookie,
  Lock,
  MapPin,
  Shield,
  Download,
  X,
  Check,
  AlertCircle,
  FileText,
  Sliders,
  CheckCircle,
  Database,
  Eye,
  Camera,
  Server,
  RefreshCw,
} from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '../context/CookieConsentContext';
import { useAuth } from '../context/AuthContext';

export const DataPoliciesModal: React.FC = () => {
  const {
    policiesModalOpen,
    activePoliciesTab,
    closePoliciesModal,
    preferences,
    saveCustomPreferences,
    acceptAllCookies,
    rejectOptionalCookies,
    openPoliciesModal,
  } = useCookieConsent();

  const { user } = useAuth();

  // Local draft of preferences for customization
  const [draftPrefs, setDraftPrefs] = useState<{
    functional: boolean;
    analytics: boolean;
    media: boolean;
  }>({
    functional: preferences.functional,
    analytics: preferences.analytics,
    media: preferences.media,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sync draft when preferences change or modal opens
  React.useEffect(() => {
    if (policiesModalOpen) {
      setDraftPrefs({
        functional: preferences.functional,
        analytics: preferences.analytics,
        media: preferences.media,
      });
      setSavedSuccess(false);
      setDownloadSuccess(false);
    }
  }, [policiesModalOpen, preferences]);

  if (!policiesModalOpen) return null;

  const handleSaveDraft = () => {
    saveCustomPreferences(draftPrefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closePoliciesModal();
    }, 1200);
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closePoliciesModal();
    }, 1000);
  };

  const handleRejectAll = () => {
    rejectOptionalCookies();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closePoliciesModal();
    }, 1000);
  };

  const handleExportPersonalData = () => {
    const exportData = {
      plataforma: 'ONLYCLOUD - Comunidad Visual y Astrofotografía',
      cumplimiento: 'Reglamento General de Protección de Datos (RGPD UE 2016/679)',
      fechaExportacion: new Date().toISOString(),
      usuario: user
        ? {
            id: user.id,
            username: user.username,
            nombreCompleto: user.displayName,
            email: user.email,
            fechaRegistro: user.joinedDate,
            autenticacion2FA: user.twoFactorEnabled ? 'Activada' : 'Desactivada',
            rol: user.role || 'user',
            ubicacionRegistrada: user.location,
            equipoFotografico: user.cameraGear,
          }
        : {
            tipo: 'Sesión Invitado / No autenticado',
            identificadorNavegador: 'guest_local_session',
          },
      consentimientoCookies: preferences,
      politicasAceptadas: {
        rgpd: true,
        politicaCookies: true,
        cifradoE2EE: true,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onlycloud_datos_personales_${user?.username || 'usuario'}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-auto flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-slate-800 dark:to-indigo-900 flex items-center justify-center text-[#263B54] dark:text-[#E2ECF8] shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#263B54] dark:text-[#B9DDF5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 font-extrabold text-[10px] uppercase tracking-wider border border-sky-500/20">
                  RGPD / LOPDGDD España
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-500/20">
                  AEPD Compliant
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#263B54] dark:text-white">
                Datos - Políticas: Seguridad, Privacidad y Cookies
              </h2>
              <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] mt-0.5">
                Transparencia total sobre cómo OnlyCloud protege tus fotografías, localización, telemetría y credenciales.
              </p>
            </div>
          </div>

          <button
            onClick={closePoliciesModal}
            className="p-2 rounded-xl text-[#71849A] hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 p-3 px-5 sm:px-6 bg-slate-100/70 dark:bg-slate-850/60 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'cookies', label: 'Gestión de Cookies', icon: Cookie },
            { id: 'privacidad', label: 'Política de Privacidad', icon: Lock },
            { id: 'permisos', label: 'Geolocalización & Permisos', icon: MapPin },
            { id: 'seguridad', label: 'Cifrado & ADMINCLOUD', icon: Shield },
            { id: 'portabilidad', label: 'Descarga de mis Datos', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePoliciesTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => openPoliciesModal(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-[#263B54] dark:text-white shadow-xs font-bold'
                    : 'text-[#71849A] dark:text-[#9FB3C8] hover:text-[#263B54] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-[#263B54] dark:text-[#CBD5E1] leading-relaxed">
          {/* TAB 1: COOKIES PREFERENCES & MANAGEMENT */}
          {activePoliciesTab === 'cookies' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 flex items-start gap-3">
                <Sliders className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#263B54] dark:text-white">
                    Panel de Configuración de Consentimiento
                  </h4>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] mt-1 leading-relaxed">
                    De conformidad con el artículo 22 de la Ley 34/2002 (LSSI-CE) y las directrices de la Agencia Española de Protección de Datos (AEPD), puedes activar o desactivar cada categoría de cookies. Las cookies esenciales no pueden desactivarse ya que son imprescindibles para navegar y asegurar tu sesión.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                    Estado actual:{' '}
                    <span className="font-bold uppercase tracking-wider">
                      {preferences.status === 'accepted_all'
                        ? 'Todas aceptadas'
                        : preferences.status === 'rejected_optional'
                        ? 'Opcionales rechazadas'
                        : preferences.status === 'custom'
                        ? 'Personalizadas por el usuario'
                        : 'Pendiente de confirmación'}
                    </span>{' '}
                    {preferences.timestamp && (
                      <span className="text-[#71849A] font-normal">
                        (Actualizado: {new Date(preferences.timestamp).toLocaleString('es-ES')})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* COOKIES LIST */}
              <div className="space-y-3">
                {/* 1. Essential Cookies */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#263B54] dark:text-white">
                        1. Cookies Técnicas y de Seguridad
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-extrabold uppercase text-[#71849A] dark:text-[#CBD5E1]">
                        Siempre Activas
                      </span>
                    </div>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      Permiten la autenticación del usuario, la gestión de la sesión, la persistencia del tema (Día/Noche) y la protección contra ataques de falsificación de peticiones en sitios cruzados (CSRF).
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ejemplos: <code>onlycloud_user</code>, <code>onlycloud_theme</code>, <code>onlycloud_csrf</code> • Duración: Sesión / 1 año
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Obligatorias
                    </span>
                  </div>
                </div>

                {/* 2. Functional & Geolocation Cookies */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#263B54] dark:text-white">
                        2. Cookies Funcionales y de Geolocalización de Cielos
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      Recuerdan tu provincia o coordenadas aproximadas para mostrarte pronósticos de estrellas, efemérides solares y permitirte ver amigos en el mapa de quedadas si ambos han aceptado la amistad.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ejemplos: <code>onlycloud_geo_pref</code>, <code>onlycloud_radar_filter</code> • Duración: 6 meses
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftPrefs.functional}
                      onChange={(e) =>
                        setDraftPrefs((prev) => ({ ...prev, functional: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B9DDF5] dark:peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 3. Performance & Analytics Cookies */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#263B54] dark:text-white">
                        3. Cookies Analíticas y Rendimiento Fotográfico
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      Recopilan métricas totalmente agregadas y anónimas sobre tiempos de carga de imágenes en alta resolución y timelapses de nubes. Nunca se utilizan para perfilado publicitario de terceros.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ejemplos: <code>onlycloud_perf_metrics</code> • Duración: 3 meses
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftPrefs.analytics}
                      onChange={(e) =>
                        setDraftPrefs((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B9DDF5] dark:peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 4. Social Media & Media Embed Cookies */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#263B54] dark:text-white">
                        4. Cookies de Medios y Vídeos de Cielos en Movimiento
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      Habilitan la reproducción fluida y aceleración por hardware de vídeos de timelapses atmosféricos y enlaces compartidos de observatorios.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ejemplos: <code>onlycloud_video_pref</code> • Duración: 6 meses
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={draftPrefs.media}
                      onChange={(e) =>
                        setDraftPrefs((prev) => ({ ...prev, media: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B9DDF5] dark:peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[#71849A]">
                  Puedes modificar estas preferencias en cualquier momento desde el menú de usuario.
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#71849A] hover:text-[#263B54] dark:text-[#CBD5E1] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    Rechazar opcionales
                  </button>

                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#263B54] dark:text-white bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 cursor-pointer transition-colors"
                  >
                    Aceptar todas
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] dark:from-sky-500 dark:to-indigo-600 text-[#263B54] dark:text-white shadow-xs hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                        <span>¡Preferencias guardadas!</span>
                      </>
                    ) : (
                      <span>Guardar selección</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY RGPD */}
          {activePoliciesTab === 'privacidad' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-500" />
                  Política de Privacidad y Protección de Datos Personales
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h5 className="font-bold text-[#263B54] dark:text-white">
                      1. Responsable del Tratamiento
                    </h5>
                    <p className="text-[#71849A] dark:text-[#9FB3C8] mt-0.5">
                      <strong>OnlyCloud Visual S.L.</strong> («OnlyCloud»), con NIF B-87941203 y domicilio en Calle Astronomía 42, 28001 Madrid, España. Delegado de Protección de Datos (DPD): <code className="text-sky-600 dark:text-sky-400">privacidad@onlycloud.es</code>.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#263B54] dark:text-white">
                      2. Finalidades y Legitimación del Tratamiento
                    </h5>
                    <ul className="list-disc pl-5 text-[#71849A] dark:text-[#9FB3C8] space-y-1 mt-1">
                      <li>
                        <strong>Gestión del perfil de usuario y publicación de fotografías de cielos:</strong> Base legal: Ejecución de la relación contractual y términos de uso (Art. 6.1.b RGPD).
                      </li>
                      <li>
                        <strong>Red de amigos y mensajería cifrada:</strong> La primera interacción siempre requiere una solicitud de amistad consentida por ambas partes. Base legal: Consentimiento mutuo (Art. 6.1.a RGPD).
                      </li>
                      <li>
                        <strong>Geolocalización en el mapa de quedadas y visualización astronómica:</strong> Solo activa si otorgas voluntariamente el permiso expreso. Base legal: Consentimiento explícito revocable en cualquier momento.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#263B54] dark:text-white">
                      3. Conservación y Destinatarios de los Datos
                    </h5>
                    <p className="text-[#71849A] dark:text-[#9FB3C8] mt-0.5">
                      Tus datos se conservarán mientras mantengas activa tu cuenta o hasta que solicites su supresión. No vendemos ni cedemos datos personales a redes de publicidad de terceros ni a intermediarios de datos. Toda la infraestructura se encuentra alojada en centros de datos seguros dentro del Espacio Económico Europeo (EEE).
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#263B54] dark:text-white">
                      4. Ejercicio de Derechos ARCO+
                    </h5>
                    <p className="text-[#71849A] dark:text-[#9FB3C8] mt-0.5">
                      Puedes ejercer en cualquier momento tus derechos de <strong>Acceso, Rectificación, Supresión («Derecho al olvido»), Limitación del tratamiento, Portabilidad de tus datos y Oposición</strong> enviando un correo a <code className="text-sky-600 dark:text-sky-400">privacidad@onlycloud.es</code> o mediante la pestaña de «Descarga de mis Datos». Asimismo, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline text-sky-600 dark:text-sky-400">www.aepd.es</a>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEOLOCATION & PERMISSIONS */}
          {activePoliciesTab === 'permisos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Protocolo de Privacidad en Geolocalización y Cámaras
                </h3>

                <p className="text-[#71849A] dark:text-[#9FB3C8]">
                  OnlyCloud es una red social orientada al cielo, la meteorología y la contemplación de eventos celestes. La localización es un dato especialmente sensible y lo tratamos bajo estrictos principios de necesidad y minimización:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-[#263B54] dark:text-white block mb-1">
                      🛰️ Geolocalización Voluntaria
                    </span>
                    <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                      Solo se consulta cuando abres el Mapa de Cielos o la predicción meteorológica. Nunca rastreamos tu ubicación en segundo plano sin tu consentimiento.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-[#263B54] dark:text-white block mb-1">
                      🤝 Amigos en el Mapa: Doble Consentimiento
                    </span>
                    <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                      Para que una persona aparezca en tu mapa de geolocalización, es requisito obligatorio haber aceptado previamente la invitación de amistad y tener concedido el permiso de ubicación mutuo.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-[#263B54] dark:text-white block mb-1">
                      🛡️ Ofuscación y Radio de Seguridad
                    </span>
                    <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                      Las coordenadas compartidas en quedadas se transmiten con un radio de ofuscación de seguridad (± 25 metros) para proteger la privacidad del entorno exacto de los fotógrafos.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-[#263B54] dark:text-white block mb-1">
                      📷 Acceso a Cámara y Galería
                    </span>
                    <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                      Se utiliza exclusivamente cuando decides subir una fotografía o reel. Puedes eliminar los metadatos EXIF de ubicación si así lo prefieres antes de publicar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENCRYPTION & ADMINCLOUD */}
          {activePoliciesTab === 'seguridad' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Arquitectura de Cifrado Militar y Rol Privado ADMINCLOUD
                </h3>

                <div className="space-y-2.5 text-xs text-[#71849A] dark:text-[#9FB3C8]">
                  <p>
                    OnlyCloud implementa un modelo de seguridad por capas para asegurar la integridad y confidencialidad absoluta de la base de datos:
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5 border border-slate-800">
                    <div className="text-amber-400 font-bold">
                      [ESTÁNDAR CRIPTOGRÁFICO DE ONLYCLOUD]:
                    </div>
                    <div>• Cifrado en reposo: AES-256-GCM para base de datos y almacén multimedia CDN.</div>
                    <div>• Cifrado en tránsito: TLS 1.3 con curvas elípticas Ed25519 / X25519.</div>
                    <div>• Hashing de credenciales: Argon2id con salt criptográfico individual de 128 bits.</div>
                    <div>• Mensajería privada: Protocolo E2EE (End-to-End Encryption) de señal con claves efímeras.</div>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#263B54] dark:text-white mt-2">
                      Acceso Exclusivo de ADMINCLOUD
                    </h5>
                    <p className="mt-0.5">
                      Los usuarios convencionales no tienen acceso al backend ni a la base de datos de la plataforma. La consola de base de datos solo es visible y accesible cuando el superadministrador <strong className="text-amber-500 font-bold">ADMINCLOUD</strong> inicia sesión con sus credenciales autorizadas. En dicha consola, los datos sensibles permanecen protegidos con máscaras de seguridad y solo pueden ser descifrados para auditoría bajo clave maestra forense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA PORTABILITY */}
          {activePoliciesTab === 'portabilidad' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-500" />
                  Derecho a la Portabilidad de tus Datos Personales (Art. 20 RGPD)
                </h3>

                <p className="text-xs text-[#71849A] dark:text-[#9FB3C8] leading-relaxed">
                  Tienes derecho a recibir los datos personales que te incumban y que hayas facilitado a OnlyCloud en un formato estructurado, de uso común y lectura mecánica (.JSON). Puedes descargar tu archivo en cualquier momento haciendo clic a continuación:
                </p>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-[#263B54] dark:text-white block">
                      Copia Completa de Registro Personal (.json)
                    </span>
                    <span className="text-[11px] text-[#71849A] block mt-0.5">
                      Incluye: Perfil, dirección de correo, consentimientos de cookies, registro de publicaciones y credenciales 2FA registradas.
                    </span>
                  </div>

                  <button
                    onClick={handleExportPersonalData}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 cursor-pointer flex-shrink-0"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>¡Descargado con éxito!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Descargar mis Datos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 px-5 sm:px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#71849A] dark:text-[#8EA5C0]">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tus datos pertenecen a ti. OnlyCloud no comercializa tu privacidad.</span>
          </div>

          <button
            onClick={closePoliciesModal}
            className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[#263B54] dark:text-white font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
