const estanciaForm = document.getElementById("estanciaForm");
const mensajeEstancia = document.getElementById("mensajeEstancia");
const listaEstancias = document.getElementById("listaEstancias");
const recargarEstancias = document.getElementById("recargarEstancias");
const logoutBtn = document.getElementById("logoutBtn");
const tituloProyecto = document.getElementById("tituloProyecto");

const params = new URLSearchParams(window.location.search);
const proyectoId = params.get("proyectoId");
const nombreProyecto = params.get("nombre");

if (tituloProyecto && nombreProyecto) {
  tituloProyecto.textContent = `Estancias de ${decodeURIComponent(nombreProyecto)}`;
}

function mostrarErrorProyecto() {
  if (listaEstancias) {
    listaEstancias.innerHTML = `<p class="empty-state">No se ha recibido un proyecto válido.</p>`;
  }
}

function pintarEstancias(estancias) {
  if (!listaEstancias) return;

  if (!estancias || estancias.length === 0) {
    listaEstancias.innerHTML = `<p class="empty-state">Todavía no hay estancias cargadas.</p>`;
    return;
  }

  listaEstancias.innerHTML = estancias.map((estancia) => `
    <article class="project-item">
      <h3>${estancia.nombre || "Estancia sin nombre"}</h3>
      <p>
        Ancho: ${estancia.ancho ?? "-"} ·
        Largo: ${estancia.largo ?? "-"} ·
        Alto: ${estancia.alto ?? "-"}
      </p>
      <small>ID: ${estancia.id_estancia || estancia.id || "-"}</small>
    </article>
  `).join("");
}

async function cargarEstancias() {
  if (!proyectoId) {
    mostrarErrorProyecto();
    return;
  }

  listaEstancias.innerHTML = `<p class="empty-state">Cargando estancias...</p>`;

  try {
    const response = await fetch(`/api/proyectos/${proyectoId}/estancias`);
    const data = await response.json();

    if (!response.ok) {
      listaEstancias.innerHTML = `<p class="empty-state">No se pudieron cargar las estancias.</p>`;
      return;
    }

    pintarEstancias(data);
  } catch (error) {
    listaEstancias.innerHTML = `<p class="empty-state">Error de conexión con el servidor.</p>`;
  }
}

if (estanciaForm) {
  estanciaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!proyectoId) {
      mensajeEstancia.textContent = "No se ha recibido un proyecto válido.";
      mensajeEstancia.style.color = "#8a3d3d";
      return;
    }

    const nombre = document.getElementById("nombreEstancia").value.trim();
    const ancho = document.getElementById("anchoEstancia").value.trim();
    const largo = document.getElementById("largoEstancia").value.trim();
    const alto = document.getElementById("altoEstancia").value.trim();

    mensajeEstancia.textContent = "";
    mensajeEstancia.style.color = "#8a3d3d";

    try {
      const response = await fetch(`/api/proyectos/${proyectoId}/estancias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          ancho: ancho || null,
          largo: largo || null,
          alto: alto || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        mensajeEstancia.textContent = data.error || "No se pudo crear la estancia";
        return;
      }

      mensajeEstancia.style.color = "#55735c";
      mensajeEstancia.textContent = data.mensaje || "Estancia creada correctamente";

      estanciaForm.reset();
      cargarEstancias();
    } catch (error) {
      mensajeEstancia.textContent = "Error de conexión con el servidor";
    }
  });
}

if (recargarEstancias) {
  recargarEstancias.addEventListener("click", cargarEstancias);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

cargarEstancias();
