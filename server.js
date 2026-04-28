const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./src/models/db");
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const estanciaRoutes = require("./src/routes/estanciaRoutes");
const propuestaIaRoutes = require("./src/routes/propuestaIaRoutes");
const presupuestoRoutes = require("./src/routes/presupuestoRoutes");

const contactoRoutes = require("./src/routes/contactoRoutes");
const diseno3dRoutes = require("./src/routes/diseno3dRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      mensaje: "Servidor y base de datos funcionando",
      fecha: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error conectando con la base de datos",
      detalle: error.message,
    });
  }
});

// ====== RUTAS  ======
app.use("/api/auth", authRoutes);
app.use("/api/proyectos", projectRoutes);
app.use("/api/ia", propuestaIaRoutes);
app.use("/api/estancias", estanciaRoutes);
app.use("/api/presupuesto", presupuestoRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/diseno3d", diseno3dRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
  console.log(`✅ Todas las rutas cargadas correctamente`);
});

// Simulación de base de datos de proveedores y productos
const catalogoProveedores = {
    "ikea": {
        "sofa": "https://www.ikea.com/es/es/cat/sofas-fu003/",
        "mesa": "https://www.ikea.com/es/es/cat/mesas-de-comedor-16242/",
        "lampara": "https://www.ikea.com/es/es/cat/iluminacion-li001/"
    },
    "maisons du monde": {
        "sofa": "https://www.maisonsdumonde.com/ES/es/c/sofas-n76657980",
        "mesa": "https://www.maisonsdumonde.com/ES/es/c/mesas-f7be62547b",
        "espejo": "https://www.maisonsdumonde.com/ES/es/c/espejos-n46471690"
    },
    "zara home": {
        "sofa": "https://www.zarahome.com/es/search.html?term=sofa",
        "mesa": "https://www.zarahome.com/es/search.html?term=mesa",
        "espejo": "https://www.zarahome.com/es/search.html?term=espejo",
        "silla": "https://www.zarahome.com/es/search.html?term=silla"
    },
    "kenay": {
        "sofa": "https://kenayhome.com/es/?gad_source=1&gad_campaignid=80729412&gbraid=0AAAAADwroXz5IYWOom03ObmTfqYMfsLml&gclid=CjwKCAjwhLPOBhBiEiwA8_wJHGQHKS7jTWSoZrE7cSIVihM3b-iQg3cVur19OYYknkT-sS8AtgZm9BoCGF0QAvD_BwE#15dd/fullscreen/m=and&q=sofa",
        "mesa": "https://kenayhome.com/es/?gad_source=1&gad_campaignid=80729412&gbraid=0AAAAADwroXz5IYWOom03ObmTfqYMfsLml&gclid=CjwKCAjwhLPOBhBiEiwA8_wJHGQHKS7jTWSoZrE7cSIVihM3b-iQg3cVur19OYYknkT-sS8AtgZm9BoCGF0QAvD_BwE#15dd/fullscreen/m=and&q=mesa",
        "espejo": "https://kenayhome.com/es/?gad_source=1&gad_campaignid=80729412&gbraid=0AAAAADwroXz5IYWOom03ObmTfqYMfsLml&gclid=CjwKCAjwhLPOBhBiEiwA8_wJHGQHKS7jTWSoZrE7cSIVihM3b-iQg3cVur19OYYknkT-sS8AtgZm9BoCGF0QAvD_BwE#15dd/fullscreen/m=and&q=espejo",
        "silla": "https://kenayhome.com/es/?gad_source=1&gad_campaignid=80729412&gbraid=0AAAAADwroXz5IYWOom03ObmTfqYMfsLml&gclid=CjwKCAjwhLPOBhBiEiwA8_wJHGQHKS7jTWSoZrE7cSIVihM3b-iQg3cVur19OYYknkT-sS8AtgZm9BoCGF0QAvD_BwE#15dd/fullscreen/m=and&q=silla",
        "jarron": "https://kenayhome.com/es/?gad_source=1&gad_campaignid=80729412&gbraid=0AAAAADwroXz5IYWOom03ObmTfqYMfsLml&gclid=CjwKCAjwhLPOBhBiEiwA8_wJHGQHKS7jTWSoZrE7cSIVihM3b-iQg3cVur19OYYknkT-sS8AtgZm9BoCGF0QAvD_BwE#15dd/fullscreen/m=and&q=jarron"
    },
    "sklum": {
      "decoracion":"https://www.sklum.com/es/results?q=decoracion",
      "lampara": "https://www.sklum.com/es/results?q=lampara",
      "terraza": "https://www.sklum.com/es/results?q=terraza",
      "silla": "https://www.sklum.com/es/results?q=silla",
      "mesa":"https://www.sklum.com/es/results?q=mesa"
    }
};

app.post('/api/buscar-productos', (req, res) => {
    const { marca, tipoArticulo } = req.body;
    const marcaLower = marca.toLowerCase();
    const tipoLower = tipoArticulo.toLowerCase();

    if (catalogoProveedores[marcaLower] && catalogoProveedores[marcaLower][tipoLower]) {
        res.json({ 
            success: true, 
            url: catalogoProveedores[marcaLower][tipoLower],
            mensaje: `Hemos encontrado ${tipoLower} similares en ${marca}.`
        });
    } else {
        res.json({ 
            success: false, 
            mensaje: "No tenemos ese proveedor o artículo registrado, pero aquí tienes una búsqueda general.",
            url: `https://www.google.com/search?q=${tipoLower}+estilo+${marcaLower}`
        });
    }
});

app.post('/api/proyectos/actualizar-presupuesto', (req, res) => {
    const { proyectoId, costeEstancia } = req.body;

    // Buscamos el proyecto en tu "base de datos"
    const proyecto = listaProyectos.find(p => p.id === proyectoId);

    if (proyecto) {
        // Opción A: Sumar al total existente
        proyecto.presupuesto_total = (proyecto.presupuesto_total || 0) + costeEstancia;
        
        res.json({ 
            success: true, 
            totalProyecto: proyecto.presupuesto_total 
        });
    } else {
        res.status(404).json({ success: false, message: "Proyecto no encontrado" });
    }
});