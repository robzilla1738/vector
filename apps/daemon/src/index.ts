import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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
    // On macOS process.ppid reads the current OS parent on every access.
    // Once that parent exits, reparenting prevents a reused PID from matching.
    // A slow external ps command is not evidence that a live parent exited.
    const watchdog = setInterval(() => {
      if (process.ppid === browserPid) return;
      clearInterval(watchdog);
      console.info('Browser parent exited; stopping the local daemon.');
      void daemon.close().catch(() => {
        process.exitCode = 1;
      });
    }, 2000);
    watchdog.unref();
    daemon.server.once('close', () => clearInterval(watchdog));
  }
  return daemon;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await runDaemon();
