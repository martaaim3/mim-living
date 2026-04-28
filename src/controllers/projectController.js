const pool = require("../models/db");

// Crear proyecto
exports.createProject = async (req, res) => {
  try {
    const { id_usuario, nombre, descripcion } = req.body;

    // Validar campos obligatorios
    if (!id_usuario || !nombre) {
      return res.status(400).json({
        error: "El id del usuario y el nombre del proyecto son obligatorios"
      });
    }

    const result = await pool.query(
      `INSERT INTO proyecto (id_usuario, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_usuario, nombre, descripcion]
    );

    res.status(201).json({
      mensaje: "Proyecto creado correctamente",
      proyecto: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al crear el proyecto",
      detalle: error.message
    });
  }
};

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const { id_usuario } = req.query; 

    if (!id_usuario) {
      return res.status(400).json({ error: "Falta el ID de usuario" });
    }

    const result = await pool.query(
      "SELECT * FROM proyecto WHERE id_usuario = $1 ORDER BY fecha_creacion DESC",
      [id_usuario]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener los proyectos",
      detalle: error.message
    });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const result = await pool.query(
      `UPDATE proyecto
       SET nombre = $1, descripcion = $2
       WHERE id_proyecto = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Proyecto no encontrado"
      });
    }

    res.json({
      mensaje: "Proyecto actualizado correctamente",
      proyecto: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el proyecto",
      detalle: error.message
    });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM proyecto WHERE id_proyecto = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Proyecto no encontrado"
      });
    }

    res.json({
      mensaje: "Proyecto eliminado correctamente"
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar el proyecto",
      detalle: error.message
    });
  }
};