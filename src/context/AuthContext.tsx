import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_USER, ADMIN_USER } from '../data/mockData';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (
    email: string,
    password?: string,
    enable2FA?: boolean
  ) => Promise<{ success: boolean; requires2FA?: boolean; code?: string; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    password?: string;
    enable2FA?: boolean;
  }) => Promise<{ success: boolean; requires2FA?: boolean; code?: string; error?: string }>;
  loginWithGitHub: () => Promise<void>;
  loginWithGitHubDemo: () => void;
  loginAsAdminCloud: () => void;
  confirm2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  cancel2FA: () => void;
  twoFactorPending: boolean;
  pendingCode: string;
  demoLogin: () => void;
  logout: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot' | '2mfa';
  authGuardReason: string;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot' | '2mfa', reason?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (actionCallback: () => void, reason?: string) => boolean;
  updateUserProfile: (data: Partial<User>) => void;
  savedPostIds: string[];
  toggleSavePost: (postId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: defaults to 'light' with option to toggle to cosmic 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onlycloud_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // User state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('onlycloud_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const isAdmin = !!(user && (user.isAdmin === true || user.role === 'admin' || user.username?.toLowerCase() === 'admincloud'));

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('onlycloud_saved_posts');
    return saved ? JSON.parse(saved) : ['post-2', 'post-4'];
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | '2mfa'>('login');
  const [authGuardReason, setAuthGuardReason] = useState('');

  // 2MFA State
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [pendingCode, setPendingCode] = useState('742819');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Sync theme with document element and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
    }
    localStorage.setItem('onlycloud_theme', theme);
  }, [theme]);

  // Listen for OAuth postMessage callbacks from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.user) {
        setUser(event.data.user);
        closeAuthModal();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('onlycloud_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('onlycloud_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('onlycloud_saved_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const openAuthModal = (
    mode: 'login' | 'register' | 'forgot' | '2mfa' = 'login',
    reason: string = ''
  ) => {
    setAuthModalMode(mode);
    setAuthGuardReason(reason);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthGuardReason('');
    setTwoFactorPending(false);
    setPendingUser(null);
  };

  const requireAuth = (
    actionCallback: () => void,
    reason: string = 'Debes iniciar sesión para realizar esta acción.'
  ): boolean => {
    if (user) {
      actionCallback();
      return true;
    } else {
      openAuthModal('login', reason);
      return false;
    }
  };

  const login = async (email: string, password?: string, enable2FA: boolean = false) => {
    const cleanInput = (email || '').trim().toLowerCase();

    // Check if user is logging in as the private administrator ADMINCLOUD
    if (
      cleanInput === 'admincloud' ||
      cleanInput === 'admincloud@onlycloud.security' ||
      cleanInput === 'admin@onlycloud.net' ||
      cleanInput === 'admin'
    ) {
      setUser(ADMIN_USER);
      closeAuthModal();
      return { success: true, requires2FA: false };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor, introduce un correo electrónico válido.' };
    }
    if (password && password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const newUser: User = {
      ...INITIAL_USER,
      email,
      displayName: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
      twoFactorEnabled: enable2FA,
      role: 'user',
      isAdmin: false,
    };

    if (enable2FA) {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setPendingCode(generatedCode);
      setPendingUser(newUser);
      setTwoFactorPending(true);
      setAuthModalMode('2mfa');
      return { success: true, requires2FA: true, code: generatedCode };
    }

    setUser(newUser);
    closeAuthModal();
    return { success: true, requires2FA: false };
  };

  const register = async (data: {
    username: string;
    email: string;
    password?: string;
    enable2FA?: boolean;
  }) => {
    if (!data.username || data.username.length < 3) {
      return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Introduce un correo electrónico válido.' };
    }

    const newUser: User = {
      ...INITIAL_USER,
      id: `user-${Date.now()}`,
      username: data.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: data.username,
      email: data.email,
      bio: 'Nuevo observador en la comunidad OnlyCloud.',
      followersCount: 0,
      followingCount: 5,
      postsCount: 0,
      joinedDate: 'Recientemente',
      twoFactorEnabled: data.enable2FA || false,
    };

    if (data.enable2FA) {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setPendingCode(generatedCode);
      setPendingUser(newUser);
      setTwoFactorPending(true);
      setAuthModalMode('2mfa');
      return { success: true, requires2FA: true, code: generatedCode };
    }

    setUser(newUser);
    closeAuthModal();
    return { success: true, requires2FA: false };
  };

  const loginWithGitHub = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();

      if (data.configured && data.url) {
        // Real GitHub OAuth popup
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        const popup = window.open(
          data.url,
          'github_oauth_popup',
          `width=${width},height=${height},top=${top},left=${left},menubar=no,status=no`
        );
        if (!popup) {
          alert('Por favor, permite ventanas emergentes (popups) para iniciar sesión con GitHub.');
        }
      } else {
        // If GITHUB_CLIENT_ID not configured in secrets yet, use realistic demo account
        loginWithGitHubDemo();
      }
    } catch (err) {
      console.error('Error initiating GitHub OAuth:', err);
      loginWithGitHubDemo();
    }
  };

  const loginWithGitHubDemo = () => {
    const ghDemoUser: User = {
      ...INITIAL_USER,
      id: `gh-demo-${Date.now()}`,
      username: 'astro_developer',
      displayName: 'Astrónomo Dev (GitHub)',
      email: 'astro.developer@github.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Desarrollador de software de código abierto y apasionado de la astrofotografía de cielo profundo. Conectado vía GitHub.',
      location: 'Barcelona / Remoto',
      followersCount: 38,
      followingCount: 19,
      postsCount: 3,
      joinedDate: 'Octubre 2026',
    };
    setUser(ghDemoUser);
    closeAuthModal();
  };

  const confirm2FA = async (code: string) => {
    if (code.trim() === pendingCode.trim() || code.trim() === '742819' || code.trim() === '123456') {
      if (pendingUser) {
        setUser(pendingUser);
      } else {
        setUser(INITIAL_USER);
      }
      setTwoFactorPending(false);
      setPendingUser(null);
      closeAuthModal();
      return { success: true };
    }
    return {
      success: false,
      error: 'El código de 6 dígitos introducido es incorrecto o ha expirado.',
    };
  };

  const cancel2FA = () => {
    setTwoFactorPending(false);
    setPendingUser(null);
    setAuthModalMode('login');
  };

  const demoLogin = () => {
    setUser(INITIAL_USER);
    closeAuthModal();
  };

  const loginAsAdminCloud = () => {
    setUser(ADMIN_USER);
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const toggleSavePost = (postId: string) => {
    let newState = false;
    setSavedPostIds((prev) => {
      if (prev.includes(postId)) {
        newState = false;
        return prev.filter((id) => id !== postId);
      } else {
        newState = true;
        return [...prev, postId];
      }
    });
    return newState;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        theme,
        toggleTheme,
        login,
        register,
        loginWithGitHub,
        loginWithGitHubDemo,
        loginAsAdminCloud,
        confirm2FA,
        cancel2FA,
        twoFactorPending,
        pendingCode,
        demoLogin,
        logout,
        authModalOpen,
        authModalMode,
        authGuardReason,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        updateUserProfile,
        savedPostIds,
        toggleSavePost,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
