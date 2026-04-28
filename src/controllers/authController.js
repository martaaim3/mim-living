const pool = require("../models/db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const userExists = await pool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        error: "El usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, contrasena)
       VALUES ($1, $2, $3)
       RETURNING id_usuario, nombre, email, fecha_creacion`,
      [nombre, email, hashedPassword]
    );

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al registrar el usuario",
      detalle: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({
        error: "Email y contraseña obligatorios"
      });
    }

    const result = await pool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Usuario no encontrado"
      });
    }

    const usuario = result.rows[0];

    const passwordValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!passwordValida) {
      return res.status(401).json({
        error: "Contraseña incorrecta"
      });
    }

    return res.json({
      mensaje: "Login correcto",
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error en login",
      detalle: error.message
    });
  }
};

// --- NUEVA FUNCIÓN PARA ESTADÍSTICAS DE MI CUENTA ---
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Esta consulta cuenta proyectos del usuario y estancias asociadas a esos proyectos
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM proyecto WHERE id_usuario = $1) AS total_proyectos,
        (SELECT COUNT(*) FROM estancia e 
         JOIN proyecto p ON e.id_proyecto = p.id_proyecto 
         WHERE p.id_usuario = $1) AS total_estancias
    `;

    const result = await pool.query(query, [id]);

    return res.json({
      total_proyectos: parseInt(result.rows[0].total_proyectos),
      total_estancias: parseInt(result.rows[0].total_estancias)
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener estadísticas",
      detalle: error.message
    });
  }
};