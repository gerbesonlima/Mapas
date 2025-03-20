
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

   