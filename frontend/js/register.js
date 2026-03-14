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

      mensajeRegistro.style.color = "#55735c";
      mensajeRegistro.textContent = "Usuario registrado correctamente";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      mensajeRegistro.textContent = "Error de conexión con el servidor";
    }
  });
}