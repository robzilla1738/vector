import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";

function fixture(
  options: {
    replace?: boolean;
    noLoader?: boolean;
    wrongFrame?: boolean;
    replaceAfterTree?: boolean;
    replaceDuringDetach?: boolean;
    hangCommand?: boolean;
    overflow?: boolean;
  } = {},
) {
  const frame = { url: () => "https://example.test/next" };
  const page = Object.assign(new EventEmitter(), {
    mainFrame: () => frame,
    isClosed: () => false,
    url: frame.url,
    waitForLoadState: vi.fn(async () => {}),
  });
  const session = Object.assign(new EventEmitter(), {
    detach: vi.fn(async () => {
      if (options.replaceDuringDetach) {
        page.emit("framenavigated", frame);
        session.emit("Page.frameNavigated", {
          frame: { id: "main", loaderId: "human-loader", url: frame.url() },
        });
      }
    }),
    send: vi.fn(async (method: string) => {
      if (method === "Page.navigate") {
        if (options.hangCommand) await new Promise(() => {});
        if (options.overflow)
          for (let index = 0; index < 9; index++)
            session.emit("Page.frameNavigated", {
              frame: { id: "main", loaderId: `early-${index}`, url: frame.url() },
            });
        page.emit("framenavigated", frame);
        // Deliberately before the ack to exercise the real producer's event buffer.
        session.emit("Page.frameNavigated", {
          frame: { id: options.wrongFrame ? "other" : "main", loaderId: "command-loader", url: frame.url() },
        });
        return { frameId: "main", ...(options.noLoader ? {} : { loaderId: "command-loader" }) };
      }
      if (method === "Page.getFrameTree") {
        const tree = {
          frameTree: {
            frame: {
              id: "main",
              loaderId: options.replace ? "human-loader" : "command-loader",
              url: frame.url(),
            },
          },
        };
        if (options.replaceAfterTree)
          queueMicrotask(() => {
            page.emit("framenavigated", frame);
            session.emit("Page.frameNavigated", {
              frame: { id: "main", loaderId: "human-loader", url: frame.url() },
            });
          });
        return tree;
      }
      return {};
    }),
  });
  let attaches = 0;
  const context = {
    newCDPSession: async () => {
      if (++attaches === 1) throw new Error("No isolated world in this structural fixture");
      return session;
    },
  };
  const driver = new PlaywrightDriverPage({
    page: page as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["page"],
    context: context as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["context"],
    identity: { pageId: "a", targetId: "target", backend: "aux" },
    refs: new RefRegistry(),
  });
  return { driver, session };
}

describe("command-owned navigation receipts", () => {
  it("accepts a matching loader commit that arrives before the command acknowledgement", async () => {
    const f = fixture();
    await expect(f.driver.navigateWithReceipt("https://example.test/next")).resolves.toEqual({
      url: "https://example.test/next",
      documentEpoch: 1,
      loaderId: "command-loader",
    });
    expect(f.session.send).toHaveBeenCalledWith("Page.navigate", { url: "https://example.test/next" });
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
  it("rejects a human replacement even when its URL matches the commanded destination", async () => {
    const f = fixture({ replace: true });
    await expect(f.driver.navigateWithReceipt("https://example.test/next")).rejects.toThrow(/replaced/);
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
  it("does not mint a receipt for same-document/no-loader navigation", async () => {
    const f = fixture({ noLoader: true });
    await expect(f.driver.navigateWithReceipt("https://example.test/next#same")).rejects.toThrow(
      /loader receipt/,
    );
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
  it("refuses a command commit for another frame and closes the session", async () => {
    const f = fixture({ wrongFrame: true });
    await expect(f.driver.navigateWithReceipt("https://example.test/next", 5)).rejects.toMatchObject({
      code: "ref_stale",
    });
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
  it.each(["replaceAfterTree", "replaceDuringDetach"] as const)(
    "rejects same-URL replacement at %s instead of borrowing its new epoch",
    async (option) => {
      const f = fixture({ [option]: true });
      await expect(f.driver.navigateWithReceipt("https://example.test/next")).rejects.toThrow(
        /replaced|changed/,
      );
      expect(f.session.detach).toHaveBeenCalledOnce();
    },
  );
  it("bounds an unanswered navigation command and still closes the session", async () => {
    const f = fixture({ hangCommand: true });
    await expect(f.driver.navigateWithReceipt("https://example.test/next", 5)).rejects.toThrow(/deadline/);
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
  it("fails closed when early commits overflow the bounded loader buffer", async () => {
    const f = fixture({ overflow: true });
    await expect(f.driver.navigateWithReceipt("https://example.test/next")).rejects.toThrow(/Too many/);
    expect(f.session.detach).toHaveBeenCalledOnce();
  });
});
