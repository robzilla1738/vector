import { describe, expect, it } from "vitest";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(count: () => Promise<number> = async () => 1) {
  const evaluation = deferred<unknown>(),
    clicked = deferred<void>();
  let clicks = 0,
    evaluations = 0;
  const locator = {
    count,
    click: async () => {
      clicks++;
      clicked.resolve();
    },
    filter() {
      return this;
    },
  };
  const frame = { locator: () => locator, url: () => "https://input.test/" };
  const page = {
    on() {},
    mainFrame: () => frame,
    frames: () => [frame],
    isClosed: () => false,
    evaluate: async () => {
      evaluations++;
      return evaluation.promise;
    },
  };
  const driver = new PlaywrightDriverPage({
    page: page as never,
    context: {} as never,
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    refs: new RefRegistry(),
  });
  return {
    driver,
    evaluation,
    clicked: clicked.promise,
    clicks: () => clicks,
    evaluations: () => evaluations,
  };
}

describe("native click completion ownership", () => {
  it("dispatches once and never enters the held heuristic evaluation for a governed click", async () => {
    const f = fixture();
    await f.driver.click("#submit", "left", 1000, { signal: new AbortController().signal });
    expect(f.clicks()).toBe(1);
    expect(f.evaluations()).toBe(0);
  });
  it("preserves heuristic navigation settlement for an ordinary click", async () => {
    const f = fixture();
    let settled = false;
    const pending = f.driver.click("#submit").then(() => {
      settled = true;
    });
    await f.clicked;
    await Promise.resolve();
    expect(settled).toBe(false);
    f.evaluation.resolve(undefined);
    await pending;
    expect(f.clicks()).toBe(1);
    expect(f.evaluations()).toBe(1);
  });
  it("does not dispatch after cancellation while the original target is resolving", async () => {
    const found = deferred<number>(),
      entered = deferred<void>(),
      controller = new AbortController();
    const f = fixture(async () => {
      entered.resolve();
      return found.promise;
    });
    const pending = f.driver.click("#submit", "left", 1000, { signal: controller.signal });
    const rejected = expect(pending).rejects.toMatchObject({ code: "cancelled" });
    await entered.promise;
    controller.abort();
    found.resolve(1);
    await rejected;
    expect(f.clicks()).toBe(0);
    expect(f.evaluations()).toBe(0);
  });
});
