// Launch the built desktop app for a smoke script and find its shell window.
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '../..');
export const { _electron } = createRequire(join(root, 'packages/chromium-driver/package.json'))('playwright-core');
export const electron = createRequire(join(root, 'apps/desktop/package.json'))('electron');

/** The Aux renderer window — not DevTools, popups or page windows. */
export async function shellWindow(app, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  do {
    const page = app.windows().find(candidate => candidate.url().includes('renderer/index.html'));
    if (page) return page;
    await new Promise(resolve => setTimeout(resolve, 50));
  } while (Date.now() < deadline);
  throw new Error(`The Aux shell window did not open within ${timeoutMs}ms`);
}

/** Start `apps/desktop` under Electron; `args` follow the app path. */
export function launchApp({ args = [], ...options } = {}) {
  return _electron.launch({ executablePath: electron, args: [join(root, 'apps/desktop'), ...args], ...options });
}

/** Start the app and wait for its shell window. */
export async function launchAux(options = {}) {
  const app = await launchApp(options);
  return { app, page: await shellWindow(app) };
}
