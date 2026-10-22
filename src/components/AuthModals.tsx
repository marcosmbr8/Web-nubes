import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cloud,
  Eye,
  EyeOff,
  X,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Shield,
  ShieldCheck,
  KeyRound,
  RotateCw,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModals: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    authGuardReason,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    loginWithGitHub,
    confirm2FA,
    cancel2FA,
    twoFactorPending,
    pendingCode,
    demoLogin,
    loginAsAdminCloud,
  } = useAuth();

  // Active Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);

  // 2MFA 6-digit boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(45);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync activeTab when modal mode changes
  useEffect(() => {
    if (authModalMode === 'login' || authModalMode === 'register') {
      setActiveTab(authModalMode);
      setErrorMessage('');
    }
  }, [authModalMode]);

  // Reset 2MFA digits when entering 2MFA
  useEffect(() => {
    if (authModalMode === '2mfa') {
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(45);
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [authModalMode]);

  // 2MFA countdown timer
  useEffect(() => {
    if (authModalMode === '2mfa' && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authModalMode, resendTimer]);

  if (!authModalOpen) return null;

  // Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Vacía', color: 'bg-slate-200 dark:bg-slate-700', tip: 'Introduce al menos 6 caracteres' };
    if (pass.length < 6) {
      return { score: 1, label: 'Leve / Débil', color: 'bg-rose-400', tip: 'Demasiado corta (mínimo 6 caracteres)' };
    }
    const hasNum = /\d/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length >= 8 && hasNum && (hasUpper || hasSpecial)) {
      return { score: 3, label: 'Fuerte', color: 'bg-emerald-500', tip: '¡Excelente contraseña segura!' };
    }
    return { score: 2, label: 'Media', color: 'bg-amber-400', tip: 'Añade mayúsculas o números para mayor seguridad' };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(email, password, enable2FA);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales no válidas.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!acceptTerms) {
      setErrorMessage('Debes aceptar las condiciones de uso y privacidad.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    const res = await register({ username, email, password, enable2FA });
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo crear la cuenta.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }
    setForgotSubmitted(true);
  };

  const handleGitHubClick = async () => {
    setIsGitHubLoading(true);
    setErrorMessage('');
    try {
      await loginWithGitHub();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con GitHub.');
    } finally {
      setIsGitHubLoading(false);
    }
  };

  // 2MFA input handling
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // User pasted multiple chars
      handlePaste(value);
      return;
    }

    const cleanChar = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (cleanChar && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits filled
    if (index === 5 && cleanChar && newDigits.every((d) => d !== '')) {
      const fullCode = newDigits.join('');
      handleVerify2FA(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (pastedText: string) => {
    const cleanNumbers = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
    if (!cleanNumbers) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanNumbers.length; i++) {
      newDigits[i] = cleanNumbers[i];
    }
    setOtpDigits(newDigits);

    const focusIdx = Math.min(cleanNumbers.length, 5);
    digitInputRefs.current[focusIdx]?.focus();

    if (cleanNumbers.length === 6) {
      handleVerify2FA(cleanNumbers);
    }
  };

  const handleVerify2FA = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Por favor, introduce los 6 dígitos del código de seguridad.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const res = await confirm2FA(code);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Código incorrecto. Revisa el código introducido.');
    }
  };

  const handleQuickPasteDemo = () => {
    const code = pendingCode || '742819';
    handlePaste(code);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-md bg-white dark:bg-[#0E1626] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Guard Notice when triggered by protected action */}
        {authGuardReason && authModalMode !== '2mfa' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#B9DDF5]/25 dark:bg-slate-800/80 border border-[#B9DDF5]/50 text-xs text-[#263B54] dark:text-[#E2ECF8] flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#263B54] dark:text-[#B9DDF5] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Acceso requerido:</strong> {authGuardReason}
            </p>
          </div>
        )}

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-[#1E293B] dark:to-[#4338CA] flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            {authModalMode === '2mfa' ? (
              <ShieldCheck className="w-6 h-6 text-[#263B54] dark:text-[#B9DDF5]" />
            ) : (
              <Cloud className="w-6 h-6 text-[#263B54] dark:text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
            {authModalMode === '2mfa' ? 'Verificación en Dos Pasos (2MFA)' : 'ONLYCLOUD'}
          </h2>
          <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] mt-0.5">
            {authModalMode === '2mfa'
              ? 'Protección reforzada para tu cuenta celestial'
              : 'Pasarela oficial de acceso a la comunidad'}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900/60 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PANTALLA ESPECIAL: 2MFA VERIFICATION */}
        {authModalMode === '2mfa' ? (
          <div className="space-y-5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#D9EDFA]/40 dark:bg-slate-800/60 border border-[#B9DDF5]/50 text-center space-y-1">
              <p className="font-semibold text-[#263B54] dark:text-white">
                Introduce el código de 6 dígitos
              </p>
              <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                Hemos enviado un código temporal a tu dispositivo seguro.
              </p>
            </div>

            {/* Quick Demo Code Banner with 1-click paste */}
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-purple-700 dark:text-purple-300">
                <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  Código demo generado: <strong className="font-mono tracking-wider">{pendingCode || '742819'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickPasteDemo}
                className="px-2.5 py-1 rounded-full bg-purple-200/80 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-bold hover:bg-purple-300 cursor-pointer transition-colors flex items-center gap-1"
              >
                {copiedDemo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Pegar</span>
              </button>
            </div>

            {/* 6 OTP Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    digitInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    handlePaste(e.clipboardData.getData('text'));
                  }}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#B9DDF5] ${
                    digit
                      ? 'border-indigo-500 bg-[#B9DDF5]/15 dark:bg-slate-800 text-[#263B54] dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[#263B54] dark:text-white'
                  }`}
                />
              ))}
            </div>

            {/* Verification Button */}
            <button
              type="button"
              disabled={isLoading || otpDigits.join('').length < 6}
              onClick={() => handleVerify2FA()}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] font-bold text-xs shadow-xs cursor-pointer transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verificando código...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar y Acceder</span>
                </>
              )}
            </button>

            {/* Resend and Cancel */}
            <div className="flex items-center justify-between text-[11px] text-[#71849A] pt-1">
              <button
                type="button"
                onClick={cancel2FA}
                className="hover:text-[#263B54] dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Cancelar</span>
              </button>

              <span>
                {resendTimer > 0 ? (
                  `Reenviar código en 00:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}`
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(45);
                      setErrorMessage('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Reenviar nuevo código
                  </button>
                )}
              </span>
            </div>
          </div>
        ) : authModalMode === 'forgot' ? (
          /* FORGOT PASSWORD FORM */
          <div className="space-y-4 text-xs">
            {forgotSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-[#263B54] dark:text-white">
                  Enlace de recuperación enviado
                </h3>
                <p className="text-xs text-[#71849A] leading-relaxed">
                  Si la dirección <strong className="text-[#263B54] dark:text-white">{email}</strong>{' '}
                  está asociada a una cuenta en OnlyCloud, recibirás las instrucciones seguras para
                  restablecer tu contraseña.
                </p>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 rounded-full bg-[#B9DDF5] text-[#263B54] font-semibold text-xs cursor-pointer mt-2"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#71849A] leading-relaxed">
                  Introduce el correo electrónico asociado a tu cuenta y te enviaremos un enlace para
                  restablecer tu contraseña.
                </p>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.cielo@ejemplo.com"
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] font-bold text-xs shadow-xs cursor-pointer"
                >
                  Enviar enlace de recuperación
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="w-full text-center text-xs text-[#71849A] hover:text-[#263B54] flex items-center justify-center gap-1 cursor-pointer pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la pasarela de acceso</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* PASARELA DUAL: INICIAR SESIÓN / CREAR CUENTA */
          <div className="space-y-5 text-xs">
            {/* Segmented Gateway Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-750 text-[#263B54] dark:text-white shadow-xs'
                    : 'text-[#71849A] dark:text-[#8EA5C0] hover:text-[#263B54]'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-750 text-[#263B54] dark:text-white shadow-xs'
                    : 'text-[#71849A] dark:text-[#8EA5C0] hover:text-[#263B54]'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {/* GitHub OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isGitHubLoading}
              onClick={handleGitHubClick}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#171D27] hover:bg-[#202735] dark:bg-white/10 dark:hover:bg-white/15 text-white text-xs font-semibold border border-slate-700/60 dark:border-white/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isGitHubLoading ? (
                <RotateCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 fill-current text-white flex-shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              <span>{isGitHubLoading ? 'Conectando con GitHub...' : 'Continuar con GitHub'}</span>
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0E1626] px-3 text-[10px] text-[#71849A] uppercase tracking-wider font-semibold whitespace-nowrap">
                o con correo electrónico
              </span>
            </div>

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.cielo@ejemplo.com"
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#263B54] dark:text-white">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => openAuthModal('forgot')}
                      className="text-[11px] text-[#71849A] hover:text-[#263B54] dark:hover:text-white underline cursor-pointer"
                    >
                      ¿Has olvidado tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña secreta"
                      className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71849A] hover:text-[#263B54] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OPCIONAL: 2MFA Checkbox */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="enable2fa-login"
                    checked={enable2FA}
                    onChange={(e) => setEnable2FA(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-[#B9DDF5] cursor-pointer"
                  />
                  <label htmlFor="enable2fa-login" className="cursor-pointer select-none">
                    <span className="font-semibold text-[#263B54] dark:text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      Activar verificación en dos pasos (2MFA)
                    </span>
                    <span className="text-[11px] text-[#71849A] block mt-0.5">
                      Solicitará un código seguro de 6 dígitos antes de entrar.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] font-bold text-xs shadow-xs cursor-pointer transition-opacity"
                >
                  {isLoading ? 'Comprobando acceso...' : 'Iniciar sesión'}
                </button>

                {/* Demo & Admin Fast Login */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={demoLogin}
                    className="w-full py-2 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#263B54] dark:text-[#CBD5E1] text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Entrar con cuenta de demostración (Marcos)</span>
                  </button>

                  {/* Private Administrator ADMINCLOUD */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        loginAsAdminCloud();
                      }}
                      className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 hover:from-amber-500/20 hover:via-indigo-500/20 hover:to-sky-500/20 border border-amber-500/30 dark:border-amber-400/30 text-left flex items-center justify-between group transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-indigo-600 flex items-center justify-center shadow-xs">
                          <Database className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#263B54] dark:text-white">
                              ADMINCLOUD
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold text-[9px] uppercase tracking-wider">
                              Superadmin
                            </span>
                          </div>
                          <span className="text-[10px] text-[#71849A] dark:text-[#8EA5C0] block">
                            Acceso a Base de Datos encriptada y backend
                          </span>
                        </div>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <p className="text-[10px] text-[#71849A] text-center mt-1">
                      O escribe usuario <strong className="text-[#263B54] dark:text-white">ADMINCLOUD</strong> en el formulario superior.
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej: cazador_cielos"
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.cielo@ejemplo.com"
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                {/* Password with Strength Meter (Leve, Media, Fuerte) */}
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71849A] hover:text-[#263B54] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Leve / Media / Fuerte) */}
                  {password && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#71849A]">Nivel de seguridad:</span>
                        <span
                          className={`font-bold uppercase tracking-wider ${
                            strength.score === 1
                              ? 'text-rose-500'
                              : strength.score === 2
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }`}
                        >
                          {strength.label}
                        </span>
                      </div>

                      {/* 3-segment progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 transition-all ${
                            strength.score >= 1 ? strength.color : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 transition-all ${
                            strength.score >= 2 ? strength.color : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 transition-all ${
                            strength.score >= 3 ? strength.color : 'bg-transparent'
                          }`}
                        />
                      </div>

                      <p className="text-[10px] text-[#71849A] leading-tight">{strength.tip}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71849A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                    />
                  </div>
                </div>

                {/* OPCIONAL: 2MFA Checkbox in Register */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="enable2fa-reg"
                    checked={enable2FA}
                    onChange={(e) => setEnable2FA(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-[#B9DDF5] cursor-pointer"
                  />
                  <label htmlFor="enable2fa-reg" className="cursor-pointer select-none">
                    <span className="font-semibold text-[#263B54] dark:text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      Activar verificación en dos pasos (2MFA)
                    </span>
                    <span className="text-[11px] text-[#71849A] block mt-0.5">
                      Te proporcionará un código de verificación para blindar tu registro.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-[#B9DDF5] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-[#71849A] cursor-pointer">
                    Acepto las condiciones de uso y la política de privacidad de OnlyCloud.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] font-bold text-xs shadow-xs cursor-pointer transition-opacity"
                >
                  {isLoading ? 'Registrando cuenta...' : 'Crear mi cuenta'}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
