// Utilitaires pour navigation et interactions web cross-platform

import React, { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook personnalisé pour navigation sécurisée avec fallback
 */
export function useSafeNavigation() {
  const router = useRouter();

  const push = (url: string) => {
    try {
      router.push(url);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback en cas d'erreur
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    }
  };

  const replace = (url: string) => {
    try {
      router.replace(url);
    } catch (error) {
      console.error('Navigation error:', error);
      if (typeof window !== 'undefined') {
        window.location.replace(url);
      }
    }
  };

  const back = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };

  return { push, replace, back };
}

/**
 * Ouvre un URL dans un nouvel onglet de manière sécurisée
 */
export function openInNewTab(url: string, target = '_blank') {
  try {
    if (typeof window !== 'undefined') {
      window.open(url, target, 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Failed to open URL in new tab:', error);
    // Fallback
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }
}

/**
 * Crée un lien cliquable sécurisé
 */
interface SafeLinkProps {
  href: string;
  onClick?: () => void;
  external?: boolean;
  children: React.ReactNode;
  [key: string]: any;
}

export function SafeLinkComponent({
  href,
  onClick,
  external = false,
  children,
  ...props
}: SafeLinkProps) {
  const { push } = useSafeNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();

    if (external) {
      openInNewTab(href);
    } else {
      push(href);
    }
  };

  return React.createElement('a', {
    href,
    onClick: handleClick,
    ...props
  }, children);
}

/**
 * Wrapper pour boutons de navigation
 */
export function createNavigationHandler(href: string, useRouter: any) {
  return () => {
    try {
      useRouter.push(href);
    } catch (error) {
      console.error('Navigation failed:', error);
      if (typeof window !== 'undefined') {
        window.location.href = href;
      }
    }
  };
}

/**
 * Détecte le type d'appareil
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobi)|xoom|sch-i800|playbook|nexus 7|nexus 10|premiere|silk/i.test(userAgent);

  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
};

/**
 * Détecte le système d'exploitation
 */
export const getOS = (): 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown' => {
  if (typeof window === 'undefined') {
    return 'Unknown';
  }

  const userAgent = window.navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Win/.test(userAgent)) return 'Windows';
  if (/Mac/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';

  return 'Unknown';
};

/**
 * Vérifie si l'app est en mode incognito/privé
 */
export async function isIncognitoMode(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;

    // Test localStorage
    try {
      const test = '__incognito__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return false; // localStorage fonctionne, pas incognito
    } catch (e) {
      // localStorage échoue, probablement incognito
      return true;
    }
  } catch (error) {
    console.error('Error checking incognito mode:', error);
    return false;
  }
}

export default {
  useSafeNavigation,
  openInNewTab,
  SafeLinkComponent,
  createNavigationHandler,
  getDeviceType,
  getOS,
  isIncognitoMode,
};
