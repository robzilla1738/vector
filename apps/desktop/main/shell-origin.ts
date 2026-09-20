import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function isShellDocument(value: string, rendererFile: string, devUrl?: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === "file:") return resolve(fileURLToPath(url)) === resolve(rendererFile);
    if (!devUrl) return false;
    const development = new URL(devUrl);
    return url.origin === development.origin && url.pathname === development.pathname;
  } catch { return false; }
}
