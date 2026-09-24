/**
 * Env the desktop shell passes to the runtime. Isolated from Electron so the
 * defaults are unit-tested without spawning a window.
 */
export function desktopRuntimeEnv(opts: {
  dataDir: string;
  profileId: string;
  cdpPort: number;
  internalCdp?: boolean;
  electronVersion?: string;
  env?: NodeJS.ProcessEnv;
}): NodeJS.ProcessEnv {
  return {
    ...(opts.env ?? process.env),
    // A Chromium candidate socket/capability must never override Electron's
    // fork IPC when both hosts are developed on the same machine.
    AUX_HOST_SOCKET: undefined,
    AUX_HOST_TOKEN: undefined,
    AUX_HOST_CDP: undefined,
    AUX_HOST_PROOF: undefined,
    ELECTRON_RUN_AS_NODE: "1",
    AUX_DATA_DIR: opts.dataDir,
    AUX_BROWSER_PROFILE_ID: opts.profileId,
    AUX_IPC: "1",
    AUX_ELECTRON_CDP: opts.internalCdp ? undefined : `http://127.0.0.1:${opts.cdpPort}`,
    AUX_INTERNAL_CDP: opts.internalCdp ? "1" : undefined,
    AUX_ELECTRON_VERSION: opts.electronVersion ?? "dev",
  };
}
