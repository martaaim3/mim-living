
const express = require('express');
const router = express.Router();
const diseno3dController = require('../controllers/diseno3dController');

// Importante: la ruta específica debe ir antes que /:id
router.get('/estancia/:id_estancia', diseno3dController.obtenerDisenosPorEstancia);

router.post('/', diseno3dController.crearDiseno);
router.get('/:id', diseno3dController.obtenerDiseno);
router.put('/:id', diseno3dController.actualizarDiseno);
router.delete('/:id', diseno3dController.eliminarDiseno);

module.exports = router;
