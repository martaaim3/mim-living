// ====================================
// contactoRoutes.js
// Ubicación: src/routes/contactoRoutes.js
// ====================================

const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');

/**
 * RUTAS DE CONTACTO
 */

// POST: Enviar mensaje de contacto (PÚBLICO)
router.post('/', contactoController.enviarMensaje);

// GET: Obtener todos los mensajes (ADMIN)
router.get('/', contactoController.obtenerMensajes);

// GET: Obtener un mensaje específico (ADMIN)
router.get('/:id', contactoController.obtenerMensaje);

// PUT: Actualizar estado/respuesta del mensaje (ADMIN)
router.put('/:id', contactoController.actualizarEstado);

// DELETE: Eliminar mensaje (ADMIN)
router.delete('/:id', contactoController.eliminarMensaje);

module.exports = router;