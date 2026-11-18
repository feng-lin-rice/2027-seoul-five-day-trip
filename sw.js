'use strict';

const CACHE_NAME = 'seoul-trip-v1.9.1';
const CACHE_PREFIX = 'seoul-trip-';
const PRECACHE = [
  './',
  './index.html',
  './enhancements.css',
  './enhancements.js',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return Promise.all(PRECACHE.map(function (url) {
          return fetch(new Request(url, { cache: 'reload' })).then(function (response) {
            if (!response.ok) throw new Error('Precache failed: ' + url);
            return cache.put(url, response);
          });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys
          .filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then(function (cache) { return cache.put(event.request, copy); })
            .then(function () { return response; });
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        if (!response.ok) return response;
        const copy = response.clone();
        return caches.open(CACHE_NAME)
          .then(function (cache) { return cache.put(event.request, copy); })
          .then(function () { return response; });
      });
    })
  );
});
