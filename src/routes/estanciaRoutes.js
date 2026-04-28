const express = require("express");
const router = express.Router();
const estanciaController = require("../controllers/estanciaController");

// Definición de rutas vinculadas al controlador
// POST /api/estancias/proyecto/7 -> Crea una estancia en el proyecto 7
router.post("/proyecto/:proyectoId", estanciaController.createEstancia);

// GET /api/estancias/proyecto/7 -> Obtiene las estancias del proyecto 7
router.get("/proyecto/:proyectoId", estanciaController.getEstancias);

// PUT y DELETE usan el ID directo de la estancia
router.put("/:id", estanciaController.updateEstancia);
router.delete("/:id", estanciaController.deleteEstancia);

module.exports = router;