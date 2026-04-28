const grid = document.getElementById("inspirationGrid");
const botones = document.querySelectorAll(".tag-btn");
const botonPinterest = document.getElementById("btnPinterest");
const logoutBtn = document.getElementById("logoutBtn");

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

let filtros = [];

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

const imagenes = [
  // SALÓN
  { titulo: "Salón 1", img: "img/salon.png", tags: ["salon", "minimalista", "beige", "nordico"] },
  { titulo: "Salón 2", img: "img/salon2.png", tags: ["salon", "minimalista", "beige", "japandi"] },
  { titulo: "Salón 3", img: "img/salon3.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 4", img: "img/salon4.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 5", img: "img/salon5.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 6", img: "img/salon6.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 7", img: "img/salon7.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 8", img: "img/salon8.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 9", img: "img/salon9.png", tags: ["salon", "minimalista", "beige"] },
  { titulo: "Salón 10", img: "img/salon10.png", tags: ["salon", "minimalista", "beige"] },

  // COCINA
  { titulo: "Cocina 1", img: "img/cocina.png", tags: ["cocina", "minimalista", "beige", "japandi"] },
  { titulo: "Cocina 2", img: "img/cocina2.png", tags: ["cocina", "minimalista", "beige", "japandi"] },
  { titulo: "Cocina 3", img: "img/cocina3.png", tags: ["cocina", "minimalista", "beige", "japandi"] },
  { titulo: "Cocina 4", img: "img/cocina4.png", tags: ["cocina", "minimalista", "beige"] },
  { titulo: "Cocina 5", img: "img/cocina5.png", tags: ["cocina", "minimalista", "beige", "nordico"] },
  { titulo: "Cocina 6", img: "img/cocina6.png", tags: ["cocina", "minimalista", "beige"] },
  { titulo: "Cocina 7", img: "img/cocina7.png", tags: ["cocina", "minimalista", "beige"] },
  { titulo: "Cocina 8", img: "img/cocina8.png", tags: ["cocina", "minimalista", "beige", "nordico"] },
  { titulo: "Cocina 9", img: "img/cocina9.png", tags: ["cocina", "minimalista", "beige"] },
  { titulo: "Cocina 10", img: "img/cocina10.png", tags: ["cocina", "minimalista", "beige", "japandi"] },

  // DORMITORIO
  { titulo: "Dormitorio 1", img: "img/dormitorio1.png", tags: ["dormitorio", "minimalista", "beige", "japandi"] },
  { titulo: "Dormitorio 2", img: "img/dormitorio2.png", tags: ["dormitorio", "minimalista", "beige"] },

  // ASEO
  { titulo: "Aseo 1", img: "img/aseo1.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 2", img: "img/aseo2.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 3", img: "img/aseo3.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 5", img: "img/aseo5.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 6", img: "img/aseo6.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 7", img: "img/aseo7.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 8", img: "img/aseo8.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 9", img: "img/aseo9.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 10", img: "img/aseo10.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Aseo 11", img: "img/aseo11.png", tags: ["aseo", "minimalista", "beige"] },
  { titulo: "Lavabo", img: "img/lavabo.png", tags: ["aseo", "minimalista", "beige"] },

  // MINIMALISTA
  { titulo: "Minimalista 1", img: "img/minimalista1.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 2", img: "img/minimalista2.jpg", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 3", img: "img/minimalista3.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 4", img: "img/minimalista4.png", tags: ["minimalista", "beige", "japandi"] },
  { titulo: "Minimalista 5", img: "img/minimalista5.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 6", img: "img/minimalista6.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 7", img: "img/minimalista7.png", tags: ["minimalista", "beige", "japandi"] },
  { titulo: "Minimalista 8", img: "img/minimalista8.png", tags: ["minimalista", "beige", "nordico"] },
  { titulo: "Minimalista 9", img: "img/minimalista9.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 10", img: "img/minimalista10.png", tags: ["minimalista", "dormitorio", "beige"] },
  { titulo: "Minimalista 11", img: "img/minimalista11.png", tags: ["minimalista", "beige"] },
  { titulo: "Minimalista 12", img: "img/minimalista12.png", tags: ["minimalista", "beige"] },

  // NOGAL
  { titulo: "Nogal 1", img: "img/nogal.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 2", img: "img/nogal2.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 3", img: "img/nogal3.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 4", img: "img/nogal4.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 5", img: "img/nogal5.png", tags: ["nogal", "minimalista", "aseo", "beige"] },
  { titulo: "Nogal 6", img: "img/nogal6.png", tags: ["nogal", "minimalista", "cocina", "beige"] },
  { titulo: "Nogal 7", img: "img/nogal7.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 8", img: "img/nogal8.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 9", img: "img/nogal9.png", tags: ["nogal", "minimalista", "beige"] },
  { titulo: "Nogal 11", img: "img/nogal11.png", tags: ["nogal", "minimalista", "beige"] }
];

function render(lista) {
  if (!lista.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px">
        <h2>No hay resultados</h2>
        <p>Prueba a quitar algún filtro o revisa la clasificación de imágenes.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = lista.map((img) => `
    <article class="card inspiration-card">
      <img class="inspiration-img" src="${img.img}" alt="${img.titulo}" data-full="${img.img}">
      <div class="card-body">
        <h3>${img.titulo}</h3>
        <p>${img.tags.join(" · ")}</p>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".inspiration-img").forEach((img) => {
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.dataset.full;
      modalImg.alt = img.alt;
    });
  });
}

function actualizarPinterest() {
  let busqueda = "interiorismo minimalista beige";

  if (filtros.length > 0) {
    busqueda = filtros.join(" ");
  }

  botonPinterest.href = `https://es.pinterest.com/search/pins/?q=${encodeURIComponent(busqueda)}`;
}

function aplicarFiltros() {
  if (filtros.length === 0) {
    render(imagenes);
    actualizarPinterest();
    return;
  }

  const filtradas = imagenes.filter((img) =>
    filtros.every((tag) => img.tags.includes(tag))
  );

  render(filtradas);
  actualizarPinterest();
}

botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tag = btn.dataset.tag;

    btn.classList.toggle("active");

    if (filtros.includes(tag)) {
      filtros = filtros.filter((t) => t !== tag);
    } else {
      filtros.push(tag);
    }

    aplicarFiltros();
  });
});

if (closeModal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImg.src = "";
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalImg.src = "";
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

render(imagenes);
actualizarPinterest();
