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

const senhaCorreta = "1234";
const totalMapas = 38;

// Oculta apenas os campos de data e botões de designar inicialmente
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
    document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
    document.getElementById("sair-btn").style.display = "none";
    document.getElementById("limpar-tudo-btn").style.display = "none";
    document.getElementById("relatorio-btn").style.display = "none";
    document.getElementById("recuperar-dados-btn").style.display = "none";
    document.getElementById("editar-campo-btn").style.display = "none";
    
    carregarDados();
});

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
        document.getElementById("remover-designado-btn").style.display = "inline-block";
       
        alert("Senha correta! Campos de edição liberados.");
    } else {
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
        document.getElementById("sair-btn").style.display = "none";
        document.getElementById("limpar-tudo-btn").style.display = "none";
        document.getElementById("relatorio-btn").style.display = "none";
        document.getElementById("recuperar-dados-btn").style.display = "none";
        document.querySelectorAll(".compartilhar-btn").forEach(btn => btn.style.display = "none");
        document.getElementById("remover-designado-btn").style.display = "none";
        
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
    if (confirm("Tem certeza que deseja limpar TODOS os dados de datas e observações? Esta ação não pode ser desfeita, mas você poderá recuperar os dados com o botão 'Recuperar Dados'.")) {
        database.ref("mapas").once("value", snapshot => {
            const mapas = snapshot.val();
            database.ref("progressoGeral").once("value", progressoSnapshot => {
                const progresso = progressoSnapshot.val();
                database.ref("backup").set({
                    mapas: mapas || {},
                    progressoGeral: progresso || { progresso: 0 }
                }).then(() => {
                    for (let i = 1; i <= totalMapas; i++) {
                        document.getElementById(`data-inicio-${i}`).value = "";
                        document.getElementById(`data-fim-${i}`).value = "";
                        document.getElementById(`observacao-${i}`).value = "";
                        document.getElementById(`status-${i}`).textContent = "Status: Não iniciado";
                        database.ref(`mapas/${i}`).remove();
                    }
                    atualizarProgressoGeral();
                    document.getElementById("recuperar-dados-btn").style.display = "inline";
                    alert("Todos os dados foram limpos com sucesso! Use o botão 'Recuperar Dados' para restaurar, se necessário.");
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
    if (confirm("Tem certeza que deseja recuperar os dados salvos? Isso substituirá os dados atuais.")) {
        database.ref("backup").once("value", snapshot => {
            const backup = snapshot.val();
            if (backup && backup.mapas) {
                Object.keys(backup.mapas).forEach(id => {
                    const dados = backup.mapas[id];
                    document.getElementById(`data-inicio-${id}`).value = dados.dataInicio || "";
                    document.getElementById(`data-fim-${id}`).value = dados.dataFim || "";
                    document.getElementById(`observacao-${id}`).value = dados.observacao || "";
                    document.getElementById(`status-${id}`).textContent = dados.status || "Status: Não iniciado";
                    database.ref(`mapas/${id}`).set(dados);
                });
                if (backup.progressoGeral) {
                    document.getElementById("barra-geral").value = backup.progressoGeral.progresso || 0;
                    document.getElementById("percentual-geral").textContent = `${Math.round(backup.progressoGeral.progresso || 0)}%`;
                    database.ref("progressoGeral").set(backup.progressoGeral);
                }
                alert("Dados recuperados com sucesso!");
                document.getElementById("recuperar-dados-btn").style.display = "none";
            } else {
                alert("Nenhum backup disponível para recuperação.");
            }
        }).catch(error => {
            console.error("Erro ao recuperar dados:", error);
            alert("Erro ao recuperar dados: " + error.message);
        });
    }
}

function limparHistorico() {
    const senha = document.getElementById("senha-historico")?.value.trim();
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
            alert("Histórico limpo com sucesso!");
            document.getElementById("senha-historico").value = "";
        }).catch(error => {
            console.error("Erro ao limpar histórico:", error);
            alert("Erro ao limpar histórico: " + error.message);
        });
    }
}

function atualizarStatus(id) {
    const dataInicio = document.getElementById(`data-inicio-${id}`).value;
    const dataFim = document.getElementById(`data-fim-${id}`).value;
    const observacao = document.getElementById(`observacao-${id}`).value;
    const status = document.getElementById(`status-${id}`);

    if (dataFim) {
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        if (dataFimObj < dataInicioObj) {
            alert("A data de fim não pode ser menor que a data de início!");
            document.getElementById(`data-fim-${id}`).value = "";
            return;
        }
        status.textContent = "Status: Concluído";
    } else if (dataInicio) {
        status.textContent = "Status: Aberto";
    } else {
        status.textContent = "Status: Não iniciado";
    }

    salvarNoFirebase(id, dataInicio, dataFim, observacao, status.textContent);
    atualizarProgressoGeral();
}

function atualizarProgressoGeral() {
    let mapasConcluidos = 0;
    for (let i = 1; i <= totalMapas; i++) {
        const status = document.getElementById(`status-${i}`);
        if (status && status.textContent.includes("Concluído")) {
            mapasConcluidos++;
        }
    }
    const progressoGeral = (mapasConcluidos / totalMapas) * 100;
    document.getElementById("barra-geral").value = progressoGeral;
    document.getElementById("percentual-geral").textContent = `${Math.round(progressoGeral)}%`;
    database.ref("progressoGeral").set({ progresso: progressoGeral });
}

function salvarNoFirebase(id, dataInicio, dataFim, observacao, status) {
    database.ref(`mapas/${id}`).set({
        dataInicio,
        dataFim,
        observacao,
        status
    }).catch(error => {
        console.error("Erro ao salvar no Firebase:", error);
        alert("Erro ao salvar dados: " + error.message);
    });
}

function carregarDados() {
    for (let i = 1; i <= totalMapas; i++) {
        database.ref(`mapas/${i}`).on("value", snapshot => {
            const dados = snapshot.val();
            if (dados) {
                const inputInicio = document.getElementById(`data-inicio-${i}`);
                const inputFim = document.getElementById(`data-fim-${i}`);
                const inputObservacao = document.getElementById(`observacao-${i}`);
                const status = document.getElementById(`status-${i}`);
                if (inputInicio) inputInicio.value = dados.dataInicio || "";
                if (inputFim) inputFim.value = dados.dataFim || "";
                if (inputObservacao) inputObservacao.value = dados.observacao || "";
                if (status) status.textContent = dados.status || "Status: Não iniciado";
            }
        });
    }
    database.ref("progressoGeral").on("value", snapshot => {
        const dados = snapshot.val();
        if (dados) {
            document.getElementById("barra-geral").value = dados.progresso || 0;
            document.getElementById("percentual-geral").textContent = `${Math.round(dados.progresso || 0)}%`;
        }
    });
}

function salvarNoHistorico(id, link, nome, observacao, acao) {
    const timestamp = new Date().toISOString();
    database.ref("historicoDesignacoes").push({
        mapaId: id,
        link: link || "",
        nome: nome || "",
        observacao: observacao || "",
        acao: acao,
        timestamp: timestamp
    }).catch(error => {
        console.error("Erro ao salvar no histórico:", error);
        alert("Erro ao salvar no histórico: " + error.message);
    });
}

function designarMapa(id, link, nome) {
    const observacao = document.getElementById(`observacao-${id}`).value;
    database.ref(`mapasDesignados/${id}`).set({
        link,
        nome,
        observacao
    }).then(() => {
        salvarNoHistorico(id, link, nome, observacao, "designado");
        alert(`Mapa ${nome} designado com sucesso!`);
    }).catch(error => {
        console.error("Erro ao designar mapa:", error);
        alert("Erro ao designar mapa: " + error.message);
    });
}

function enviarMapa(id) {
    if (confirm("Tem certeza que deseja remover cartão?")) {
        database.ref(`mapasDesignados/${id}`).once("value", snapshot => {
            const mapa = snapshot.val();
            if (mapa) {
                const { link, nome, observacao } = mapa;
                database.ref(`mapasDesignados/${id}`).remove().then(() => {
                    salvarNoHistorico(id, link, nome, observacao, "removido");
                    alert("Cartão removido com sucesso!");
                }).catch(error => {
                    console.error("Erro ao remover mapa:", error);
                    alert("Erro ao remover mapa: " + error.message);
                });
            } else {
                alert("Mapa não encontrado!");
            }
        }).catch(error => {
            console.error("Erro ao acessar mapa:", error);
            alert("Erro ao acessar mapa: " + error.message);
        });
    }
}

function compartilharLink() {
    const url = "https://gerbesonlima.github.io/Mapas/designados.html";
    if (navigator.share) {
        navigator.share({
            title: 'Mapas Designados',
            text: 'Confira o território a ser trabalhado!',
            url: url
        }).catch(error => {
            console.error('Erro ao compartilhar:', error);
            alert('Erro ao compartilhar o link.');
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a área de transferência: ' + url);
        }).catch(error => {
            console.error('Erro ao copiar:', error);
            alert('Erro ao copiar o link.');
        });
    }
}