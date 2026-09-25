import { describe, expect, it } from "vitest";
import { cosmeticApplyScript, COSMETIC_SELECTORS } from "../../apps/desktop/main/cosmetic-filter.js";

// @vitest-environment jsdom

function apply(on: boolean) {
  // oxlint-disable-next-line no-eval — exercising the real injected script.
  return (0, eval)(cosmeticApplyScript(on));
}

describe("cosmeticApplyScript", () => {
  it("injects a style that hides known ad containers and removes it cleanly", () => {
    const ad = document.createElement("ins");
    ad.className = "adsbygoogle";
    document.body.appendChild(ad);
    expect(apply(true)).toBe(1);
    const style = document.getElementById("__aux-ads") as HTMLStyleElement;
    expect(style).toBeTruthy();
    expect(style.textContent).toContain("display: none !important");
    expect(getComputedStyle(ad).display).toBe("none");
    // Idempotent — a second apply does not duplicate the node.
    expect(apply(true)).toBe(1);
    expect(document.querySelectorAll("#__aux-ads")).toHaveLength(1);
    expect(apply(false)).toBe(0);
    expect(document.getElementById("__aux-ads")).toBeNull();
    expect(getComputedStyle(ad).display).not.toBe("none");
  });

  it("is a no-op when removing without a style present", () => {
    expect(apply(false)).toBe(0);
  });

  it("updates reviewed cookie selectors on an open page and removes them on exemption", () => {
    const banner = document.createElement("div");
    banner.className = "cookie-overlay";
    document.body.appendChild(banner);
    // oxlint-disable-next-line no-eval — exercising the real injected script.
    (0, eval)(cosmeticApplyScript(true, [".cookie-overlay"]));
    expect(getComputedStyle(banner).display).toBe("none");
    // oxlint-disable-next-line no-eval — exercising the real injected script.
    (0, eval)(cosmeticApplyScript(true, []));
    expect(getComputedStyle(banner).display).not.toBe("none");
    // oxlint-disable-next-line no-eval — exercising the real injected script.
    (0, eval)(cosmeticApplyScript(false, [".cookie-overlay"]));
    expect(document.getElementById("__aux-ads")).toBeNull();
    banner.remove();
  });
});

describe("COSMETIC_SELECTORS", () => {
  it("stays cheap — no relational or universal selectors and every rule parses", () => {
    for (const selector of COSMETIC_SELECTORS) {
      expect(selector).not.toMatch(/:has\(/);   // no relselector work on every mutation
      expect(selector).not.toMatch(/^\s*\*/);    // no universal scans
      expect(() => document.querySelector(selector)).not.toThrow();
    }
    expect(COSMETIC_SELECTORS.length).toBeGreaterThan(10);
  });
});
