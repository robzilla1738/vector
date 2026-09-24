import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { unsavedWorkScript } from "../../apps/desktop/main/tabs/unsaved-work.js";
const { JSDOM } = createRequire(import.meta.url)("jsdom");

function scan(markup: string, edit?: (window: Window) => void): boolean {
  const dom = new JSDOM(markup, { runScripts: "outside-only" });
  try {
    edit?.(dom.window);
    return dom.window.eval(unsavedWorkScript) as boolean;
  } finally { dom.window.close(); }
}

describe("duplicate cleanup unsaved-work check", () => {
  it("detects changed text, toggles, and selections without returning field contents", () => {
    expect(scan('<textarea id="draft"></textarea>', window => { window.document.querySelector("textarea")!.value = "private draft"; })).toBe(true);
    expect(scan('<input type="checkbox">', window => { window.document.querySelector("input")!.checked = true; })).toBe(true);
    expect(scan('<select><option>One</option><option>Two</option></select>', window => { window.document.querySelector("select")!.selectedIndex = 1; })).toBe(true);
    expect(scan('<input value="unchanged"><textarea>same</textarea>')).toBe(false);
  });

  it("conservatively protects rich editors", () => {
    expect(scan('<div contenteditable="true">Draft</div>')).toBe(true);
  });
});
