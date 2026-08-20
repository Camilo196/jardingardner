const http = require('http');

const PORT = Number(process.env.GMAIL_OAUTH_PORT || 3001);
const CLIENT_ID = process.env.GMAIL_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_API_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Faltan GMAIL_API_CLIENT_ID y GMAIL_API_CLIENT_SECRET en variables de entorno.');
  process.exit(1);
}

function crearUrlAutorizacion() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function intercambiarCodigo(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'No se pudo obtener el refresh token.');
  }
  return data;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404);
    res.end('No encontrado');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('No llego codigo OAuth.');
    return;
  }

  try {
    const data = await intercambiarCodigo(code);
    console.log('\nGuarda estas variables en Render:\n');
    console.log(`GMAIL_API_REFRESH_TOKEN=${data.refresh_token || '(Google no envio refresh_token; vuelve a ejecutar con prompt=consent)'}`);
    console.log('GMAIL_API_USER=tu_correo@gmail.com');
    console.log('MAIL_FROM=tu_correo@gmail.com\n');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Listo. Puedes volver a Codex y copiar el refresh token en Render.');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Error: ${err.message}`);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('\n1. Agrega este redirect URI en Google Cloud OAuth Client:');
  console.log(`   ${REDIRECT_URI}\n`);
  console.log('2. Abre esta URL, acepta el permiso gmail.send y vuelve aqui:\n');
  console.log(crearUrlAutorizacion());
  console.log('\nEsperando autorizacion de Google...\n');
});
