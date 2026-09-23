import { chmod, readFile } from "node:fs/promises";
import { DEVTOOLS_PORT_FILE } from "../app/bootstrap.js";

/** Chromium's DevTools port, read without blocking the main thread (polls until the file lands). */
export async function waitForCdpPort(timeoutMs = 10_000): Promise<number> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const port = Number((await readFile(DEVTOOLS_PORT_FILE, "utf8").catch(() => "")).split("\n")[0]);
    if (port > 0) {
      await chmod(DEVTOOLS_PORT_FILE, 0o600).catch(() => { /* non-POSIX fs */ });
      return port;
    }
    if (Date.now() > deadline) throw new Error("DevToolsActivePort never appeared");
    await new Promise(resolve => setTimeout(resolve, 15));
  }
}
