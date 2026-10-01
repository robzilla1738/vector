import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import { join } from 'node:path';

/** Disposable SAN certificate and exact-authority HTTPS list receiver. */
export async function createFilterTls(directory, text = '0.0.0.0 cdn.appround.biz\n') {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const key = join(directory, 'key.pem');
  const ca = join(directory, 'ca.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', ca, '-days', '1', '-subj', '/CN=aux-filter.fixture.test', '-addext', 'subjectAltName=DNS:aux-filter.fixture.test', '-addext', 'basicConstraints=critical,CA:TRUE'], { stdio: 'ignore' });
  chmodSync(key, 0o600);
  chmodSync(ca, 0o600);
  const requests = [];
  const server = createServer({ key: readFileSync(key), cert: readFileSync(ca) }, (request, response) => {
    if (request.headers.host !== 'aux-filter.fixture.test' || request.url !== '/hosts.txt') { response.writeHead(403); response.end(); return; }
    requests.push({ path: request.url, etag: request.headers['if-none-match'] ?? null });
    response.setHeader('etag', '"aux-fixture-v1"');
    response.setHeader('content-type', 'text/plain');
    if (request.headers['if-none-match'] === '"aux-fixture-v1"') { response.writeHead(304); response.end(); return; }
    response.end(text);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, ca, requests, text, url: 'https://aux-filter.fixture.test/hosts.txt' };
}
