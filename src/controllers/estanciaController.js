const pool = require("../models/db");

// Crear estancia
exports.createEstancia = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { nombre, ancho, largo, alto } = req.body;

    const resultado = await pool.query(
      `INSERT INTO estancia (id_proyecto, nombre, ancho, largo, alto)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [proyectoId, nombre, ancho, largo, alto]
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

// Obtener estancias de un proyecto
exports.getEstancias = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    const resultado = await pool.query(
      `SELECT * FROM estancia
       WHERE id_proyecto = $1
       ORDER BY id`,
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

// Actualizar estancia
exports.updateEstancia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ancho, largo, alto } = req.body;

    const resultado = await pool.query(
      `UPDATE estancia
       SET nombre=$1, ancho=$2, largo=$3, alto=$4
       WHERE id=$5
       RETURNING *`,
      [nombre, ancho, largo, alto, id]
    );

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

// Eliminar estancia
exports.deleteEstancia = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM estancia WHERE id=$1`,
      [id]
    );

    res.json({
      mensaje: "Estancia eliminada",
    });

  } catch (error) {
    res.status(500).json({
      error: "Error eliminando estancia",
      detalle: error.message,
    });
  }
};