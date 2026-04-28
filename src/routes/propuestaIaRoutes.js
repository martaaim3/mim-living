const express = require("express");
const router = express.Router();
const pool = require("../models/db");

const propuestaIaController = require("../controllers/propuestaIaController"); 

router.use("/",propuestaIaController);

module.exports = router;

// 1. Listar items por ID de Proyecto
router.get("/proyecto/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM presupuesto_items WHERE id_proyecto = $1 ORDER BY id DESC",
            [parseInt(req.params.id)]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Añadir nuevo item (Manejo de Llave Foránea Proyecto)
router.post("/anadir", async (req, res) => {
    const { id_proyecto, articulo, precio, url_referencia } = req.body;

    try {
        const query = `
            INSERT INTO presupuesto_items (id_proyecto, articulo, precio, url_referencia) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        
        const values = [
            parseInt(id_proyecto), 
            articulo, 
            parseFloat(precio), 
            url_referencia || null
        ];

        const result = await pool.query(query, values);
        res.json({ success: true, item: result.rows[0] });

    } catch (err) {
        console.error("Error DB:", err.message);
        // Error 23503 = Violación de llave foránea (el proyecto no existe)
        if (err.code === '23503') {
            return res.status(400).json({ success: false, error: "El ID de proyecto no existe." });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;