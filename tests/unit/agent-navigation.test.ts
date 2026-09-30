import { describe, expect, it } from "vitest";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";

function driver(page: object) {
  return new PlaywrightDriverPage({
    page: {
      on: () => {},
      addInitScript: async () => {},
      ...page,
    } as never,
    context: {} as never,
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    refs: new RefRegistry(),
  });
}

describe("agent page driver", () => {
  it("returns from navigation at DOMContentLoaded without a settle probe", async () => {
    const calls: string[] = [];
    const page = {
      goto: async (_url: string, opts?: { waitUntil?: string }) => {
        calls.push(`goto:${opts?.waitUntil}`);
        return null;
      },
      goBack: async (_opts?: { waitUntil?: string }) => {
        calls.push("back");
        return {};
      },
      goForward: async () => {
        calls.push("forward");
        return {};
      },
      reload: async (_opts?: { waitUntil?: string }) => {
        calls.push(`reload`);
        return null;
      },
      evaluate: async (fn: unknown) => {
        // the readiness tracker is installed into the attached document; only a settle probe counts
        if (typeof fn !== "string") calls.push("settle");
        return true;
      },
      url: () => "https://example.test/",
      isClosed: () => false,
    };
    const subject = driver(page);
    await subject.navigate("https://example.test/next");
    await subject.back();
    await subject.forward();
    await subject.reload();
    expect(calls).toEqual(["goto:domcontentloaded", "back", "forward", "reload"]);
  });

  it("keeps a condition wait open when navigation interrupts the locator", async () => {
    let calls = 0;
    let release: () => void = () => {};
    const waiting = new Promise<void>((resolve) => { release = resolve; });
    const subject = driver({
      isClosed: () => false,
      locator: () => ({
        first: () => ({
          waitFor: async () => {
            calls += 1;
            if (calls === 1) throw new Error('Navigation to "https://start.example/" is interrupted by another navigation to "https://example.com/next"');
            await waiting;
          },
        }),
      }),
    });
    let settled = false;
    const pending = subject.waitFor({
      kind: "selector", selector: "#absent", state: "visible", timeoutMs: 2_000,
    }).finally(() => { settled = true; });
    const deadline = Date.now() + 1_000;
    while (calls < 2 && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 10));
    expect(calls).toBe(2);
    expect(settled).toBe(false);
    release();
    await expect(pending).resolves.toEqual({ ok: true, timedOut: false });
  });

  it("does not retry a condition wait after the page closes", async () => {
    let calls = 0;
    const subject = driver({
      isClosed: () => false,
      locator: () => ({
        first: () => ({
          waitFor: async () => {
            calls += 1;
            throw new Error("Target page, context or browser has been closed");
          },
        }),
      }),
    });
    const result = await subject.waitFor({ kind: "selector", selector: "#absent", state: "visible", timeoutMs: 2_000 });
    expect(calls).toBe(1);
    expect(result).toMatchObject({ ok: false, timedOut: false });
  });

  it("stops retrying a navigation interrupt at the condition deadline", async () => {
    let calls = 0;
    const subject = driver({
      isClosed: () => false,
      locator: () => ({
        first: () => ({
          waitFor: async () => {
            calls += 1;
            throw new Error("Execution context was destroyed, most likely because of a navigation");
          },
        }),
      }),
    });
    const started = Date.now();
    const result = await subject.waitFor({ kind: "selector", selector: "#absent", state: "visible", timeoutMs: 80 });
    expect(calls).toBeGreaterThan(1);
    expect(Date.now() - started).toBeLessThan(1_000);
    expect(result).toMatchObject({ ok: false, timedOut: true });
  });

  it("observes a page that is not focused or brought forward", async () => {
    const calls: string[] = [];
    const seen = {
      nextRef: 2,
      elementsTotal: 0,
      truncated: false,
      viewport: { width: 800, height: 600, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      text: "hidden page",
      headings: [],
      title: "Hidden",
      elements: [],
      formFields: [],
      tables: [],
      links: [],
    };
    const frame = {
      url: () => "https://example.test/",
      name: () => "",
      evaluate: async () => seen,
    };
    const subject = driver({
      url: () => "https://example.test/",
      isClosed: () => false,
      mainFrame: () => frame,
      frames: () => [frame],
      bringToFront: async () => {
        calls.push("front");
      },
      focus: async () => {
        calls.push("focus");
      },
      title: async () => {
        calls.push("title");
        return "Hidden";
      },
    });
    const obs = await subject.observe({});
    expect(obs.url).toBe("https://example.test/");
    expect(obs.text).toBe("hidden page");
    expect(obs.title).toBe("Hidden");
    expect(calls).toEqual([]);
  });
});
