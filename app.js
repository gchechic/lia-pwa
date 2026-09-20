const input = document.getElementById("movimiento");
const boton = document.getElementById("registrar");
const estado = document.getElementById("estado");

boton.addEventListener("click", function () {

    const texto = input.value.trim();

    if (!texto) {
        estado.textContent = "Escribí un movimiento.";
        return;
    }

    estado.textContent = "Probando...";

    setTimeout(function () {
        estado.textContent = "Interfaz funcionando.";
    }, 500);
});