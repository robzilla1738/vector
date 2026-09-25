import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import type { WebContents } from "electron";
import { syncSidebarGlass } from "../../apps/desktop/main/sidebar-glass.js";

function page() {
  const contents = new EventEmitter();
  const executeJavaScript = vi.fn().mockResolvedValue(undefined);
  return Object.assign(contents, { isDestroyed: () => false, executeJavaScript }) as unknown as WebContents;
}

describe("sidebar glass", () => {
  it("repaints an open sidebar when the selected page replaces its document", () => {
    const contents = page();
    const bounds = { x: 8, y: 48, width: 280, height: 700 };
    syncSidebarGlass("glass-navigation", contents, bounds);
    expect(contents.executeJavaScript).toHaveBeenCalledTimes(1);

    contents.emit("dom-ready");
    expect(contents.executeJavaScript).toHaveBeenCalledTimes(2);
    expect(vi.mocked(contents.executeJavaScript).mock.calls[1]?.[0]).toContain("blur(28px)");

    syncSidebarGlass("glass-navigation", contents, null);
    contents.emit("dom-ready");
    expect(contents.executeJavaScript).toHaveBeenCalledTimes(3);
  });
});
