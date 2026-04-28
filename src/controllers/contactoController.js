

const pool = require('../models/db');
const nodemailer = require('nodemailer');

exports.enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje, fecha } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Guardar en base de datos
    const query = `
      INSERT INTO contacto (nombre, email, telefono, asunto, mensaje, estado, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_contacto, estado
    `;

    const values = [
      nombre,
      email,
      telefono || null,
      asunto,
      mensaje,
      'pendiente', // Estado inicial
      new Date()
    ];

    const result = await pool.query(query, values);
    const contactoId = result.rows[0].id_contacto;

    console.log(`📧 Mensaje de contacto recibido: ${contactoId}`);

    // Opción: Enviar email de confirmación al usuario
    await enviarEmailConfirmacion(nombre, email, asunto);

    // Opción: Enviar email de notificación al admin
    await enviarEmailAdmin(nombre, email, telefono, asunto, mensaje);

    res.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      id: contactoId
    });

  } catch (error) {
    console.error('Error en enviarMensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};


exports.obtenerMensajes = async (req, res) => {
  try {
    const query = `
      SELECT id_contacto, nombre, email, telefono, asunto, estado, fecha_creacion
      FROM contacto
      ORDER BY fecha_creacion DESC
      LIMIT 50
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total: result.rows.length,
      mensajes: result.rows
    });

  } catch (error) {
    console.error('Error en obtenerMensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
};

/**
 * Obtener un mensaje específico (ADMIN)
 * GET /api/contacto/:id
 */
exports.obtenerMensaje = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM contacto
      WHERE id_contacto = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    res.json({
      success: true,
      mensaje: result.rows[0]
    });

  } catch (error) {
    console.error('Error en obtenerMensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensaje'
    });
  }
};

/**
 * Actualizar estado del mensaje (ADMIN)
 * PUT /api/contacto/:id
 */
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!['pendiente', 'respondido', 'cerrado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const query = `
      UPDATE contacto
      SET estado = $1, respuesta = $2, fecha_respuesta = NOW()
      WHERE id_contacto = $3
      RETURNING *
    `;

    const values = [estado, respuesta || null, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    console.log(`📧 Mensaje ${id} actualizado a estado: ${estado}`);

    // Si hay respuesta, enviar email
    if (respuesta) {
      const contacto = result.rows[0];
      await enviarRespuesta(contacto.email, contacto.nombre, respuesta);
    }

    res.json({
      success: true,
      message: 'Estado actualizado',
      mensaje: result.rows[0]
    });

  } catch (error) {
    console.error('Error en actualizarEstado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado'
    });
  }
};

/**
 * Eliminar mensaje (ADMIN)
 * DELETE /api/contacto/:id
 */
exports.eliminarMensaje = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM contacto WHERE id_contacto = $1 RETURNING id_contacto';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    console.log(`🗑️ Mensaje ${id} eliminado`);

    res.json({
      success: true,
      message: 'Mensaje eliminado'
    });

  } catch (error) {
    console.error('Error en eliminarMensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mensaje'
    });
  }
};

// ====================================
// FUNCIONES DE EMAIL
// ====================================

/**
 * Enviar email de confirmación al usuario
 */
async function enviarEmailConfirmacion(nombre, email, asunto) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `✅ Hemos recibido tu mensaje - ${asunto}`,
      html: `
        <h2>Hola ${nombre},</h2>
        <p>Gracias por contactarnos. Hemos recibido tu mensaje correctamente.</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p>Te responderemos lo antes posible.</p>
        <br>
        <p>Saludos,<br>El equipo de MIM Living</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmación enviado a ${email}`);

  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    // No bloquear la respuesta si falla el email
  }
}

/**
 * Enviar email de notificación al administrador
 */
async function enviarEmailAdmin(nombre, email, telefono, asunto, mensaje) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `📬 Nuevo mensaje de contacto: ${asunto}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <hr>
        <h3>Mensaje:</h3>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><a href="http://localhost:3000/admin/contactos">Ver en el panel de admin</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Notificación enviada al admin`);

  } catch (error) {
    console.error('Error enviando email al admin:', error);
  }
}

/**
 * Enviar respuesta al usuario
 */
async function enviarRespuesta(email, nombre, respuesta) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `📬 Respuesta a tu consulta - MIM Living`,
      html: `
        <h2>Hola ${nombre},</h2>
        <p>Hemos revisado tu mensaje y aquí está nuestra respuesta:</p>
        <hr>
        <p>${respuesta.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Si tienes más dudas, no dudes en escribirnos.</p>
        <p>Saludos,<br>El equipo de MIM Living</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Respuesta enviada a ${email}`);

  } catch (error) {
    console.error('Error enviando respuesta:', error);
  }
}