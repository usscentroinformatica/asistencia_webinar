// Proxy para evitar CORS: el frontend llama a esta API (mismo origen en Vercel)
// y esta función envía los datos a Google Apps Script desde el servidor.

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyBds_DWYQ2QV8aI46ZVHXlB1mictt7LNPMYvR8mxNTQsFCcsFvdJa9Sf-TYRWgSf136g/exec';

// Helper para esperas
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    // Enviar UNO POR UNO con pausas para evitar saturación de Google Script
    const resultados = [];
    
    console.log(`📤 Iniciando envío de ${registros.length} registros a Google Script...`);
    
    for (let i = 0; i < registros.length; i++) {
      const datos = registros[i];
      
      console.log(`📝 Enviando registro ${i + 1}/${registros.length}: ${datos.curso}`);
      
      // Pausa antes de enviar (excepto el primero)
      if (i > 0) {
        await sleep(600);
      }
      
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        });
        
        resultados.push({
          success: true,
          curso: datos.curso,
          index: i + 1
        });
        
        console.log(`✅ Registro ${i + 1} enviado: ${datos.curso}`);
        
      } catch (err) {
        console.error(`❌ Error enviando registro ${i + 1}:`, err.message);
        resultados.push({
          success: false,
          curso: datos.curso,
          error: err.message,
          index: i + 1
        });
      }
    }
    
    // Verificar resultados
    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;
    
    console.log(`\n📊 RESUMEN: ${exitosos} exitosos, ${fallidos} fallidos`);
    
    return res.status(200).json({ 
      success: true,
      enviados: exitosos,
      fallidos: fallidos,
      total: registros.length
    });
    
  } catch (err) {
    console.error('Error proxy encuesta:', err);
    return res.status(500).json({ error: err.message || 'Error al enviar' });
  }
};
