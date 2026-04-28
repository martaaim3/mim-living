document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const idProyecto = params.get("proyectoId") || "3";
    const cuerpo = document.getElementById("cuerpoPresupuesto");
    const totalTxt = document.getElementById("totalPresupuesto");

    function mostrarMensaje(texto) {
        const container = document.getElementById("notification-container");
        if (!container) return; 
        const toast = document.createElement("div");
        toast.className = "custom-toast";
        toast.innerText = texto;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.5s ease";
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }


async function cargarTabla() {
    try {
        const items = await window.api.presupuesto.listar(idProyecto);
        let total = 0;
        
        cuerpo.innerHTML = items.map(i => {
            const precioNum = parseFloat(i.precio) || 0;
            total += precioNum;
            
            // Verificamos si existe una URL válida para este artículo
            const tieneUrl = i.url && i.url !== "null" && i.url.trim() !== "";
            
            // Si hay URL, creamos el enlace. Si no, texto plano.
            const nombreCelda = tieneUrl 
                ? `<a href="${i.url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold;">${i.articulo}</a>`
                : i.articulo;

            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 10px;">${nombreCelda}</td>
                    <td style="text-align:right; padding: 12px 10px;">${precioNum.toFixed(2)}€</td>
                </tr>`;
        }).join("");
        
        totalTxt.textContent = `${total.toFixed(2)}€`;
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

// Evento para añadir al presupuesto
document.getElementById("btnAnadirPresupuesto")?.addEventListener("click", async () => {
    const articulo = document.getElementById("nombreElemento").value;
    const precio = document.getElementById("precioElemento").value;
    const url = document.getElementById("urlElemento").value; // Capturamos la URL del input
    
    if(articulo && precio) {
        try {
            await window.api.presupuesto.anadir({ 
                id_proyecto: idProyecto, 
                articulo: articulo, 
                precio: precio,
                url: url // Enviamos la URL a la API
            });
            
            mostrarMensaje("✅ Producto añadido con enlace");
            cargarTabla(); // Refrescamos la lista
            
            // Limpiar campos
            document.getElementById("nombreElemento").value = "";
            document.getElementById("precioElemento").value = "";
            document.getElementById("urlElemento").value = "";
        } catch (err) {
            mostrarMensaje("❌ Error al guardar");
        }
    } else {
        mostrarMensaje("⚠️ Por favor, introduce nombre y precio");
    }
});

    // --- 3. GENERAR PDF ---
    document.getElementById("btnGenerarPDF")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const elemento = document.getElementById("contenedorExportar");
        mostrarMensaje("📄 Generando PDF...");
        html2pdf().set({
            margin: 10,
            filename: 'Presupuesto_MIM_Living.pdf',
            html2canvas: { scale: 3, backgroundColor: "#ffffff" },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(elemento).save();
    });

    // --- 4. BUSCADOR ---
    document.getElementById("btnBuscarSimilaresManual")?.addEventListener("click", async () => {
        const marca = document.getElementById("marcaProducto").value;
        const mueble = document.getElementById("tipoArticulo").value;
        if (marca && mueble) {
            mostrarMensaje("🔍 Buscando en " + marca + "...");
            const response = await fetch('/api/buscar-productos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ marca, tipoArticulo: mueble })
            });
            const data = await response.json();
            if(data.url) window.open(data.url, '_blank');
        } else {
            mostrarMensaje("⚠️ Indica marca y mueble");
        }
    });

    cargarTabla();
});