const projectForm = document.getElementById("projectForm");
const mensajeProyecto = document.getElementById("mensajeProyecto");
const listaProyectos = document.getElementById("listaProyectos");
const logoutBtn = document.getElementById("logoutBtn");

// MODAL - ELEMENTOS
const modalNuevoProyecto = document.getElementById("modalNuevoProyecto");
const btnNuevoProyecto = document.getElementById("btnNuevoProyecto");
const btnCerrarModal = document.getElementById("btnCerrarModal");

// Función para proteger la ruta
function verificarSesion() {
  const usuario = localStorage.getItem("usuario");

  // Si no hay usuario y no estamos ya en el index, redirigir
  if (!usuario && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html";
  }
}

// Ejecutar nada más cargar el script
verificarSesion();

// FUNCIONES MODAL
function abrirModalNuevoProyecto() {
  modalNuevoProyecto.style.display = "flex";
}

function cerrarModalNuevoProyecto() {
  modalNuevoProyecto.style.display = "none";
  projectForm.reset();
  mensajeProyecto.textContent = "";
}

// Event listeners del modal
if (btnNuevoProyecto) {
  btnNuevoProyecto.addEventListener("click", abrirModalNuevoProyecto);
}

if (btnCerrarModal) {
  btnCerrarModal.addEventListener("click", cerrarModalNuevoProyecto);
}

// Cerrar modal al hacer clic fuera (en el overlay)
if (modalNuevoProyecto) {
  modalNuevoProyecto.addEventListener("click", (e) => {
    if (e.target === modalNuevoProyecto) {
      cerrarModalNuevoProyecto();
    }
  });
}

// Función para obtener el usuario del localStorage
function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    return null;
  }
}


// Redirección a estancias
function irAEstancias(idProyecto, nombreProyecto) {
  const nombre = encodeURIComponent(nombreProyecto || "");
  window.location.href = `estancias.html?proyectoId=${idProyecto}&nombre=${nombre}`;
}

// Renderizado de proyectos en GRID 3 COLUMNAS con cards expandidas
function pintarProyectos(proyectos) {
  if (!listaProyectos) return;

  if (!proyectos || proyectos.length === 0) {
    listaProyectos.innerHTML = `<p class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">Todavía no tienes proyectos creados.<br><small style="color: #7a726a;">Haz clic en "+ Nuevo proyecto" para empezar</small></p>`;
    return;
  }

  listaProyectos.innerHTML = proyectos.map((proyecto) => {
    const id = proyecto.id_proyecto || proyecto.id;
    return `
    <div class="project-card" id="card-proyecto-${id}">
      <div class="project-card-content">
        <h3>${proyecto.nombre || "Proyecto sin nombre"}</h3>
        <p>${proyecto.descripcion || "Sin descripción"}</p>
        <span class="project-badge">${proyecto.tipo || "Proyecto"}</span>
        <small class="project-id">ID: ${id}</small>
      </div>

      <div class="project-card-actions">
        <button
          class="btn-proyecto-estancias"
          data-id="${id}"
          data-nombre="${proyecto.nombre || ""}"
        >
          Ver estancias
        </button>
        <button 
          class="btn-proyecto-delete"
          onclick="abrirConfirmacionEliminar(${id})" 
        >
          🗑️
        </button>
      </div>
    </div>
  `}).join("");

  document.querySelectorAll(".btn-proyecto-estancias").forEach((btn) => {
    btn.addEventListener("click", () => {
      irAEstancias(btn.dataset.id, btn.dataset.nombre);
    });
  });
}

// Cargar proyectos filtrados por el ID del usuario logueado
async function cargarProyectos() {
  if (!listaProyectos) return;

  const usuario = obtenerUsuario();
  if (!usuario || !usuario.id) {
    listaProyectos.innerHTML = `<p class="empty-state">Inicia sesión para ver tus proyectos.</p>`;
    return;
  }

  try {
    const response = await fetch(`/api/proyectos?id_usuario=${usuario.id}`);
    const data = await response.json();

    if (!response.ok) {
      listaProyectos.innerHTML = `<p class="empty-state">Error al cargar proyectos.</p>`;
      return;
    }

    pintarProyectos(data);
  } catch (error) {
    listaProyectos.innerHTML = `<p class="empty-state">Error de conexión con el servidor.</p>`;
  }
}

/** * LÓGICA DEL MODAL PERSONALIZADO (Sustituye al confirm nativo)
 *
 */
function abrirConfirmacionEliminar(id) {
  const modal = document.getElementById("customConfirm");
  const btnCancel = document.getElementById("confirmCancel");
  const btnDelete = document.getElementById("confirmDelete");

  // Mostrar el modal con flex para centrarlo
  modal.style.display = "flex";

  // Acción de cancelar
  btnCancel.onclick = () => {
    modal.style.display = "none";
  };

  // Acción de eliminar definitiva
  btnDelete.onclick = async () => {
    modal.style.display = "none";
    try {
      const response = await fetch(`/api/proyectos/${id}`, { method: "DELETE" });
      if (response.ok) {
        // Remover la tarjeta del DOM inmediatamente
        const card = document.getElementById(`card-proyecto-${id}`);
        if (card) card.remove();
        
        // Recargar la lista completa desde el servidor para evitar inconsistencias
        setTimeout(() => {
          cargarProyectos();
        }, 300);
      } else {
        alert("Hubo un problema al eliminar el proyecto en el servidor.");
      }
    } catch (error) {
      console.error("Error al borrar:", error);
      alert("Error de conexión al eliminar el proyecto.");
    }
  };
}

// Crear nuevo proyecto ligado al usuario
if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = obtenerUsuario();
    if (!usuario) return;

    const nombre = document.getElementById("nombreProyecto").value.trim();
    const descripcion = document.getElementById("descripcionProyecto").value.trim();

    try {
      const response = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, id_usuario: usuario.id })
      });

      if (response.ok) {
        mensajeProyecto.textContent = "Proyecto creado correctamente";
        mensajeProyecto.style.color = "#55735c";
        projectForm.reset();
        cargarProyectos();
        
        // Cerrar modal después de crear proyecto
        setTimeout(() => {
          cerrarModalNuevoProyecto();
        }, 1000);
      }
    } catch (error) {
      mensajeProyecto.textContent = "Error al conectar con el servidor";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

async function exportarPDF() {
  const doc = new jsPDF();
  doc.text("Dossier de Diseño - MIM LIVING", 10, 10);
  doc.text(`Proyecto: ${nombreProyecto}`, 10, 20);
  // Añadir imágenes y tablas de presupuesto...
  doc.save(`Proyecto_${nombreProyecto}.pdf`);
}
// Carga inicial
cargarProyectos();