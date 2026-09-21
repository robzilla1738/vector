import { describe, expect, it } from "vitest";
import { nextSidebarMode, readSidebarMode, sidebarFocusSelector } from "./sidebar-mode";

describe("sidebar-mode", () => {
  it("migrates the old rail to a fully hidden sidebar", () => {
    expect(readSidebarMode("rail")).toBe("hidden");
    expect(readSidebarMode("hidden")).toBe("hidden");
    expect(readSidebarMode("expanded")).toBe("expanded");
    expect(readSidebarMode("nope")).toBe("expanded");
    expect(readSidebarMode(null)).toBe("expanded");
  });

  it("toggles expanded and hidden without a logo strip", () => {
    expect(nextSidebarMode("expanded")).toBe("hidden");
    expect(nextSidebarMode("rail")).toBe("expanded");
    expect(nextSidebarMode("hidden")).toBe("expanded");
  });

  it("focuses a control that still exists after collapse", () => {
    expect(sidebarFocusSelector("expanded")).toBe(".space-switch");
    expect(sidebarFocusSelector("rail")).toBe('.toolbar [aria-label="Show sidebar"]');
    expect(sidebarFocusSelector("hidden")).toBe('.toolbar [aria-label="Show sidebar"]');
  });
});
