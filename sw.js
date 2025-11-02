// sw.js - Service Worker Mínimo

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado com sucesso.');
});

self.addEventListener('fetch', (event) => {
  // Por enquanto, não fazemos cache, apenas 
  // passamos a requisição para a rede.
  event.respondWith(fetch(event.request));
});