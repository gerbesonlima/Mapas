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
        status.textContent = "Status: Em andamento";
    } else {
        status.textContent = "Status: Não iniciado";
    }

    database.ref(`mapas/${id}`).set({
        dataInicio: dataInicio,
        dataFim: dataFim,
        observacao: observacao,
        status: status.textContent
    }).catch(error => {
        console.error("Erro ao salvar dados:", error);
        alert("Erro ao salvar dados: " + error.message);
    });

    atualizarProgressoGeral();
}

function atualizarProgressoGeral() {
    let mapasConcluidos = 0;
    for (let i = 1; i <= totalMapas; i++) {
        const dataFim = document.getElementById(`data-fim-${i}`).value;
        if (dataFim) {
            mapasConcluidos++;
        }
    }
    const progresso = (mapasConcluidos / totalMapas) * 100;
    document.getElementById("barra-geral").value = progresso;
    document.getElementById("percentual-geral").textContent = `${Math.round(progresso)}%`;
    database.ref("progressoGeral").set({ progresso: progresso }).catch(error => {
        console.error("Erro ao salvar progresso geral:", error);
        alert("Erro ao salvar progresso geral: " + error.message);
    });
}

function carregarDados() {
    database.ref("mapas").on("value", snapshot => {
        const mapas = snapshot.val();
        if (mapas) {
            Object.keys(mapas).forEach(id => {
                const dados = mapas[id];
                document.getElementById(`data-inicio-${id}`).value = dados.dataInicio || "";
                document.getElementById(`data-fim-${id}`).value = dados.dataFim || "";
                document.getElementById(`observacao-${id}`).value = dados.observacao || "";
                document.getElementById(`status-${id}`).textContent = dados.status || "Status: Não iniciado";
            });
        }
        atualizarProgressoGeral();
    }, error => {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados: " + error.message);
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
            console.error("Erro ao salvar no histórico:", error);
            alert("Erro ao salvar no histórico: " + error.message);
        });
    }).catch(error => {
        console.error("Erro ao designar mapa:", error);
        alert("Erro ao designar mapa: " + error.message);
    });
}

function enviarMapa(id) {
    if (confirm("Tem certeza que deseja remover este mapa designado?")) {
        database.ref(`mapasDesignados/${id}`).remove().then(() => {
            alert("Mapa removido com sucesso!");
        }).catch(error => {
            console.error("Erro ao remover mapa:", error);
            alert("Erro ao remover mapa: " + error.message);
        });
    }
}

function compartilharLink() {
    const url = "https://gerbesonlima.github.io/Mapas/designados.html";
    const button = document.querySelector('#botao-compartilhar-independente button');

    // Recuperar os mapas designados do Firebase
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
            navigator.share({
                title: 'Mapas Designados',
                text: shareText
            }).then(() => {
                if (button) {
                    button.classList.add('success');
                    setTimeout(() => button.classList.remove('success'), 1000);
                }
            }).catch(error => {
                console.error('Erro ao compartilhar:', error);
                alert('Erro ao compartilhar o link: ' + error.message);
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Informações copiadas para a área de transferência!');
                if (button) {
                    button.classList.add('success');
                    setTimeout(() => button.classList.remove('success'), 1000);
                }
            }).catch(error => {
                console.error('Erro ao copiar:', error);
                alert('Erro ao copiar as informações: ' + error.message);
            });
        }
    }).catch(error => {
        console.error('Erro ao recuperar mapas designados:', error);
        alert('Erro ao recuperar mapas designados: ' + error.message);
    });
}