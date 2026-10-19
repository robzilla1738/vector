import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { verifyAssertion, verifyRegistration } from './verifier.mjs';

export async function startHarness({ port = 0, reportPath } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error('Port must be an integer from 0 through 65535.');
  if (reportPath)
    writeFileSync(reportPath, '{}\n', { mode: 0o600, flag: 'wx' });
  const runId = randomBytes(16).toString('hex'),
    credentials = new Map(),
    ceremonies = new Map(),
    events = [];
  let origin;
  const record = (event) => {
    events.push({ at: new Date().toISOString(), ...event });
    if (reportPath)
      writeFileSync(reportPath, JSON.stringify(report(), null, 2), {
        mode: 0o600,
      });
  };
  const report = () => ({
    version: 1,
    runId,
    origin,
    realBrowserRequired: true,
    events,
    registeredCases: [...credentials.keys()],
    automated: {
      registration: events.some((e) => e.type === 'registration-verified'),
      assertion: events.some((e) => e.type === 'assertion-verified'),
    },
    note: 'Manual observations are explicitly labeled. No virtual authenticator or credential API replacement is used.',
  });
  const reply = (res, status, body, type = 'application/json') => {
    res.writeHead(status, {
      'content-type': `${type}; charset=utf-8`,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'content-security-policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'",
    });
    res.end(type === 'application/json' ? JSON.stringify(body) : body);
  };
  const server = createServer(async (req, res) => {
    try {
      if (req.headers.host !== new URL(origin).host)
        return reply(res, 403, { error: 'Use the exact localhost RP URL.' });
      const url = new URL(req.url, origin),
        prefix = `/api/${runId}`;
      if (req.method === 'GET' && url.pathname === `/run/${runId}`)
        return reply(
          res,
          200,
          readFileSync(new URL('./page.html', import.meta.url), 'utf8'),
          'text/html',
        );
      if (req.method === 'GET' && url.pathname === '/client.js')
        return reply(
          res,
          200,
          readFileSync(new URL('./client.js', import.meta.url), 'utf8'),
          'text/javascript',
        );
      if (req.method === 'GET' && url.pathname === '/style.css')
        return reply(
          res,
          200,
          readFileSync(new URL('./style.css', import.meta.url), 'utf8'),
          'text/css',
        );
      if (req.method === 'GET' && url.pathname === `${prefix}/report`)
        return reply(res, 200, report());
      if (req.method === 'GET' && url.pathname === `${prefix}/navigation`) {
        const id = url.searchParams.get('ceremony'),
          ceremony = ceremonies.get(id);
        if (!ceremony)
          return reply(res, 404, { error: 'Unknown navigation ceremony.' });
        ceremonies.delete(id);
        record({
          type: 'navigation-committed',
          case: ceremony.case,
          inference:
            'RP document navigation only; verify the old Vault request is canceled in UI.',
        });
        res.writeHead(303, {
          location: `/run/${runId}?navigation=returned`,
          'cache-control': 'no-store',
        });
        return res.end();
      }
      if (
        req.method !== 'POST' ||
        req.headers.origin !== origin ||
        !url.pathname.startsWith(`${prefix}/`)
      )
        return reply(res, 403, { error: 'Same-origin RP request required.' });
      if (!req.headers['content-type']?.startsWith('application/json'))
        return reply(res, 415, { error: 'JSON required.' });
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 262144) throw new Error('Request too large.');
        chunks.push(chunk);
      }
      const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (url.pathname === `${prefix}/begin`) {
        if (
          ![
            'register',
            'assert',
            'cancel',
            'fallback',
            'navigation',
            'private-reopen',
          ].includes(input.action) ||
          typeof input.case !== 'string' ||
          !/^[a-z][a-z0-9-]{0,63}$/.test(input.case)
        )
          throw new Error('Invalid fixture case.');
        for (const [id, item] of ceremonies)
          if (item.expiresAt < Date.now()) ceremonies.delete(id);
        if (ceremonies.size >= 64)
          throw new Error('Too many pending ceremonies.');
        const get = ['assert', 'private-reopen'].includes(input.action),
          existing = credentials.get(input.case);
        if (get && !existing)
          throw new Error(
            'Register this fixture case first, then reuse this exact RP URL.',
          );
        const challenge = randomBytes(32).toString('base64url'),
          id = randomUUID();
        const userId = createHash('sha256')
          .update(`${runId}/${input.case}`)
          .digest()
          .toString('base64url');
        const ceremony = {
          kind: get ? 'get' : 'create',
          action: input.action,
          case: input.case,
          challenge,
          userId,
          origin,
          rpId: 'localhost',
          expiresAt: Date.now() + 120000,
        };
        ceremonies.set(id, ceremony);
        record({
          type: 'ceremony-started',
          case: input.case,
          action: input.action,
        });
        const publicKey = get
          ? {
              challenge,
              rpId: 'localhost',
              allowCredentials: [
                {
                  type: 'public-key',
                  id: existing.id,
                  transports: ['internal'],
                },
              ],
              userVerification: 'required',
              timeout: 120000,
            }
          : {
              challenge,
              rp: { id: 'localhost', name: 'Aux disposable acceptance RP' },
              user: {
                id: userId,
                name: `fixture-${input.case}@localhost`,
                displayName: `Fixture ${input.case}`,
              },
              pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
              authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'required',
              },
              excludeCredentials: existing
                ? [{ type: 'public-key', id: existing.id }]
                : [],
              attestation: 'none',
              extensions: { credProps: true },
              timeout: 120000,
            };
        return reply(res, 200, {
          ceremonyId: id,
          kind: ceremony.kind,
          publicKey,
        });
      }
      if (
        url.pathname === `${prefix}/finish` ||
        url.pathname === `${prefix}/error`
      ) {
        const ceremony = ceremonies.get(input.ceremonyId);
        ceremonies.delete(input.ceremonyId);
        if (!ceremony || ceremony.expiresAt <= Date.now())
          throw new Error('Expired, canceled or already consumed ceremony.');
        if (url.pathname.endsWith('/error')) {
          if (
            ![
              'AbortError',
              'NotAllowedError',
              'InvalidStateError',
              'NotSupportedError',
              'SecurityError',
              'UnknownError',
            ].includes(input.name)
          )
            throw new Error('Unexpected browser error.');
          const expected =
            (ceremony.action === 'cancel' && input.name === 'AbortError') ||
            (ceremony.action === 'fallback' &&
              input.name === 'NotAllowedError') ||
            (ceremony.action === 'private-reopen' &&
              input.name === 'NotAllowedError');
          record({
            type: expected ? 'expected-browser-rejection' : 'browser-error',
            case: ceremony.case,
            action: ceremony.action,
            name: input.name,
          });
          return reply(res, 200, {
            expected,
            name: input.name,
            manualEvidenceRequired: ['fallback', 'private-reopen'].includes(
              ceremony.action,
            ),
          });
        }
        if (ceremony.action !== 'register' && ceremony.action !== 'assert') {
          record({
            type: 'unexpected-success',
            case: ceremony.case,
            action: ceremony.action,
          });
          throw new Error('This negative test unexpectedly succeeded.');
        }
        if (ceremony.kind === 'create') {
          const credential = verifyRegistration(input.credential, ceremony);
          credentials.set(ceremony.case, credential);
          record({
            type: 'registration-verified',
            case: ceremony.case,
            algorithm: 'ES256',
            attestation: 'none',
            flags: 0x45,
          });
          return reply(res, 200, {
            verified: true,
            algorithm: 'ES256',
            note: 'Public key and attestation fields validated; assertion proves possession.',
          });
        }
        const credential = credentials.get(ceremony.case),
          result = verifyAssertion(input.credential, ceremony, credential);
        credential.counter = result.counter;
        record({
          type: 'assertion-verified',
          case: ceremony.case,
          counter: result.counter,
          flags: result.flags,
        });
        return reply(res, 200, result);
      }
      if (url.pathname === `${prefix}/observe`) {
        const allowed = [
          'other-providers-ui-visible',
          'vault-canceled-after-abort',
          'vault-canceled-after-navigation',
          'all-private-windows-closed',
          'reopened-private-vault-has-no-candidate',
          'fresh-verification-prompt-visible',
        ];
        if (!allowed.includes(input.observation))
          throw new Error('Unknown observation.');
        record({ type: 'manual-observation', observation: input.observation });
        return reply(res, 200, { recorded: true });
      }
      return reply(res, 404, { error: 'Unknown RP route.' });
    } catch (error) {
      return reply(res, 400, {
        error:
          error instanceof Error ? error.message : 'RP verification failed.',
      });
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  origin = `http://localhost:${server.address().port}`;
  return {
    url: `${origin}/run/${runId}`,
    report,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2),
    reportIndex = args.indexOf('--report'),
    portIndex = args.indexOf('--port');
  const harness = await startHarness({
    ...(reportIndex >= 0 ? { reportPath: args[reportIndex + 1] } : {}),
    ...(portIndex >= 0 ? { port: Number(args[portIndex + 1]) } : {}),
  });
  process.stdout.write(
    `Disposable Aux RP: ${harness.url}\nUse only a disposable Aux profile and fixture Vault account.\n`,
  );
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, async () => {
      await harness.close();
      process.exit(0);
    });
}
