// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";

function fixture(html: string) {
  document.body.innerHTML = html;
  const locator = (selector: string) => ({
    count: async () => document.querySelectorAll(selector).length,
    filter() { return this; },
    evaluate: async <T>(fn: (element: HTMLElement) => T) => fn(document.querySelector<HTMLElement>(selector)!),
  });
  const frame = { locator, url: () => location.href };
  const page = { on() {}, mainFrame: () => frame, locator, isClosed: () => false };
  return new PlaywrightDriverPage({
    page: page as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["page"],
    context: {} as ConstructorParameters<typeof PlaywrightDriverPage>[0]["context"],
    identity: { pageId: "a", targetId: "target", backend: "aux" }, refs: new RefRegistry(),
  });
}

describe("resolved live action metadata", () => {
  it("uses the real form owner and the effective submitter overrides outside that form", async () => {
    const driver = fixture('<form id="login" method="get" action="/old"><input type="password" autocomplete="current-password"></form><button id="submit" form="login" formmethod="post" formaction="/override">Sign in</button>');
    expect(await driver.actionTarget("#submit")).toMatchObject({ name: "Sign in", type: "submit", form: {
      action: new URL("/override", location.href).href, method: "post", fields: [{ type: "password", autocomplete: "current-password" }],
    } });
  });
  it("never reads credential field values or nested field text as button captions", async () => {
    const driver = fixture('<form method="post"><input id="secret" type="password" autocomplete="current-password"><button id="submit">Sign in<textarea>synthetic secret text</textarea></button></form>');
    const secret = document.querySelector<HTMLInputElement>("#secret")!;
    Object.defineProperty(secret, "value", { get() { throw new Error("Credential value was read"); } });
    Object.defineProperty(secret, "textContent", { get() { throw new Error("Credential text was read"); } });
    const metadata = await driver.actionTarget("#submit");
    expect(metadata.name).toBe("Sign in");
    expect(JSON.stringify(metadata)).not.toContain("synthetic secret text");
    expect((await driver.actionTarget("#secret")).name).toBe("");
  });
  it("fails closed when associated form controls exceed the traversal bound", async () => {
    const driver = fixture(`<form id="login" method="post">${'<input type="text">'.repeat(129)}<button id="submit">Sign in</button></form>`);
    await expect(driver.actionTarget("#submit")).rejects.toThrow(/metadata bound/);
  });
});
