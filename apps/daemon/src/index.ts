import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { createFeatures } from './features.js';
import { createDaemon } from './http/server.js';

export { BridgeRegistry } from './bridge/registry.js';
export { createDaemon } from './http/server.js';
export { atomicJson, Store } from './storage/store.js';
export { createCoreRouter, procedure, t } from './trpc/core.js';

export async function runDaemon() {
  const port = Number(process.env.AUX_PORT ?? 21520);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid AUX_PORT');
  const daemon = await createDaemon({
    ...createFeatures(),
    home: process.env.AUX_HOME ?? join(homedir(), '.aux'),
    port,
    origins: (process.env.AUX_DEV_ORIGINS ?? '').split(',').filter(Boolean),
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const)
    process.once(signal, () => void daemon.close());
  console.info(`Aux daemon listening on 127.0.0.1:${daemon.port}`);
  const browserPid = Number(process.env.AUX_BROWSER_PID ?? 0);
  if (browserPid) {
    if (
      !Number.isSafeInteger(browserPid) ||
      browserPid < 1 ||
      browserPid !== process.ppid
    ) {
      await daemon.close();
      throw new Error('Browser parent identity is invalid.');
    }
    const identify = () =>
      promisify(execFile)(
        '/bin/ps',
        ['-p', String(browserPid), '-o', 'lstart=,comm='],
        { timeout: 1000, maxBuffer: 4096 },
      );
    let identity: string;
    try {
      identity = (await identify()).stdout.trim();
      if (!identity) throw new Error('Browser parent exited.');
    } catch (error) {
      await daemon.close();
      throw error;
    }
    let checking = false;
    const watchdog = setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        const current = (await identify()).stdout.trim();
        if (current !== identity) {
          clearInterval(watchdog);
          await daemon.close();
        }
      } catch {
        clearInterval(watchdog);
        await daemon.close().catch(() => {
          process.exitCode = 1;
        });
      } finally {
        checking = false;
      }
    }, 2000);
    watchdog.unref();
    daemon.server.once('close', () => clearInterval(watchdog));
  }
  return daemon;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await runDaemon();
