// Proxy para evitar CORS: el frontend llama a esta API (mismo origen en Vercel)
// y esta función envía los datos a Google Apps Script desde el servidor.

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyBds_DWYQ2QV8aI46ZVHXlB1mictt7LNPMYvR8mxNTQsFCcsFvdJa9Sf-TYRWgSf136g/exec';

function allowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      return res.status(400).json({ error: 'Body JSON inválido' });
    }
  }
  const { registros } = body || {};
  if (!registros || !Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ error: 'Se requiere body.registros (array)' });
  }

  try {
    // En paralelo: todos a la vez (desde servidor no satura como en el navegador)
    await Promise.all(
      registros.map((datos) =>
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        })
      )
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error proxy encuesta:', err);
    return res.status(500).json({ error: err.message || 'Error al enviar' });
  }
};
