// js/presupuesto.js

// ELEMENTOS DOM
const listaPresupuestos = document.getElementById("listaPresupuestos");
const modalEditorPresupuesto = document.getElementById("modalEditorPresupuesto");
const btnCerrarModalPresupuesto = document.getElementById("btnCerrarModalPresupuesto");
const tbodyLineasPresupuesto = document.getElementById("tbodyLineasPresupuesto");
const selectEstanciaPresupuesto = document.getElementById("selectEstanciaPresupuesto");
const formNuevaLineaPresupuesto = document.getElementById("formNuevaLineaPresupuesto");
const logoutBtn = document.getElementById("logoutBtn");

// ESTADO GLOBAL
let presupuestoActivo = null;
let lineasPresupuesto = [];
let estancias = [];

// VERIFICACIÓN SESIÓN
function verificarSesion() {
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "index.html";
  }
}
verificarSesion();

// OBTENER USUARIO
function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    return null;
  }
}

// CARGAR PRESUPUESTOS (lista de proyectos con presupuestos)
async function cargarPresupuestos() {
  const usuario = obtenerUsuario();
  if (!usuario || !usuario.id) return;

  listaPresupuestos.innerHTML = `<p class="empty-state" style="grid-column: 1/-1;">Cargando presupuestos...</p>`;

  try {
    // Obtener proyectos del usuario
    const response = await fetch(`/api/proyectos?id_usuario=${usuario.id}`);
    const proyectos = await response.json();

    if (!proyectos || proyectos.length === 0) {
      listaPresupuestos.innerHTML = `<p class="empty-state" style="grid-column: 1/-1;">No tienes proyectos. <a href="project.html" style="color: #c8a98b;">Crear uno</a></p>`;
      return;
    }

    // Renderizar tarjetas de proyectos
    listaPresupuestos.innerHTML = proyectos.map(proyecto => {
      const id = proyecto.id_proyecto || proyecto.id;
      return `
        <div class="presupuesto-card" id="card-presupuesto-${id}">
          <h3>${proyecto.nombre}</h3>
          <p>${proyecto.descripcion || "Sin descripción"}</p>
          <button class="btn btn-primary btn-abrir-presupuesto" data-id="${id}" data-nombre="${proyecto.nombre}">
            Gestionar presupuesto
          </button>
        </div>
      `;
    }).join("");

    // Event listeners
    document.querySelectorAll(".btn-abrir-presupuesto").forEach(btn => {
      btn.addEventListener("click", () => {
        abrirEditorPresupuesto(btn.dataset.id, btn.dataset.nombre);
      });
    });

  } catch (error) {
    console.error("Error cargando presupuestos:", error);
    listaPresupuestos.innerHTML = `<p class="empty-state" style="grid-column: 1/-1;">Error al cargar presupuestos</p>`;
  }
}

// ABRIR EDITOR DE PRESUPUESTO
async function abrirEditorPresupuesto(idProyecto, nombreProyecto) {
  presupuestoActivo = { id_proyecto: idProyecto, nombre: nombreProyecto };
  
  document.getElementById("tituloPresupuestoModal").textContent = `Presupuesto - ${nombreProyecto}`;
  modalEditorPresupuesto.style.display = "flex";
  
  // Cargar líneas de presupuesto del proyecto
  await cargarLineasPresupuesto(idProyecto);
}



// CARGAR LÍNEAS DE PRESUPUESTO
async function cargarLineasPresupuesto(idProyecto) {
  try {
    const response = await fetch(`/api/presupuesto/proyecto/${idProyecto}`);
    lineasPresupuesto = await response.json();
    renderizarLineasPresupuesto();
    actualizarResumen();
  } catch (error) {
    console.error("Error cargando líneas:", error);
    tbodyLineasPresupuesto.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #7a726a;">Sin líneas de presupuesto</td></tr>`;
  }
}

// RENDERIZAR LÍNEAS EN TABLA
function renderizarLineasPresupuesto() {
  if (lineasPresupuesto.length === 0) {
    tbodyLineasPresupuesto.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #7a726a;">Sin líneas aún. Agrega una debajo.</td></tr>`;
    return;
  }

  tbodyLineasPresupuesto.innerHTML = lineasPresupuesto.map((linea, idx) => {
    const categoria = linea.categoria || "otro";
    return `
      <tr id="linea-${linea.id}">
        <td>${linea.articulo || linea.concepto}</td>
        <td><span class="categoria-badge categoria-${categoria}">${categoria}</span></td>
        <td>€${parseFloat(linea.precio).toFixed(2)}</td>
        <td>
          <button class="btn-eliminar-linea" data-id="${linea.id}" onclick="eliminarLinea(${linea.id})">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");
}

// AGREGAR NUEVA LÍNEA
if (formNuevaLineaPresupuesto) {
  formNuevaLineaPresupuesto.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!presupuestoActivo) return;

    const datos = {
      id_proyecto: presupuestoActivo.id_proyecto,
      articulo: document.getElementById("conceptoPresupuesto").value.trim(),
      categoria: document.getElementById("categoriaPresupuesto").value,
      precio: parseFloat(document.getElementById("precioPresupuesto").value)
    };

    try {
      const response = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      if (response.ok) {
        formNuevaLineaPresupuesto.reset();
        await cargarLineasPresupuesto(presupuestoActivo.id_proyecto);
      }
    } catch (error) {
      console.error("Error agregando línea:", error);
      alert("Error al agregar línea");
    }
  });
}

// ELIMINAR LÍNEA
async function eliminarLinea(idLinea) {
  if (!confirm("¿Eliminar esta línea del presupuesto?")) return;

  try {
    const response = await fetch(`/api/presupuesto/${idLinea}`, { method: "DELETE" });
    if (response.ok) {
      await cargarLineasPresupuesto(presupuestoActivo.id_proyecto);
    }
  } catch (error) {
    console.error("Error eliminando línea:", error);
  }
}

// ACTUALIZAR RESUMEN
function actualizarResumen() {
  const totalMuebles = lineasPresupuesto
    .filter(l => l.categoria === "muebles")
    .reduce((sum, l) => sum + parseFloat(l.precio), 0);

  const totalManoObra = lineasPresupuesto
    .filter(l => l.categoria === "mano_obra")
    .reduce((sum, l) => sum + parseFloat(l.precio), 0);

  const totalMateriales = lineasPresupuesto
    .filter(l => l.categoria === "materiales")
    .reduce((sum, l) => sum + parseFloat(l.precio), 0);

  const totalGeneral = totalMuebles + totalManoObra + totalMateriales;

  document.getElementById("totalMuebles").textContent = `€${totalMuebles.toFixed(2)}`;
  document.getElementById("totalManoObra").textContent = `€${totalManoObra.toFixed(2)}`;
  document.getElementById("totalMateriales").textContent = `€${totalMateriales.toFixed(2)}`;
  document.getElementById("totalPresupuesto").textContent = `€${totalGeneral.toFixed(2)}`;
}

// CERRAR MODAL
if (btnCerrarModalPresupuesto) {
  btnCerrarModalPresupuesto.addEventListener("click", () => {
    modalEditorPresupuesto.style.display = "none";
    presupuestoActivo = null;
    lineasPresupuesto = [];
  });
}

// Cerrar modal al hacer clic fuera
if (modalEditorPresupuesto) {
  modalEditorPresupuesto.addEventListener("click", (e) => {
    if (e.target === modalEditorPresupuesto) {
      modalEditorPresupuesto.style.display = "none";
      presupuestoActivo = null;
      lineasPresupuesto = [];
    }
  });
}

// EXPORTAR PDF (placeholder)
// EXPORTAR PDF
  document.getElementById("btnExportarPDF").onclick = () => {
    if (!presupuestoActivo || lineasPresupuesto.length === 0) {
      alert("No hay líneas para exportar");
      return;
    }

    const tablaHTML = document.querySelector(".presupuesto-tabla-container").innerHTML;
    const resumenHTML = document.querySelector(".presupuesto-resumen-modal").innerHTML;
    const titulo = document.getElementById("tituloPresupuestoModal").textContent;
    
    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>${titulo}</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${tablaHTML}
        </table>
        <h3 style="margin-top: 30px;">Resumen Detallado</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          ${resumenHTML}
        </div>
      </div>
    `;

    html2pdf().set({
      margin: 15,
      filename: `Presupuesto_${presupuestoActivo.nombre}.pdf`,
      html2canvas: { scale: 2, backgroundColor: "#ffffff" },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(html).save();
  };

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

// CARGA INICIAL
cargarPresupuestos();