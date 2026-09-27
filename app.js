const API_URL = "https://script.google.com/macros/s/AKfycbw7ecZIF70pjXDkNtDv4OnXEKdhaBz-hTzLtTZou6hYerPRYDM5oOoQ3XkSxEwMUqQb/exec";

const input = document.getElementById("movimiento");
const boton = document.getElementById("registrar");
const estado = document.getElementById("estado");
const confirmacion = document.getElementById("confirmacion");
const detalleConfirmacion = document.getElementById("confirmacion-detalle");
const botonEditar = document.getElementById("editar");
const botonConfirmar = document.getElementById("confirmar");
let textoPendiente = "";

boton.addEventListener("click", function () {
    const texto = input.value.trim();

    if (!texto) {
        estado.textContent = "Escribí un movimiento.";
        input.focus();
        return;
    }

    textoPendiente = texto;
    detalleConfirmacion.textContent = texto;
    estado.textContent = "";
    confirmacion.hidden = false;
    boton.disabled = true;
    boton.hidden = true;
    input.disabled = true;
    botonConfirmar.focus();
});

botonEditar.addEventListener("click", function () {
    confirmacion.hidden = true;
    boton.hidden = false;
    boton.disabled = false;
    input.disabled = false;
    textoPendiente = "";
    input.focus();
});

botonConfirmar.addEventListener("click", async function () {
    if (!textoPendiente) {
        return;
    }

    botonConfirmar.disabled = true;
    botonEditar.disabled = true;
    estado.textContent = "Registrando...";

    try {

        const respuesta = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                frase: textoPendiente
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

        estado.textContent = "❌ No se pudo registrar\n" + error.message;
    } finally {
        confirmacion.hidden = true;
        boton.hidden = false;
        boton.disabled = false;
        botonConfirmar.disabled = false;
        botonEditar.disabled = false;
        input.disabled = false;
        textoPendiente = "";
        input.focus();
    }
});


// ======================================
// SERVICE WORKER
// ======================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js?v=7", {
        updateViaCache: "none"
    }).then(registration => registration.update())
        .catch(error =>
            console.error(
                "Error registrando Service Worker:",
                error
            )
        );
}