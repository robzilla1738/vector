import { afterEach, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
const native = vi.hoisted(() => ({ listeners: new Map<string, Function>(), handlers: new Map<string, Function>() }));
vi.mock("../../apps/desktop/node_modules/electron", () => ({
  app: { on: (name: string, listener: Function) => native.listeners.set(name, listener) },
  ipcMain: { handle: (name: string, handler: Function) => native.handlers.set(name, handler) },
}));
import { installHttpAuth } from "../../apps/desktop/main/http-auth.js";
afterEach(() => { native.listeners.get("before-quit")?.(); native.listeners.clear(); native.handlers.clear(); });
function setup() {
  let owner = "first";
  const page = Object.assign(new EventEmitter(), { isDestroyed: () => false });
  installHttpAuth({ owner: () => owner, requireShell: event => (event as unknown as { owner: string }).owner, changed: vi.fn() });
  const callback = vi.fn();
  native.listeners.get("login")!({ preventDefault: vi.fn() }, page, { url: "https://example.test/private", firstAuthAttempt: true }, { isProxy: false, realm: "Restricted" }, callback);
  const list = (window = owner) => native.handlers.get("ui.httpAuthRequests")!({ owner: window });
  const respond = (id: string, credentials: unknown, window = owner) => native.handlers.get("ui.respondHttpAuth")!({ owner: window }, id, credentials);
  return { page, callback, list, respond, move: () => { owner = "second"; } };
}
it("scopes authentication to the owning window and follows transferred tabs", () => {
  const auth = setup(), prompt = auth.list()[0];
  expect(auth.list("second")).toEqual([]);
  expect(() => auth.respond(prompt.id, null, "second")).toThrow("ended");
  auth.move();
  expect(auth.list("first")).toEqual([]);
  expect(auth.list("second")).toEqual([prompt]);
  expect(prompt).toEqual({ id: expect.any(String), origin: "https://example.test", proxy: false, realm: "Restricted", retry: false });
  auth.respond(prompt.id, { username: "person", password: "secret" });
  expect(auth.callback).toHaveBeenCalledWith("person", "secret");
  expect(auth.list()).toEqual([]);
  expect(() => auth.respond(prompt.id, null)).toThrow("ended");
});
it("keeps same-document navigation and cancels on a changed document", () => {
  const auth = setup();
  auth.page.emit("did-start-navigation", {}, "https://example.test/#section", true, true);
  expect(auth.list()).toHaveLength(1);
  auth.page.emit("did-start-navigation", {}, "https://elsewhere.test", false, true);
  expect(auth.list()).toEqual([]);
  expect(auth.callback).toHaveBeenCalledExactlyOnceWith();
  expect(auth.page.listenerCount("destroyed")).toBe(0);
});
it("cancels destroyed pages without retaining credentials or listeners", () => {
  const auth = setup();
  auth.page.emit("destroyed");
  expect(auth.callback).toHaveBeenCalledExactlyOnceWith();
  expect(auth.list()).toEqual([]);
  expect(auth.page.listenerCount("did-start-navigation")).toBe(0);
});
