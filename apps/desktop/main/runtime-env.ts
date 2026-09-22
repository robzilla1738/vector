/**
 * Env the desktop shell passes to the runtime. Isolated from Electron so the
 * defaults are unit-tested without spawning a window.
 */
export function desktopRuntimeEnv(opts: {
  dataDir: string;
  cdpPort: number;
  electronVersion?: string;
  env?: NodeJS.ProcessEnv;
}): NodeJS.ProcessEnv {
  return {
    ...(opts.env ?? process.env),
    ELECTRON_RUN_AS_NODE: "1",
    AUX_DATA_DIR: opts.dataDir,
    AUX_IPC: "1",
    AUX_ELECTRON_CDP: `http://127.0.0.1:${opts.cdpPort}`,
    AUX_ELECTRON_VERSION: opts.electronVersion ?? "dev",
  };
}
