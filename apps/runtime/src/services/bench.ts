import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { platform, release, arch, totalmem } from "node:os";
import { join } from "node:path";
import type { PageService } from "./pages.js";

function pkgVersion(name: string): string {
  try {
    const req = createRequire(import.meta.url);
    const p = req(`${name}/package.json`) as { version?: string };
    return p.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Local benchmark harness: measures observation build and local dispatch
 * times against a fixture URL, writes a JSON report to benchmarks/.
 */
export async function runBench(opts: {
  pages: PageService;
  url: string;
  repeats: number;
  dir: string;
}): Promise<{ reportPath: string; summary: Record<string, unknown> }> {
  const { pages, url, repeats, dir } = opts;
  const page = await pages.open({ url, backend: "vector", background: true, ownedByRuntime: true });
  const obsTimes: number[] = [];
  const execTimes: number[] = [];
  let chromiumVersion: string | undefined;
  try {
    const ua = await pages
      .execute({ pageId: page.pageId, steps: [{ id: "ua", op: "evaluate", expression: "navigator.userAgent" }] }, { allowEval: true })
      .then((r) => {
        const d = r.steps[0]?.detail;
        try { return d ? String(JSON.parse(d)) : ""; } catch { return String(d ?? ""); }
      })
      .catch(() => "");
    chromiumVersion = ua.match(/Chrome\/[\d.]+/)?.[0]?.replace("Chrome/", "");
    for (let i = 0; i < repeats; i++) {
      let t = Date.now();
      const obs = await pages.observe(page.pageId, {});
      obsTimes.push(Date.now() - t);
      // find a clickable ref to time dispatch
      const btn = obs.content.elements.find((e) => e.role === "button" || e.role === "link");
      if (btn) {
        t = Date.now();
        await pages.execute(
          { pageId: page.pageId, steps: [{ id: "b1", op: "hover", target: btn.ref }] },
          {},
        );
        execTimes.push(Date.now() - t);
      }
    }
  } finally {
    await pages.close(page.pageId).catch(() => {});
  }
  const stats = (xs: number[]) => ({
    n: xs.length,
    mean: xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : 0,
    p95: xs.length ? xs.slice().sort((a, b) => a - b)[Math.floor(xs.length * 0.95)]! : 0,
    min: xs.length ? Math.min(...xs) : 0,
    max: xs.length ? Math.max(...xs) : 0,
  });
  const report = {
    at: new Date().toISOString(),
    url,
    repeats,
    observation: stats(obsTimes),
    dispatch: stats(execTimes),
    versions: {
      node: process.version,
      os: `${platform()} ${release()} ${arch()}`,
      memoryMb: Math.round(totalmem() / 1048576),
      electron: process.env.VECTOR_ELECTRON_VERSION ?? "unknown",
      playwright: pkgVersion("playwright-core"),
      aiSdk: pkgVersion("ai"),
      chromium: chromiumVersion ?? "unknown",
    },
  };
  mkdirSync(dir, { recursive: true });
  const reportPath = join(dir, `bench-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return { reportPath, summary: report };
}
