import { describe, expect, it } from "vitest";
import { toolbarGlassCss } from "../../apps/desktop/main/toolbar-glass";

describe("toolbar glass", () => {
  it("keeps frost across the controls and feathers below them", () => {
    const css = toolbarGlassCss(true);
    expect(css).toContain("height:52px");
    expect(css).toContain("pointer-events:none");
    expect(css).toContain("#000 26px,rgb(0 0 0 / .85) 34px");
    expect(css).toContain("backdrop-filter:blur(20px) saturate(1.2)");
    expect(css).not.toContain("bottom:");
  });
});
