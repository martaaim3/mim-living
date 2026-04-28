const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// GET: Obtener items por ID de Proyecto
router.get("/proyecto/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM presupuesto_items 
             WHERE id_proyecto = $1 
             ORDER BY categoria, id DESC`,
            [parseInt(req.params.id)]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Añadir item
router.post("/", async (req, res) => {
    const { id_proyecto, articulo, categoria, precio } = req.body;

    try {
        const idProyectoNum = parseInt(id_proyecto);
        const precioNum = parseFloat(precio);

        const query = `
            INSERT INTO presupuesto_items (id_proyecto, articulo, categoria, precio) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        
        const values = [idProyectoNum, articulo, categoria, precioNum];
        const result = await pool.query(query, values);
        
        res.json({ success: true, item: result.rows[0] });

    } catch (err) {
        console.error("Error al insertar:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT: Actualizar item
router.put("/:id", async (req, res) => {
    const { concepto, categoria, precio } = req.body;

    try {
        const result = await pool.query(
            `UPDATE presupuesto_items 
             SET articulo = $1, categoria = $2, precio = $3
             WHERE id = $4
             RETURNING *`,
            [concepto, categoria, parseFloat(precio), parseInt(req.params.id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Item no encontrado" });
        }

        res.json({ success: true, item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Eliminar item
router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM presupuesto_items WHERE id = $1 RETURNING id",
            [parseInt(req.params.id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Item no encontrado" });
        }

        res.json({ success: true, mensaje: "Item eliminado" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// LEGACY: Endpoint antiguo para compatibilidad
router.post("/anadir", async (req, res) => {
    const { id_proyecto, articulo, precio, url_referencia } = req.body;

    try {
        const idNum = parseInt(id_proyecto);
        const precioNum = parseFloat(precio);

        const query = `
            INSERT INTO presupuesto_items (id_proyecto, articulo, precio, url_referencia) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        
        const values = [idNum, articulo, precioNum, url_referencia || null];
        const result = await pool.query(query, values);
        
        res.json({ success: true, item: result.rows[0] });

    } catch (err) {
        console.error("Error al insertar:", err.message);
        if (err.code === '23503') {
            return res.status(400).json({ 
                success: false, 
                error: `El ID de proyecto ${id_proyecto} no existe en la tabla maestra.` 
            });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;