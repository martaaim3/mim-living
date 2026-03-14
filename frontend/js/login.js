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

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      mensaje.style.color = "#55735c";
      mensaje.textContent = "Inicio de sesión correcto";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 900);
    } catch (error) {
      mensaje.textContent = "Error de conexión con el servidor";
    }
  });
}