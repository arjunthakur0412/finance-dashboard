"use client";

import { useEffect } from "react";

const CACHE = "finance-os-v1";
const DASHBOARD_KEY = "finance-os-dashboard-cache";

/** Registers a minimal service worker for offline shell + caches last dashboard HTML. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const swCode = `
      const CACHE = '${CACHE}';
      const ASSETS = ['/dashboard', '/manifest.webmanifest'];
      self.addEventListener('install', (e) => {
        e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
      });
      self.addEventListener('activate', (e) => {
        e.waitUntil(self.clients.claim());
      });
      self.addEventListener('fetch', (e) => {
        const req = e.request;
        if (req.method !== 'GET') return;
        e.respondWith(
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
              return res;
            })
            .catch(() => caches.match(req).then((r) => r || caches.match('/dashboard')))
        );
      });
    `;

    const blob = new Blob([swCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    navigator.serviceWorker.register(url).catch(() => {
      /* ignore in dev */
    });

    // Persist a lightweight offline summary marker
    try {
      localStorage.setItem(DASHBOARD_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
