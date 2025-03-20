
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggle-theme");
    const body = document.body;

    // Verifica se já existe um tema salvo no navegador
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    } else {
        body.classList.add("light-mode");
    }

    toggleButton.addEventListener("click", function () {
        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark"); // Salva no navegador
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            localStorage.setItem("theme", "light"); // Salva no navegador
        }
    });
});



    function toggleList(id) {
        const lista = document.getElementById(id);
        const titulo = lista.previousElementSibling;

        if (lista.style.display === "none" || lista.style.display === "") {
            lista.style.display = "block";
            titulo.classList.add('active');
        } else {
            lista.style.display = "none";
            titulo.classList.remove('active');
        }
    }

    document.addEventListener("DOMContentLoaded", async function () {
        const form = document.getElementById("messageForm");
        const messagesContainer = document.getElementById("messages");
        const apiUrl = "https://script.google.com/macros/s/AKfycbwAxFf4vBULMBupjcMPOlGHQaOF6zm4gADi9l8s5zq_Kp-v-uQCUz-aU8YbU-pLrVr7/exec";
    
        // Função para carregar mensagens do Google Sheets
        async function loadMessages() {
            try {
                const response = await fetch(apiUrl + "?action=getMessages");
                const messages = await response.json();
                
                messagesContainer.innerHTML = ""; // Limpa antes de carregar
    
                messages.forEach(msg => {
                    const messageElement = document.createElement("div");
                    messageElement.classList.add("message");
                    messageElement.innerHTML = `<strong>${msg.name}</strong> (${msg.date}): ${msg.message}`;
                    messagesContainer.appendChild(messageElement);
                });
            } catch (error) {
                console.error("Erro ao carregar mensagens:", error);
            }
        }
    
        // Carregar mensagens ao iniciar
        loadMessages();
    
        // Enviar formulário
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
    
            const name = document.getElementById("name").value;
            const message = document.getElementById("message").value;
    
            try {
                await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, message })
                });
    
                form.reset(); // Limpa o formulário
                loadMessages(); // Atualiza a lista
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
            }
        });
    });
    