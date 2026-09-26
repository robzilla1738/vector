// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUiFontSize, readUiFontSize, UI_FONT_SIZES, writeUiFontSize } from "./ui-font-size";

describe("ui-font-size", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("accepts only 12, 13, or 14 and defaults to 14", () => {
    expect(UI_FONT_SIZES).toEqual([12, 13, 14]);
    localStorage.removeItem("aux.ui.fontSize");
    expect(readUiFontSize()).toBe(14);
    localStorage.setItem("aux.ui.fontSize", "11");
    expect(readUiFontSize()).toBe(14);
    localStorage.setItem("aux.ui.fontSize", "14");
    expect(readUiFontSize()).toBe(14);
  });

  it("writes --ui-font-size only, never html font-size", () => {
    document.documentElement.style.fontSize = "16px";
    writeUiFontSize(12);
    expect(document.documentElement.style.getPropertyValue("--ui-font-size")).toBe("12px");
    expect(document.documentElement.style.fontSize).toBe("16px");
    applyUiFontSize(13);
    expect(document.documentElement.style.getPropertyValue("--ui-font-size")).toBe("13px");
    expect(document.documentElement.style.fontSize).toBe("16px");
  });
});
