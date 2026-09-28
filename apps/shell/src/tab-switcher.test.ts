import { describe, expect, it } from "vitest";
import { createTabSwitcher } from "./tab-switcher";

const tabs = [
  { pageId: "red", lastActiveAt: 30 },
  { pageId: "blue", lastActiveAt: 10 },
  { pageId: "plain", lastActiveAt: 20 },
];

describe("tab switcher order", () => {
  it("uses sidebar order by default in both directions", () => {
    const next = createTabSwitcher();
    expect(next(tabs, "red", 1, "sidebar")).toBe("blue");
    expect(next(tabs, "red", -1, "sidebar")).toBe("plain");
  });

  it("freezes recently used order through a quick shortcut sequence", () => {
    const next = createTabSwitcher();
    expect(next(tabs, "red", 1, "recently-used", 1000)).toBe("plain");
    expect(next(tabs, "plain", 1, "recently-used", 1100)).toBe("blue");
    expect(next(tabs, "blue", -1, "recently-used", 1200)).toBe("plain");
    expect(next(tabs.map(tab => ({ ...tab, lastActiveAt: tab.pageId === "blue" ? 50 : tab.pageId === "plain" ? 40 : 30 })), "plain", 1, "recently-used", 3000)).toBe("red");
  });

  it("restarts the sequence after a tab closes or selection changes", () => {
    const next = createTabSwitcher();
    expect(next(tabs, "red", 1, "recently-used", 1000)).toBe("plain");
    expect(next(tabs.slice(0, 2), "blue", 1, "recently-used", 1100)).toBe("red");
  });
});
