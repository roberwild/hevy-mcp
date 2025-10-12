// api/index.js

const { startHttpServer } = require('../dist/utils/httpServer');
const { default: dotenv } = require('dotenv');

dotenv.config();

module.exports = async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.statusCode = 200;
    res.end('OK');
    return;
  }

  // ⚠️ OJO: esto crea el servidor en cada request (no ideal, pero válido en serverless)
  const { default: { main } } = await import('../dist/index.js');
  await main();

  // Podrías mejorar esto almacenando el servidor en memoria, pero así funciona por ahora
  res.statusCode = 200;
  res.end('Hevy MCP launched (check logs)');
};
