
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

    const scriptURL = 'https://script.google.com/macros/s/AKfycbysusFsS79Q0RIGZNSQbFjuHDs-TLJ4ymNDGcRDm7DMykDkSV0LcGqYcCdn5wCb2loJWQ/exec';

    document.addEventListener('DOMContentLoaded', function() {
        fetch(`${scriptURL}?action=getMessages`)
            .then(response => response.json())
            .then(data => {
                data.forEach(row => addMessage(row[0], row[1], new Date(row[2]).toLocaleString('pt-BR')));
            });
    });

    document.getElementById('messageForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const timestamp = new Date().toLocaleString('pt-BR');
        const messageData = { name, message };

        fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => response.text())
        .then(result => {
            if (result === 'Mensagem salva') {
                addMessage(name, message, timestamp);
                document.getElementById('messageForm').reset();
            }
        });
    });

    document.getElementById("messageForm").addEventListener("submit", function(event) {
        event.preventDefault();
    
        var name = document.getElementById("name").value;
        var message = document.getElementById("message").value;
    
        fetch("URL_DA_SUA_API_DO_GOOGLE_APPS_SCRIPT", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById("messageForm").reset();
                loadMessages();
            }
        });
    });
    
    function loadMessages() {
        fetch("https://script.google.com/macros/s/AKfycbzNQSAL-yVEk0xBFIdWZ777dnd3uRDDmDYEoWCapLDaQbOwfT7UE3_-_prG6YMfCMgPfQ/exec")
        .then(response => response.json())
        .then(data => {
            var messagesDiv = document.getElementById("messages");
            messagesDiv.innerHTML = "";
            data.forEach(msg => {
                var msgElement = document.createElement("p");
                msgElement.innerHTML = `<strong>${msg.name}:</strong> ${msg.message} <br> <small>${new Date(msg.date).toLocaleString()}</small>`;
                messagesDiv.appendChild(msgElement);
            });
        });
    }
    
    loadMessages();
    