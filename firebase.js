const firebaseConfig = {
    apiKey: "AIzaSyD75RGb3lOiZ0azcSjtP_b9VcZPlHCelJY",
    authDomain: "territorios-3d0bb.firebaseapp.com",
    projectId: "territorios-3d0bb",
    
    // ESTA É A LINHA CORRIGIDA
    storageBucket: "territorios-3d0bb.firebasestorage.app", 
    
    messagingSenderId: "712377474662",
    appId: "1:712377474662:web:dfb86ef024b18aa2cb97a7",
    measurementId: "G-DME60YZGXX",
    databaseURL: "https://territorios-3d0bb-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Use 'database' consistently
const db = database; // Alias for convenience if used elsewhere in existing code

// Adicionamos a variável global 'storage'
const storage = firebase.storage();

// *** NOVA LÓGICA DE NOTIFICAÇÃO ***
const messaging = firebase.messaging();
// Esta "Key" é a sua "Web push certificate" que está no Console do Firebase
// Vá em: Configurações do Projeto -> Cloud Messaging -> Certificados Web push -> Gerar Par de Chaves
const vapidKey = "BEfYRfUWuPgJUiLBFdLY53K_L6yRc2V0k2mhOgaZ_ySh9E2NHmt0om81q-TBExLUi1Q8-5FSUGlQW8SheD_qkNs"; // <-- MUDE ISTO

function solicitarPermissaoNotificacao() {
    console.log("Pedindo permissão para notificações...");
    
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Permissão concedida. A obter token...');
            
            // Obter o token do utilizador
            messaging.getToken({ vapidKey: vapidKey })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log('Token do utilizador:', currentToken);
                        // Salvar o token na base de dados para uso futuro
                        database.ref('subscriptions/' + currentToken).set(true);
                        showToast("Notificações ativadas!", false);
                    } else {
                        console.log('Não foi possível obter o token. O utilizador precisa de permitir no navegador.');
                        showToast("Permita as notificações nas definições do seu navegador.", true);
                    }
                }).catch((err) => {
                    console.error('Ocorreu um erro ao obter o token.', err);
                    showToast("Erro ao ativar notificações.", true);
                });

        } else if (permission === 'denied') {
            console.log('Permissão negada.');
            showToast("Você bloqueou as notificações. Ative-as nas definições do navegador.", true);
        } else {
            console.log('Permissão ignorada.');
        }
    });
}

const senhaCorreta = "1234";
const totalMapasGlobal = 38; // Use a more descriptive global name

let activeCycleDataIndex = null; // To store active cycle data for index.html

// Oculta apenas os campos de data e botões de designar inicialmente
document.addEventListener("DOMContentLoaded", () => {
    // Tenta executar o código de administração.
    // Se os elementos não existirem (como na 'index.html' dos anexos), 
    // ele apenas pulará essa parte sem dar erro.
    
    const senhaBtn = document.getElementById("senha"); // Check if admin page
    if (senhaBtn) {
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
        document.getElementById("sair-btn").style.display = "none";
        document.getElementById("limpar-tudo-btn").style.display = "none";
        document.getElementById("relatorio-btn").style.display = "none";
        document.getElementById("recuperar-dados-btn").style.display = "none";
        document.getElementById("editar-campo-btn").style.display = "none";
        
        document.querySelectorAll("textarea").forEach(textarea => {
            textarea.addEventListener("input", autoResizeTextarea);
        });
        
        // Load active cycle details first, which will then call carregarDadosEAtualizarProgressoIndex
        loadActiveCycleDetailsForIndex();
    }
}); // <-- FIM DO 'DOMContentLoaded'

// Função para redimensionar automaticamente o textarea
function autoResizeTextarea() {
    this.style.height = "auto"; // Reseta a altura para recalcular
    this.style.height = `${this.scrollHeight}px`; // Define a altura com base no conteúdo
}

// Expandir Lista
function toggleList(id) {
    const lista = document.getElementById(id);
    const titulo = lista.previousElementSibling;
    if (lista.style.display === "none" || lista.style.display === "") {
        lista.style.display = "block";
        titulo.classList.add("active");
    } else {
        lista.style.display = "none";
        titulo.classList.remove("active");
    }
}

// --- (O RESTO DE TODAS AS SUAS OUTRAS FUNÇÕES) ---
// (verificarSenha, sair, limparTudo, etc. ...)

function verificarSenha() {
    const senha = document.getElementById("senha").value.trim();
    if (senha === senhaCorreta) {
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "block");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "inline");
        document.getElementById("sair-btn").style.display = "inline";
        document.getElementById("limpar-tudo-btn").style.display = "inline";
        document.getElementById("relatorio-btn").style.display = "inline";
        document.getElementById("editar-campo-btn").style.display = "inline";
        document.querySelectorAll(".compartilhar-btn").forEach(btn => btn.style.display = "inline-block");
        // Assuming 'remover-designado-btn' is for the designados.html context, handle if present
        const removerBtn = document.getElementById("remover-designado-btn");
        if(removerBtn) removerBtn.style.display = "inline-block";
       
        alert("Senha correta! Campos de edição liberados.");
    } else {
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
        document.getElementById("sair-btn").style.display = "none";
        document.getElementById("limpar-tudo-btn").style.display = "none";
        document.getElementById("relatorio-btn").style.display = "none";
        document.getElementById("recuperar-dados-btn").style.display = "none";
        document.getElementById("editar-campo-btn").style.display = "none";
        document.querySelectorAll(".compartilhar-btn").forEach(btn => btn.style.display = "none");
        const removerBtn = document.getElementById("remover-designado-btn");
        if(removerBtn) removerBtn.style.display = "none";
        
        alert("Senha incorreta!");
    }
}

function sair() {
    document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
    document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
    document.getElementById("sair-btn").style.display = "none";
    document.getElementById("limpar-tudo-btn").style.display = "none";
    document.getElementById("relatorio-btn").style.display = "none";
    document.getElementById("recuperar-dados-btn").style.display = "none";
    document.getElementById("editar-campo-btn").style.display = "none";
    document.getElementById("senha").value = "";
   
    alert("Sessão encerrada. Dados permanecem salvos.");
}

function limparTudo() {
    if (confirm("Tem certeza que deseja limpar TODOS os dados de datas e observações dos mapas em edição (não afeta o histórico de ciclos)? Esta ação não pode ser desfeita, mas você poderá recuperar os dados com o botão 'Recuperar Dados'.")) {
        database.ref("mapas").once("value", snapshot => {
            const mapasData = snapshot.val();
            // Backup 'progressoGeral' if it exists, though it's being deprecated by cycle-based progress
            database.ref("progressoGeral").once("value", progressoSnapshot => {
                const progressoData = progressoSnapshot.val();
                database.ref("backup").set({ // This backup is for the 'mapas' node
                    mapas: mapasData || {},
                    progressoGeral: progressoData || { progresso: 0 } // Keep for legacy restore if needed
                }).then(() => {
                    for (let i = 1; i <= totalMapasGlobal; i++) {
                        const dataInicioEl = document.getElementById(`data-inicio-${i}`);
                        const dataFimEl = document.getElementById(`data-fim-${i}`);
                        const observacaoEl = document.getElementById(`observacao-${i}`);
                        const statusEl = document.getElementById(`status-${i}`);

                        if(dataInicioEl) dataInicioEl.value = "";
                        if(dataFimEl) dataFimEl.value = "";
                        if(observacaoEl) observacaoEl.value = "";
                        if(statusEl) statusEl.textContent = "Status: Não iniciado";
                    }
                    database.ref(`mapas`).remove(); // Clears the 'mapas' node for editing data
                    
                    // Update UI based on cleared data; progress bar will reflect empty 'mapas'
                    // and historico for current cycle.
                    carregarDadosEAtualizarProgressoIndex(); 
                    
                    const recuperarBtn = document.getElementById("recuperar-dados-btn");
                    if(recuperarBtn) recuperarBtn.style.display = "inline";
                    alert("Todos os dados de edição de mapas foram limpos! Use 'Recuperar Dados' para restaurar a última edição, se necessário.");
                }).catch(error => {
                    console.error("Erro ao fazer backup:", error);
                    alert("Erro ao fazer backup: " + error.message);
                });
            });
        }).catch(error => {
            console.error("Erro ao acessar dados para backup:", error);
            alert("Erro ao acessar dados para backup: " + error.message);
        });
    }
}

function recuperarDados() {
    if (confirm("Tem certeza que deseja recuperar os dados de edição de mapas salvos? Isso substituirá os dados de edição atuais.")) {
        database.ref("backup/mapas").once("value", snapshot => { // Specifically restore 'mapas'
            const backupMapas = snapshot.val();
            if (backupMapas) {
                 database.ref(`mapas`).set(backupMapas).then(() => {
                    // Reload data into UI after restoring to Firebase
                    carregarDadosEAtualizarProgressoIndex();
                    alert("Dados de edição recuperados com sucesso!");
                    const recuperarBtn = document.getElementById("recuperar-dados-btn");
                    if(recuperarBtn) recuperarBtn.style.display = "none";
                 }).catch(error => {
                    console.error("Erro ao restaurar mapas para Firebase:", error);
                    alert("Erro ao restaurar mapas: " + error.message);
                 });
            } else {
                alert("Nenhum backup de edição de mapas disponível para recuperação.");
            }
        }).catch(error => {
            console.error("Erro ao recuperar dados do backup:", error);
            alert("Erro ao recuperar dados: " + error.message);
        });
    }
}

async function loadActiveCycleDetailsForIndex() {
    try {
        const activeCycleIdSnap = await db.ref("cicloAtualId").once("value");
        const activeCycleId = activeCycleIdSnap.val();

        if (activeCycleId) {
            const cycleSnap = await db.ref(`ciclos/${activeCycleId}`).once("value");
            if (cycleSnap.exists()) {
                activeCycleDataIndex = { id: activeCycleId, ...cycleSnap.val() };
            } else {
                activeCycleDataIndex = null;
                console.warn("Index Page: cicloAtualId aponta para um ciclo inexistente.");
            }
        } else {
            // Fallback to legacy 'cicloAtual' if 'cicloAtualId' is not present
            const legacyCicloAtualSnap = await db.ref("cicloAtual").once("value");
            const legacyCicloKey = legacyCicloAtualSnap.val(); // Could be number or string like "ciclo_1"
            if (legacyCicloKey) {
                if (typeof legacyCicloKey === 'number') {
                    const ciclosSnap = await db.ref('ciclos').orderByChild('numero').equalTo(legacyCicloKey).limitToFirst(1).once('value');
                    if (ciclosSnap.exists()) {
                        const foundCycleId = Object.keys(ciclosSnap.val())[0];
                        activeCycleDataIndex = { id: foundCycleId, ...ciclosSnap.val()[foundCycleId] };
                    } else {
                         // If no matching cycle in /ciclos, create a placeholder
                        activeCycleDataIndex = { numero: legacyCicloKey, nome: `Ciclo ${legacyCicloKey} (Legado)`, status: 'ativo', id: `legacy_${legacyCicloKey}` };
                    }
                } else if (typeof legacyCicloKey === 'string' && legacyCicloKey.startsWith('ciclo_')) {
                     const cycleSnap = await db.ref(`ciclos/${legacyCicloKey}`).once("value");
                     if (cycleSnap.exists()) {
                        activeCycleDataIndex = { id: legacyCicloKey, ...cycleSnap.val() };
                     } else {
                        // Create a placeholder for "ciclo_1", "ciclo_2" etc. if not in /ciclos
                        const num = parseInt(legacyCicloKey.split('_')[1]);
                        activeCycleDataIndex = { numero: num, nome: `Ciclo ${num} (Importado/Legado)`, status: 'ativo', id: legacyCicloKey };
                     }
                }
            } else {
                 activeCycleDataIndex = null;
            }
        }
        console.log("Index Page: Active cycle data:", activeCycleDataIndex);
    } catch (error) {
        console.error("Index Page: Error loading active cycle details:", error);
        activeCycleDataIndex = null;
    }
    // After loading, update UI elements that depend on the active cycle
    await carregarDadosEAtualizarProgressoIndex();
}

// Dentro do seu arquivo firebase.js
// Substitua a função atualizarProgressoGeralIndex existente por esta:

async function atualizarProgressoGeralIndex() {
    const progressBar = document.getElementById("progress-bar"); 
    
    if (!progressBar) {
        // Isso não é um erro se estivermos na página de anexos
        // console.warn("Elemento da barra de progresso (progress-bar) não encontrado.");
        return;
    }

    if (!activeCycleDataIndex || typeof activeCycleDataIndex.numero === 'undefined') {
        progressBar.style.width = "0%";
        progressBar.textContent = "0% (0/" + totalMapasGlobal + ")";
        return;
    }

    const cicloAtualNumero = activeCycleDataIndex.numero;

    try {
        const promiseHistorico = db.ref("historicoMapas")
            .orderByChild("ciclo")
            .equalTo(cicloAtualNumero)
            .once("value");

        const promiseArquivado = db.ref("historico_arquivado")
            .once("value");

        const snapshots = await Promise.all([promiseHistorico, promiseArquivado]);
        
        const historicoSnap = snapshots[0];
        const arquivadoSnap = snapshots[1];

        let totalConclusoesNoCiclo = 0;

        if (historicoSnap.exists()) {
            historicoSnap.forEach(childSnap => {
                const registro = childSnap.val();
                if (registro && registro.dataFim && String(registro.dataFim).trim() !== "" && 
                    String(registro.ciclo) === String(cicloAtualNumero)) {
                    totalConclusoesNoCiclo++;
                }
            });
        }

        if (arquivadoSnap.exists()) {
            arquivadoSnap.forEach(childSnap => {
                const registroArchived = childSnap.val();
                if (registroArchived && 
                    String(registroArchived.ciclo) === String(cicloAtualNumero) && 
                    registroArchived.dataFim && String(registroArchived.dataFim).trim() !== "" &&
                    registroArchived.mapa) {
                    totalConclusoesNoCiclo++;
                }
            });
        }

        let percent = 0;
        let mapasNaVoltaAtualDisplay = 0; // Quantos mapas contar para a barra na volta atual

        if (totalConclusoesNoCiclo === 0) {
            percent = 0;
            mapasNaVoltaAtualDisplay = 0;
        } else {
            // Calcula quantos mapas foram concluídos na "volta" atual de 0-38
            mapasNaVoltaAtualDisplay = ((totalConclusoesNoCiclo - 1) % totalMapasGlobal) + 1;
            percent = totalMapasGlobal > 0 ? Math.round((mapasNaVoltaAtualDisplay / totalMapasGlobal) * 100) : 0;
        }
        
        progressBar.style.width = percent + "%";
        // Exibe o progresso da volta atual (ex: se 39 concluídos, mostra 3% (1/38))
        progressBar.textContent = `${percent}% (${mapasNaVoltaAtualDisplay}/${totalMapasGlobal})`;

    } catch (error) {
        console.error("Index Page: Erro ao atualizar barra de progresso:", error);
        progressBar.style.width = "0%";
        progressBar.textContent = "Erro"; // Ou "0% (0/38)"
    }
}

async function carregarDadosEAtualizarProgressoIndex() {
    let historicoMapasDoCicloAtual = {};
    if (activeCycleDataIndex && typeof activeCycleDataIndex.numero !== 'undefined') {
        try {
            const historicoSnap = await db.ref("historicoMapas").orderByChild("ciclo").equalTo(activeCycleDataIndex.numero).once("value");
            if (historicoSnap.exists()) {
                historicoMapasDoCicloAtual = historicoSnap.val();
            }
        } catch (error) {
            console.error("Index Page: Error fetching historicoMapas for current cycle:", error);
        }
    }

    db.ref("mapas").on("value", snapshot => {
        const mapasEmAndamento = snapshot.val() || {};
        
        for (let i = 1; i <= totalMapasGlobal; i++) {
            const statusElement = document.getElementById(`status-${i}`);
            const dataInicioElement = document.getElementById(`data-inicio-${i}`);
            const dataFimElement = document.getElementById(`data-fim-${i}`);
            const observacaoElement = document.getElementById(`observacao-${i}`);

            if (!statusElement) {
                // Se não encontrar o 'status-i', provavelmente não está na página de admin
                // E podemos parar de processar (ou pular para o próximo)
                continue; 
            }
            if (!dataInicioElement || !dataFimElement || !observacaoElement) {
                continue;
            }

            let statusText = "Status: Não iniciado";
            let dataInicioVal = "";
            let dataFimVal = "";
            let observacaoVal = "";
            let isFromHistory = false;

            let historyEntry = null;
            for (const key in historicoMapasDoCicloAtual) {
                if (String(historicoMapasDoCicloAtual[key].mapa) === String(i)) {
                    historyEntry = historicoMapasDoCicloAtual[key];
                    break;
                }
            }

           if (historyEntry && historyEntry.dataFim && String(historyEntry.dataFim).trim() !== "") {
    statusText = "Status: Concluído (Histórico)";
    dataInicioVal = historyEntry.dataInicio || "";
    dataFimVal = historyEntry.dataFim || "";

    // Formata a dataFim para o padrão brasileiro
let dataFimFormatada = "";
if (historyEntry.dataFim) {
    const data = new Date(historyEntry.dataFim);
    // Usando métodos UTC para evitar conversão de fuso horário local
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const ano = data.getUTCFullYear();
    dataFimFormatada = `${dia}/${mes}/${ano}`;
}

observacaoVal = historyEntry.observacao || (historyEntry.nome ? `Concluído em: ${dataFimFormatada}` : "");
isFromHistory = true;

} else {
    const dadosMapaAtual = mapasEmAndamento[i];
    if (dadosMapaAtual) {
        dataInicioVal = dadosMapaAtual.dataInicio || "";
        dataFimVal = dadosMapaAtual.dataFim || "";
        observacaoVal = dadosMapaAtual.observacao || "";

        // Formata a dataFim para o padrão brasileiro também aqui, se necessário
        let dataFimFormatadaElse = "";
        if (dataFimVal) {
            const dataElse = new Date(dataFimVal);
            const diaElse = String(dataElse.getDate()).padStart(2, '0');
            const mesElse = String(dataElse.getMonth() + 1).padStart(2, '0');
            const anoElse = dataElse.getFullYear();
            dataFimFormatadaElse = `${diaElse}/${mesElse}/${anoElse}`;
            // Você pode querer usar dataFimFormatadaElse na observacaoVal ou em outro lugar
        }


        if (dataFimVal) {
            statusText = "Status: Concluído (Pronto p/ Relatório)";
        } else if (dataInicioVal) {
            statusText = "Status: Em andamento";
        }
    }
}
            
            statusElement.textContent = statusText;
            dataInicioElement.value = dataInicioVal;
            dataFimElement.value = dataFimVal;
            observacaoElement.value = observacaoVal;

            dataInicioElement.readOnly = isFromHistory;
            dataFimElement.readOnly = isFromHistory;

            if (typeof autoResizeTextarea === 'function' && observacaoElement.value) {
                 observacaoElement.style.height = "auto"; 
                 observacaoElement.style.height = `${observacaoElement.scrollHeight}px`;
            }
        }
        atualizarProgressoGeralIndex(); // Update progress bar after map data is processed
    }, error => {
        console.error("Index Page: Erro ao carregar dados de 'mapas':", error);
    });

    await atualizarProgressoGeralIndex(); // Initial call
}

function atualizarStatus(id) {
    const dataInicioElement = document.getElementById(`data-inicio-${id}`);
    const dataFimElement = document.getElementById(`data-fim-${id}`);

    if (dataInicioElement && dataInicioElement.readOnly) {
        return;
    }

    const dataInicio = dataInicioElement.value;
    const dataFim = dataFimElement.value;
    const observacao = document.getElementById(`observacao-${id}`).value;
    const statusElement = document.getElementById(`status-${id}`);
    let currentStatusText = "Status: Não iniciado";

    if (dataFim) {
        const dataInicioObj = dataInicio ? new Date(dataInicio) : null;
        const dataFimObj = new Date(dataFim);
        if (dataInicioObj && dataFimObj < dataInicioObj) {
            alert("A data de fim não pode ser menor que a data de início!");
            dataFimElement.value = ""; // Clear invalid date
            if (dataInicio) {
                 currentStatusText = "Status: Em andamento";
            }
            database.ref(`mapas/${id}`).update({ dataFim: "" , status: currentStatusText })
                .catch(e => console.error("Error updating cleared dataFim:", e));
            if (statusElement) statusElement.textContent = currentStatusText;
            return; 
        }
        currentStatusText = "Status: Concluído (Pronto p/ Relatório)";
    } else if (dataInicio) {
        currentStatusText = "Status: Em andamento";
    }
    
    if (statusElement) statusElement.textContent = currentStatusText;

    database.ref(`mapas/${id}`).set({
        dataInicio: dataInicio,
        dataFim: dataFim,
        observacao: observacao,
        status: currentStatusText 
    }).catch(error => {
        console.error("Erro ao salvar dados:", error);
        alert("Erro ao salvar dados: " + error.message);
    });
}

function designarMapa(id, link, nome) {
    const observacao = document.getElementById(`observacao-${id}`).value;
    database.ref(`mapasDesignados/${id}`).set({
        nome: nome,
        link: link,
        observacao: observacao
    }).then(() => {
        alert(`Mapa ${nome} designado com sucesso!`);
        const dataAtual = new Date().toISOString().slice(0, 10);
        database.ref("historicoDesignacoes").push({ // This is a different history
            mapaId: id,
            nome: nome,
            link: link,
            observacao: observacao,
            dataDesignacao: dataAtual
        }).catch(error => {
            console.error("Erro ao salvar no histórico de designações:", error);
        });
    }).catch(error => {
        console.error("Erro ao designar mapa:", error);
        alert("Erro ao designar mapa: " + error.message);
    });
}

function enviarMapa(id) { // This is for 'mapasDesignados'
    if (confirm("Tem certeza que deseja remover este mapa designado?")) {
        database.ref(`mapasDesignados/${id}`).remove().then(() => {
            alert("Mapa removido com sucesso!");
        }).catch(error => {
            console.error("Erro ao remover mapa designado:", error);
        });
    }
}

function compartilharLink() {
    const url = "https://gerbesonlima.github.io/Mapas/designados.html";
    const button = document.querySelector('#botao-compartilhar-independente button');

    database.ref("mapasDesignados").once("value", snapshot => {
        const mapas = snapshot.val();
        let shareText = "Confira os territórios a serem trabalhados!\n\nLink: " + url + "\n\nMapas Designados:\n";

        if (mapas) {
            Object.keys(mapas).forEach(id => {
                const mapa = mapas[id];
                shareText += `- ${mapa.nome}\n  Link: ${mapa.link}\n`;
                if (mapa.observacao) {
                    shareText += `  Observações: ${mapa.observacao}\n`;
                }
                shareText += "\n";
            });
        } else {
            shareText += "Nenhum mapa designado no momento.\n";
        }

        if (navigator.share) {
            navigator.share({ title: 'Mapas Designados', text: shareText })
            .then(() => { if (button) { button.classList.add('success'); setTimeout(() => button.classList.remove('success'), 1000); }})
            .catch(error => console.error('Erro ao compartilhar:', error));
        } else {
            navigator.clipboard.writeText(shareText)
            .then(() => { alert('Informações copiadas!'); if (button) { button.classList.add('success'); setTimeout(() => button.classList.remove('success'), 1000); }})
            .catch(error => console.error('Erro ao copiar:', error));
        }
    }).catch(error => console.error('Erro ao recuperar mapas designados:', error));
}
// limparHistorico function remains as is, it affects 'historicoDesignacoes'
function limparHistorico() {
    const senhaEl = document.getElementById("senha-historico");
    if (!senhaEl) {
      alert("Elemento de senha do histórico não encontrado.");
      return;
    }
    const senha = senhaEl.value.trim();
    if (!senha) {
        alert("Por favor, digite a senha!");
        return;
    }
    if (senha !== senhaCorreta) {
        alert("Senha incorreta!");
        return;
    }
    if (confirm("Tem certeza que deseja limpar TODO o histórico de designações? Esta ação não pode ser desfeita.")) {
        database.ref("historicoDesignacoes").remove().then(() => {
            alert("Histórico de designações limpo com sucesso!");
            senhaEl.value = "";
        }).catch(error => {
            console.error("Erro ao limpar histórico de designações:", error);
            alert("Erro ao limpar histórico: " + error.message);
        });
    }
}