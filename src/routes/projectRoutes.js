const express= require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;

const pool = require ("../models/db");

exports.createProject = async (req, res) => {
    try{
        const {id_usuario, nombre, descripcion} = req.body;

        const result = await pool.query(
            `INSERT INTO proyecto (id_usuario, nombre, descripcion)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [id_usuario, nombre, descripcion]
        );

        res.status(201).json({
            mensaje:"Proyecto creado",
            proyecto: result.rows[0]
        });

    } catch (error){
        res.status (500).json({
            error: "Error creando proyecto",
            detalle: error.message
        });
    }
};