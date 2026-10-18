// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts/commands";
import { DEFAULT_SEARCH_ENGINE, SEARCH_ENGINE_TEMPLATE_ERROR } from "@aux/contracts/search-engine";
const state = vi.hoisted(() => ({ windowId: "one", privateMode: false, toast: vi.fn() }));
vi.mock("./bridge", () => ({
  bridge: {
    get windowId() {
      return state.windowId;
    },
    get privateMode() {
      return state.privateMode;
    },
  },
}));
vi.mock("./store", () => ({ errToast: state.toast }));
vi.mock("./commands", async () => {
  const { invokeScopedControl } = await import("./scoped-control-commands");
  return {
    executeCommand: (id: string, context: object) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
import { invokeScopedControl } from "./scoped-control-commands";
import { SearchEngineSetting } from "./settings/search-engines";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement,
  root: Root,
  value: string,
  save: ReturnType<typeof vi.fn<(value: string) => Promise<boolean>>>;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
async function render() {
  await act(async () => root.render(<SearchEngineSetting value={value} onSave={save} />));
  await openPicker();
}
async function openPicker() {
  if (!document.querySelector('[role="dialog"][aria-label="Default search engine"]'))
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Default search engine"]')!.click(),
    );
}
async function custom() {
  await openPicker();
  await act(async () => button("Custom…").click());
}
const button = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('button:not([aria-label="Default search engine"])')].find(
    (b) => b.textContent === text,
  )!;
const input = () => host.querySelector<HTMLInputElement>("input")!;
async function edit(next: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input(), next);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
beforeEach(() => {
  Element.prototype.scrollIntoView ??= () => {};
  state.windowId = "one";
  state.privateMode = false;
  state.toast.mockReset();
  value = DEFAULT_SEARCH_ENGINE;
  save = vi.fn().mockResolvedValue(true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
it("registers the three original mounted action types without changing window policy", () => {
  for (const id of ["select-search-engine", "toggle-custom-search-engine", "save-search-engine"]) {
    const rows = COMMANDS.filter((row) => row.id === id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ handler: "shell", palette: false, bindings: [] });
    expect(rows[0]).not.toHaveProperty("windows");
  }
});
it("selects the exact original focused preset and retains a false save ACK", async () => {
  await render();
  save.mockResolvedValue(false);
  button("Google").focus();
  await act(async () => {
    expect(await invokeScopedControl("select-search-engine")).toBe(false);
  });
  expect(save).toHaveBeenCalledWith("https://www.google.com/search?q=%s");
  expect(host.textContent).toContain("wasn’t saved");
  expect(button("DuckDuckGo").getAttribute("aria-pressed")).toBe("true");
});
it("preserves native keyboard Enter, trim, and the actual custom URL", async () => {
  await render();
  await custom();
  await edit("  https://search.example/find?q=%s  ");
  input().focus();
  await act(async () => input().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(save).toHaveBeenCalledWith("https://search.example/find?q=%s");
  expect(input().value).toBe("https://search.example/find?q=%s");
  expect(host.textContent).toContain("Use %s where the search terms belong.");
});
it("retains the exact validation failure and makes no invalid save", async () => {
  await render();
  await custom();
  await edit("javascript:alert(%s)");
  await act(async () => button("Save").click());
  expect(save).not.toHaveBeenCalled();
  expect(host.textContent).toContain(SEARCH_ENGINE_TEMPLATE_ERROR);
  expect(input().value).toBe("javascript:alert(%s)");
});
it("refuses composition Enter without saving", async () => {
  await render();
  await custom();
  await edit("https://search.example/?q=%s");
  await act(async () =>
    input().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true })),
  );
  expect(save).not.toHaveBeenCalled();
});
it("reserves pending synchronously and preserves the original rejection", async () => {
  await render();
  const held = deferred<boolean>();
  save.mockReturnValue(held.promise);
  button("Google").focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("select-search-engine");
    expect(() => invokeScopedControl("select-search-engine")).toThrow();
  });
  const original = new Error("Save transport failed");
  await act(async () => {
    held.reject(original);
    await expect(completion).rejects.toBe(original);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(button("Google").disabled).toBe(false);
  expect(host.textContent).toContain("wasn’t saved");
});
it("retains original synchronous onSave failure through the real click completion", async () => {
  await render();
  const original = new Error("Synchronous save failure");
  save.mockImplementation(() => {
    throw original;
  });
  await act(async () => button("Google").click());
  expect(state.toast).toHaveBeenCalledWith(original);
  expect(host.textContent).toContain("wasn’t saved");
});
it("keeps fresh B busy when original A completes after value roundtrip", async () => {
  await render();
  const old = deferred<boolean>();
  save.mockReturnValueOnce(old.promise);
  await act(async () => button("Google").click());
  value = "https://new.example/?q=%s";
  await render();
  value = DEFAULT_SEARCH_ENGINE;
  await render();
  const fresh = deferred<boolean>();
  save.mockReturnValueOnce(fresh.promise);
  await act(async () => button("Microsoft Bing").click());
  await act(async () => old.resolve(true));
  expect(button("Microsoft Bing").disabled).toBe(true);
  expect(host.querySelector("input")).toBeNull();
  await act(async () => fresh.resolve(true));
  expect(document.querySelector('[role="dialog"][aria-label="Default search engine"]')).toBeNull();
  expect(state.toast).not.toHaveBeenCalled();
});
it("retires original window/private failures and preserves the new custom draft", async () => {
  await render();
  const old = deferred<boolean>();
  save.mockReturnValueOnce(old.promise);
  await act(async () => button("Google").click());
  state.privateMode = true;
  await render();
  state.privateMode = false;
  state.windowId = "two";
  await render();
  await custom();
  await edit("https://fresh.example/?q=%s");
  await act(async () => old.reject(new Error("Retired failure")));
  expect(state.toast).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(input().value).toBe("https://fresh.example/?q=%s");
});
it("returns the original successful ACK after replacement without stale draft delivery", async () => {
  await render();
  const old = deferred<boolean>();
  save.mockReturnValueOnce(old.promise);
  button("Google").focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("select-search-engine");
  });
  value = "https://new.example/?q=%s";
  await render();
  await edit("https://draft.example/?q=%s");
  await act(async () => {
    old.resolve(true);
    expect(await completion).toBe(true);
  });
  expect(input().value).toBe("https://draft.example/?q=%s");
});
it("refuses unrelated focus and preserves the existing draft when Custom closes", async () => {
  await render();
  host.tabIndex = -1;
  host.focus();
  expect(() => invokeScopedControl("select-search-engine")).toThrow();
  await custom();
  await edit("https://kept.example/?q=%s");
  await custom();
  await custom();
  expect(input().value).toBe("https://kept.example/?q=%s");
  expect(save).not.toHaveBeenCalled();
});

it("saves the exact Brave and Ecosia search templates through the preset controls", async () => {
  await render();
  await act(async () => button("Brave").click());
  expect(save).toHaveBeenLastCalledWith("https://search.brave.com/search?q=%s");
  await openPicker();
  await act(async () => button("Ecosia").click());
  expect(save).toHaveBeenLastCalledWith("https://www.ecosia.org/search?q=%s&addon=manualopensearch");
});
it("closes the acknowledged menu while keeping the same trigger for focus return", async () => {
  await render();
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Default search engine"]')!;
  value = "https://search.brave.com/search?q=%s";
  await act(async () => root.render(<SearchEngineSetting value={value} onSave={save} />));
  expect(document.querySelector('[role="dialog"][aria-label="Default search engine"]')).toBeNull();
  expect(host.querySelector('[aria-label="Default search engine"]')).toBe(trigger);
  expect(trigger.textContent).toContain("Brave");
});

it("recognizes the native Brave preset after Chromium adds its source parameter without rewriting it", async () => {
  value = "https://search.brave.com/search?q=%s&source=csChrome";
  await render();
  expect(button("Brave").getAttribute("aria-pressed")).toBe("true");
  expect(host.querySelector("input")).toBeNull();
  expect(save).not.toHaveBeenCalled();
  await custom();
  expect(input().value).toBe(value);
});
it("keeps different endpoints and search placeholders custom", async () => {
  for (const template of [
    "https://search.brave.com/other?q=%s",
    "https://other.example/search?q=%s",
    "https://search.brave.com/search?q=constant&term=%s",
  ]) {
    value = template;
    await render();
    expect(button("Brave").getAttribute("aria-pressed")).toBe("false");
    expect(input().value).toBe(template);
  }
});

it("opens at the actual selected choice, traverses options and restores the same trigger on Escape", async () => {
  await render();
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Default search engine"]')!;
  const panel = document.querySelector<HTMLDialogElement>('dialog[aria-label="Default search engine"]')!;
  expect(panel.classList.contains("popup-material")).toBe(true);
  expect(panel.classList.contains("ui-select-menu")).toBe(true);
  expect(document.activeElement).toBe(button("DuckDuckGo"));
  await act(async () =>
    button("DuckDuckGo").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    ),
  );
  expect(document.activeElement).toBe(button("Brave"));
  await act(async () =>
    button("Brave").dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }),
    ),
  );
  expect(document.activeElement).toBe(button("Custom…"));
  await act(async () =>
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(document.querySelector('dialog[aria-label="Default search engine"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(save).not.toHaveBeenCalled();
});

it("aligns and focuses Custom for a persisted non-preset without saving or changing its editor draft", async () => {
  value = "https://search.example/find?q=%s";
  await render();
  expect(document.activeElement).toBe(button("Custom…"));
  expect(input().value).toBe(value);
  expect(save).not.toHaveBeenCalled();
});
