// Firebase Cloud Messaging service worker for background push notifications
// (i.e. notifications that arrive while this tab isn't focused/open).
//
// Config is passed via query string at registration time (see
// src/hooks/usePushNotifications.ts) rather than baked in at build time,
// since service workers are static files Vite doesn't run through its env
// substitution. These Firebase Web config values are meant to be public /
// client-safe, so passing them in the URL is not a secret-exposure concern.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Member Care';
  const body = payload.notification?.body ?? '';
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    data: payload.data ?? {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link ?? '/';
  event.waitUntil(self.clients.openWindow(link));
});
