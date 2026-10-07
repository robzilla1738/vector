// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";

function fixture(html: string) {
  document.body.innerHTML = html;
  let frame: object;
  const nodes = new Map<string, HTMLElement>();
  const identities = new WeakMap<Element, number>();
  let sequence = 0;
  const handle = (element: HTMLElement) => ({
    evaluate: async <T>(fn: (element: HTMLElement) => T) => fn(element),
    ownerFrame: async () => frame,
    dispose: async () => {},
    click: async () => {
      if (!element.isConnected) throw new Error("Pinned element detached");
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    },
  });
  const locator = (selector: string) => ({
    count: async () => document.querySelectorAll(selector).length,
    filter() {
      return this;
    },
    elementHandle: async () => handle(document.querySelector<HTMLElement>(selector)!),
  });
  frame = { locator, url: () => location.href, parentFrame: () => null };
  const page = { on() {}, mainFrame: () => frame, locator, isClosed: () => false };
  const context = {
    newCDPSession: async () => ({
      detach: async () => {},
      send: async (method: string, args: Record<string, any> = {}) => {
        if (method === "Page.getFrameTree") return { frameTree: { frame: { id: "main" } } };
        if (method === "Page.createIsolatedWorld") return { executionContextId: 1 };
        if (method === "Runtime.evaluate") {
          const element = window.eval(args.expression) as HTMLElement;
          const objectId = `node-${++sequence}`;
          nodes.set(objectId, element);
          return { result: { objectId } };
        }
        if (method === "DOM.describeNode") {
          const element = nodes.get(args.objectId)!;
          if (!identities.has(element)) identities.set(element, ++sequence);
          return { node: { backendNodeId: identities.get(element) } };
        }
        if (method === "Runtime.callFunctionOn") {
          const fn = window.eval(`(${args.functionDeclaration})`);
          return {
            result: {
              value: fn.apply(
                nodes.get(args.objectId),
                (args.arguments ?? []).map((arg: any) =>
                  arg.objectId ? nodes.get(arg.objectId) : arg.value,
                ),
              ),
            },
          };
        }
        if (method === "Runtime.releaseObject") {
          nodes.delete(args.objectId);
          return {};
        }
        throw new Error(`Unexpected CDP method ${method}`);
      },
    }),
  };
  return new PlaywrightDriverPage({
    page: page as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["page"],
    context: context as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["context"],
    identity: { pageId: "a", targetId: "target", backend: "aux" },
    refs: new RefRegistry(),
  });
}

describe("resolved live action metadata", () => {
  it("uses the real form owner and the effective submitter overrides outside that form", async () => {
    const driver = fixture(
      '<form id="login" method="get" action="/old"><input type="password" autocomplete="current-password"></form><button id="submit" form="login" formmethod="post" formaction="/override">Sign in</button>',
    );
    expect(await driver.actionTarget("#submit")).toMatchObject({
      name: "Sign in",
      type: "submit",
      form: {
        action: new URL("/override", location.href).href,
        method: "post",
        fields: [{ type: "password", autocomplete: "current-password" }],
      },
    });
  });
  it("never reads credential field values or nested field text as button captions", async () => {
    const driver = fixture(
      '<form method="post"><input id="secret" type="password" autocomplete="current-password"><button id="submit">Sign in<textarea>synthetic secret text</textarea></button></form>',
    );
    const secret = document.querySelector<HTMLInputElement>("#secret")!;
    Object.defineProperty(secret, "value", {
      get() {
        throw new Error("Credential value was read");
      },
    });
    Object.defineProperty(secret, "textContent", {
      get() {
        throw new Error("Credential text was read");
      },
    });
    const metadata = await driver.actionTarget("#submit");
    expect(metadata.name).toBe("Sign in");
    expect(JSON.stringify(metadata)).not.toContain("synthetic secret text");
    expect((await driver.actionTarget("#secret")).name).toBe("");
  });
  it("fails closed when associated form controls exceed the traversal bound", async () => {
    const driver = fixture(
      `<form id="login" method="post">${'<input type="text">'.repeat(129)}<button id="submit">Sign in</button></form>`,
    );
    await expect(driver.actionTarget("#submit")).rejects.toThrow(/metadata bound/);
  });
});

it("binds a same-node href change while exposing only its safe destination origin", async () => {
  const driver = fixture(
    '<a id="link" href="https://example.test/first?token=synthetic-secret">Open record</a>',
  );
  const before = await driver.actionTarget("#link");
  expect(before).toMatchObject({ name: "Open record", destination: "https://example.test" });
  expect(JSON.stringify(before)).not.toContain("synthetic-secret");
  document.querySelector<HTMLAnchorElement>("#link")!.href =
    "https://example.test/second?token=another-secret";
  const after = await driver.actionTarget("#link");
  expect(after.nodeIdentity).toBe(before.nodeIdentity);
  expect(after.stateDigest).not.toBe(before.stateDigest);
});

it("revalidates an awaited target and dispatches only the admitted node", async () => {
  const driver = fixture('<a id="link" href="https://example.test/first">Open</a>');
  const proof = await driver.actionTarget("#link");
  document.querySelector<HTMLAnchorElement>("#link")!.href = "https://example.test/changed";
  let dispatched = false;
  await expect(
    driver.withActionTarget("#link", proof, async () => {
      dispatched = true;
    }),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(dispatched).toBe(false);
  const fresh = await driver.actionTarget("#link");
  let replacementClicked = false;
  await expect(
    driver.withActionTarget("#link", fresh, async () => {
      const replacement = document.createElement("a");
      replacement.id = "link";
      replacement.href = "https://example.test/changed";
      replacement.addEventListener("click", () => {
        replacementClicked = true;
      });
      document.querySelector("#link")!.replaceWith(replacement);
      await driver.click("#link");
    }),
  ).rejects.toThrow(/detached/);
  expect(replacementClicked).toBe(false);
});
