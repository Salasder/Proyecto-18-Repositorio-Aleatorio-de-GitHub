// ======================================
// GITHUB REPOSITORY FINDER
// ======================================


// 1. SELECCIONAR ELEMENTOS HTML

const lenguaje = document.getElementById("lenguaje");
const resultado = document.getElementById("resultado");

const btnRefresh = document.getElementById("btn-refresh");
const btnRetry = document.getElementById("btn-retry");


// 2. VARIABLES GLOBALES

let lenguajeSeleccionado = "";
let repositorioActual = null;
let primeraBusquedaExitosa = false;


// 3. MOSTRAR ESTADO DE CARGA

function mostrarCargando() {

    resultado.innerHTML = `
        <div class="estado-cargando">
            <div class="spinner"></div>
            <h2>Loading, porfaovr espere mientra encuentro el RP...</h2>
            <p>Buscando repositorios en GitHub.</p>
        </div>
    `;

    btnRefresh.hidden = true;
    btnRetry.hidden = true;
}


// 4. MOSTRAR ESTADO VACÍO

function mostrarVacio() {

    resultado.innerHTML = `
        <div class="estado-vacio">
            <p>🔎</p>
            <h2>No repositories found</h2>
            <p>No encontramos repositorios para este lenguaje.</p>
        </div>
    `;

    btnRefresh.hidden = true;
    btnRetry.hidden = primeraBusquedaExitosa;
}


// 5. MOSTRAR ESTADO DE ERROR

function mostrarError(mensaje) {

    resultado.innerHTML = `
        <div class="estado-error">
            <p>⚠️</p>
            <h2>¡Ups! Algo salió mal</h2>
            <p>${mensaje}</p>
        </div>
    `;

    btnRefresh.hidden = true;
    btnRetry.hidden = false;
}


// 6. MOSTRAR REPOSITORIO

function mostrarRepositorio(repo) {

    resultado.innerHTML = "";

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-repositorio";

    const titulo = document.createElement("h2");
    const enlace = document.createElement("a");

    enlace.href = repo.html_url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = repo.full_name;

    titulo.appendChild(enlace);

    const descripcion = document.createElement("p");
    descripcion.className = "descripcion";

    descripcion.textContent =
        repo.description || "Este repositorio no tiene descripción.";

    const lenguajeRepo = document.createElement("span");
    lenguajeRepo.className = "etiqueta-lenguaje";
    lenguajeRepo.textContent = repo.language || lenguajeSeleccionado;

    const estadisticas = document.createElement("div");
    estadisticas.className = "estadisticas";

    // Crear estadísticas

    const datos = [{
            numero: repo.stargazers_count,
            nombre: "⭐ Estrellas"
        },
        {
            numero: repo.forks_count,
            nombre: "🍴 Forks"
        },
        {
            numero: repo.open_issues_count,
            nombre: "🔧 Issues abiertas"
        }
    ];

    datos.forEach(function(dato) {

        const elemento = document.createElement("div");
        elemento.className = "estadistica";

        const numero = document.createElement("strong");
        numero.textContent = dato.numero.toLocaleString("es-CO");

        const nombre = document.createElement("span");
        nombre.textContent = dato.nombre;

        elemento.appendChild(numero);
        elemento.appendChild(nombre);

        estadisticas.appendChild(elemento);

    });

    // Agregar todos los elementos a la tarjeta

    tarjeta.appendChild(titulo);
    tarjeta.appendChild(descripcion);
    tarjeta.appendChild(lenguajeRepo);
    tarjeta.appendChild(estadisticas);

    resultado.appendChild(tarjeta);

    // Mostrar botón Refresh

    primeraBusquedaExitosa = true;

    btnRefresh.hidden = false;
    btnRetry.hidden = true;

}


// 7. FUNCIÓN PRINCIPAL: BUSCAR REPOSITORIO

async function buscarRepositorio() {

    if (!lenguajeSeleccionado) {

        return;

    }

    // Mostrar carga

    mostrarCargando();

    try {

        // Construir consulta para GitHub

        const parametros = new URLSearchParams({

            q: `language:${lenguajeSeleccionado}`,
            sort: "stars",
            order: "desc",
            per_page: "100"

        });

        const url =
            `https://api.github.com/search/repositories?${parametros}`;

        // Consultar API

        const respuesta = await fetch(url);

        // Comprobar respuesta

        if (!respuesta.ok) {

            if (respuesta.status === 403 || respuesta.status === 429) {
                throw new Error(
                    "GitHub ha limitado temporalmente las consultas. Intenta más tarde."
                );
            }

            throw new Error(
                `Error al consultar GitHub. Código: ${respuesta.status}`
            );

        }

        // Convertir respuesta a JSON

        const datos = await respuesta.json();

        // Comprobar si existen repositorios

        if (!datos.items || datos.items.length === 0) {

            mostrarVacio();
            return;

        }

        // Elegir un repositorio aleatorio

        const indiceAleatorio = Math.floor(
            Math.random() * datos.items.length
        );

        repositorioActual = datos.items[indiceAleatorio];

        // Mostrar resultado

        mostrarRepositorio(repositorioActual);

    } catch (error) {

        console.error("Error:", error);

        mostrarError(error.message);

    }

}


// 8. DETECTAR CAMBIOS EN EL MENÚ

lenguaje.addEventListener("change", function() {

    lenguajeSeleccionado = lenguaje.value;

    if (lenguajeSeleccionado === "") {

        resultado.innerHTML = `
            <div class="estado-vacio">
                <p>🔎</p>
                <h2>Porfavor seleciona un lenguaje</h2>
                <p>Selecciona un lenguaje para encontrar repositorios.</p>
            </div>
        `;

        btnRefresh.hidden = true;
        btnRetry.hidden = true;

        return;

    }

    buscarRepositorio();

});


// 9. BOTÓN REFRESH

btnRefresh.addEventListener("click", function() {

    buscarRepositorio();

});


// 10. BOTÓN PARA REINTENTAR

btnRetry.addEventListener("click", function() {

    buscarRepositorio();

});


// 11. MODO DE PRUEBA DE ESTADOS
// Se activa agregando ?test=loading, ?test=empty
// o ?test=error a la dirección de la página.

const modoPrueba = new URLSearchParams(
    window.location.search
).get("test");

if (modoPrueba === "loading") {

    mostrarCargando();

    setTimeout(function() {

        resultado.innerHTML = `
            <div class="estado-vacio">
                <h2>Prueba de carga completada</h2>
                <p>El estado Loading se mostró correctamente.</p>
            </div>
        `;

    }, 4000);

} else if (modoPrueba === "empty") {

    lenguajeSeleccionado = "LenguajeSinResultados";
    mostrarVacio();

} else if (modoPrueba === "error") {

    mostrarError("Este es un error simulado para probar la interfaz.");

}

console.log("GitHub Repository Finder iniciado correctamente.");