
const pool = require('../models/db');

function safeParseConfig(config) {
  if (!config) {
    return null;
  }

  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch (error) {
      return null;
    }
  }

  return config;
}

exports.crearDiseno = async (req, res) => {
  try {
    const { id_estancia, nombre, config_json } = req.body;

    if (!nombre || !config_json) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre y config_json'
      });
    }

    const query = `
      INSERT INTO diseno_3d (id_estancia, nombre, config_json, fecha_creacion, fecha_actualizacion)
      VALUES ($1, $2, $3::jsonb, NOW(), NOW())
      RETURNING id_diseno, id_estancia, nombre, fecha_creacion, fecha_actualizacion
    `;

    const values = [id_estancia || null, nombre, JSON.stringify(config_json)];
    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: 'Diseño guardado correctamente',
      id: result.rows[0].id_diseno,
      diseno: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en crearDiseno:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al guardar el diseño',
      error: error.message
    });
  }
};

exports.obtenerDiseno = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id_diseno, id_estancia, nombre, config_json, fecha_creacion, fecha_actualizacion
      FROM diseno_3d
      WHERE id_diseno = $1
    `;

    const result = await pool.query(query, [id]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }

    const diseno = result.rows[0];
    diseno.config_json = safeParseConfig(diseno.config_json);

    return res.json({
      success: true,
      diseno
    });
  } catch (error) {
    console.error('❌ Error en obtenerDiseno:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el diseño',
      error: error.message
    });
  }
};

exports.obtenerDisenosPorEstancia = async (req, res) => {
  try {
    const { id_estancia } = req.params;

    const query = `
      SELECT id_diseno, id_estancia, nombre, fecha_creacion, fecha_actualizacion
      FROM diseno_3d
      WHERE id_estancia = $1
      ORDER BY COALESCE(fecha_actualizacion, fecha_creacion) DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [id_estancia]);

    return res.json({
      success: true,
      total: result.rows.length,
      disenos: result.rows
    });
  } catch (error) {
    console.error('❌ Error en obtenerDisenosPorEstancia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los diseños',
      error: error.message
    });
  }
};

exports.actualizarDiseno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, config_json } = req.body;

    if (!nombre && !config_json) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar al menos nombre o config_json'
      });
    }

    const query = `
      UPDATE diseno_3d
      SET nombre = COALESCE($1, nombre),
          config_json = COALESCE($2::jsonb, config_json),
          fecha_actualizacion = NOW()
      WHERE id_diseno = $3
      RETURNING id_diseno, id_estancia, nombre, config_json, fecha_creacion, fecha_actualizacion
    `;

    const result = await pool.query(query, [
      nombre || null,
      config_json ? JSON.stringify(config_json) : null,
      id
    ]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }

    const diseno = result.rows[0];
    diseno.config_json = safeParseConfig(diseno.config_json);

    return res.json({
      success: true,
      message: 'Diseño actualizado',
      id: diseno.id_diseno,
      diseno
    });
  } catch (error) {
    console.error('❌ Error en actualizarDiseno:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el diseño',
      error: error.message
    });
  }
};

exports.eliminarDiseno = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM diseno_3d WHERE id_diseno = $1 RETURNING id_diseno',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Diseño no encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Diseño eliminado'
    });
  } catch (error) {
    console.error('❌ Error en eliminarDiseno:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el diseño',
      error: error.message
    });
  }
};
