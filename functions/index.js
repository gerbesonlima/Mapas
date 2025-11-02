// Ficheiro: functions/index.js

// Importar as ferramentas necessárias
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializar a aplicação de administração do Firebase
admin.initializeApp();

/**
 * Esta é a nossa função "Carteiro".
 * Ela é "callable", o que significa que pode ser chamada
 * diretamente pela nossa página de admin (configcampo.html).
 */
exports.enviarNotificacaoPush = functions.https.onCall(async (data, context) => {

  const titulo = data.titulo;
  const corpo = data.corpo;

  console.log(`Nova notificação recebida: Título - ${titulo}, Corpo - ${corpo}`);

  // 1. Preparar a mensagem
  const payload = {
    notification: {
      title: titulo,
      body: corpo,
      icon: "/Mapas/icon-192.png", // Ícone da app
      click_action: "/Mapas/index.html" // O que abrir ao clicar
    }
  };

  try {
    // 2. Buscar TODOS os "endereços" (tokens) guardados na base de dados
    const snapshot = await admin.database().ref("/subscriptions").once("value");

    if (!snapshot.exists()) {
      console.log("Nenhum subscritor (token) encontrado.");
      return { sucesso: false, erro: "Nenhum subscritor encontrado." };
    }

    const tokens = Object.keys(snapshot.val());

    console.log(`A enviar para ${tokens.length} subscritores.`);

    // 3. Enviar a mensagem para todos os dispositivos
    const response = await admin.messaging().sendToDevice(tokens, payload);

    // 4. (Opcional) Limpar tokens que falharam (porque o utilizador desinstalou a app)
    response.results.forEach((result, index) => {
      const error = result.error;
      if (error) {
        console.error("Falha ao enviar para o token:", tokens[index], error);
        if (error.code === "messaging/registration-token-not-registered") {
          // Remove o token inválido da base de dados
          admin.database().ref(`/subscriptions/${tokens[index]}`).remove();
        }
      }
    });

    console.log("Notificações enviadas com sucesso.");
    return { sucesso: true, totalEnviado: response.successCount };

  } catch (err) {
    console.error("Erro ao enviar notificações:", err);
    return { sucesso: false, erro: err.message };
  }
});