import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export async function runPostgresTool(binary, args, env = {}, output) {
  // Provider credentials stay in the environment, never argv or diagnostics.
  const child = spawn(binary, args, { env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C', ...env }, stdio: ['ignore', output ? 'pipe' : 'ignore', 'pipe'] });
  let spawned = false, exited = false, stopRequested = false, failure, diagnostic = '';
  const stop = error => {
    failure ||= error;
    if (!exited && !stopRequested) {
      stopRequested = true;
      try { child.kill('SIGTERM'); }
      catch { /* A failed stop request cannot release the live child. */ }
    }
  };
  const completed = new Promise(resolve => {
    child.once('spawn', () => { spawned = true; });
    child.on('error', () => {
      stop(Error('PostgreSQL recovery tool process error'));
      if (!spawned) { exited = true; resolve(); }
    });
    child.once('exit', code => {
      exited = true;
      if (code !== 0) {
        const category = /certificate|SSL error|root certificate/i.test(diagnostic) ? 'TLS validation' : /snapshot/i.test(diagnostic) ? 'snapshot' : /permission denied/i.test(diagnostic) ? 'database permission' : /version mismatch|unsupported version/i.test(diagnostic) ? 'tool version' : 'archive command';
        failure ||= Error(`PostgreSQL recovery tool failed: ${category}`);
      }
      resolve();
    });
  });
  const timer = setTimeout(() => stop(Error('PostgreSQL recovery tool timed out')), 300000);
  child.stderr.on('data', chunk => { diagnostic = (diagnostic + chunk.toString()).slice(0, 8192); });
  child.stderr.on('error', () => stop(Error('PostgreSQL recovery tool diagnostic stream failed')));
  let bytes = 0;
  const streamed = output ? pipeline(child.stdout, new Transform({ transform(chunk, _encoding, done) {
    bytes += chunk.length;
    done(bytes > output.limit ? Error('Database archive exceeds byte budget') : null, chunk);
  } }), createWriteStream(output.path, { flags: 'wx', mode: 0o600 })).catch(() => {
    stop(Error('PostgreSQL recovery tool archive stream failed'));
  }) : Promise.resolve();
  // A stop request, stream failure or post-spawn error is not process exit.
  // Retain the snapshot and staging directory until the child and stream end.
  try { await Promise.all([completed, streamed]); }
  finally { clearTimeout(timer); }
  if (failure) throw failure;
}
