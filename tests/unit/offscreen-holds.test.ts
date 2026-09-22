import { describe, expect, it } from "vitest";
import { createOffscreenHolds } from "../../apps/desktop/main/offscreen-holds";

describe("offscreen holds", () => {
  it("keeps an agent lease when a preview that started on the hidden page ends", () => {
    const holds = createOffscreenHolds();
    holds.beginPreview("page");
    holds.acquireStage("page");
    expect(holds.endPreview("page")).toBe(false);
    expect(holds.holds("page")).toBe(true);
  });

  it("hides a preview-only page when that preview ends", () => {
    const holds = createOffscreenHolds();
    holds.beginPreview("page");
    expect(holds.holds("page")).toBe(true);
    expect(holds.endPreview("page")).toBe(true);
    expect(holds.holds("page")).toBe(false);
  });

  it("does not hide the page when the lease ends during a preview", () => {
    const holds = createOffscreenHolds();
    holds.acquireStage("page");
    holds.beginPreview("page");
    expect(holds.releaseStage("page")).toBe(false);
    expect(holds.holds("page")).toBe(true);
    expect(holds.endPreview("page")).toBe(true);
    expect(holds.holds("page")).toBe(false);
  });

  it("releases the lease once the preview is already gone", () => {
    const holds = createOffscreenHolds();
    holds.acquireStage("page");
    holds.beginPreview("page");
    expect(holds.endPreview("page")).toBe(false);
    expect(holds.releaseStage("page")).toBe(true);
    expect(holds.holds("page")).toBe(false);
  });

  it("keeps the page laid out until every overlapping preview ends", () => {
    const holds = createOffscreenHolds();
    holds.beginPreview("page");
    holds.beginPreview("page");
    expect(holds.endPreview("page")).toBe(false);
    expect(holds.holds("page")).toBe(true);
    expect(holds.endPreview("page")).toBe(true);
    expect(holds.holds("page")).toBe(false);
  });

  it("ignores a second release when no lease remains", () => {
    const holds = createOffscreenHolds();
    expect(holds.releaseStage("page")).toBe(false);
    holds.acquireStage("page");
    holds.acquireStage("page");
    expect(holds.releaseStage("page")).toBe(true);
    expect(holds.releaseStage("page")).toBe(false);
    expect(holds.holds("page")).toBe(false);
  });

  it("drops both a lease and a preview when the page closes", () => {
    const holds = createOffscreenHolds();
    holds.acquireStage("page");
    holds.beginPreview("page");
    holds.beginPreview("page");
    holds.forget("page");
    expect(holds.holds("page")).toBe(false);
    expect(holds.releaseStage("page")).toBe(false);
    expect(holds.endPreview("page")).toBe(false);
  });

  it("does not let one page's preview end another page's lease", () => {
    const holds = createOffscreenHolds();
    holds.acquireStage("agent");
    holds.beginPreview("preview");
    expect(holds.endPreview("preview")).toBe(true);
    expect(holds.holds("agent")).toBe(true);
    expect(holds.holds("preview")).toBe(false);
  });
});
