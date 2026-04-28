const express = require("express");
const router = express.Router();
const multer = require("multer");
const Replicate = require("replicate");
const pool = require("../models/db");

const upload = multer({ storage: multer.memoryStorage() });

const cpUpload = upload.fields([
  { name: "estancia", maxCount: 1 },
  { name: "mueble", maxCount: 1 }
]);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

function fileToDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

function interpretarPrompt(prompt, tipoAccion, estilo) {
  return `
You are a professional interior design AI editor.

You will receive:
- IMAGE 1: the current room
- IMAGE 2: the furniture/material reference

TASK:
Edit IMAGE 1 using IMAGE 2 as visual reference.

STRICT RULES:
- DO NOT create a new room
- DO NOT change perspective, lighting, walls, floor or layout
- ONLY modify what the user asks
- If user says remove → remove completely
- If user says replace → remove first, then place new object in SAME POSITION
- Use IMAGE 2 style, material and design
- Match scale, shadows and realism
- Do NOT add random furniture
- Do NOT modify unrelated elements

STYLE:
${estilo || "realistic interior design"}

USER INSTRUCTION:
${prompt}

Return ONLY the edited room image.
`.trim();
}

function normalizarOutput(output) {
  if (!output) return null;

  if (Array.isArray(output)) {
    return normalizarOutput(output[0]);
  }

  if (typeof output === "string") {
    return output;
  }

  if (output.url && typeof output.url === "function") {
    return output.url();
  }

  if (output.image) return output.image;
  if (output.image_url) return output.image_url;
  if (output.output) return normalizarOutput(output.output);

  return String(output);
}

router.post("/generar", cpUpload, async (req, res) => {
  try {
    const { prompt, id_estancia, tipo_accion, estilo } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "El prompt es obligatorio."
      });
    }

    if (!req.files?.["estancia"]?.[0]) {
      return res.status(400).json({
        success: false,
        error: "Falta la imagen de la estancia"
      });
    }

    if (!req.files?.["mueble"]?.[0]) {
      return res.status(400).json({
        success: false,
        error: "Falta la imagen del mueble"
      });
    }

    const estanciaBase64 = fileToDataUrl(req.files["estancia"][0]);
    const muebleBase64 = fileToDataUrl(req.files["mueble"][0]);

    const promptFinal = interpretarPrompt(prompt, tipo_accion, estilo);

    const output = await replicate.run(
      "flux-kontext-apps/multi-image-kontext-max",
      {
        input: {
          prompt: promptFinal,
          input_image_1: estanciaBase64,
          input_image_2: muebleBase64,
          output_format: "jpg",
          safety_tolerance: 2,
          prompt_upsampling: false
        }
      }
    );

    const finalImageUrl = normalizarOutput(output);

    if (!finalImageUrl) {
      return res.status(500).json({
        success: false,
        error: "No se recibió imagen de la IA"
      });
    }

    let propuesta = null;

    if (id_estancia) {
      const result = await pool.query(
        `INSERT INTO propuesta_ia (id_estancia, prompt, imagen_resultado)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id_estancia, prompt, finalImageUrl]
      );
      propuesta = result.rows[0];
    }

    res.json({
      success: true,
      imageUrl: finalImageUrl,
      imagen: finalImageUrl,
      propuesta
    });

  } catch (error) {
    console.error("ERROR IA:", error);

    res.status(500).json({
      success: false,
      error: "Error generando imagen",
      details: error.message
    });
  }
});

module.exports = router;