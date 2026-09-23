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
      evaluate: async () => {
        calls.push("settle");
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
