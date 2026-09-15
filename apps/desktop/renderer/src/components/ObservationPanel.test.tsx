// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ObservationPanel, parseCompact } from "./ObservationPanel";
import { OBSERVATION } from "../mock/fixtures";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
});

describe("compact observation parsing", () => {
  it("splits the runtime's compact text into header and ## sections", () => {
    const p = parseCompact(OBSERVATION.text);
    expect(p.header[0]).toMatch(/Vector Engine M0/);
    expect(p.sections.map((s) => s.name)).toEqual(["Headings", "Form fields", "Interactive", "Text"]);
    expect(p.sections[2]!.lines[0]).toBe("r1 link “vector-browser / vector”");
  });
});

describe("ObservationPanel", () => {
  it("renders headings, form fields, and interactive refs as readable rows", () => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<ObservationPanel obs={OBSERVATION} />));
    expect(host.querySelector(".obs-title")!.textContent).toContain("Vector Engine M0");
    expect(host.querySelector(".obs-meta")!.textContent).toContain(`${OBSERVATION.refs.length} refs`);
    const refs = host.querySelectorAll(".obs-ref");
    expect(refs.length).toBeGreaterThanOrEqual(OBSERVATION.refs.length);
    const first = refs[0]!;
    expect(first.querySelector(".ref")!.textContent).toBe("r3");
    expect(first.querySelector(".role")!.textContent).toBe("textbox");
    expect(first.querySelector(".name")!.textContent).toBe("Leave a comment");
    // sections collapse
    const head = host.querySelector(".obs-section-head") as HTMLButtonElement;
    act(() => head.click());
    expect(head.getAttribute("aria-expanded")).toBe("false");
  });
});
