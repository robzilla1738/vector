/**
 * Driver isolated world + raw CDP input against real Chromium: fast paths
 * dispatch trusted input, page scripts cannot redirect refs, blocked targets
 * fall back to Playwright's actionability, readiness counts requests from Node.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { StandaloneDriver, type PlaywrightDriverPage } from "@aux/chromium-driver";
import { findChromium } from "../../scripts/chromium.mjs";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";

let driver: StandaloneDriver;
let fixtures: ChildProcess[] = [];
let n = 0;

beforeAll(async () => {
  fixtures = await startFixturesIfNeeded();
  await waitForFixtures();
  const path = findChromium();
  if (path && !process.env.AUX_BROWSER_PATH) process.env.AUX_BROWSER_PATH = path;
  driver = new StandaloneDriver();
  await driver.connect();
}, 60_000);

afterAll(async () => {
  await driver?.disconnect();
  for (const fixture of fixtures) fixture.kill();
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

  it("observes and acts through open shadow DOM and an explicit cross-site iframe subtree", async () => {
    const dp = (await driver.attach(await driver.createTarget("about:blank"), `p${++n}`)) as PlaywrightDriverPage;
    await page(dp).goto("http://127.0.0.1:4812/");
    const shadow = await dp.observe({});
    const increment = refNamed(shadow.elements, "Increment");
    await dp.click(increment);
    expect(await page(dp).locator("shadow-counter #n").textContent()).toBe("1");

    await page(dp).locator("iframe").evaluate((iframe: HTMLIFrameElement) => {
      iframe.src = "http://localhost:4812/frame-inner";
    });
    await page(dp).frameLocator("iframe").locator("#frame-btn").waitFor();
    const cdp = await page(dp).context().newCDPSession(page(dp));
    const targets = await cdp.send("Target.getTargets");
    expect(targets.targetInfos.some((target: { type: string; url: string }) =>
      target.type === "iframe" && target.url.includes("localhost:4812/frame-inner"))).toBe(true);
    await cdp.detach();
    const defaultView = await dp.observe({});
    expect(defaultView.frames.some(frame => frame.url.includes("localhost:4812/frame-inner") && !frame.sameOrigin)).toBe(true);
    expect(defaultView.elements.some(element => element.name === "Frame button")).toBe(false);

    const child = await dp.observe({ scope: "subtree", subtreeRef: "css:iframe" });
    const input = child.elements.find(element => element.tag === "input" && element.frame !== "main");
    expect(input).toBeDefined();
    await dp.fill(input!.ref, "frame value");
    await dp.click(refNamed(child.elements, "Frame button"));
    expect(await page(dp).frameLocator("iframe").locator("#frame-out").textContent()).toBe("frame clicked: frame value");
  });

  it("keeps ID-free shadow paths distinct across sibling hosts", async () => {
    const dp = await pageWith(`<shadow-choice data-name="Alpha"></shadow-choice><shadow-choice data-name="Beta"></shadow-choice>
      <script>customElements.define('shadow-choice', class extends HTMLElement {
        connectedCallback() {
          this.attachShadow({mode:'open'}).innerHTML = '<section><button>' + this.dataset.name + '</button></section>';
          this.shadowRoot.querySelector('button').onclick = () => { this.dataset.clicked = 'yes'; };
        }
      });</script>`);
    const observed = await dp.observe({});
    await dp.click(refNamed(observed.elements, "Beta"));
    expect(await page(dp).locator('shadow-choice[data-name="Alpha"]').getAttribute("data-clicked")).toBeNull();
    expect(await page(dp).locator('shadow-choice[data-name="Beta"]').getAttribute("data-clicked")).toBe("yes");
  });

  it("targets controls with CSS punctuation and quoted test IDs", async () => {
    const dp = await pageWith(`<input id="field.name" aria-label="Dotted field"><input id="field:name" aria-label="Colon field"><input data-testid='quoted"test' aria-label="Quoted test field">`);
    const observed = await dp.observe({});
    for (const name of ["Dotted field", "Colon field", "Quoted test field"]) {
      const selector = observed.elements.find(element => element.name === name)?.selector.css;
      expect(selector).toBeDefined();
      expect(await page(dp).locator(selector!).count()).toBe(1);
    }
    await dp.fill(refNamed(observed.elements, "Dotted field"), "dot");
    await dp.fill(refNamed(observed.elements, "Colon field"), "colon");
    await dp.fill(refNamed(observed.elements, "Quoted test field"), "quote");
    expect(await page(dp).evaluate(() => [
      (document.getElementById("field.name") as HTMLInputElement).value,
      (document.getElementById("field:name") as HTMLInputElement).value,
      (document.querySelector('input[data-testid]') as HTMLInputElement).value,
    ])).toEqual(["dot", "colon", "quote"]);
  });

  it("selects, checks and uploads through observed refs on the form fixture", async () => {
    const dp = (await driver.attach(await driver.createTarget("about:blank"), `p${++n}`)) as PlaywrightDriverPage;
    await page(dp).goto("http://127.0.0.1:4811/");
    const observed = await dp.observe({});
    const dir = mkdtempSync(join(tmpdir(), "aux-form-upload-"));
    try {
      const file = join(dir, "fixture.txt");
      writeFileSync(file, "fixture upload");
      await dp.select(refNamed(observed.elements, "Role"), "Engineer");
      const emailPreference = observed.elements.find(element => element.type === "checkbox" && element.name === "Email");
      expect(emailPreference).toBeDefined();
      await dp.check(emailPreference!.ref);
      await dp.check(refNamed(observed.elements, "Pro"));
      await dp.uploadFiles(refNamed(observed.elements, "Resume (upload)"), [file]);
      expect(await page(dp).locator("#role").inputValue()).toBe("Engineer");
      expect(await page(dp).locator('input[name="pref"][value="email"]').isChecked()).toBe(true);
      expect(await page(dp).locator('input[name="plan"][value="pro"]').isChecked()).toBe(true);
      expect(await page(dp).locator("#resume").evaluate((input: HTMLInputElement) => input.files?.[0]?.name)).toBe("fixture.txt");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("accepts an armed dialog from an observed button", async () => {
    const dp = await pageWith(`<button onclick="alert('confirm fixture'); window.accepted = true">Open alert</button>`);
    const button = refNamed((await dp.observe({})).elements, "Open alert");
    await dp.handleDialog("accept");
    await dp.click(button);
    expect(await page(dp).evaluate(() => (window as unknown as { accepted?: boolean }).accepted)).toBe(true);
  });
});
