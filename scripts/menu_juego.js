document.addEventListener('DOMContentLoaded', function () {
    // Evento para crear sesión
    document.getElementById("crearSesion").addEventListener("click", function () {
        window.location.href = "pages/crear_sesion.html"; // Cambia a la página para crear sesión
    });

    // Evento para unirse a sesión
    document.getElementById("unirseSesion").addEventListener("click", function () {
        window.location.href = "pages/unirse_sesion.html"; // Cambia a la página para unirse a una sesión
    });

    // Evento para jugar en casa
    document.getElementById("jugarCasa").addEventListener("click", function () {
        window.location.href = "pages/jugar_casa.html"; // Cambia a la página para jugar en casa
    });
});
