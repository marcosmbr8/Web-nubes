import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CookiePreferences {
  essential: boolean; // Always true (Session, Auth, CSRF, Theme)
  functional: boolean; // Geolocation memory & astronomy radar filters
  analytics: boolean; // Performance metrics without third-party tracking
  media: boolean; // Video timelapses & embed media
  timestamp?: string;
  status: 'pending' | 'accepted_all' | 'rejected_optional' | 'custom';
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  bannerVisible: boolean;
  policiesModalOpen: boolean;
  activePoliciesTab: 'cookies' | 'privacidad' | 'permisos' | 'seguridad' | 'portabilidad';
  acceptAllCookies: () => void;
  rejectOptionalCookies: () => void;
  saveCustomPreferences: (prefs: Partial<CookiePreferences>) => void;
  openPoliciesModal: (tab?: 'cookies' | 'privacidad' | 'permisos' | 'seguridad' | 'portabilidad') => void;
  closePoliciesModal: () => void;
  closeBanner: () => void;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  media: false,
  status: 'pending',
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onlycloud_cookie_consent');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_PREFERENCES;
        }
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onlycloud_cookie_consent') !== null;
    }
    return false;
  });

  // Banner is visible on first visit if no consent has been registered
  const [bannerVisible, setBannerVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onlycloud_cookie_consent') === null;
    }
    return true;
  });

  const [policiesModalOpen, setPoliciesModalOpen] = useState(false);
  const [activePoliciesTab, setActivePoliciesTab] = useState<
    'cookies' | 'privacidad' | 'permisos' | 'seguridad' | 'portabilidad'
  >('cookies');

  const persistConsent = (newPrefs: CookiePreferences) => {
    setPreferences(newPrefs);
    setHasConsented(true);
    setBannerVisible(false);
    localStorage.setItem('onlycloud_cookie_consent', JSON.stringify(newPrefs));
  };

  const acceptAllCookies = () => {
    const updated: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      media: true,
      timestamp: new Date().toISOString(),
      status: 'accepted_all',
    };
    persistConsent(updated);
  };

  const rejectOptionalCookies = () => {
    const updated: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      media: false,
      timestamp: new Date().toISOString(),
      status: 'rejected_optional',
    };
    persistConsent(updated);
  };

  const saveCustomPreferences = (custom: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      ...preferences,
      ...custom,
      essential: true, // Always mandatory
      timestamp: new Date().toISOString(),
      status: 'custom',
    };
    persistConsent(updated);
  };

  const openPoliciesModal = (
    tab: 'cookies' | 'privacidad' | 'permisos' | 'seguridad' | 'portabilidad' = 'cookies'
  ) => {
    setActivePoliciesTab(tab);
    setPoliciesModalOpen(true);
  };

  const closePoliciesModal = () => {
    setPoliciesModalOpen(false);
  };

  const closeBanner = () => {
    setBannerVisible(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        bannerVisible,
        policiesModalOpen,
        activePoliciesTab,
        acceptAllCookies,
        rejectOptionalCookies,
        saveCustomPreferences,
        openPoliciesModal,
        closePoliciesModal,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
