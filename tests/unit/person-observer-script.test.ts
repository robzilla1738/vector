import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { expect, it } from "vitest";

const header = readFileSync(new URL("../../.native/chrome/common/native_person_observer_script.h", import.meta.url), "utf8");
const source = /kRead\[\] = uR"AUX_READ\(([\s\S]*?)\)AUX_READ";/.exec(header)![1]!;
function page(html: string) {
  const dom = new JSDOM(html, { url: "https://person-read.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  window.Element.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 40, height: 20, top: 0, bottom: 20, left: 0, right: 40, toJSON: () => ({}) });
  const forbidden = () => { throw new Error("Forbidden page actuation or field read"); };
  window.HTMLInputElement.prototype.checkValidity = forbidden;
  window.HTMLElement.prototype.click = forbidden;
  window.EventTarget.prototype.dispatchEvent = forbidden;
  for (const prototype of [window.HTMLInputElement.prototype, window.HTMLTextAreaElement.prototype]) {
    Object.defineProperty(prototype, "value", { get: forbidden });
    Object.defineProperty(prototype, "defaultValue", { get: forbidden });
  }
  const read = window.eval(source) as (request: unknown) => string;
  return { window, dom, read: (request: unknown) => JSON.parse(read(request)) };
}
const observe = { operation: "observe", maxElements: 20, maxTextChars: 1000 };

it("reads real structure without field getters, validation events or clicks", () => {
  const f = page('<title>Workspace</title><h1>Plan</h1><p>Ready to work.</p><input name="company"><button>Continue</button><table><tr><th>Item</th></tr><tr><td>Draft</td></tr></table><dialog open>Review</dialog>');
  const result = f.read(observe);
  expect(result).toMatchObject({ title: "Workspace", headings: ["Plan"], formFields: [{ type: "text", label: "company" }], tables: [{ columns: ["Item"], rows: [["Draft"]] }], dialogs: [{ message: "Review" }] });
  expect(result.text).toContain("Ready to work.");
  expect(result.elements.some((element: { name: string }) => element.name === "Continue")).toBe(true);
  f.dom.window.close();
});
it.each(['type="password"', 'autocomplete="one-time-code"', 'name="access_token"', 'id="credit-card"'])("refuses protected document before reading even echoed content: %s", attribute => {
  const f = page(`<input ${attribute}><p>Synthetic secret echo</p>`);
  Object.defineProperty(f.window.document, "title", { get: () => { throw new Error("Forbidden title read"); } });
  expect(() => f.read(observe)).toThrow("This page cannot be read safely.");
  expect(() => f.read({ operation: "extract", fields: [{ name: "text" }] })).toThrow("This page cannot be read safely.");
  f.dom.window.close();
});
it("admits metadata in every open shadow root before collecting text", () => {
  const f = page('<div id="host"></div><p>Synthetic secret echo</p>');
  f.window.document.getElementById("host")!.attachShadow({ mode: "open" }).innerHTML = '<input autocomplete="cc-number">';
  expect(() => f.read(observe)).toThrow("This page cannot be read safely.");
  f.dom.window.close();
});
it("uses bounded fixed extraction data and refuses script, value and malformed requests", () => {
  const f = page('<p class="item">One</p><p class="item">Two</p><a href="/next">Next</a>');
  expect(f.read({ operation: "extract", fields: [{ name: "items", selector: ".item", all: true }, { name: "destination", selector: "a", attribute: "href" }] })).toEqual({ items: ["One", "Two"], destination: "https://person-read.test/next" });
  for (const request of [{ operation: "evaluate", script: "alert(1)" }, { ...observe, maxElements: 201 }, { ...observe, maxTextChars: 16001 }, { operation: "extract", fields: [{ name: "secret", selector: "p", attribute: "value" }] }])
    expect(() => f.read(request)).toThrow("This page cannot be read safely.");
  f.dom.window.close();
});
it("keeps original refs stable across repeated reads and never reissues removed ids", () => {
  const f = page("<button>Original</button>");
  const original = f.read(observe).elements[0].ref;
  expect(f.read(observe).elements[0].ref).toBe(original);
  f.window.document.querySelector("button")!.remove();
  f.window.document.body.innerHTML = "<button>Replacement</button>";
  expect(f.read(observe).elements[0].ref).not.toBe(original);
  f.dom.window.close();
});
it("refuses secret-bearing destination metadata and excessive tree or extraction output", () => {
  const f = page('<a href="/next?access_token=synthetic">Next</a>');
  expect(() => f.read(observe)).toThrow("This page cannot be read safely.");
  f.window.document.body.innerHTML = "<p></p>".repeat(10001);
  expect(() => f.read(observe)).toThrow("This page cannot be read safely.");
  f.window.document.body.innerHTML = `<p>${"x".repeat(4000)}</p>`.repeat(20);
  expect(() => f.read({ operation: "extract", fields: [{ name: "text", selector: "p", all: true }] })).toThrow("This page cannot be read safely.");
  f.dom.window.close();
});
