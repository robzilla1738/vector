/**
 * Driver isolated world + raw CDP input against real Chromium: fast paths
 * dispatch trusted input, page scripts cannot redirect refs, blocked targets
 * fall back to Playwright's actionability, readiness counts requests from Node.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { StandaloneDriver, type PlaywrightDriverPage } from "@aux/chromium-driver";
import { findChromium } from "../../scripts/chromium.mjs";

let driver: StandaloneDriver;
let n = 0;

beforeAll(async () => {
  const path = findChromium();
  if (path && !process.env.AUX_BROWSER_PATH) process.env.AUX_BROWSER_PATH = path;
  driver = new StandaloneDriver();
  await driver.connect();
}, 60_000);

afterAll(async () => {
  await driver?.disconnect();
});

async function pageWith(html: string) {
  const dp = (await driver.attach(await driver.createTarget("about:blank"), `p${++n}`)) as PlaywrightDriverPage;
  await dp.rawPage().setContent(html);
  return dp;
}
const refNamed = (els: { ref: string; name?: string; tag: string }[], name: string) => els.find((e) => e.name === name)!.ref;
const page = (dp: PlaywrightDriverPage) => dp.rawPage();

describe("aux isolated world", () => {
  it("clicks and fills with trusted events and keeps refs stable across observations", async () => {
    const dp = await pageWith(`<button id="b" onclick="window.log.push('click:' + event.isTrusted)">Go</button>
      <input id="t" aria-label="Title" oninput="window.log.push('input:' + event.isTrusted + ':' + this.value)">
      <script>window.log = []</script>`);
    const first = await dp.observe({});
    const go = refNamed(first.elements, "Go");
    const title = refNamed(first.elements, "Title");
    await dp.click(go);
    await dp.fill(title, "hello");
    await dp.fill(title, "");
    expect(await page(dp).evaluate(() => (window as unknown as { log: string[] }).log)).toEqual(["click:true", "input:true:hello", "input:true:"]);
    await page(dp).evaluate(() => document.body.insertAdjacentHTML("afterbegin", "<button>New</button>"));
    const second = await dp.observe({});
    expect(refNamed(second.elements, "Go")).toBe(go);
    expect(refNamed(second.elements, "Title")).toBe(title);
    expect([go, title]).not.toContain(refNamed(second.elements, "New"));
  });

  it("ignores page-world tampering with the ref map", async () => {
    const dp = await pageWith(`<button onclick="window.hit='real'">Real</button><button onclick="window.hit='decoy'">Decoy</button>`);
    const obs = await dp.observe({});
    const real = refNamed(obs.elements, "Real");
    await page(dp).evaluate(([ref]) => {
      const decoy = document.querySelectorAll("button")[1];
      const g = globalThis as unknown as Record<string, unknown>;
      g.__auxStore = { ids: new WeakMap(), refs: new Map([[ref, decoy]]), next: 1 };
      g.__aux = { point: () => [0, 0] };
    }, [real]);
    await dp.click(real);
    expect(await page(dp).evaluate(() => (window as unknown as { hit: string }).hit)).toBe("real");
    expect(await page(dp).evaluate(() => typeof fetch.toString === "function" && fetch.toString().includes("[native code]"))).toBe(true);
  });

  it("falls back to Playwright's actionability wait for an occluded target", async () => {
    const dp = await pageWith(`<button onclick="window.hit=1">Under</button>
      <div id="cover" style="position:fixed;inset:0;background:#fff"></div>`);
    const under = refNamed((await dp.observe({})).elements, "Under");
    await expect(dp.click(under, "left", 400)).rejects.toThrow(/intercepts pointer events|Timeout/i);
    await page(dp).evaluate(() => document.getElementById("cover")!.remove());
    await dp.click(under);
    expect(await page(dp).evaluate(() => (window as unknown as { hit?: number }).hit)).toBe(1);
  });

  it("scrolls an offscreen target into view before clicking", async () => {
    const dp = await pageWith(`<div style="height:3000px"></div><button onclick="window.hit=scrollY">Far</button>`);
    const far = refNamed((await dp.observe({ maxElements: 10 })).elements, "Far");
    await dp.click(far);
    expect(await page(dp).evaluate(() => (window as unknown as { hit?: number }).hit)).toBeGreaterThan(1000);
  });

  it("waits for in-flight fetches before reporting settled", async () => {
    const dp = await pageWith("<p>idle</p>");
    await page(dp).route("**/slow", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ body: "done" });
    });
    await page(dp).goto("data:text/html,<p>x</p>").catch(() => {});
    await page(dp).setContent("<p id=s>waiting</p>");
    await page(dp).evaluate(() => { void fetch("https://aux.test/slow").then((r) => r.text()).then((t) => { document.getElementById("s")!.textContent = t; }); });
    const t0 = Date.now();
    expect(await dp.waitForSettled(3_000)).toBe(true);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(250);
    expect(await page(dp).textContent("#s")).toBe("done");
  });

  it("fingerprint changes on a text-only mutation", async () => {
    const dp = await pageWith("<p id=p>one</p>");
    const a = await dp.observeFingerprint();
    expect(await dp.observeFingerprint()).toBe(a);
    await page(dp).evaluate(() => { document.getElementById("p")!.firstChild!.nodeValue = "two"; });
    expect(await dp.observeFingerprint()).not.toBe(a);
  });
});
