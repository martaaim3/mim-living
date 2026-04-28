const registroForm = document.getElementById("registroForm");
const mensajeRegistro = document.getElementById("mensajeRegistro");

if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    mensajeRegistro.textContent = "";
    mensajeRegistro.style.color = "#8a3d3d";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, contrasena })
      });

      const data = await response.json();

      if (!response.ok) {
        mensajeRegistro.textContent = data.error || "No se pudo registrar el usuario";
        return;
      }

      const usuario = data.usuario || data.user || {
        id: data.id || data.id_usuario,
        id_usuario: data.id_usuario || data.id,
        nombre,
        email
      };

      if (!usuario.id && usuario.id_usuario) {
        usuario.id = usuario.id_usuario;
      }

      if (!usuario.id_usuario && usuario.id) {
        usuario.id_usuario = usuario.id;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));

      mensajeRegistro.style.color = "#55735c";
      mensajeRegistro.textContent = "Cuenta creada. Iniciando sesión...";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

    } catch (error) {
      console.error("Error registrando usuario:", error);
      mensajeRegistro.textContent = "Error de conexión con el servidor";
    }
  });
}