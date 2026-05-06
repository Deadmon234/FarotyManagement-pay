/**
 * Composant pour enregistrer le Service Worker et initialiser les fonctionnalités PWA
 */

'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegister() {
  const [swRegistered, setSwRegistered] = useState(false);
  const [swError, setSwError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('[App] Service Worker registered:', registration);
        setSwRegistered(true);

        // Vérifier les mises à jour périodiquement
        setInterval(() => {
          registration.update();
        }, 60000); // Toutes les minutes

        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Une nouvelle version est disponible
                console.log('[App] New Service Worker version available');
                // Vous pouvez notifier l'utilisateur ici
              }
            });
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[App] Service Worker registration failed:', message);
        setSwError(message);
      }
    };

    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Gérer les mises à jour du Service Worker
    const handleServiceWorkerUpdate = () => {
      const registration = navigator.serviceWorker.controller;
      if (registration) {
        registration.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    };

    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        handleServiceWorkerUpdate();
      }
    });

    // Écouter les changements de contrôleur
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] Service Worker controller changed');
    });
  }, []);

  // Récupérer les credentials pour la synchronisation d'arrière-plan
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkBackgroundSyncSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.sync) {
            console.log('[App] Background Sync supported');
          }
        } catch (error) {
          console.warn('[App] Background Sync not available:', error);
        }
      }
    };

    checkBackgroundSyncSupport();
  }, []);

  // Log du statut
  useEffect(() => {
    if (swRegistered) {
      console.log('[App] PWA features are available');
    }
    if (swError) {
      console.error('[App] PWA setup error:', swError);
    }
  }, [swRegistered, swError]);

  return null; // Ce composant n'affiche rien, il initialise juste le SW
}

export default ServiceWorkerRegister;
