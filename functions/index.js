// Este é o conteúdo do arquivo: functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o app do Firebase (lado do servidor)
admin.initializeApp();

/**
 * Esta é a função que o index.html chama.
 * Ela pega todos os tokens de notificação salvos no Realtime Database
 * e envia uma mensagem para cada um.
 */
exports.enviarNotificacaoPush = functions.https.onCall(async (data, context) => {
  // Pega o título e o corpo que o index.html enviou
  const titulo = data.titulo;
  const corpo = data.corpo;

  if (!titulo || !corpo) {
    return {
      sucesso: false,
      erro: "O título e o corpo da mensagem são obrigatórios.",
    };
  }

  // 1. Buscar todos os tokens (endereços) de notificação
  // O seu index.html salva os tokens em "subscriptions/"
  const tokensSnapshot = await admin.database().ref("/subscriptions").once("value");

  if (!tokensSnapshot.exists()) {
    return { sucesso: false, erro: "Nenhum dispositivo registrado." };
  }

  const tokens = Object.keys(tokensSnapshot.val());

  // 2. Preparar a mensagem (payload)
  const payload = {
    notification: {
      title: titulo,
      body: corpo,
      icon: "icon-192.png", // Ícone que aparece na notificação
    },
  };

  // 3. Enviar a mensagem para todos os tokens
  const response = await admin.messaging().sendToDevice(tokens, payload);

  // 4. Limpar tokens que falharam (opcional, mas boa prática)
  const tokensToRemove = [];
  response.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      console.error("Falha ao enviar para", tokens[index], error);
      // Se o token expirou ou não é válido, marcamos para remoção
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        tokensToRemove.push(tokensSnapshot.child(tokens[index]).ref.remove());
      }
    }
  });

  // Espera a limpeza terminar
  await Promise.all(tokensToRemove);

  // 5. Retornar o sucesso para o index.html
  return {
    sucesso: true,
    totalEnviado: response.successCount,
  };
});