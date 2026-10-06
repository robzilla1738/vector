import { createContext, runInContext } from "node:vm";
import { expect, it, vi } from "vitest";
import { AUX_WORLD_SOURCE } from "@aux/chromium-driver";

function world(controls: object[]) {
  const document = {
    readyState: "loading",
    title: "Website",
    activeElement: null,
    querySelectorAll: () => controls,
    addEventListener: vi.fn(),
  };
  const context = createContext({
    document,
    location: { href: "https://source.test/" },
    scrollX: 0,
    scrollY: 0,
    innerWidth: 800,
    innerHeight: 600,
  });
  runInContext("globalThis.top = globalThis", context);
  runInContext(AUX_WORLD_SOURCE, context);
  return () => runInContext("__aux.fingerprint()", context) as string;
}

it.each(["password", "cc-number", "one-time-code", "text"])(
  "never reads %s control values while probing the cache",
  (type) => {
    const read = vi.fn(() => {
      throw new Error("Field value must not be read by the cache probe");
    });
    const control = {
      type,
      get value() {
        return read();
      },
    };
    const fingerprint = world([control]);
    const first = fingerprint(),
      second = fingerprint();
    expect(first).not.toBe(second);
    expect(read).not.toHaveBeenCalled();
  },
);

it("keeps a control-free unchanged document cacheable", () => {
  const fingerprint = world([]);
  expect(fingerprint()).toBe(fingerprint());
});

it("invalidates ordinary silently edited form state without reading its contents", () => {
  const control = { type: "text", value: "First" };
  const fingerprint = world([control]);
  const before = fingerprint();
  control.value = "Second";
  expect(fingerprint()).not.toBe(before);
});
