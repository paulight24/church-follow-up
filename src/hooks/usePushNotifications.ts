import { useCallback, useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, isFirebaseConfigured, vapidKey } from '@/config/firebase';
import { deviceTokensApi } from '@/features/notifications/api/deviceTokens.api';

type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

function buildServiceWorkerUrl(): string {
  const params = new URLSearchParams({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

/**
 * Manages the staff browser-push opt-in flow: registers the FCM service
 * worker, requests notification permission, and syncs the resulting device
 * token with the backend (POST /device-tokens). A silent no-op wherever
 * Firebase isn't configured (isFirebaseConfigured() === false) - the app
 * works identically without it, just without a browser push alert.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>(() => {
    if (!isFirebaseConfigured() || typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission as PushPermissionState;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enable = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setPermission('unsupported');
      return;
    }
    setIsRegistering(true);
    setError(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      if (result !== 'granted') return;

      const registration = await navigator.serviceWorker.register(buildServiceWorkerUrl());
      const messaging = getFirebaseMessaging();
      if (!messaging) return;

      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
      if (token) {
        await deviceTokensApi.register(token);
        localStorage.setItem('fcmToken', token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable push notifications');
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const disable = useCallback(async () => {
    const token = localStorage.getItem('fcmToken');
    if (token) {
      try {
        await deviceTokensApi.unregister(token);
      } catch {
        // Best-effort - the backend prunes stale tokens on its own too.
      }
      localStorage.removeItem('fcmToken');
    }
  }, []);

  // Show a toast/notification for foreground messages (background messages
  // are handled by the service worker's onBackgroundMessage instead).
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title ?? 'Member Care', {
          body: payload.notification.body,
          icon: '/favicon.svg',
        });
      }
    });
    return unsubscribe;
  }, []);

  return { permission, isRegistering, error, enable, disable, isSupported: isFirebaseConfigured() };
}
