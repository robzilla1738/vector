// @vitest-environment jsdom
import { act, Suspense, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { committedSplitGeometry, useCommittedSurfaceWitness } from "./committed-surface-witness";
let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
const forever = new Promise(() => {});
function Witness({ value, suspend = false }: { value: string; suspend?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useCommittedSurfaceWitness(ref, "stage", () => value);
  if (suspend) throw forever;
  return <div ref={ref} data-value={value} />;
}
function render(value: string, suspend = false, key = "same") {
  act(() =>
    root.render(
      <Suspense fallback={<span>Pending</span>}>
        <Witness key={key} value={value} suspend={suspend} />
      </Suspense>,
    ),
  );
}
function revision() {
  return container.querySelector("div")?.getAttribute("data-stage-selection-generation");
}
it("increments only committed semantic changes including A to B to A", () => {
  render("A");
  expect(revision()).toBe("1");
  render("A");
  expect(revision()).toBe("1");
  render("B");
  expect(revision()).toBe("2");
  render("A");
  expect(revision()).toBe("3");
});
it("does not publish abandoned suspended render identities", () => {
  render("A");
  const node = container.querySelector("div")!;
  render("B", true);
  expect(node.getAttribute("data-stage-selection-generation")).toBe("1");
  render("A");
  expect(revision()).toBe("1");
});
it("fences remounts with a new instance while resetting local revision", () => {
  render("A");
  const instance = container.querySelector("div")!.getAttribute("data-stage-instance");
  render("B");
  render("A", false, "new");
  expect(revision()).toBe("1");
  expect(container.querySelector("div")!.getAttribute("data-stage-instance")).not.toBe(instance);
});
it("reads actual committed DOM order and finite pane/divider bounds", () => {
  const host = document.createElement("section");
  host.innerHTML = '<section class="split-pane"></section><div class="fluid-split-divider"></div>';
  const panes = host.children;
  vi.spyOn(panes[0]!, "getBoundingClientRect").mockReturnValue(new DOMRect(8, 8, 200, 300));
  vi.spyOn(panes[1]!, "getBoundingClientRect").mockReturnValue(new DOMRect(208, 8, 8, 300));
  const first = committedSplitGeometry(host);
  expect(JSON.parse(first!)).toEqual([
    ["pane", 8, 8, 200, 300],
    ["divider", 208, 8, 8, 300],
  ]);
  host.prepend(panes[1]!);
  expect(committedSplitGeometry(host)).not.toBe(first);
  vi.spyOn(host.children[0]!, "getBoundingClientRect").mockReturnValue(new DOMRect(NaN, 0, 8, 300));
  expect(committedSplitGeometry(host)).toBeNull();
  expect(committedSplitGeometry(document.createElement("section"))).toBeNull();
});
