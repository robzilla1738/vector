import { fork, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { app } from "electron";
import { desktopRuntimeEnv } from "./runtime-env.js";

export { desktopRuntimeEnv } from "./runtime-env.js";

const require_ = createRequire(import.meta.url);

/** Resolve the runtime entry across dev (workspace) and packaged layouts. */
export function runtimeEntry(): string {
  if (app.isPackaged) {
    // packaged: staging deployed to <resources>/runtime (see scripts/package-local.mjs)
    return join(process.resourcesPath, "runtime", "dist", "main.js");
  }
  try {
    const pkg = require_.resolve("@vector/runtime/package.json");
    return join(pkg.replace(/\/package\.json$/, ""), "dist", "main.js");
  } catch {
    // dev fallback: sibling workspace package (apps/desktop → apps/runtime)
    return join(app.getAppPath(), "..", "runtime", "dist", "main.js");
  }
}

export interface RuntimeProc {
  proc: ChildProcess;
}

export function spawnRuntime(opts: {
  dataDir: string;
  cdpPort: number;
  onExit: (code: number | null) => void;
}): RuntimeProc {
  const entry = runtimeEntry();
  const proc = fork(entry, [], {
    execPath: process.execPath,
    silent: true,
    cwd: app.isPackaged ? undefined : join(app.getAppPath(), "..", ".."),
    env: desktopRuntimeEnv({
      dataDir: opts.dataDir,
      cdpPort: opts.cdpPort,
      packaged: app.isPackaged,
      electronVersion: String(process.versions.electron ?? "dev"),
      resourcesPath: app.isPackaged ? process.resourcesPath : undefined,
      workspaceRoot: app.isPackaged ? undefined : join(app.getAppPath(), "..", ".."),
    }),
  });
  proc.stdout?.on("data", (d) => process.stdout.write(`[runtime] ${d}`));
  proc.stderr?.on("data", (d) => process.stderr.write(`[runtime!] ${d}`));
  proc.on("exit", opts.onExit);
  return { proc };
}
