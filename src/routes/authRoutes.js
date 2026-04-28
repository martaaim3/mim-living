const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

// NUEVA RUTA PARA LAS ESTADÍSTICAS
router.get("/stats/:id", authController.getUserStats);

module.exports = router;