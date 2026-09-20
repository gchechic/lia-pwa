const API_URL = "https://script.google.com/macros/s/AKfycbw7ecZIF70pjXDkNtDv4OnXEKdhaBz-hTzLtTZou6hYerPRYDM5oOoQ3XkSxEwMUqQb/exec";

const input = document.getElementById("movimiento");
const boton = document.getElementById("registrar");
const estado = document.getElementById("estado");

boton.addEventListener("click", async function () {
    const texto = input.value.trim();

    if (!texto) {
        estado.textContent = "Escribí un movimiento.";
        return;
    }

    boton.disabled = true;
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

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.error || "No se pudo registrar.");
        }

        const movimiento = resultado.movimiento;

        estado.textContent =
            `${movimiento.fecha} · ${movimiento.concepto} · $${movimiento.importe}`;

        input.value = "";

    } catch (error) {
        console.error(error);
        estado.textContent = "Error: " + error.message;

    } finally {
        boton.disabled = false;
    }
});