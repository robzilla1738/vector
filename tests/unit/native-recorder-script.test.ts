import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { RECORDER_SOURCE } from "@aux/chromium-driver";

const header = readFileSync(new URL("../../.native/chrome/common/native_recorder_script.h", import.meta.url), "utf8");
function script(name: string) {
  const source = new RegExp(`k${name}\\[\\] = uR"AUX_REC\\(([\\s\\S]*?)\\)AUX_REC";`).exec(header);
  if (!source) throw new Error(`Missing fixed generated ${name}`);
  return source[1]!;
}
function page() {
  class Element {
    tagName = "INPUT";
    type = "text";
    autocomplete = "";
    id = "company";
    name = "company";
    labels = [{ textContent: "Company" }];
    textContent = "";
    value = "Synthetic company";
    getAttribute(name: string) { return name === "aria-label" ? "Company" : null; }
    closest() { return this; }
  }
  const input = new Element();
  const listeners = new Map<string, (event: unknown) => void>();
  const context = { Element, CSS: { escape: (value: string) => value },
    document: { querySelectorAll: () => [input],
      addEventListener: (event: string, listener: (event: unknown) => void) => { listeners.set(event, listener); },
      removeEventListener: (event: string) => { listeners.delete(event); },
    },
  };
  runInNewContext(script("Begin"), context)("original-token");
  return { input, listeners, context };
}

it("generates native fixed scripts from the original single recorder producer", () => {
  expect(header).toContain(createHash("sha256").update(RECORDER_SOURCE).digest("hex"));
  expect(script("Begin")).toContain(RECORDER_SOURCE);
  expect(script("Drain")).not.toContain("eval(");
  expect(script("Stop")).not.toContain("eval(");
});
it("takes genuine trusted synthetic steps once and ignores programmatic events", () => {
  const f = page();
  f.listeners.get("input")!({ isTrusted: false, target: f.input });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toMatchObject({ events: [], overflow: false });
  f.listeners.get("input")!({ isTrusted: true, target: f.input });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toMatchObject({ events: [{ kind: "input", value: "Synthetic company" }], overflow: false });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toMatchObject({ events: [], overflow: false });
  runInNewContext(script("Stop"), f.context)("original-token"); expect(f.listeners.size).toBe(0);
});
it("classifies synthetic secret controls before any value access", () => {
  const f = page(); f.input.type = "password";
  Object.defineProperty(f.input, "value", { get: () => { throw new Error("Synthetic forbidden value access"); } });
  f.listeners.get("input")!({ isTrusted: true, target: f.input });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toMatchObject({ events: [{ kind: "credentialFill", secretType: "password" }], overflow: false });
  runInNewContext(script("Stop"), f.context)("original-token");
});
it("refuses an overflowing native queue instead of returning partial capture", () => {
  const f = page();
  for (let index = 0; index < 51; index++) f.listeners.get("input")!({ isTrusted: true, target: f.input });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toMatchObject({ events: [], overflow: true });
  expect(f.listeners.size).toBe(0);
  runInNewContext(script("Stop"), f.context)("original-token");
});


it("does not let a retired token drain or stop a replacement capture", () => {
  const f = page();
  runInNewContext(script("Begin"), f.context)("replacement-token");
  f.listeners.get("input")!({ isTrusted: true, target: f.input });
  expect(runInNewContext(script("Drain"), f.context)("original-token")).toBeNull();
  expect(runInNewContext(script("Stop"), f.context)("original-token")).toBe(false);
  expect(f.listeners.size).toBe(4);
  expect(runInNewContext(script("Drain"), f.context)("replacement-token")).toMatchObject({ events: [{ kind: "input", value: "Synthetic company" }], overflow: false });
  expect(runInNewContext(script("Stop"), f.context)("replacement-token")).toBe(true);
  expect(f.listeners.size).toBe(0);
});
it("synchronously passes fixed capture to the native binding before any drain", () => {
  const f = page(); const emitted: string[] = [];
  Object.assign(f.context, { __auxRec: (raw: string) => { emitted.push(raw); } });
  expect(runInNewContext(script("StreamingBegin"), f.context)).toBe(true);
  f.listeners.get("input")!({ isTrusted: true, target: f.input });
  expect(emitted).toHaveLength(1);
  expect(JSON.parse(emitted[0]!)).toMatchObject({ kind: "input", value: "Synthetic company" });
  expect(runInNewContext(script("StreamingStop"), f.context)).toBe(true);
  expect(f.listeners.size).toBe(0);
});
