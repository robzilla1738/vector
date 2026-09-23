import { describe, expect, it } from "vitest";
import { toolbarGlassCss } from "../../apps/desktop/main/toolbar-glass";

describe("toolbar glass", () => {
  it("fades the blur out before the bottom of the address row", () => {
    const css = toolbarGlassCss(true);
    expect(css).toContain("height:40px");
    expect(css).toContain("pointer-events:none");
    expect(css).toContain("transparent 32px");
    expect(css).toContain("backdrop-filter:blur(12px) saturate(1.2)");
    expect(css).not.toContain("bottom:");
  });
});
