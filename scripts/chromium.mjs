/**
 * Locate a headless Chromium for the standalone runtime when no system Chrome
 * is installed: honours VECTOR_BROWSER_PATH, then falls back to a Playwright
 * `chromium_headless_shell-*` download (`pnpm exec playwright install
 * chromium-headless-shell`). Used by the bench harness and the engine
 * integration tests so they can report "Chromium unavailable" precisely.
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function findChromium(env = process.env) {
  if (env.VECTOR_BROWSER_PATH && existsSync(env.VECTOR_BROWSER_PATH)) return env.VECTOR_BROWSER_PATH;
  const roots = [env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), ".cache", "ms-playwright")].filter(Boolean);
  for (const root of roots) {
    let entries = [];
    try {
      entries = readdirSync(root);
    } catch {
      continue;
    }
    for (const dir of entries.filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse()) {
      const bin =
        process.platform === "win32"
          ? join(root, dir, "chrome-headless-shell-win64", "chrome-headless-shell.exe")
          : process.platform === "darwin"
            ? join(root, dir, `chrome-headless-shell-mac-${process.arch === "arm64" ? "arm64" : "x64"}`, "chrome-headless-shell")
            : join(root, dir, "chrome-headless-shell-linux64", "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  return null;
}

/** Environment for `startRuntime` with the discovered Chromium (when any). */
export function withChromium(env = process.env) {
  const path = findChromium(env);
  return path ? { ...env, VECTOR_BROWSER_PATH: path } : { ...env };
}
