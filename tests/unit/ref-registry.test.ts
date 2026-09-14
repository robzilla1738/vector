import { describe, it, expect } from "vitest";
import { RefRegistry, parseTarget } from "@vector/browser-driver";

const el = (ref: string) => ({ ref, frame: "main", tag: "button", rect: { x: 0, y: 0, w: 10, h: 10 }, selector: { css: "#b" } });

describe("RefRegistry", () => {
  it("registers, resolves, and clears per page", () => {
    const r = new RefRegistry();
    r.register("p1", [el("r1"), el("r2")]);
    expect(r.resolve("p1", "r1")?.tag).toBe("button");
    expect(r.has("p1", "r2")).toBe(true);
    expect(r.has("p2", "r1")).toBe(false);
    r.clear("p1"); // navigation → new epoch wipes refs
    expect(r.has("p1", "r1")).toBe(false);
  });
});

describe("parseTarget", () => {
  it("classifies targets", () => {
    expect(parseTarget("r12")).toEqual({ kind: "ref", ref: "r12" });
    expect(parseTarget("css:#save")).toEqual({ kind: "selector", strategy: { css: "#save" } });
    expect(parseTarget("text:Save record")).toEqual({ kind: "selector", strategy: { text: "Save record" } });
    expect(parseTarget("role=button[name=Save]")).toEqual({ kind: "selector", strategy: { role: { role: "button", name: "Save" } } });
    expect(parseTarget("xpath://button[1]")).toEqual({ kind: "selector", strategy: { xpath: "xpath=//button[1]" } });
    expect(parseTarget("#plain-css")).toEqual({ kind: "selector", strategy: { css: "#plain-css" } });
  });
});
