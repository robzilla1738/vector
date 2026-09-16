/**
 * Attached-Chrome path: a real Chrome running with --remote-debugging-port
 * is attached, its tabs listed, adopted, and driven — borrowed-tab semantics
 * (Vector never closes the user's tabs).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import type { PageTarget } from "@vector/contracts";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";

const RECORDS = "http://127.0.0.1:4810";
const CHROME_CDP = 9333;
const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

let rt: RuntimeHandle;
let chrome: ChildProcess | null = null;
let procs: ChildProcess[] = [];
let dataDir = "";
const invoke = <T>(m: string, p?: unknown) => rt.invoke(m, p ?? {}) as Promise<T>;

const itIfChrome = existsSync(CHROME_BIN) ? it : it.skip;

beforeAll(async () => {
  procs = await startFixturesIfNeeded();
  await waitForFixtures();
  dataDir = mkdtempSync(join(tmpdir(), "vector-chrome-"));

  if (existsSync(CHROME_BIN)) {
    const profile = mkdtempSync(join(tmpdir(), "vector-chrome-profile-"));
    chrome = spawn(CHROME_BIN, [
      `--remote-debugging-port=${CHROME_CDP}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--headless=new",
      `${RECORDS}/records`,
    ], { stdio: "ignore" });
    // wait for CDP
    const deadline = Date.now() + 20_000;
    for (;;) {
      try {
        const r = await fetch(`http://127.0.0.1:${CHROME_CDP}/json/version`);
        if (r.ok) break;
      } catch { /* not up */ }
      if (Date.now() > deadline) { chrome.kill(); chrome = null; break; }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  rt = await startRuntime({ ...process.env, VECTOR_DATA_DIR: dataDir, VECTOR_ELECTRON_CDP: "", VECTOR_ENGINE_MODE: "off" });
}, 60_000);

afterAll(async () => {
  await rt?.close();
  chrome?.kill();
  procs.forEach((p) => p.kill());
  rmSync(dataDir, { recursive: true, force: true });
});

describe("attached chrome", () => {
  itIfChrome("attaches, lists tabs, adopts and drives one", async () => {
    const session = await invoke<{ backend: string; status: string }>("chrome.attach", { port: CHROME_CDP });
    expect(session.backend).toBe("chrome");
    expect(session.status).toBe("connected");

    const tabs = await invoke<{ targetId: string; url: string; type: string }[]>("chrome.tabs");
    const recordsTab = tabs.find((t) => t.url.includes("/records") && t.type === "page");
    expect(recordsTab, "records tab visible to chrome.tabs").toBeTruthy();

    // adopt the existing tab — chrome backend requires targetId of an existing tab
    const page = await invoke<PageTarget>("pages.open", {
      url: recordsTab!.url,
      backend: "chrome",
      targetId: recordsTab!.targetId,
    });
    expect(page.backend).toBe("chrome");
    expect(page.targetId).toBe(recordsTab!.targetId);

    const obs = await invoke<{ content: { elements: unknown[]; url: string } }>("pages.observe", { pageId: page.pageId });
    expect(obs.content.url).toContain("/records");
    expect(obs.content.elements.length).toBeGreaterThan(3);

    // borrowed-tab semantics: closing the Vector page must NOT close the Chrome tab
    await invoke("pages.close", { pageId: page.pageId });
    const tabsAfter = await invoke<{ targetId: string }[]>("chrome.tabs");
    expect(tabsAfter.some((t) => t.targetId === recordsTab!.targetId)).toBe(true);

    await invoke("chrome.detach");
    const ws = await invoke<{ sessions: { backend: string; status: string }[] }>("workspace.get");
    expect(ws.sessions.find((s) => s.backend === "chrome")?.status).toBe("disconnected");
  }, 90_000);
});
