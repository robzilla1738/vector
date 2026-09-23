// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { describePickedElement, pickElementInPage, type PickedElement } from "../../apps/runtime/src/execution/element-picker.js";

const CHROME = "data-aux-element-picker";

function mount(html: string) {
  document.body.innerHTML = html;
}

function target(): HTMLElement {
  return document.getElementById("pick-me")!;
}

afterEach(() => {
  document.body.innerHTML = "";
  document.querySelectorAll(`[${CHROME}]`).forEach(node => node.remove());
  vi.useRealTimers();
});

describe("pickElementInPage", () => {
  it("resolves with a summary of the clicked element and cleans up", async () => {
    mount(`<main><section class="hero"><h1 id="pick-me" class="title big" aria-label="Welcome title">Welcome home</h1></section></main>`);
    const promise = pickElementInPage(30_000) as Promise<PickedElement | null>;
    target().dispatchEvent(new MouseEvent("mouseover", { bubbles: true, composed: true }));
    target().dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    const pick = await promise;
    expect(pick).not.toBeNull();
    expect(pick!.tag).toBe("h1");
    expect(pick!.id).toBe("pick-me");
    expect(pick!.classes).toEqual(["title", "big"]);
    expect(pick!.text).toBe("Welcome home");
    expect(pick!.ariaLabel).toBe("Welcome title");
    expect(pick!.selector).toContain("h1#pick-me");
    expect(document.querySelectorAll(`[${CHROME}]`)).toHaveLength(0);
  });

  it("resolves null on Escape and removes the overlay", async () => {
    mount(`<button id="pick-me">Go</button>`);
    const promise = pickElementInPage(30_000);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expect(promise).resolves.toBeNull();
    expect(document.querySelectorAll(`[${CHROME}]`)).toHaveLength(0);
    // A click after cancel does not resolve a second time.
    target().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  it("resolves null on timeout", async () => {
    vi.useFakeTimers();
    const promise = pickElementInPage(50);
    await vi.advanceTimersByTimeAsync(60);
    await expect(promise).resolves.toBeNull();
    expect(document.querySelectorAll(`[${CHROME}]`)).toHaveLength(0);
  });

  it("prevents the picked click from reaching the page", async () => {
    mount(`<a id="pick-me" href="https://example.com">Link</a>`);
    const anchor = target();
    let navigated = 0;
    anchor.addEventListener("click", event => { if (!event.defaultPrevented) navigated += 1; });
    const promise = pickElementInPage(30_000) as Promise<PickedElement | null>;
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));
    const pick = await promise;
    expect(pick!.href).toBe("https://example.com/");
    expect(navigated).toBe(0);
  });

  it("summarizes through a shadow boundary", async () => {
    mount(`<div id="host"></div>`);
    const host = document.getElementById("host")!;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<button id="pick-me" class="cta">Shadow action</button>`;
    const inner = shadow.getElementById("pick-me")!;
    const promise = pickElementInPage(30_000) as Promise<PickedElement | null>;
    inner.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    const pick = await promise;
    expect(pick).not.toBeNull();
    expect(pick!.tag).toBe("button");
    expect(pick!.text).toBe("Shadow action");
  });
});

describe("describePickedElement", () => {
  it("renders a one-line human description", () => {
    const el: PickedElement = {
      tag: "button",
      id: "save",
      classes: ["primary"],
      text: "Save draft",
      selector: "main > button#save",
      rect: { x: 0, y: 0, width: 10, height: 10 },
    };
    expect(describePickedElement(el)).toBe('button #save (primary) at "main > button#save" — text "Save draft"');
  });
});
