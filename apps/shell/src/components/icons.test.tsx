import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  shellIconAlert,
  shellIconCircle,
  shellIconClose,
  shellIconMore,
  shellIconSearch,
  shellIconSidebar,
  shellIconSidebarClose,
  shellIconSidebarCloseSm,
  shellIconSidebarOpen,
  shellIconSidebarSm,
  shellIconStop,
  shellIconUnplug,
} from "./icons";
import * as shellIcons from "./icons";
import { Mic } from "./central-icons";

describe("Central Icons", () => {
  it("keeps the supplied viewbox and hides decorative icons from assistive technology", () => {
    for (const icon of Object.values(shellIcons)) {
      const markup = renderToStaticMarkup(icon);
      expect(markup).toContain('viewBox="0 0 24 24"');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).toContain("currentColor");
      expect(markup).not.toMatch(/lucide|<image|<script|https?:\/\/(?!www.w3.org)/);
    }
  });
  it("preserves stroke geometry and the three-dot menu glyph", () => {
    expect(renderToStaticMarkup(shellIconSearch)).toContain('stroke-width="1.5"');
    expect(renderToStaticMarkup(shellIconMore).match(/<rect/g)).toHaveLength(3);
  });
  it("lets the microphone retain its size beside an icon-only label", () => {
    const markup = renderToStaticMarkup(<Mic width={15} height={15} />);
    expect(markup).toContain('width="15"');
    expect(markup).toContain('height="15"');
  });
  it("draws a stroke cross for close and stop, not the X brand mark", () => {
    const close = renderToStaticMarkup(shellIconClose);
    expect(close).toContain('stroke-width="1.5"');
    expect(close).toContain("M6.25 6.25L17.75 17.75");
    expect(close).not.toContain("M17.5652");
    expect(close).toBe(renderToStaticMarkup(shellIconStop));
  });
  it("uses a circle, a warning triangle, and a plug for those actions", () => {
    expect(renderToStaticMarkup(shellIconCircle)).toContain('r="9.25"');
    expect(renderToStaticMarkup(shellIconCircle)).not.toContain("16.625");
    expect(renderToStaticMarkup(shellIconAlert)).toContain("M2.79693 16.2276");
    expect(renderToStaticMarkup(shellIconAlert)).not.toContain("M2.75 20.25L6.37938");
    expect(renderToStaticMarkup(shellIconUnplug)).toContain("M15.25 6.25V2.75");
    expect(renderToStaticMarkup(shellIconUnplug)).not.toContain("M18.5 19.0615");
  });
  it("uses one Central sidebar glyph for open, collapse and the menu action", () => {
    expect(renderToStaticMarkup(shellIconSidebarOpen)).toBe(renderToStaticMarkup(shellIconSidebarClose));
    expect(renderToStaticMarkup(shellIconSidebarClose)).toBe(renderToStaticMarkup(shellIconSidebar));
    expect(renderToStaticMarkup(shellIconSidebarCloseSm)).toBe(renderToStaticMarkup(shellIconSidebarSm));
  });
});
