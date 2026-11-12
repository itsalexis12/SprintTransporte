// ============================================
// Mapa con Leaflet
// ============================================

const mapa = L.map("mapa").setView([19.0414, -98.2063], 13);

L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: '© Esri — OpenStreetMap contributors'
}).addTo(mapa);

let marcadorSeleccionado = null;
const capaParadas = L.layerGroup().addTo(mapa);

const API = "/paradas";
const form = document.getElementById("form-parada");
const lista = document.getElementById("lista-paradas");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = document.getElementById("btn-guardar");
const titulo = document.getElementById("titulo-formulario");

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function limpiarFormulario() {
  form.reset();
  document.getElementById("parada-id").value = "";
  btnCancelar.classList.add("oculto");
  btnGuardar.textContent = "Guardar";
  titulo.textContent = "Registrar parada";
}

async function cargarParadas() {
  try {
    const respuesta = await fetch(API);

    if (!respuesta.ok) {
      throw new Error("No se pudo obtener la lista de paradas");
    }

    const datos = await respuesta.json();

    lista.innerHTML = "";
    capaParadas.clearLayers();

    if (!datos.paradas || datos.paradas.length === 0) {
      lista.innerHTML = "<p>No hay paradas registradas.</p>";
      return;
    }

    datos.paradas.forEach(parada => {
      // Tarjeta de parada
      const tarjeta = document.createElement("article");
      tarjeta.className = "parada";

      tarjeta.innerHTML = `
        <h3>${parada.nombre}</h3>
        <p><strong>ID:</strong> ${parada.id}</p>
        <p><strong>Colonia:</strong> ${parada.colonia}</p>
        <p><strong>Municipio:</strong> ${parada.municipio}</p>
        <p><strong>Coordenadas:</strong> ${parada.latitud}, ${parada.longitud}</p>
        <p><strong>Rutas:</strong> ${parada.rutas.length > 0 ? parada.rutas.join(", ") : "Sin rutas"}</p>
        <p><strong>Estado:</strong> ${parada.activa ? "Activa" : "Inactiva"}</p>
        <div class="acciones">
          <button class="btn-editar" data-id="${parada.id}">Editar</button>
          <button class="btn-eliminar" data-id="${parada.id}">Eliminar</button>
          <button class="btn-ubicar" data-id="${parada.id}">Ver en mapa</button>
        </div>`;

      lista.appendChild(tarjeta);

      // Marcador en el mapa
      const marcador = L.marker([
        parada.latitud,
        parada.longitud
      ]).addTo(capaParadas);

      marcador.bindPopup(`
        <strong>${parada.nombre}</strong><br>
        ${parada.colonia}<br>
        Rutas: ${parada.rutas.join(", ") || "Sin rutas"}
      `);

      marcador.bindTooltip(parada.nombre);
    });

  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}


form.addEventListener("submit", async evento => {
  evento.preventDefault();

  const id = document.getElementById("parada-id").value;
  const rutas = document.getElementById("rutas").value
    .split(",")
    .map(ruta => ruta.trim())
    .filter(ruta => ruta !== "");

  const datos = {
    nombre: document.getElementById("nombre").value,
    colonia: document.getElementById("colonia").value,
    municipio: "Puebla",
    latitud: parseFloat(document.getElementById("latitud").value),
    longitud: parseFloat(document.getElementById("longitud").value),
    rutas,
    activa: document.getElementById("activa").value === "true"
  };

  const url = id ? `${API}/${id}` : API;
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.detail || "Error al guardar");
    }

    mostrarMensaje(
      id ? "Parada actualizada correctamente." : "Parada registrada correctamente.",
      "exito"
    );

    limpiarFormulario();
    cargarParadas();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});
async function ubicarParadaEnMapa(id) {
  try {
    const respuesta = await fetch(`${API}/${id}`);
    if (!respuesta.ok) {
      throw new Error("No se encontró la parada");
    }

    const parada = await respuesta.json();

    if (marcadorSeleccionado) {
      mapa.removeLayer(marcadorSeleccionado);
    }

    marcadorSeleccionado = L.marker([
      parada.latitud,
      parada.longitud
    ]).addTo(mapa);

    marcadorSeleccionado
      .bindPopup(`
        <strong>${parada.nombre}</strong><br>
        ${parada.colonia}<br>
        Rutas: ${parada.rutas.join(", ") || "Sin rutas"}
      `)
      .openPopup();

    mapa.setView([parada.latitud, parada.longitud], 16);

    document.querySelector(".panel-mapa").scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

lista.addEventListener("click", async evento => {
    const boton = evento.target;
    const id = boton.dataset.id;

    if (!id) {
        return;
    }

    // EDITAR PARADA
    if (boton.classList.contains("btn-editar")) {
        const respuesta = await fetch(`${API}/${id}`);
        const parada = await respuesta.json();

        document.getElementById("parada-id").value = parada.id;
        document.getElementById("nombre").value = parada.nombre;
        document.getElementById("colonia").value = parada.colonia;
        document.getElementById("latitud").value = parada.latitud;
        document.getElementById("longitud").value = parada.longitud;
        document.getElementById("rutas").value = parada.rutas.join(", ");
        document.getElementById("activa").value = parada.activa.toString();

        btnCancelar.classList.remove("oculto");
        btnGuardar.textContent = "Actualizar";
        titulo.textContent = "Editar parada";
    }

    // ELIMINAR PARADA
    if (boton.classList.contains("btn-eliminar")) {
        const confirmar = confirm("¿Deseas eliminar esta parada?");

        if (!confirmar) return;

        const respuesta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            mostrarMensaje("Parada eliminada correctamente.", "exito");
            cargarParadas();
        } else {
            mostrarMensaje("No se pudo eliminar la parada.", "error");
        }
    }

    // UBICAR PARADA EN EL MAPA
    if (boton.classList.contains("btn-ubicar")) {
        ubicarParadaEnMapa(id);
    }
});


btnCancelar.addEventListener("click", limpiarFormulario);
document.getElementById("btn-recargar").addEventListener("click", cargarParadas);

limpiarFormulario();
cargarParadas();
