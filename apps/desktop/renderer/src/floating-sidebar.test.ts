// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { floatingSidebarVisible, type FloatingSidebarState } from "./floating-sidebar";

const state = (patch: Partial<FloatingSidebarState> = {}): FloatingSidebarState => ({
  visible: false,
  frameActive: true,
  edge: false,
  inside: false,
  focused: false,
  locks: { "force-collapse": 0, "keep-current": 0, "keep-expanded": 0 },
  ...patch,
});

describe("floating sidebar locks", () => {
  it("counts focus as hover and gates an inactive frame", () => {
    expect(floatingSidebarVisible(state({ focused: true }))).toBe(true);
    expect(floatingSidebarVisible(state({ edge: true, frameActive: false }))).toBe(false);
    expect(floatingSidebarVisible(state({ focused: true, frameActive: false }))).toBe(true);
  });

  it("retains only an already visible sidebar for a menu", () => {
    const locks = {
      "force-collapse": 0,
      "keep-current": 1,
      "keep-expanded": 0,
    };
    expect(floatingSidebarVisible(state({ locks }))).toBe(false);
    expect(floatingSidebarVisible(state({ visible: true, locks }))).toBe(true);
  });

  it("forces collapse ahead of a drag lock", () => {
    expect(
      floatingSidebarVisible(
        state({
          locks: { "force-collapse": 1, "keep-current": 0, "keep-expanded": 1 },
        }),
      ),
    ).toBe(false);
    expect(
      floatingSidebarVisible(
        state({
          locks: { "force-collapse": 0, "keep-current": 0, "keep-expanded": 1 },
        }),
      ),
    ).toBe(true);
  });
});
