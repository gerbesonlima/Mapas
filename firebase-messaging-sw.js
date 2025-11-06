// sw.js - O ÚNICO Service Worker de que precisa

// 1. Importar os scripts do Firebase Messaging
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// 2. As suas credenciais do Firebase (copiadas do seu index.html)
const firebaseConfig = {
    apiKey: "AIzaSyD75RGb3lOiZ0azcSjtP_b9VcZPlHCelJY",
    authDomain: "territorios-3d0bb.firebaseapp.com",
    projectId: "territorios-3d0bb",
    storageBucket: "territorios-3d0bb.firebasestorage.app",
    messagingSenderId: "712377474662",
    appId: "1:712377474662:web:dfb86ef024b18aa2cb97a7",
    databaseURL: "https://territorios-3d0bb-default-rtdb.firebaseio.com"
};

// 3. Inicializar o Firebase para o Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. Lidar com notificações em segundo plano (quando a app está fechada)
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Recebida mensagem em background: ', payload);
    
    // Título e corpo vêm da Cloud Function que criámos
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'icon-192.png' // Ícone do seu PWA
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Lógica PWA (o seu código antigo do sw.js)
self.addEventListener('install', (event) => {
  console.log('Service Worker (PWA + Messaging) instalado com sucesso.');
});

self.addEventListener('fetch', (event) => {
  // Por enquanto, não fazemos cache, apenas 
  // passamos a requisição para a rede.
  event.respondWith(fetch(event.request));
});