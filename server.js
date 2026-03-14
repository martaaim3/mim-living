const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./src/models/db");
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const estanciaRoutes = require("./src/routes/estanciaRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
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

app.use("/api/auth", authRoutes);
app.use("/api/proyectos", projectRoutes);
app.use("/api", estanciaRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});