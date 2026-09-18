/**
 * Env the desktop shell passes to the runtime. Isolated from Electron so
 * Gate B defaults are unit-tested without spawning a window.
 */
export function desktopRuntimeEnv(opts: {
  dataDir: string;
  cdpPort: number;
  packaged: boolean;
  electronVersion?: string;
  env?: NodeJS.ProcessEnv;
}): NodeJS.ProcessEnv {
  const src = opts.env ?? process.env;
  const out: NodeJS.ProcessEnv = {
    ...src,
    ELECTRON_RUN_AS_NODE: "1",
    VECTOR_DATA_DIR: opts.dataDir,
    VECTOR_IPC: "1",
    VECTOR_ELECTRON_CDP: `http://127.0.0.1:${opts.cdpPort}`,
    VECTOR_ELECTRON_VERSION: opts.electronVersion ?? "dev",
  };
  // One live Vector document. Chromium is not the default page engine.
  // A saved settings.engineMode still wins over this env default.
  if (!src.VECTOR_ENGINE_MODE) out.VECTOR_ENGINE_MODE = "always";
  if (opts.packaged && !src.VECTOR_ENGINE_PROFILE) out.VECTOR_ENGINE_PROFILE = "production";
  return out;
}
