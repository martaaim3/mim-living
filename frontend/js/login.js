const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    mensaje.textContent = "";
    mensaje.style.color = "#8a3d3d";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, contrasena })
      });

      const data = await response.json();

      if (!response.ok) {
        mensaje.textContent = data.error || "No se pudo iniciar sesión";
        return;
      }

      const usuario = data.usuario || data.user || data;

      if (!usuario.id && usuario.id_usuario) {
        usuario.id = usuario.id_usuario;
      }

      if (!usuario.id_usuario && usuario.id) {
        usuario.id_usuario = usuario.id;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));

      mensaje.style.color = "#55735c";
      mensaje.textContent = "Inicio de sesión correcto";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

    } catch (error) {
      console.error("Error iniciando sesión:", error);
      mensaje.textContent = "Error de conexión con el servidor";
    }
  });
}