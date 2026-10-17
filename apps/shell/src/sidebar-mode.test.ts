import { describe, expect, it } from "vitest";
import { nextSidebarMode, readSidebarMode, sidebarFocusSelector } from "./sidebar-mode";

describe("sidebar-mode", () => {
  it("starts with the sidebar open and retains saved collapse choices", () => {
    expect(readSidebarMode("rail")).toBe("hidden");
    expect(readSidebarMode("hidden")).toBe("hidden");
    expect(readSidebarMode("expanded")).toBe("expanded");
    expect(readSidebarMode("nope")).toBe("hidden");
    expect(readSidebarMode(null)).toBe("expanded");
    expect(readSidebarMode(undefined)).toBe("expanded");
  });

  it("toggles expanded and hidden without a logo strip", () => {
    expect(nextSidebarMode("expanded")).toBe("hidden");
    expect(nextSidebarMode("hidden")).toBe("expanded");
  });

  it("focuses a control that still exists after collapse", () => {
    expect(sidebarFocusSelector("expanded")).toBe(".chat-sidebar .chat-sidebar-link, .space-switch");
    expect(sidebarFocusSelector("hidden")).toBe('.chat-sidebar-toggle, .toolbar [aria-label="Show sidebar"]');
  });
});
