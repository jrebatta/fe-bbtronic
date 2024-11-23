document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("crearSesion").addEventListener("click", function() {
        window.location.href = "crear_sesion.html"; // Cambia a la página para crear sesión
    });

    document.getElementById("unirseSesion").addEventListener("click", function() {
        window.location.href = "unirse_sesion.html"; // Cambia a la página para unirse a una sesión
    });

    document.getElementById("jugarCasa").addEventListener("click", function() {
        window.location.href = "jugar_casa.html"; // Cambia a la página para jugar en casa
    });
});
