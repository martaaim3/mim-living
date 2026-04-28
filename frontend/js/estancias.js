// js/estancias.js

// 1. Elementos del DOM
const estanciaForm = document.getElementById("estanciaForm");
const mensajeEstancia = document.getElementById("mensajeEstancia");
const listaEstancias = document.getElementById("listaEstancias");
const logoutBtn = document.getElementById("logoutBtn");
const tituloProyecto = document.getElementById("tituloProyecto");

// MODAL ELEMENTOS
const modalNuevaEstancia = document.getElementById("modalNuevaEstancia");
const btnNuevaEstancia = document.getElementById("btnNuevaEstancia");
const btnCerrarModalEstancia = document.getElementById("btnCerrarModalEstancia");

// 2. Parámetros de la URL
const params = new URLSearchParams(window.location.search);
const idProyecto = params.get("proyectoId");
const nombreProyecto = params.get("nombre");

// Configurar título inicial
if (nombreProyecto && tituloProyecto) {
  tituloProyecto.textContent = decodeURIComponent(nombreProyecto);
}

// 3. Verificación de Sesión
function verificarSesion() {
  const usuario = localStorage.getItem("usuario");
  if (!usuario && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html";
  }
}
verificarSesion();

// 4. Navegación
function irADisenoIA(idEstancia, nombreEstancia) {
  const nombre = encodeURIComponent(nombreEstancia || "");
  window.location.href = `detalle-estancia.html?estanciaId=${idEstancia}&nombre=${nombre}&proyectoId=${idProyecto}`;
}

function irADiseno3D(idEstancia, nombreEstancia) {
  const nombre = encodeURIComponent(nombreEstancia || "");
  window.location.href = `plano3d.html?estanciaId=${idEstancia}&nombre=${nombre}&proyectoId=${idProyecto}`;
}

// 5. MODAL - Abrir/Cerrar
function abrirModalNuevaEstancia() {
  modalNuevaEstancia.style.display = "flex";
}

function cerrarModalNuevaEstancia() {
  modalNuevaEstancia.style.display = "none";
  estanciaForm.reset();
  mensajeEstancia.textContent = "";
}

if (btnNuevaEstancia) {
  btnNuevaEstancia.addEventListener("click", abrirModalNuevaEstancia);
}

if (btnCerrarModalEstancia) {
  btnCerrarModalEstancia.addEventListener("click", cerrarModalNuevaEstancia);
}

// Cerrar modal al hacer clic fuera (overlay)
if (modalNuevaEstancia) {
  modalNuevaEstancia.addEventListener("click", (e) => {
    if (e.target === modalNuevaEstancia) {
      cerrarModalNuevaEstancia();
    }
  });
}

// 6. Pintado de estancias en GRID 3 COLUMNAS
function pintarEstancias(estancias) {
  if (!listaEstancias) return;

  if (!Array.isArray(estancias) || estancias.length === 0) {
    listaEstancias.innerHTML = `<p class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">Todavía no hay estancias creadas.<br><small style="color: #7a726a;">Haz clic en "+ Nueva estancia" para empezar</small></p>`;
    return;
  }

  listaEstancias.innerHTML = estancias.map((estancia) => {
    const id = estancia.id_estancia || estancia.id;
    const ancho = estancia.ancho ? estancia.ancho + "m" : "-";
    const largo = estancia.largo ? estancia.largo + "m" : "-";
    const alto = estancia.alto ? estancia.alto + "m" : "-";
    
    return `
    <div class="estancia-card" id="card-estancia-${id}">
      <div class="estancia-card-content">
        <h3>${estancia.nombre || "Estancia sin nombre"}</h3>
        <p class="estancia-medidas">${ancho} × ${largo} × ${alto}</p>
      </div>

      <div class="estancia-card-actions">
        <button
          class="btn-estancia-ia"
          data-id="${id}"
          data-nombre="${estancia.nombre || ""}"
        >
          Diseño IA
        </button>
        <button
          class="btn-estancia-3d"
          data-id="${id}"
          data-nombre="${estancia.nombre || ""}"
        >
          🎨 Diseño 3D
        </button>
      </div>
    </div>
  `}).join("");

  // Event listeners dinámicos
  document.querySelectorAll(".btn-estancia-ia").forEach((btn) => {
    btn.addEventListener("click", () => irADisenoIA(btn.dataset.id, btn.dataset.nombre));
  });

  document.querySelectorAll(".btn-estancia-3d").forEach((btn) => {
    btn.addEventListener("click", () => irADiseno3D(btn.dataset.id, btn.dataset.nombre));
  });
}

// 7. Cargar estancias
async function cargarEstancias() {
  if (!listaEstancias) return;

  if (!idProyecto) {
    listaEstancias.innerHTML = `<p class="empty-state">Error: No se encontró el ID del proyecto.</p>`;
    return;
  }

  listaEstancias.innerHTML = `<p class="empty-state">Cargando estancias...</p>`;

  try {
    const data = await window.api.estancias.listar(idProyecto);
    const estancias = Array.isArray(data) ? data : (data.estancias || []);
    pintarEstancias(estancias);
    
  } catch (error) {
    console.error("Error al cargar estancias:", error);
    listaEstancias.innerHTML = `<p class="empty-state">Error de conexión con el servidor.</p>`;
  }
}

// 8. Crear estancia
if (estanciaForm) {
  estanciaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!idProyecto) {
      mensajeEstancia.textContent = "Error: Falta el ID del proyecto.";
      return;
    }

    const datos = {
      nombre: document.getElementById("nombreEstancia").value.trim(),
      ancho: document.getElementById("anchoEstancia").value || null,
      largo: document.getElementById("largoEstancia").value || null,
      alto: document.getElementById("altoEstancia").value || null
    };

    mensajeEstancia.textContent = "Guardando...";
    mensajeEstancia.style.color = "#666";

    try {
      const resultado = await window.api.estancias.crear(idProyecto, datos);

      if (resultado.estancia || resultado.mensaje === "Estancia creada") {
        mensajeEstancia.style.color = "#55735c";
        mensajeEstancia.textContent = "¡Estancia creada correctamente!";
        estanciaForm.reset();
        cargarEstancias();
        
        // Cerrar modal después de crear
        setTimeout(() => {
          cerrarModalNuevaEstancia();
        }, 1000);
      } else {
        mensajeEstancia.style.color = "#8a3d3d";
        mensajeEstancia.textContent = resultado.error || "No se pudo crear la estancia";
      }
    } catch (error) {
      console.error("Error al crear estancia:", error);
      mensajeEstancia.style.color = "#8a3d3d";
      mensajeEstancia.textContent = "Error de conexión con el servidor";
    }
  });
}

// 9. Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

// Carga inicial
cargarEstancias();