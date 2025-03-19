
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

