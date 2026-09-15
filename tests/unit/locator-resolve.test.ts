import { describe, it, expect } from "vitest";
import { locatorAttempts, selectUniqueLocator, type FrameLike, type LocatorLike } from "@vector/browser-driver";
import { VectorError } from "@vector/contracts";

/** Fake locator: a fixed match count plus a visible-filtered count; records count() calls. */
function fakeLocator(label: string, count: number, visibleCount = count, log: string[] = []): LocatorLike & { label: string } {
  return {
    label,
    async count() {
      log.push(`count:${label}`);
      return count;
    },
    filter() {
      return fakeLocator(`${label}:visible`, visibleCount, visibleCount, log);
    },
  };
}

function fakeFrame(counts: { css?: [number, number?]; xpath?: [number, number?]; role?: [number, number?]; text?: [number, number?] }) {
  const log: string[] = [];
  const frame: FrameLike<ReturnType<typeof fakeLocator>> = {
    locator(sel) {
      const which = sel.startsWith("xpath=") || sel.startsWith("/") ? "xpath" : "css";
      const [c, v] = counts[which] ?? [0];
      return fakeLocator(which, c, v ?? c, log);
    },
    getByRole() {
      const [c, v] = counts.role ?? [0];
      return fakeLocator("role", c, v ?? c, log);
    },
    getByText() {
      const [c, v] = counts.text ?? [0];
      return fakeLocator("text", c, v ?? c, log);
    },
  };
  return { frame, log };
}

const strategy = { role: { role: "button", name: "Save" }, css: "form > button:nth-of-type(1)", xpath: "/html/body/form/button[1]", text: "Save" };

describe("locatorAttempts", () => {
  it("orders unique paths (css, xpath) before semantic searches (role, text)", () => {
    const { frame } = fakeFrame({});
    const attempts = locatorAttempts(frame, strategy);
    expect(attempts.map((a) => `${a.kind}:${a.label}`)).toEqual(["path:css", "path:xpath", "semantic:role", "semantic:text"]);
  });
  it("rejects an empty strategy", () => {
    const { frame } = fakeFrame({});
    expect(() => locatorAttempts(frame, {})).toThrow(VectorError);
  });
});

describe("selectUniqueLocator", () => {
  it("resolves by css alone when it matches exactly one element — role/text never evaluated", async () => {
    const { frame, log } = fakeFrame({ css: [1], role: [2] });
    const loc = await selectUniqueLocator(locatorAttempts(frame, strategy), "r3");
    expect(loc.label).toBe("css");
    expect(log).toEqual(["count:css"]);
  });

  it("falls through to xpath when css matches nothing", async () => {
    const { frame, log } = fakeFrame({ css: [0], xpath: [1], role: [1] });
    const loc = await selectUniqueLocator(locatorAttempts(frame, strategy), "r3");
    expect(loc.label).toBe("xpath");
    expect(log).toEqual(["count:css", "count:xpath"]);
  });

  it("uses role/text only after every path strategy matched zero elements", async () => {
    const { frame, log } = fakeFrame({ css: [0], xpath: [0], role: [1] });
    const loc = await selectUniqueLocator(locatorAttempts(frame, strategy), "r3");
    expect(loc.label).toBe("role");
    expect(log).toEqual(["count:css", "count:xpath", "count:role"]);
  });

  it("narrows a multi-match path to its single visible element", async () => {
    const { frame, log } = fakeFrame({ css: [3, 1] });
    const loc = await selectUniqueLocator(locatorAttempts(frame, strategy), "r3");
    expect(loc.label).toBe("css:visible");
    expect(log).toEqual(["count:css", "count:css:visible"]);
  });

  it("reports target_ambiguous for a multi-match path without consulting role/text", async () => {
    const { frame, log } = fakeFrame({ css: [3, 3], xpath: [0], role: [1] });
    await expect(selectUniqueLocator(locatorAttempts(frame, strategy), "r3")).rejects.toMatchObject({ code: "target_ambiguous" });
    expect(log).not.toContain("count:role");
    expect(log).not.toContain("count:text");
  });

  it("reports target_detached when nothing matches", async () => {
    const { frame } = fakeFrame({});
    await expect(selectUniqueLocator(locatorAttempts(frame, strategy), "r9")).rejects.toMatchObject({ code: "target_detached" });
  });

  it("a semantic substring collision no longer causes ambiguity when the path is unique (P0-3)", async () => {
    // "Save" also matches "Save draft" → role would report 2; css path is unique
    const { frame } = fakeFrame({ css: [1], role: [2, 2], text: [2, 2] });
    const loc = await selectUniqueLocator(locatorAttempts(frame, strategy), "r3");
    expect(loc.label).toBe("css");
  });
});
