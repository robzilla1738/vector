// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { collectObservation } from "../../packages/chromium-driver/src/observe-script";

const observe = (over: Partial<Parameters<typeof collectObservation>[0]> = {}) =>
  collectObservation({ maxElements: 50, maxTextChars: 2000, frameKey: "main", refStart: 1, ...over });

beforeEach(() => {
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 120,
    bottom: 32,
    width: 120,
    height: 32,
    toJSON: () => ({}),
  });
  delete (globalThis as { __auxStore?: unknown }).__auxStore;
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("keeps a node's ref across observations and never reissues a number to another node", () => {
  document.body.innerHTML = '<button id="a">A</button><button id="b">B</button>';
  const first = observe();
  const refOf = (r: typeof first, name: string) => r.elements.find((e) => e.name === name)?.ref;
  const a = refOf(first, "A");
  const b = refOf(first, "B");
  expect(a).toBeDefined();

  document.getElementById("b")!.remove();
  document.body.insertAdjacentHTML("afterbegin", '<button id="c">C</button>');
  const second = observe({ refStart: first.nextRef });
  expect(refOf(second, "A")).toBe(a);
  const c = refOf(second, "C")!;
  expect([a, b]).not.toContain(c);
  expect(Number(c.slice(1))).toBeGreaterThanOrEqual(first.nextRef);
  expect(second.nextRef).toBeGreaterThan(first.nextRef);
});

it("seeds new numbers from the page-wide counter so frames never collide", () => {
  document.body.innerHTML = "<button>X</button>";
  const r = observe({ refStart: 40 });
  expect(r.elements[0]?.ref).toBe("r40");
  expect(r.nextRef).toBe(41);
});

it("interactive filter collects only actionable elements; all refs containers too (S4)", () => {
  document.body.innerHTML =
    '<div class="wrapper"><button id="b">B</button><section class="panel"><a href="/x">link</a></section></div>';
  const interactive = observe();
  expect(interactive.elements.map((e) => e.tag).sort()).toEqual(["a", "button"]);
  const all = observe({ filter: "all" });
  const tags = all.elements.map((e) => e.tag);
  expect(tags).toContain("div");
  expect(tags).toContain("section");
  expect(tags).toContain("button");
  expect(all.elements.length).toBeGreaterThan(interactive.elements.length);
});

it("viewport filter drops interactive elements outside the viewport (S4)", () => {
  document.body.innerHTML = '<button id="in">IN</button><button id="out">OUT</button>';
  vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
    const off = this.id === "out";
    return {
      x: 0,
      y: off ? 5000 : 0,
      left: 0,
      top: off ? 5000 : 0,
      right: 120,
      bottom: off ? 5032 : 32,
      width: 120,
      height: 32,
      toJSON: () => ({}),
    } as DOMRect;
  });
  const r = observe({ filter: "viewport" });
  expect(r.elements.map((e) => e.name)).toEqual(["IN"]);
});

it("viewport scope leaves offscreen elements out while interactive still lists them", () => {
  document.body.innerHTML = '<button id="in">IN</button><button id="out">OUT</button>';
  vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
    const off = this.id === "out";
    return {
      x: 0,
      y: off ? 5000 : 0,
      left: 0,
      top: off ? 5000 : 0,
      right: 120,
      bottom: off ? 5032 : 32,
      width: 120,
      height: 32,
      toJSON: () => ({}),
    } as DOMRect;
  });
  expect(
    observe()
      .elements.map((e) => e.name)
      .sort(),
  ).toEqual(["IN", "OUT"]);
  expect(observe({ filter: "viewport" }).elements.map((e) => e.name)).toEqual(["IN"]);
});

it("links form fields to their element refs", () => {
  document.body.innerHTML = '<label>Title<input name="title"></label><textarea name="notes"></textarea>';
  const r = observe();
  const input = r.elements.find((e) => e.tag === "input");
  expect(r.formFields.find((f) => f.name === "title")?.ref).toBe(input?.ref);
  expect(r.formFields.find((f) => f.name === "notes")?.ref).toBe(
    r.elements.find((e) => e.tag === "textarea")?.ref,
  );
});

it("reads main text within budget, skipping hidden subtrees and scripts", () => {
  document.body.innerHTML = `<main><p>visible one</p><div style="display:none">secret hidden</div><script>var x = 1</script><p>${"long ".repeat(400)}</p><p>tail never read</p></main>`;
  const r = observe({ maxTextChars: 100 });
  expect(r.text).toContain("visible one");
  expect(r.text).not.toContain("secret hidden");
  expect(r.text).not.toContain("var x");
  expect(r.text).not.toContain("tail never read");
  expect(r.text.endsWith("…[text truncated]")).toBe(true);
  expect(r.truncated).toBe(true);
});
