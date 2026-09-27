const API_URL = "https://script.google.com/macros/s/AKfycbw7ecZIF70pjXDkNtDv4OnXEKdhaBz-hTzLtTZou6hYerPRYDM5oOoQ3XkSxEwMUqQb/exec";

const input = document.getElementById("movimiento");
const boton = document.getElementById("registrar");
const estado = document.getElementById("estado");

boton.addEventListener("click", async function () {

    const texto = input.value.trim();

    // -----------------------------
    // VALIDACIÓN
    // -----------------------------

    if (!texto) {
        estado.textContent = "Escribí un movimiento.";
        input.focus();
        return;
    }

    // -----------------------------
    // CONFIRMACIÓN
    // -----------------------------

    const confirmar = window.confirm(
        "¿Querés registrar este movimiento?\n\n" +
        texto
    );

    if (!confirmar) {
        estado.textContent = "Registro cancelado.";
        input.focus();
        return;
    }

    // -----------------------------
    // REGISTRANDO
    // -----------------------------

    boton.disabled = true;
    input.disabled = true;

    estado.textContent = "Registrando...";

    try {

        const respuesta = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                frase: texto
            })
        });

        // Intentamos obtener JSON
        let resultado;

        try {
            resultado = await respuesta.json();
        } catch (jsonError) {

            throw new Error(
                "El servidor respondió algo que no es JSON."
            );
        }

        console.log("Respuesta de Apps Script:", resultado);

        // -----------------------------
        // ERROR DEVUELTO POR BACKEND
        // -----------------------------

        if (!respuesta.ok) {

            throw new Error(
                resultado.error ||
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );
        }

        if (!resultado.ok) {

            throw new Error(
                resultado.error ||
                resultado.message ||
                "No se pudo registrar el movimiento."
            );
        }

        // -----------------------------
        // MOVIMIENTO INTERPRETADO
        // -----------------------------

        const movimiento = resultado.movimiento;

        if (!movimiento) {
            throw new Error(
                "El servidor confirmó el registro pero no devolvió el movimiento interpretado."
            );
        }

        const importe = "$" +
            Number(movimiento.importe)
                .toLocaleString("es-AR")
                .replace(/\u00A0/g, "");

        const tipo = movimiento.paraLia
            ? "A favor de Lia"
            : "A mi favor";

        // -----------------------------
        // MOSTRAR RESULTADO
        // -----------------------------

        estado.innerHTML =
            "✅ <b>Movimiento registrado</b><br>" +
            movimiento.fecha + " · " +
            movimiento.concepto + " · " +
            importe + "<br>" +
            tipo;

        // -----------------------------
        // VIBRACIÓN
        // -----------------------------

        if (navigator.vibrate) {
            navigator.vibrate(150);
        }

        // -----------------------------
        // LIMPIAR PARA EL PRÓXIMO
        // -----------------------------

        input.value = "";

        input.disabled = false;
        boton.disabled = false;

        input.focus();

    } catch (error) {

        console.error("Error registrando movimiento:", error);

        // -----------------------------
        // MOSTRAR ERROR
        // -----------------------------

        estado.innerHTML =
            "❌ <b>No se pudo registrar</b><br>" +
            error.message;

        input.disabled = false;
        boton.disabled = false;

        input.focus();

    }
});


// ======================================
// SERVICE WORKER
// ======================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js")
        .catch(error =>
            console.error(
                "Error registrando Service Worker:",
                error
            )
        );
}