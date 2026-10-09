const API_URL = "https://script.google.com/macros/s/AKfycbw7ecZIF70pjXDkNtDv4OnXEKdhaBz-hTzLtTZou6hYerPRYDM5oOoQ3XkSxEwMUqQb/exec";

const input = document.getElementById("movimiento");
const boton = document.getElementById("registrar");
const estado = document.getElementById("estado");
const confirmacion = document.getElementById("confirmacion");
const detalleConfirmacion = document.getElementById("confirmacion-detalle");
const direccion = document.getElementById("direccion");
const botonEditar = document.getElementById("editar");
const botonConfirmar = document.getElementById("confirmar");
let borradorId = "";

async function solicitarApi(datos) {
    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(datos)
    });

    let resultado;
    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error("El servidor respondió algo que no es JSON.");
    }

    if (!respuesta.ok || !resultado.ok) {
        throw new Error(
            resultado.error || resultado.message || `Error HTTP ${respuesta.status}`
        );
    }

    return resultado;
}

boton.addEventListener("click", async function () {
    const texto = input.value.trim();

    if (!texto) {
        estado.textContent = "Escribí un movimiento.";
        input.focus();
        return;
    }

    boton.textContent = "Interpretando...";
    boton.disabled = true;
    input.disabled = true;

    try {
        const resultado = await solicitarApi({
            accion: "previsualizar",
            frase: texto
        });
        const movimiento = resultado.movimiento;

        if (!resultado.borradorId || !movimiento) {
            throw new Error("El servidor no devolvió una interpretación válida.");
        }

        const importeNumerico = Number(movimiento.importe);
        if (!Number.isFinite(importeNumerico) || !movimiento.concepto || typeof movimiento.paraLia !== "boolean") {
            throw new Error("La interpretación está incompleta. Editá el texto e intentá nuevamente.");
        }

        borradorId = resultado.borradorId;
        const importe = "$" + importeNumerico.toLocaleString("es-AR");
        detalleConfirmacion.textContent = [
            movimiento.fecha,
            movimiento.concepto,
            importe
        ].filter(Boolean).join(" · ");
        direccion.value = movimiento.paraLia ? "true" : "false";
        estado.textContent = "";
        confirmacion.hidden = false;
        boton.hidden = true;
        boton.textContent = "Registrar";
        botonConfirmar.focus();
    } catch (error) {
        console.error("Error interpretando movimiento:", error);
        estado.textContent = "No se pudo interpretar el movimiento.\n" + error.message;
        input.disabled = false;
        boton.disabled = false;
        boton.textContent = "Registrar";
        input.focus();
    }
});

botonEditar.addEventListener("click", function () {
    confirmacion.hidden = true;
    estado.textContent = "";
    boton.hidden = false;
    boton.disabled = false;
    boton.textContent = "Registrar";
    input.disabled = false;
    borradorId = "";
    input.focus();
});

botonConfirmar.addEventListener("click", async function () {
    if (!borradorId) {
        return;
    }

    botonConfirmar.disabled = true;
    botonEditar.disabled = true;
    estado.textContent = "Registrando...";
    let guardado = false;

    try {
        const resultado = await solicitarApi({
            accion: "confirmar",
            borradorId: borradorId,
            paraLia: direccion.value === "true"
        });
        console.log("Respuesta de Apps Script:", resultado);

        const movimiento = resultado.movimiento;

        if (!movimiento) {
            throw new Error("El servidor no devolvió el movimiento registrado.");
        }

        const importe = "$" +
            Number(movimiento.importe)
                .toLocaleString("es-AR")
                .replace(/\u00A0/g, "");

        const tipo = movimiento.paraLia
            ? "A favor de Lia"
            : "A mi favor";

        estado.textContent = "✅ Movimiento registrado\n" +
            [movimiento.fecha, movimiento.concepto, importe, tipo]
                .filter(Boolean)
                .join(" · ");
        guardado = true;

        if (navigator.vibrate) {
            navigator.vibrate(150);
        }

        input.value = "";
    } catch (error) {
        console.error("Error registrando movimiento:", error);
        estado.textContent = "❌ No se pudo registrar\n" + error.message;
    } finally {
        if (guardado) {
            confirmacion.hidden = true;
            boton.hidden = false;
            boton.disabled = false;
            boton.textContent = "Registrar";
            input.disabled = false;
            borradorId = "";
            input.focus();
        } else {
            botonConfirmar.disabled = false;
            botonEditar.disabled = false;
        }
    }
});


// ======================================
// SERVICE WORKER
// ======================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("./sw.js?v=8", {
        updateViaCache: "none"
    }).then(registration => registration.update())
        .catch(error =>
            console.error(
                "Error registrando Service Worker:",
                error
            )
        );
}