document.addEventListener("DOMContentLoaded", async () => {
  const usuario = obtenerUsuarioCuenta();

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  const userId = usuario.id || usuario.id_usuario;

  const displayNombre = document.getElementById("displayNombre");
  const displayEmail = document.getElementById("displayEmail");
  const userInitial = document.getElementById("userInitial");
  const numProyectos = document.getElementById("numProyectos");
  const numEstancias = document.getElementById("numEstancias");

  if (displayNombre) displayNombre.textContent = usuario.nombre || "Usuario";
  if (displayEmail) displayEmail.textContent = usuario.email || "";

  if (userInitial) {
    userInitial.textContent = (usuario.nombre || usuario.email || "U").charAt(0).toUpperCase();
  }

  const nombreUsuario = document.getElementById("nombreUsuario");
  const emailUsuario = document.getElementById("emailUsuario");

  if (nombreUsuario) nombreUsuario.value = usuario.nombre || "";
  if (emailUsuario) emailUsuario.value = usuario.email || "";

  try {
    if (window.api?.usuario?.obtenerStats && userId) {
      const stats = await window.api.usuario.obtenerStats(userId);

      if (stats) {
        if (numProyectos) numProyectos.textContent = stats.total_proyectos || 0;
        if (numEstancias) numEstancias.textContent = stats.total_estancias || 0;
      }
    }
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }

  const preferenciasGuardadas = localStorage.getItem("preferencias");

  if (preferenciasGuardadas) {
    try {
      const prefs = JSON.parse(preferenciasGuardadas);

      const temaOscuro = document.getElementById("temaOscuro");
      const idioma = document.getElementById("idioma");

      if (temaOscuro) temaOscuro.checked = prefs.temaOscuro || false;
      if (idioma) idioma.value = prefs.idioma || "es";

      if (prefs.temaOscuro) {
        document.body.classList.add("dark-mode");
      }
    } catch (error) {
      console.error("Error leyendo preferencias:", error);
    }
  }

  const formEditarPerfil = document.getElementById("formEditarPerfil");

  if (formEditarPerfil) {
    formEditarPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombreUsuario")?.value.trim() || "";
      const telefono = document.getElementById("telefonoUsuario")?.value.trim() || "";
      const direccion = document.getElementById("direccion")?.value.trim() || "";

      try {
        const response = await fetch(`/api/usuario/${userId}/perfil`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, telefono, direccion })
        });

        if (response.ok) {
          usuario.nombre = nombre;
          localStorage.setItem("usuario", JSON.stringify(usuario));

          if (displayNombre) displayNombre.textContent = nombre;
          if (userInitial) userInitial.textContent = nombre.charAt(0).toUpperCase();

          mostrarMensaje("mensajePerfil", "✅ Perfil actualizado correctamente", "success");
        } else {
          mostrarMensaje("mensajePerfil", "❌ Error al actualizar perfil", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarMensaje("mensajePerfil", "❌ Error de conexión", "error");
      }
    });
  }

  const passwordForm = document.getElementById("passwordForm");

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nuevaContrasena = document.getElementById("nuevaContrasena")?.value || "";

      try {
        const response = await fetch(`/api/usuario/${userId}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaContrasena })
        });

        if (response.ok) {
          passwordForm.reset();
          mostrarMensaje("mensajePassword", "✅ Contraseña actualizada correctamente", "success");
        } else {
          mostrarMensaje("mensajePassword", "❌ Error al actualizar contraseña", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarMensaje("mensajePassword", "❌ Error de conexión", "error");
      }
    });
  }

  window.guardarPreferencias = function () {
    const temaOscuro = document.getElementById("temaOscuro")?.checked || false;
    const idioma = document.getElementById("idioma")?.value || "es";

    const preferencias = { temaOscuro, idioma };
    localStorage.setItem("preferencias", JSON.stringify(preferencias));

    if (temaOscuro) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    mostrarMensaje("mensajePreferencias", "✅ Preferencias guardadas", "success");
  };

  window.abrirConfirmacionBorrar = function () {
    const modal = document.getElementById("modalConfirmacionBorrar");
    if (modal) modal.style.display = "flex";
  };

  window.cerrarConfirmacionBorrar = function () {
    const modal = document.getElementById("modalConfirmacionBorrar");
    const input = document.getElementById("inputConfirmacionEmail");

    if (modal) modal.style.display = "none";
    if (input) input.value = "";
  };

  window.confirmarBorrarCuenta = async function () {
    const emailConfirmacion = document.getElementById("inputConfirmacionEmail")?.value || "";

    if (emailConfirmacion !== usuario.email) {
      alert("❌ El email no coincide");
      return;
    }

    if (!confirm("⚠️ ÚLTIMA ADVERTENCIA: Esta acción es IRREVERSIBLE")) {
      return;
    }

    try {
      const response = await fetch(`/api/usuario/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        localStorage.removeItem("usuario");
        alert("✅ Cuenta borrada. Redirigiendo...");
        window.location.href = "index.html";
      } else {
        alert("❌ Error al borrar la cuenta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
  };

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
});

function obtenerUsuarioCuenta() {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);

    if (!usuario || typeof usuario !== "object") {
      return null;
    }

    if (!usuario.id && usuario.id_usuario) {
      usuario.id = usuario.id_usuario;
    }

    if (!usuario.id_usuario && usuario.id) {
      usuario.id_usuario = usuario.id;
    }

    if (!usuario.nombre && usuario.email) {
      usuario.nombre = usuario.email.split("@")[0];
    }

    localStorage.setItem("usuario", JSON.stringify(usuario));

    return usuario;
  } catch (error) {
    console.error("Error leyendo usuario:", error);
    localStorage.removeItem("usuario");
    return null;
  }
}

function mostrarMensaje(elementId, texto, tipo) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  elemento.textContent = texto;
  elemento.className = `mensaje ${tipo}`;

  if (tipo === "success") {
    setTimeout(() => {
      elemento.textContent = "";
    }, 4000);
  }
}