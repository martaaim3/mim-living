const btn = document.getElementById("generarPropuestaBtn");
const mensaje = document.getElementById("mensajeIa");
const resultado = document.getElementById("resultadoIa");
const loader = document.getElementById("iaLoader");
const btnText = document.getElementById("btnTextIa");

const inputEstancia = document.getElementById("fotoEstanciaIa");
const inputMueble = document.getElementById("fotoMuebleIa");

const previewEstancia = document.getElementById("previsualEstancia");
const previewMueble = document.getElementById("previsualMueble");

const phEstancia = document.getElementById("phEstancia");
const phMueble = document.getElementById("phMueble");

const btnGoogleLens = document.getElementById("btnGoogleLens");
const btnBingVisual = document.getElementById("btnBingVisual");
const btnSimilares = document.getElementById("btnSimilares");
const btnProveedores = document.getElementById("btnProveedores");
const mensajeProducto = document.getElementById("mensajeProducto");
const resultadosProducto = document.getElementById("resultadosProducto");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageModal = document.getElementById("closeImageModal");
const downloadImageBtn = document.getElementById("downloadImageBtn");

let currentGeneratedImageUrl = "";

const params = new URLSearchParams(window.location.search);
const idEstancia = params.get("estanciaId") || params.get("estanciaid");
const nombreEstancia = params.get("nombre");

function verificarSesion() {
  const usuario = localStorage.getItem("usuario") || localStorage.getItem("usuarioActivo");

  if (!usuario && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html";
  }
}

verificarSesion();

if (nombreEstancia) {
  const titulo = document.getElementById("tituloEstancia");
  if (titulo) {
    titulo.textContent = decodeURIComponent(nombreEstancia);
  }
}

function setMensaje(texto, color = "#8a3d3d") {
  if (!mensaje) return;
  mensaje.innerText = texto;
  mensaje.style.color = color;
}

function setMensajeProducto(texto, color = "#8a3d3d") {
  if (!mensajeProducto) return;
  mensajeProducto.textContent = texto;
  mensajeProducto.style.color = color;
}

function limpiarMensajeProducto() {
  if (!mensajeProducto) return;
  mensajeProducto.textContent = "";
}

function hayImagenMuebleSubida() {
  return !!(inputMueble && inputMueble.files && inputMueble.files[0]);
}

function obtenerTextoBusqueda() {
  if (!hayImagenMuebleSubida()) return "mueble decoracion";

  const nombreArchivo = inputMueble.files[0].name || "mueble decoracion";

  return nombreArchivo
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .trim();
}

function renderResultadosSimilares() {
  if (!resultadosProducto) return;

  const busqueda = obtenerTextoBusqueda();

  resultadosProducto.innerHTML = `
    <article class="project-item">
      <h3>Google Shopping</h3>
      <p>Busca artículos parecidos usando el nombre del archivo como referencia.</p>
      <div class="project-actions">
        <a
          href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(busqueda)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Buscar en Shopping
        </a>
      </div>
    </article>

    <article class="project-item">
      <h3>Google Imágenes</h3>
      <p>Útil para localizar modelos parecidos, marcas o referencias visuales.</p>
      <div class="project-actions">
        <a
          href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(busqueda + " mueble decoracion")}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Buscar imágenes
        </a>
      </div>
    </article>

    <article class="project-item">
      <h3>Bing Visual Search</h3>
      <p>Abre el buscador visual para subir la misma imagen y localizar productos parecidos.</p>
      <div class="project-actions">
        <a
          href="https://www.bing.com/visualsearch"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Abrir Bing Visual
        </a>
      </div>
    </article>
  `;

  setMensajeProducto("Se han preparado búsquedas útiles para encontrar artículos similares.", "#55735c");
}

function renderResultadosProveedores() {
  if (!resultadosProducto) return;

  const busqueda = obtenerTextoBusqueda();

  resultadosProducto.innerHTML = `
    <article class="project-item">
      <h3>Tiendas generales</h3>
      <p>Búsqueda abierta para encontrar proveedores que vendan este producto o uno parecido.</p>
      <div class="project-actions">
        <a
          href="https://www.google.com/search?q=${encodeURIComponent(busqueda + " comprar")}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Buscar tiendas
        </a>
      </div>
    </article>

    <article class="project-item">
      <h3>Decoración e interiorismo</h3>
      <p>Consulta orientada a tiendas de mobiliario y decoración.</p>
      <div class="project-actions">
        <a
          href="https://www.google.com/search?q=${encodeURIComponent(busqueda + " tienda decoracion")}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Ver proveedores
        </a>
      </div>
    </article>

    <article class="project-item">
      <h3>Comparar opciones</h3>
      <p>Abre una búsqueda más amplia para comparar marcas, acabados o modelos.</p>
      <div class="project-actions">
        <a
          href="https://www.google.com/search?q=${encodeURIComponent(busqueda + " proveedor mobiliario")}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary btn-small"
        >
          Explorar
        </a>
      </div>
    </article>
  `;

  setMensajeProducto("Se han generado enlaces para consultar proveedores.", "#55735c");
}

if (inputEstancia) {
  inputEstancia.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
      const url = URL.createObjectURL(file);

      if (previewEstancia) {
        previewEstancia.src = url;
        previewEstancia.style.display = "block";
      }

      if (phEstancia) {
        phEstancia.style.display = "none";
      }
    }
  });
}

if (inputMueble) {
  inputMueble.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
      const url = URL.createObjectURL(file);

      if (previewMueble) {
        previewMueble.src = url;
        previewMueble.style.display = "block";
      }

      if (phMueble) {
        phMueble.style.display = "none";
      }

      limpiarMensajeProducto();

      if (resultadosProducto) {
        resultadosProducto.innerHTML = `
          <p class="empty-state">
            Ya has subido un producto. Ahora puedes abrir Google Lens, Bing Visual Search o consultar enlaces de búsqueda y proveedores.
          </p>
        `;
      }
    }
  });
}

function openImageModal(imageUrl) {
  if (!imageModal || !modalImage || !downloadImageBtn) return;

  currentGeneratedImageUrl = imageUrl;
  modalImage.src = imageUrl;
  downloadImageBtn.href = imageUrl;
  imageModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!imageModal || !modalImage) return;

  imageModal.classList.remove("active");
  modalImage.src = "";
  document.body.style.overflow = "";
}

if (closeImageModal) {
  closeImageModal.addEventListener("click", closeModal);
}

if (imageModal) {
  imageModal.addEventListener("click", function (e) {
    if (e.target === imageModal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && imageModal && imageModal.classList.contains("active")) {
    closeModal();
  }
});

if (btnGoogleLens) {
  btnGoogleLens.addEventListener("click", () => {
    window.open("https://lens.google.com/", "_blank", "noopener,noreferrer");
  });
}

if (btnBingVisual) {
  btnBingVisual.addEventListener("click", () => {
    window.open("https://www.bing.com/visualsearch", "_blank", "noopener,noreferrer");
  });
}

if (btnSimilares) {
  btnSimilares.addEventListener("click", renderResultadosSimilares);
}

if (btnProveedores) {
  btnProveedores.addEventListener("click", renderResultadosProveedores);
}

function construirPromptFinal({ tipoAccion, estilo, prompt }) {
  const accionTexto = {
    mueble: "integrar o sustituir un mueble usando la segunda imagen como referencia visual",
    remodelar: "remodelar la estancia respetando la estructura principal",
    estilo: "cambiar el estilo visual de la estancia"
  };

  return `
La imagen 1 es la estancia actual.
La imagen 2 es el mueble, objeto, acabado o referencia que debe usarse.

Objetivo:
${accionTexto[tipoAccion] || accionTexto.mueble}

Reglas obligatorias:
- Edita la imagen 1, no generes una habitación nueva.
- Usa la imagen 2 como referencia del objeto/material/estilo.
- Sustituye o integra únicamente lo que el usuario pida.
- Mantén la perspectiva, iluminación, proporciones, suelo, paredes y techo de la imagen 1.
- No cambies elementos no solicitados.
- El resultado debe ser fotorrealista.
- Integra el objeto con escala, sombras y posición natural.

Estilo solicitado:
${estilo || "mantener estilo realista y coherente con la estancia"}

Instrucciones exactas del usuario:
${prompt}
`.trim();
}

function renderResultadoImagen(imageUrl) {
  currentGeneratedImageUrl = imageUrl;

  resultado.innerHTML = `
    <div class="resultado-image-wrapper">
      <img
        id="generatedResultImage"
        src="${imageUrl}"
        alt="Resultado IA"
        class="resultado-image-clickable"
      />
      <button id="zoomImageBtn" class="zoom-image-btn" type="button" title="Ampliar imagen">🔍</button>
      <a
        id="inlineDownloadBtn"
        class="inline-download-btn"
        href="${imageUrl}"
        download="propuesta-ia.jpg"
        title="Descargar imagen"
      >
        Descargar
      </a>
    </div>
  `;

  const generatedResultImage = document.getElementById("generatedResultImage");
  const zoomImageBtn = document.getElementById("zoomImageBtn");

  if (generatedResultImage) {
    generatedResultImage.addEventListener("click", function () {
      openImageModal(currentGeneratedImageUrl);
    });
  }

  if (zoomImageBtn) {
    zoomImageBtn.addEventListener("click", function () {
      openImageModal(currentGeneratedImageUrl);
    });
  }
}

if (btn) {
  btn.addEventListener("click", async () => {
    const estanciaFile = inputEstancia?.files?.[0];
    const muebleFile = inputMueble?.files?.[0];

    const prompt = document.getElementById("promptIa")?.value.trim() || "";
    const tipoAccion = document.getElementById("tipoAccionIa")?.value || "mueble";
    const estilo = document.getElementById("estiloIa")?.value.trim() || "";

    if (!idEstancia) {
      setMensaje("❌ No se ha encontrado el id de la estancia en la URL");
      return;
    }

    if (!estanciaFile) {
      setMensaje("⚠️ Debes subir la imagen de la estancia actual");
      return;
    }

    if (!muebleFile) {
      setMensaje("⚠️ Debes subir la imagen del mueble u objeto de referencia");
      return;
    }

    if (!prompt) {
      setMensaje("⚠️ Escribe qué quieres sustituir o integrar en la estancia");
      return;
    }

    try {
      setMensaje("");
      if (loader) loader.style.display = "block";
      if (btnText) btnText.innerText = "Generando...";
      if (btn) btn.disabled = true;

      const promptFinal = construirPromptFinal({
        tipoAccion,
        estilo,
        prompt
      });

      const formData = new FormData();
      formData.append("estancia", estanciaFile);
      formData.append("mueble", muebleFile);
      formData.append("prompt", promptFinal);
      formData.append("prompt_usuario", prompt);
      formData.append("tipo_accion", tipoAccion);
      formData.append("estilo", estilo);
      formData.append("id_estancia", idEstancia);

      const response = await fetch("/api/ia/generar", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error generando la propuesta con IA");
      }

      const imageUrl =
        data.imageUrl ||
        data.imagen ||
        data.image ||
        data.url ||
        data.output;

      if (!imageUrl) {
        console.error("Respuesta IA sin imagen:", data);
        throw new Error("La IA respondió correctamente, pero no devolvió una imagen");
      }

      renderResultadoImagen(Array.isArray(imageUrl) ? imageUrl[0] : imageUrl);

      setMensaje("✅ Diseño generado correctamente", "#55735c");
    } catch (error) {
      console.error("ERROR FRONT:", error);
      setMensaje("❌ " + error.message);
    } finally {
      if (loader) loader.style.display = "none";
      if (btnText) btnText.innerText = "Generar Propuesta";
      if (btn) btn.disabled = false;
    }
  });
}