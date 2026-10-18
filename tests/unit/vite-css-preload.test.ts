// @vitest-environment jsdom
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import ts from "typescript";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

type Preload = (load: () => Promise<unknown>, dependencies: string[], importer?: string) => Promise<unknown>;

// Exercise the pinned installed producer, not a second implementation of its helper.
const require = createRequire(import.meta.url);
const packageFile = require.resolve("vite/package.json");
const packageVersion = JSON.parse(readFileSync(packageFile, "utf8")).version;
const source = readFileSync(join(dirname(packageFile), "dist/node/chunks/config.js"), "utf8");
const tree = ts.createSourceFile("config.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const producer = ["detectScriptRel", "preload", "getPreloadCode"].map((name) => {
  const declaration = tree.statements.find(
    (node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === name,
  );
  if (!declaration) throw new Error(`Pinned Vite producer ${name} is unavailable.`);
  return declaration.getText(tree);
});
const generate = new Function(
  `${producer.join("\n")}\nconst preloadMethod = "__vitePreload"; return getPreloadCode;`,
)() as (
  environment: { config: { base: string; build: { modulePreload: { polyfill: boolean } } } },
  renderBuiltUrl: boolean,
  relativeBase: boolean,
) => string;

function helper(relative = false): Preload {
  expect(packageVersion).toBe("7.3.6");
  const generated = generate(
    { config: { base: "/", build: { modulePreload: { polyfill: true } } } },
    false,
    relative,
  );
  expect(generated.match(/export const __vitePreload/g)).toHaveLength(1);
  return new Function(
    `const __VITE_IS_MODERN__ = true; ${generated.replace("export const __vitePreload", "const __vitePreload")}; return __vitePreload;`,
  )() as Preload;
}

const cssLinks = () => [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
});
afterEach(() => vi.restoreAllMocks());

it("refuses a failed CSS attempt, then awaits a fresh explicit retry before importing", async () => {
  const preload = helper(),
    load = vi.fn(async () => "module");
  const failed = preload(load, ["surface.css"]);
  const first = cssLinks()[0]!;
  first.dispatchEvent(new Event("error"));
  await expect(failed).rejects.toThrow("Unable to preload CSS for /surface.css");
  expect(first.isConnected).toBe(false);
  expect(load).not.toHaveBeenCalled();
  const retry = preload(load, ["surface.css"]);
  const second = cssLinks()[0]!;
  expect(second).not.toBe(first);
  await tick();
  expect(load).not.toHaveBeenCalled();
  second.dispatchEvent(new Event("load"));
  await expect(retry).resolves.toBe("module");
  expect(load).toHaveBeenCalledOnce();
});

it("shares pending CSS across concurrent imports and retains the successful cache", async () => {
  const preload = helper(),
    first = vi.fn(async () => "first"),
    second = vi.fn(async () => "second");
  const one = preload(first, ["shared.css"]),
    two = preload(second, ["shared.css"]);
  expect(cssLinks()).toHaveLength(1);
  await tick();
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
  cssLinks()[0]!.dispatchEvent(new Event("load"));
  await expect(Promise.all([one, two])).resolves.toEqual(["first", "second"]);
  await expect(preload(first, ["shared.css"])).resolves.toBe("first");
  expect(cssLinks()).toHaveLength(1);
});

it("rejects every concurrent waiter and ignores late events from the retired link", async () => {
  const preload = helper(),
    load = vi.fn(async () => "module");
  const one = preload(load, ["shared.css"]),
    two = preload(load, ["shared.css"]);
  const rejected = Promise.allSettled([one, two]);
  const first = cssLinks()[0]!;
  first.dispatchEvent(new Event("error"));
  expect((await rejected).map((result) => result.status)).toEqual(["rejected", "rejected"]);
  const retry = preload(load, ["shared.css"]);
  const second = cssLinks()[0]!;
  first.dispatchEvent(new Event("load"));
  first.dispatchEvent(new Event("error"));
  await tick();
  expect(load).not.toHaveBeenCalled();
  expect(second.isConnected).toBe(true);
  second.dispatchEvent(new Event("load"));
  await retry;
  expect(load).toHaveBeenCalledOnce();
});

it("publishes the pending promise before a synchronous insertion load and reentrant import", async () => {
  const preload = helper(),
    first = vi.fn(async () => "first"),
    second = vi.fn(async () => "second");
  let concurrent: Promise<unknown> | undefined;
  const append = document.head.appendChild.bind(document.head);
  vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
    const result = append(node);
    concurrent = preload(second, ["sync.css"]);
    (node as HTMLLinkElement).dispatchEvent(new Event("load"));
    return result;
  });
  await expect(preload(first, ["sync.css"])).resolves.toBe("first");
  await expect(concurrent).resolves.toBe("second");
  expect(cssLinks()).toHaveLength(1);
});

it("retires a synchronously failed insertion without stranding a rejected cache", async () => {
  const preload = helper(),
    load = vi.fn(async () => "module"),
    failure = new Error("Stylesheet insertion failed");
  const spy = vi.spyOn(document.head, "appendChild").mockImplementationOnce(() => {
    throw failure;
  });
  await expect(preload(load, ["surface.css"])).rejects.toBe(failure);
  expect(cssLinks()).toHaveLength(0);
  spy.mockRestore();
  const retry = preload(load, ["surface.css"]);
  await tick();
  expect(load).not.toHaveBeenCalled();
  cssLinks()[0]!.dispatchEvent(new Event("load"));
  await retry;
});

it("handles synchronous CSS errors and does not delete a replacement attempt on late events", async () => {
  const preload = helper(),
    load = vi.fn(async () => "module");
  const append = document.head.appendChild.bind(document.head);
  vi.spyOn(document.head, "appendChild").mockImplementationOnce((node) => {
    const result = append(node);
    node.dispatchEvent(new Event("error"));
    return result;
  });
  await expect(preload(load, ["surface.css"])).rejects.toThrow("Unable to preload CSS");
  expect(cssLinks()).toHaveLength(0);
  const retry = preload(load, ["surface.css"]);
  cssLinks()[0]!.dispatchEvent(new Event("load"));
  await retry;
  expect(load).toHaveBeenCalledOnce();
});

it("does not adopt or remove preexisting stylesheet links or unrelated owned styles", async () => {
  const existing = document.createElement("link");
  existing.rel = "stylesheet";
  existing.href = "/existing.css";
  document.head.appendChild(existing);
  const preload = helper();
  await expect(preload(async () => "existing", ["existing.css"])).resolves.toBe("existing");
  const failed = preload(async () => "failed", ["failed.css"]);
  cssLinks()
    .find((link) => link !== existing)!
    .dispatchEvent(new Event("error"));
  await expect(failed).rejects.toThrow("Unable to preload CSS");
  expect(cssLinks()).toEqual([existing]);
});

it("preserves CSP nonce, cross-origin attributes and relative importer URL resolution", async () => {
  const nonce = document.createElement("meta");
  nonce.setAttribute("property", "csp-nonce");
  nonce.setAttribute("nonce", "original-nonce");
  document.head.appendChild(nonce);
  const preload = helper(true);
  const pending = preload(async () => "module", ["./surface.css"], "https://aux.invalid/chunks/entry.js");
  const link = cssLinks()[0]!;
  expect(link.href).toBe("https://aux.invalid/chunks/surface.css");
  expect(link.crossOrigin).toBe("");
  expect(link.getAttribute("nonce")).toBe("original-nonce");
  link.dispatchEvent(new Event("load"));
  await pending;
});

it("preserves direct JavaScript preload behavior without waiting on link events", async () => {
  const preload = helper(),
    load = vi.fn(async () => "module");
  await expect(preload(load, ["script.js"])).resolves.toBe("module");
  const link = document.querySelector<HTMLLinkElement>('link[rel="modulepreload"]')!;
  expect(link.getAttribute("href")).toBe("/script.js");
  expect(link.as).toBe("script");
  expect(link.crossOrigin).toBe("");
  await preload(load, ["script.js"]);
  expect(document.querySelectorAll('link[rel="modulepreload"]')).toHaveLength(1);
});

it("preserves preventDefault preloadError semantics and original module errors", async () => {
  const preload = helper();
  const prevented = (event: Event) => event.preventDefault();
  window.addEventListener("vite:preloadError", prevented);
  try {
    const pending = preload(async () => "accepted by existing event policy", ["failed.css"]);
    cssLinks()[0]!.dispatchEvent(new Event("error"));
    await expect(pending).resolves.toBe("accepted by existing event policy");
    expect(cssLinks()).toHaveLength(0);
  } finally {
    window.removeEventListener("vite:preloadError", prevented);
  }
  const failure = new Error("Original module failure");
  await expect(
    preload(async () => {
      throw failure;
    }, []),
  ).rejects.toBe(failure);
});
