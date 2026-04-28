const pool = require("../models/db");

// Crear estancia asociada a un proyecto específico
exports.createEstancia = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { nombre, ancho, largo, alto } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: "El nombre de la estancia es obligatorio"
      });
    }

    // Manejo de valores vacíos para que PostgreSQL los acepte como NULL
    const anchoValue = ancho === "" || ancho === undefined ? null : ancho;
    const largoValue = largo === "" || largo === undefined ? null : largo;
    const altoValue = alto === "" || alto === undefined ? null : alto;

    const resultado = await pool.query(
      `INSERT INTO estancia (id_proyecto, nombre, ancho, largo, alto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [proyectoId, nombre, anchoValue, largoValue, altoValue]
    );

    res.status(201).json({
      mensaje: "Estancia creada",
      estancia: resultado.rows[0],
    });

  } catch (error) {
    res.status(500).json({
      error: "Error creando estancia",
      detalle: error.message,
    });
  }
};

// Obtener todas las estancias de un proyecto
exports.getEstancias = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    const resultado = await pool.query(
      `SELECT * FROM estancia
       WHERE id_proyecto = $1
       ORDER BY id_estancia ASC`,
      [proyectoId]
    );

    res.json(resultado.rows);

  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo estancias",
      detalle: error.message,
    });
  }
};

// Actualizar datos de una estancia existente
exports.updateEstancia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ancho, largo, alto } = req.body;

    const anchoValue = ancho === "" || ancho === undefined ? null : ancho;
    const largoValue = largo === "" || largo === undefined ? null : largo;
    const altoValue = alto === "" || alto === undefined ? null : alto;

    const resultado = await pool.query(
      `UPDATE estancia
       SET nombre = $1, ancho = $2, largo = $3, alto = $4
       WHERE id_estancia = $5
       RETURNING *`,
      [nombre, anchoValue, largoValue, altoValue, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Estancia no encontrada" });
    }

    res.json({
      mensaje: "Estancia actualizada",
      estancia: resultado.rows[0],
    });

  } catch (error) {
    res.status(500).json({
      error: "Error actualizando estancia",
      detalle: error.message,
    });
  }
};

// Eliminar una estancia
exports.deleteEstancia = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM estancia WHERE id_estancia = $1 RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Estancia no encontrada" });
    }

    res.json({ mensaje: "Estancia eliminada" });

  } catch (error) {
    res.status(500).json({
      error: "Error eliminando estancia",
      detalle: error.message,
    });
  }
};