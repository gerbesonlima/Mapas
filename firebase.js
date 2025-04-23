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
    carregarDados();
});

//Expandir Lista
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
        alert("Senha correta! Campos de edição liberados.");
    } else {
        document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
        document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
        document.getElementById("sair-btn").style.display = "none";
        document.getElementById("limpar-tudo-btn").style.display = "none";
        document.getElementById("relatorio-btn").style.display = "none";
        alert("Senha incorreta!");
    }
}

function sair() {
    document.querySelectorAll(".info").forEach(campo => campo.style.display = "none");
    document.querySelectorAll(".designar-btn").forEach(btn => btn.style.display = "none");
    document.getElementById("sair-btn").style.display = "none";
    document.getElementById("limpar-tudo-btn").style.display = "none";
    document.getElementById("relatorio-btn").style.display = "none";
    document.getElementById("senha").value = "";
    alert("Sessão encerrada. Dados permanecem salvos.");
}

function limparTudo() {
    if (confirm("Tem certeza que deseja limpar TODOS os dados de datas e observações? Esta ação não pode ser desfeita.")) {
        for (let i = 1; i <= totalMapas; i++) {
            document.getElementById(`data-inicio-${i}`).value = "";
            document.getElementById(`data-fim-${i}`).value = "";
            document.getElementById(`observacao-${i}`).value = "";
            document.getElementById(`status-${i}`).textContent = "Status: Não iniciado";
            database.ref(`mapas/${i}`).remove();
        }
        atualizarProgressoGeral();
        alert("Todos os dados foram limpos com sucesso!");
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

function designarMapa(id, link, nome) {
    const observacao = document.getElementById(`observacao-${id}`).value;
    database.ref(`mapasDesignados/${id}`).set({
        link,
        nome,
        observacao
    }).then(() => {
        alert(`Mapa ${nome} designado com sucesso!`);
    }).catch(error => {
        console.error("Erro ao designar mapa:", error);
        alert("Erro ao designar mapa: " + error.message);
    });
}

function enviarMapa(id) {
    if (confirm("Tem certeza que deseja remover este mapa?")) {
        database.ref(`mapasDesignados/${id}`).remove().then(() => {
            alert("Mapa removido com sucesso!");
        }).catch(error => {
            console.error("Erro ao enviar mapa:", error);
            alert("Erro ao enviar mapa: " + error.message);
        });
    }
}