const express = require("express");
const router = express.Router();
const estanciaController = require("../controllers/estanciaController");

// Crear estancia dentro de un proyecto
router.post("/proyectos/:proyectoId/estancias", estanciaController.createEstancia);

// Obtener estancias de un proyecto
router.get("/proyectos/:proyectoId/estancias", estanciaController.getEstancias);

// Actualizar una estancia
router.put("/estancias/:id", estanciaController.updateEstancia);

// Eliminar una estancia
router.delete("/estancias/:id", estanciaController.deleteEstancia);

module.exports = router;