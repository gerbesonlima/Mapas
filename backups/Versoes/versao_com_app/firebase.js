// CONTEÚDO CORRETO PARA: firebase.js
// (Com a função de "Lembrar Login" adicionada)

const firebaseConfig = {
    apiKey: "AIzaSyD75RGb3lOiZ0azcSjtP_b9VcZPlHCelJY",
    authDomain: "territorios-3d0bb.firebaseapp.com",
    projectId: "territorios-3d0bb",
    storageBucket: "territorios-3d0bb.firebasestorage.app", 
    messagingSenderId: "712377474662",
    appId: "1:712377474662:web:dfb86ef024b18aa2cb97a7",
    measurementId: "G-DME60YZGXX",
    databaseURL: "https://territorios-3d0bb-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); 
const db = database; 
const storage = firebase.storage();


// REMOVEMOS O 'messaging' e 'functions' daqui

// ==========================================================
// FUNÇÃO SHOWTOAST (COM FALLBACK)
// (Necessária para o configcampo.html, se ele a usar)
// ==========================================================
let toastTimer; 

function showToast(message, isError = false) {
    let toast = document.getElementById("toast-notification");
    
    if (!toast) {
        alert(message); // Fallback para admin
        return;
    }

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = "show"; 

    if (isError) {
        toast.classList.add("error");
    } else {
        toast.classList.remove("error");
    }

    toastTimer = setTimeout(() => {
        toast.className = toast.className.replace("show", "");
        setTimeout(() => { toast.classList.remove("error"); }, 500); 
    }, 3000);
}
// ==========================================================


// Bloco de notificação (que você removeu) FOI REMOVIDO DE PROPÓSITO


const senhaCorreta = "1234";
const totalMapasGlobal = 38; 

let activeCycleDataIndex = null; 

document.addEventListener("DOMContentLoaded", () => {
    
    // <-- INÍCIO DA MODIFICAÇÃO 1: VERIFICAR SE JÁ ESTÁ LOGADO -->
    if (localStorage.getItem('territoriosLogado') === 'true') {
        // Se já estiver logado, esconde os campos de senha
        const labelSenha = document.querySelector('label[for="senha"]');
        const inputSenha = document.getElementById('senha');
        const btnEntrar = document.querySelector('button[onclick="verificarSenha()"]');
        
        if (labelSenha) labelSenha.style.display = 'none';
        if (inputSenha) inputSenha.style.display = 'none';
        if (btnEntrar) btnEntrar.style.display = 'none';

        // E mostra os botões de admin (exatamente como a função verificarSenha() faria)
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "block");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "inline");
        document.getElementById("sair-btn").style.display = "inline";
        document.getElementById("limpar-tudo-btn").style.display = "inline";
        document.getElementById("relatorio-btn").style.display = "inline";
        document.getElementById("editar-campo-btn").style.display = "inline";
        document.querySelectorAll(".compartilhar-btn").forEach(btn => btn.style.display = "inline-block");
        const removerBtn = document.getElementById("remover-designado-btn");
        if(removerBtn) removerBtn.style.display = "inline-block";
        
        // O botão "recuperar-dados-btn" continua escondido, o que está correto
        
    } else {
        // Se NÃO estiver logado, roda o código original para esconder tudo
        const senhaBtn = document.getElementById("senha"); 
        if (senhaBtn) {
            // ESTAMOS NA PÁGINA DE ADMIN (territorios.html)
            document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
            document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
            document.getElementById("sair-btn").style.display = "none";
            document.getElementById("limpar-tudo-btn").style.display = "none";
            document.getElementById("relatorio-btn").style.display = "none";
            document.getElementById("recuperar-dados-btn").style.display = "none";
            document.getElementById("editar-campo-btn").style.display = "none";
        }
    }
    // <-- FIM DA MODIFICAÇÃO 1 -->

    // O resto do código original do "DOMContentLoaded" continua aqui
    document.querySelectorAll("textarea").forEach(textarea => {
        textarea.addEventListener("input", autoResizeTextarea);
    });
    
    loadActiveCycleDetailsForIndex();
});

function autoResizeTextarea() {
    this.style.height = "auto"; 
    this.style.height = `${this.scrollHeight}px`; 
}

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

// ... (todas as suas outras funções: sair, limparTudo, etc.) ...
function verificarSenha() {
    const senha = document.getElementById("senha").value.trim();
    if (senha === senhaCorreta) {
        
        // <-- MODIFICAÇÃO 2: SALVAR O LOGIN NA MEMÓRIA -->
        localStorage.setItem('territoriosLogado', 'true');
        
        // Código original:
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "block");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "inline");
        document.getElementById("sair-btn").style.display = "inline";
        document.getElementById("limpar-tudo-btn").style.display = "inline";
        document.getElementById("relatorio-btn").style.display = "inline";
        document.getElementById("editar-campo-btn").style.display = "inline";
        document.querySelectorAll(".compartilhar-btn").forEach(btn => btn.style.display = "inline-block");
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
    // <-- MODIFICAÇÃO 3: LIMPAR O LOGIN DA MEMÓRIA E RECARREGAR A PÁGINA -->
    localStorage.removeItem('territoriosLogado');
    location.reload(); 
    
    // O código abaixo ainda roda, mas o usuário não verá o alerta porque a página recarrega
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
            database.ref("progressoGeral").once("value", progressoSnapshot => {
                const progressoData = progressoSnapshot.val();
                database.ref("backup").set({ 
                    mapas: mapasData || {},
                    progressoGeral: progressoData || { progresso: 0 } 
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
                    database.ref(`mapas`).remove(); 
                    
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
        database.ref("backup/mapas").once("value", snapshot => { 
            const backupMapas = snapshot.val();
            if (backupMapas) {
                 database.ref(`mapas`).set(backupMapas).then(() => {
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
            const legacyCicloAtualSnap = await db.ref("cicloAtual").once("value");
            const legacyCicloKey = legacyCicloAtualSnap.val(); 
            if (legacyCicloKey) {
                if (typeof legacyCicloKey === 'number') {
                    const ciclosSnap = await db.ref('ciclos').orderByChild('numero').equalTo(legacyCicloKey).limitToFirst(1).once('value');
                    if (ciclosSnap.exists()) {
                        const foundCycleId = Object.keys(ciclosSnap.val())[0];
                        activeCycleDataIndex = { id: foundCycleId, ...ciclosSnap.val()[foundCycleId] };
                    } else {
                        activeCycleDataIndex = { numero: legacyCicloKey, nome: `Ciclo ${legacyCicloKey} (Legado)`, status: 'ativo', id: `legacy_${legacyCicloKey}` };
                    }
                } else if (typeof legacyCicloKey === 'string' && legacyCicloKey.startsWith('ciclo_')) {
                     const cycleSnap = await db.ref(`ciclos/${legacyCicloKey}`).once("value");
                     if (cycleSnap.exists()) {
                        activeCycleDataIndex = { id: legacyCicloKey, ...cycleSnap.val() };
                     } else {
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
    await carregarDadosEAtualizarProgressoIndex();
}


async function atualizarProgressoGeralIndex() {
    const progressBar = document.getElementById("progress-bar"); 
    
    if (!progressBar) {
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
        let mapasNaVoltaAtualDisplay = 0; 

        if (totalConclusoesNoCiclo === 0) {
            percent = 0;
            mapasNaVoltaAtualDisplay = 0;
        } else {
            mapasNaVoltaAtualDisplay = ((totalConclusoesNoCiclo - 1) % totalMapasGlobal) + 1;
            percent = totalMapasGlobal > 0 ? Math.round((mapasNaVoltaAtualDisplay / totalMapasGlobal) * 100) : 0;
        }
        
        progressBar.style.width = percent + "%";
        progressBar.textContent = `${percent}% (${mapasNaVoltaAtualDisplay}/${totalMapasGlobal})`;

    } catch (error) {
        console.error("Index Page: Erro ao atualizar barra de progresso:", error);
        progressBar.style.width = "0%";
        progressBar.textContent = "Erro"; 
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

                let dataFimFormatada = "";
                if (historyEntry.dataFim) {
                    const data = new Date(historyEntry.dataFim);
                    const dia = String(data.getUTCDate()).padStart(2, '0');
                    const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); 
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

                    let dataFimFormatadaElse = "";
                    if (dataFimVal) {
                        const dataElse = new Date(dataFimVal);
                        const diaElse = String(dataElse.getDate()).padStart(2, '0');
                        const mesElse = String(dataElse.getMonth() + 1).padStart(2, '0');
                        const anoElse = dataElse.getFullYear();
                        dataFimFormatadaElse = `${diaElse}/${mesElse}/${anoElse}`;
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
        atualizarProgressoGeralIndex(); 
    }, error => {
        console.error("Index Page: Erro ao carregar dados de 'mapas':", error);
    });

    await atualizarProgressoGeralIndex(); 
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
            dataFimElement.value = ""; 
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
        database.ref("historicoDesignacoes").push({ 
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