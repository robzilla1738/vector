import { describe, expect, it } from "vitest";
import { extractJson } from "../../apps/runtime/src/agent/gateway-client.js";

describe("extractJson", () => {
  it("parses a bare object", () => {
    expect(extractJson('{"ok":true}')).toEqual({ ok: true });
  });
  it("extracts from fenced prose", () => {
    expect(extractJson('Sure! Here is the plan:\n```json\n{"steps":[{"op":"click"}]}\n```')).toEqual({ steps: [{ op: "click" }] });
  });
  it("handles mixed nesting", () => {
    expect(extractJson('[{"a":[1,{"b":2}]}]')).toEqual([{ a: [1, { b: 2 }] }]);
  });
  it("ignores braces inside strings", () => {
    expect(extractJson('{"text":"use } and { freely"}')).toEqual({ text: "use } and { freely" });
  });
  it("handles escaped quotes inside strings", () => {
    expect(extractJson('{"q":"say \\"hi\\" then }"}')).toEqual({ q: 'say "hi" then }' });
  });
  it("throws on no JSON", () => {
    expect(() => extractJson("no json here")).toThrow("no JSON value");
  });
  it("throws on unbalanced JSON", () => {
    expect(() => extractJson('{"a": [1, 2')).toThrow("truncated or unbalanced");
  });
});
