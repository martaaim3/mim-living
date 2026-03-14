const projectForm = document.getElementById("projectForm");
const mensajeProyecto = document.getElementById("mensajeProyecto");
const listaProyectos = document.getElementById("listaProyectos");
const recargarProyectos = document.getElementById("recargarProyectos");
const logoutBtn = document.getElementById("logoutBtn");

function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;

  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    return null;
  }
}

function irAEstancias(idProyecto, nombreProyecto) {
  const nombre = encodeURIComponent(nombreProyecto || "");
  window.location.href = `estancias.html?proyectoId=${idProyecto}&nombre=${nombre}`;
}

function pintarProyectos(proyectos) {
  if (!listaProyectos) return;

  if (!proyectos || proyectos.length === 0) {
    listaProyectos.innerHTML = `<p class="empty-state">Todavía no hay proyectos cargados.</p>`;
    return;
  }

  listaProyectos.innerHTML = proyectos.map((proyecto) => `
    <article class="project-item">
      <h3>${proyecto.nombre || "Proyecto sin nombre"}</h3>
      <p>${proyecto.descripcion || "Sin descripción"}</p>
      <small>ID: ${proyecto.id_proyecto || proyecto.id || "-"}</small>

      <div class="project-actions">
        <button
          class="btn btn-secondary btn-small btn-estancias"
          data-id="${proyecto.id_proyecto || proyecto.id}"
          data-nombre="${proyecto.nombre || ""}"
        >
          Ver estancias
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".btn-estancias").forEach((btn) => {
    btn.addEventListener("click", () => {
      irAEstancias(btn.dataset.id, btn.dataset.nombre);
    });
  });
}

async function cargarProyectos() {
  if (!listaProyectos) return;

  listaProyectos.innerHTML = `<p class="empty-state">Cargando proyectos...</p>`;

  try {
    const response = await fetch("/api/proyectos");
    const data = await response.json();

    if (!response.ok) {
      listaProyectos.innerHTML = `<p class="empty-state">No se pudieron cargar los proyectos.</p>`;
      return;
    }

    pintarProyectos(data);
  } catch (error) {
    listaProyectos.innerHTML = `<p class="empty-state">Error de conexión con el servidor.</p>`;
  }
}

if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = obtenerUsuario();

    if (!usuario) {
      mensajeProyecto.textContent = "Debes iniciar sesión.";
      mensajeProyecto.style.color = "#8a3d3d";
      return;
    }

    const nombre = document.getElementById("nombreProyecto").value.trim();
    const descripcion = document.getElementById("descripcionProyecto").value.trim();

    mensajeProyecto.textContent = "";
    mensajeProyecto.style.color = "#8a3d3d";

    try {
      const response = await fetch("/api/proyectos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          id_usuario: usuario.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        mensajeProyecto.textContent = data.error || "No se pudo crear el proyecto";
        return;
      }

      mensajeProyecto.style.color = "#55735c";
      mensajeProyecto.textContent = data.mensaje || "Proyecto creado correctamente";

      projectForm.reset();
      cargarProyectos();
    } catch (error) {
      mensajeProyecto.textContent = "Error de conexión con el servidor";
    }
  });
}

if (recargarProyectos) {
  recargarProyectos.addEventListener("click", cargarProyectos);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

cargarProyectos();
