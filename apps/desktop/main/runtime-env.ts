/**
 * Env the desktop shell passes to the runtime. Isolated from Electron so
 * Gate B / A defaults are unit-tested without spawning a window.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

function veName(base: string): string {
  return process.platform === "win32" ? `${base}.exe` : base;
}

export function resolveDesktopEngineBins(opts: {
  packaged: boolean;
  resourcesPath?: string;
  workspaceRoot?: string;
  env?: NodeJS.ProcessEnv;
}): { shell?: string; host?: string; resources?: string } {
  const src = opts.env ?? process.env;
  const shellName = veName("ve-shell");
  const hostName = veName("ve-host");
  const search: string[] = [];
  if (opts.resourcesPath) {
    search.push(join(opts.resourcesPath, "engine"), opts.resourcesPath);
  }
  const resourcesEnv = src.VECTOR_RESOURCES?.trim();
  if (resourcesEnv) search.push(join(resourcesEnv, "engine"), resourcesEnv);
  if (opts.workspaceRoot) {
    search.push(
      join(opts.workspaceRoot, "release"),
      join(opts.workspaceRoot, "engine", "target", "release"),
      join(opts.workspaceRoot, "engine", "target", "debug"),
      join(opts.workspaceRoot, "engine", "crates", "ve-napi"),
    );
  }
  const first = (name: string, explicit?: string): string | undefined => {
    if (explicit && existsSync(explicit)) return explicit;
    for (const dir of search) {
      const p = join(dir, name);
      if (existsSync(p)) return p;
    }
    return undefined;
  };
  return {
    shell: first(shellName, src.VECTOR_SHELL?.trim()),
    host: first(hostName, src.VECTOR_ENGINE_HOST?.trim()),
    resources: opts.resourcesPath,
  };
}

export function desktopRuntimeEnv(opts: {
  dataDir: string;
  cdpPort: number;
  packaged: boolean;
  electronVersion?: string;
  env?: NodeJS.ProcessEnv;
  resourcesPath?: string;
  workspaceRoot?: string;
}): NodeJS.ProcessEnv {
  const src = opts.env ?? process.env;
  const bins = resolveDesktopEngineBins({
    packaged: opts.packaged,
    resourcesPath: opts.resourcesPath,
    workspaceRoot: opts.workspaceRoot,
    env: src,
  });
  const out: NodeJS.ProcessEnv = {
    ...src,
    ELECTRON_RUN_AS_NODE: "1",
    VECTOR_DATA_DIR: opts.dataDir,
    VECTOR_IPC: "1",
    VECTOR_ELECTRON_CDP: `http://127.0.0.1:${opts.cdpPort}`,
    VECTOR_ELECTRON_VERSION: opts.electronVersion ?? "dev",
  };
  // Compatibility-first hybrid. Qualified cohorts can use the Vector Engine;
  // every decision remains visible through PageTarget.routeReason.
  if (!src.VECTOR_ENGINE_MODE) out.VECTOR_ENGINE_MODE = "auto";
  if (opts.packaged && !src.VECTOR_ENGINE_PROFILE) out.VECTOR_ENGINE_PROFILE = "production";
  if (!src.VECTOR_SHELL && bins.shell) out.VECTOR_SHELL = bins.shell;
  if (!src.VECTOR_ENGINE_HOST && bins.host) out.VECTOR_ENGINE_HOST = bins.host;
  if (!src.VECTOR_RESOURCES && bins.resources) out.VECTOR_RESOURCES = bins.resources;
  return out;
}
