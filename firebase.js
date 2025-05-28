const firebaseConfig = {
    apiKey: "AIzaSyD75RGb3lOiZ0azcSjtP_b9VcZPlHCelJY",
    authDomain: "territorios-3d0bb.firebaseapp.com",
    projectId: "territorios-3d0bb",
    storageBucket: "territorios-3d0bb.firebasestorage.app", // Corrected: .firebasestorage.app, not .appspot.com for general config
    messagingSenderId: "712377474662",
    appId: "1:712377474662:web:dfb86ef024b18aa2cb97a7",
    measurementId: "G-DME60YZGXX",
    databaseURL: "https://territorios-3d0bb-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Use 'database' consistently
const db = database; // Alias for convenience if used elsewhere in existing code

const senhaCorreta = "1234";
const totalMapasGlobal = 38; // Use a more descriptive global name

let activeCycleDataIndex = null; // To store active cycle data for index.html

// Oculta apenas os campos de data e botões de designar inicialmente
document.addEventListener("DOMContentLoaded", () => {
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
});

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
// Dentro do arquivo firebase.js
// Substitua a função atualizarProgressoGeralIndex existente por esta:

async function atualizarProgressoGeralIndex() {
    const progressBar = document.getElementById("progress-bar"); 
    
    if (!progressBar) {
        console.warn("Elemento da barra de progresso (progress-bar) não encontrado em index.html");
        return;
    }

    // activeCycleDataIndex é carregado por loadActiveCycleDetailsForIndex()
    if (!activeCycleDataIndex || typeof activeCycleDataIndex.numero === 'undefined') {
        progressBar.style.width = "0%";
        progressBar.textContent = "Nenhum ciclo ativo";
        return;
    }

    const cicloAtualNumero = activeCycleDataIndex.numero;
    // totalMapasGlobal já é uma variável global em firebase.js
    // const totalMapasNoCiclo = totalMapasGlobal; 

    try {
        // Promise para buscar mapas concluídos do historicoMapas principal
        const promiseHistorico = db.ref("historicoMapas")
            .orderByChild("ciclo")
            .equalTo(cicloAtualNumero) // Busca apenas do ciclo ativo
            .once("value");

        // Promise para buscar mapas concluídos do historico_arquivado
        const promiseArquivado = db.ref("historico_arquivado")
            .once("value"); // Filtraremos client-side pelo cicloAtualNumero

        const snapshots = await Promise.all([promiseHistorico, promiseArquivado]);
        
        const historicoSnap = snapshots[0];
        const arquivadoSnap = snapshots[1];

        let completedMapIds = new Set(); // Usaremos um Set para contar IDs de mapas únicos

        // Processar historicoMapas principal
        if (historicoSnap.exists()) {
            historicoSnap.forEach(childSnap => {
                const registro = childSnap.val();
                if (registro && registro.dataFim && String(registro.dataFim).trim() !== "" && registro.mapa) {
                    completedMapIds.add(String(registro.mapa));
                }
            });
        }

        // Processar historico_arquivado
        if (arquivadoSnap.exists()) {
            arquivadoSnap.forEach(childSnap => {
                const registroArchived = childSnap.val();
                // Filtra para garantir que o registro arquivado pertence ao ciclo ativo e tem dataFim
                if (registroArchived && 
                    String(registroArchived.ciclo) === String(cicloAtualNumero) && 
                    registroArchived.dataFim && String(registroArchived.dataFim).trim() !== "" &&
                    registroArchived.mapa) {
                    completedMapIds.add(String(registroArchived.mapa));
                }
            });
        }

        const mapasCompletosUnicos = completedMapIds.size;
        const percent = totalMapasGlobal > 0 ? Math.round((mapasCompletosUnicos / totalMapasGlobal) * 100) : 0;
        
        const cycleName = activeCycleDataIndex.nome || `Ciclo ${activeCycleDataIndex.numero}`;
        progressBar.style.width = percent + "%";
        progressBar.textContent = `${cycleName} — ${percent}% (${mapasCompletosUnicos}/${totalMapasGlobal})`;

    } catch (error) {
        console.error("Index Page: Erro ao atualizar barra de progresso:", error);
        progressBar.style.width = "0%";
        progressBar.textContent = "Erro ao carregar progresso";
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

            if (!statusElement || !dataInicioElement || !dataFimElement || !observacaoElement) {
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
                observacaoVal = historyEntry.observacao || (historyEntry.nome ? `Concluído por: ${historyEntry.nome}` : "");
                isFromHistory = true;
            } else {
                const dadosMapaAtual = mapasEmAndamento[i];
                if (dadosMapaAtual) {
                    dataInicioVal = dadosMapaAtual.dataInicio || "";
                    dataFimVal = dadosMapaAtual.dataFim || "";
                    observacaoVal = dadosMapaAtual.observacao || "";

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

            // Optionally make fields read-only if loaded from history
            dataInicioElement.readOnly = isFromHistory;
            dataFimElement.readOnly = isFromHistory;
            // observacaoElement.readOnly = isFromHistory; // Keep observations editable, or make readOnly too

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

    // Prevent changes if the map is loaded from history and marked as readOnly
    if (dataInicioElement && dataInicioElement.readOnly) {
        // alert("Este mapa foi carregado do histórico e não pode ser editado aqui. Modifique no relatório se necessário.");
        // Optionally revert to historical values if needed, or simply do nothing.
        // For now, we just prevent saving if it's readOnly.
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
            // Save cleared dataFim to Firebase immediately.
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
    // The main progress bar (atualizarProgressoGeralIndex) is updated based on historicoMapas,
    // so changes here (to `mapas/{id}`) do not directly affect it until saved via relatorio.html.
}


// Functions designarMapa, enviarMapa, compartilharLink, limparHistorico 
// are mostly related to 'designados.html' or specific actions not directly tied to the core status sync.
// They should remain as they are unless they also need cycle-awareness.

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