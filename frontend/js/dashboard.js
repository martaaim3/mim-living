// Obtener elementos
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

// ----------------------------
// Cargar usuario desde localStorage
// ----------------------------

function obtenerUsuario() {

  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    console.error("Error leyendo usuario desde localStorage:", error);
    return null;
  }

}

const usuario = obtenerUsuario();

// ----------------------------
// Mostrar nombre del usuario
// ----------------------------

if (usuario && welcomeText) {

  if (usuario.nombre) {

    welcomeText.textContent =
      `Bienvenida, ${usuario.nombre}. Aquí podrás gestionar tus proyectos y diseñar las estancias de cada uno.`;

  }

}

// ----------------------------
// Cerrar sesión
// ----------------------------

if (logoutBtn) {

  logoutBtn.addEventListener("click", function (e) {

    e.preventDefault();

    // borrar usuario guardado
    localStorage.removeItem("usuario");

    // redirigir a inicio
    window.location.href = "index.html";

  });

}

// ----------------------------
// Protección básica de sesión
// ----------------------------

if (!usuario) {

  console.warn("No hay sesión iniciada.");

  // opcional: redirigir al login
  // window.location.href = "login.html";

}
