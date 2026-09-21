import { describe, expect, it } from "vitest";
import { nextSidebarMode, readSidebarMode, sidebarFocusSelector } from "./sidebar-mode";

describe("sidebar-mode", () => {
  it("restores rail instead of coercing it to hidden", () => {
    expect(readSidebarMode("rail")).toBe("rail");
    expect(readSidebarMode("hidden")).toBe("hidden");
    expect(readSidebarMode("expanded")).toBe("expanded");
    expect(readSidebarMode("nope")).toBe("expanded");
    expect(readSidebarMode(null)).toBe("expanded");
  });

  it("toggles expanded ↔ rail so collapse always leaves a reopen target", () => {
    expect(nextSidebarMode("expanded")).toBe("rail");
    expect(nextSidebarMode("rail")).toBe("expanded");
    expect(nextSidebarMode("hidden")).toBe("expanded");
  });

  it("focuses a control that still exists after collapse", () => {
    expect(sidebarFocusSelector("expanded")).toBe(".space-switch");
    expect(sidebarFocusSelector("rail")).toBe(".sidebar-rail");
    expect(sidebarFocusSelector("hidden")).toBe(".sidebar-reveal");
  });
});
