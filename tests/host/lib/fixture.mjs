import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { connect } from 'node:net';
import { Server as TlsServer } from 'node:tls';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export function toneWavBytes({ seconds = 1, rate = 8000 } = {}) {
  const pcm = Buffer.alloc(Math.floor(rate * seconds) * 2);
  for (let i = 0; i < pcm.length / 2; i++) pcm.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 440 * i / rate) * 12000), i * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
export function fixturePage(title, body, color = '#f3f4f6') {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;padding:32px;background:${color};font:18px system-ui}button,input,textarea{font:inherit}a{color:inherit}</style></head><body><h1>${title}</h1>${body}<nav><a href="/red">Red</a> · <a href="/blue">Blue</a> · <a href="/green">Green</a></nav></body></html>`;
}
export async function createFixture({ tls = false } = {}) {
  const routes = new Map();
  const requests = [];
  let tlsHellos = 0;
  let tlsDirectory;
  const servers = [];
  const tunnelSockets = new Set();
  const tunnels = new Map();
  const route = (path, handler, { method = 'GET', status = 200, headers = {} } = {}) => {
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) throw new Error('Fixture routes need an absolute local path');
    const key = `${method.toUpperCase()} ${path}`;
    routes.set(key, { handler, status, headers });
    return () => routes.delete(key);
  };
  for (const [name, color] of [['Red', '#b84750'], ['Blue', '#4b85b9'], ['Green', '#55a377']])
    route(`/${name.toLowerCase()}`, fixturePage(`Aux native ${name}`, `<p>${name} loopback fixture.</p>`, color));
  route('/tone.wav', toneWavBytes(), { headers: { 'content-type': 'audio/wav' } });
  route('/audible', fixturePage('Aux audible fixture', '<button id="play" onclick="document.querySelector(\'audio\').play()">Play tone</button><audio controls loop src="/tone.wav"></audio>'));
  route('/dirty', fixturePage('Aux dirty fixture', '<label>Draft <textarea aria-label="Draft"></textarea></label><output id="status">Clean</output><script>document.querySelector("textarea").addEventListener("input",()=>{document.querySelector("#status").textContent="Unsaved";window.onbeforeunload=e=>{e.preventDefault();e.returnValue=""}})</script>'));
  route('/video', fixturePage('Aux video fixture', `<video id="large" aria-label="Large video" width="640" height="360" muted autoplay controls></video><video id="small" aria-label="Small video" width="160" height="90" muted autoplay controls></video><button onclick="documentPictureInPicture.requestWindow().then(w=>w.document.body.textContent='Document PiP fixture')">Document picture in picture</button><script>for(const v of document.querySelectorAll('video')){const c=document.createElement('canvas');c.width=v.width;c.height=v.height;const x=c.getContext('2d');setInterval(()=>{x.fillStyle='#164b72';x.fillRect(0,0,c.width,c.height);x.fillStyle='white';x.font='24px system-ui';x.fillText('Loopback video '+Date.now(),10,40)},50);v.srcObject=c.captureStream(20);v.play()}</script>`));
  const handler = async (request, response) => {
    try {
      const remote = request.socket.remoteAddress;
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) { response.writeHead(403); response.end(); return; }
      const parsed = new URL(request.url, 'http://127.0.0.1');
      requests.push({ method: request.method, path: parsed.pathname });
      const entry = routes.get(`${request.method} ${parsed.pathname}`);
      if (!entry) { response.writeHead(404); response.end('Unknown loopback fixture route'); return; }
      response.statusCode = entry.status;
      for (const [name, value] of Object.entries({ 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
        'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; connect-src 'self'", ...entry.headers })) response.setHeader(name, value);
      const body = typeof entry.handler === 'function' ? await entry.handler(request, response, parsed) : entry.handler;
      if (!response.writableEnded && body !== undefined) response.end(Buffer.isBuffer(body) || typeof body === 'string' ? body : JSON.stringify(body));
    } catch { if (!response.headersSent) response.writeHead(500); if (!response.writableEnded) response.end('Fixture handler failed'); }
  };
  async function listen(server) {
    servers.push(server);
    await new Promise((resolve, reject) => {
      server.once('error', reject); server.listen(0, '127.0.0.1', () => { server.off('error', reject); resolve(); });
    });
    return server.address().port;
  }
  const close = async () => {
    for (const socket of tunnelSockets) socket.destroy();
    tunnelSockets.clear();
    await Promise.all(servers.map(server => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve()); server.closeAllConnections?.();
    })));
    if (tlsDirectory) rmSync(tlsDirectory, { recursive: true, force: true });
  };
  try {
    const httpServer = createHttpServer(handler);
    httpServer.on('clientError', (error, socket) => {
      if (error.rawPacket?.[0] === 0x16) tlsHellos++;
      socket.destroy();
    });
    httpServer.on('connect', (request, socket, head) => {
      const target = tunnels.get(request.url);
      const address = target?.address();
      if (!target?.listening || !address || typeof address === 'string' || address.address !== '127.0.0.1' || socket.remoteAddress !== '127.0.0.1') {
        socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return;
      }
      const upstream = connect(address.port, '127.0.0.1');
      for (const peer of [socket, upstream]) { tunnelSockets.add(peer); peer.on('close', () => tunnelSockets.delete(peer)); }
      upstream.on('connect', () => { socket.write('HTTP/1.1 200 Connection Established\r\n\r\n'); if (head.length) upstream.write(head); socket.pipe(upstream); upstream.pipe(socket); });
      socket.on('error', () => upstream.destroy());
      socket.on('close', () => upstream.destroy());
      upstream.on('error', () => socket.destroy());
    });
    const tunnel = (authority, server) => {
      const address = server instanceof TlsServer && server.address();
      if (authority !== 'aux-filter.fixture.test:443' || !server.listening || !address || typeof address === 'string' || address.address !== '127.0.0.1') throw new Error('Only an owned loopback TLS listener may serve the disposable filter fixture');
      tunnels.set(authority, server);
      if (!servers.includes(server)) servers.push(server);
    };
    const port = await listen(httpServer);
    let tlsUrl;
    let certificate;
    if (tls) {
      tlsDirectory = mkdtempSync('/tmp/aux-loopback-tls-');
      const key = join(tlsDirectory, 'fixture.key'), cert = join(tlsDirectory, 'fixture.crt');
      execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert,
        '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'], { stdio: 'pipe', timeout: 10000 });
      certificate = cert;
      const tlsPort = await listen(createHttpsServer({ key: readFileSync(key), cert: readFileSync(cert) }, handler));
      tlsUrl = `https://127.0.0.1:${tlsPort}`;
    }
    return { tunnel, url: `http://127.0.0.1:${port}`, route, close, requests, get tlsHellos() { return tlsHellos; }, ...(tlsUrl ? { tlsUrl, certificate } : {}) };
  } catch (error) { await close(); throw error; }
}
