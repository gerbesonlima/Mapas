// firebase-messaging-sw.js

// Importar e inicializar os scripts do Firebase
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// As suas credenciais do Firebase (copiadas do seu firebase.js)
const firebaseConfig = {
    apiKey: "AIzaSyD75RGb3lOiZ0azcSjtP_b9VcZPlHCelJY",
    authDomain: "territorios-3d0bb.firebaseapp.com",
    projectId: "territorios-3d0bb",
    storageBucket: "territorios-3d0bb.firebasestorage.app",
    messagingSenderId: "712377474662",
    appId: "1:712377474662:web:dfb86ef024b18aa2cb97a7",
    databaseURL: "https://territorios-3d0bb-default-rtdb.firebaseio.com"
};

// Inicializar
firebase.initializeApp(firebaseConfig);

// Obter a instância do Messaging
const messaging = firebase.messaging();

// (Opcional) Lidar com notificações em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Recebida mensagem em background: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/Mapas/icon-192.png' // Verifique se este caminho está correto
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});