const http = require('http');
const net = require('net');
const port = process.env.PORT || 3000;
const XRAY_PORT = 10000;
const started = new Date().toISOString();

function xrayAlive() {
  return new Promise((resolve) => {
    const s = net.connect(XRAY_PORT, '127.0.0.1');
    const t = setTimeout(() => { s.destroy(); resolve(false); }, 1500);
    s.on('connect', () => { clearTimeout(t); s.end(); resolve(true); });
    s.on('error', () => { clearTimeout(t); resolve(false); });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    const up = await xrayAlive();
    res.writeHead(up ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: up ? 'ok' : 'xray-down', uptime: Math.floor(process.uptime()), started }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Abasthan Proxy</title></head><body><h1>Abasthan 代理节点</h1><p>VLESS + WebSocket over TLS · Abasthan Free · 512MB / 0.1 vCPU</p><p><a href="/health">/health</a>（同时检测 Xray 是否存活）</p></body></html>`);
});

server.on('upgrade', (req, socket, head) => {
  if (!req.url.startsWith('/vless')) { socket.destroy(); return; }
  const upstream = net.connect(XRAY_PORT, '127.0.0.1', () => {
    const headers = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
    if (head && head.length) upstream.write(head);
    socket.pipe(upstream);
    upstream.pipe(socket);
  });
  upstream.on('error', () => { try { socket.destroy(); } catch (e) {} });
  socket.on('error', () => { try { upstream.destroy(); } catch (e) {} });
});

server.listen(port, () => console.log('listening on ' + port));
