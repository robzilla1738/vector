// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts/commands";
import { SEARCH_ENGINE_TEMPLATE_ERROR } from "@aux/contracts/search-engine";
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
import { SearchEnginesSetting, type EngineRow } from "./settings/search-engines";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement,
  root: Root,
  value: EngineRow[],
  save: ReturnType<typeof vi.fn<(value: EngineRow[]) => Promise<boolean>>>;
const first = { keyword: "gh", name: "GitHub", template: "https://github.com/search?q=%s" };
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
async function render() {
  await act(async () => root.render(<SearchEnginesSetting value={value} onSave={save} />));
}
const add = () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Add")!;
const remove = (keyword: string) =>
  host.querySelector<HTMLButtonElement>(`button[aria-label="Remove ${keyword} engine"]`)!;
const input = (label: string) => host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
async function edit(label: string, next: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input(label), next);
    input(label).dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function draft(keyword = " WIKI ", name = " My search ", template = " https://search.example/?q=%s ") {
  await edit("Keyword", keyword);
  await edit("Engine name", name);
  await edit("Search URL", template);
}
beforeEach(() => {
  state.windowId = "one";
  state.privateMode = false;
  state.toast.mockReset();
  value = [{ ...first }];
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
it("registers two exact original action types and preserves window policy", () => {
  for (const id of ["add-keyword-search-engine", "remove-keyword-search-engine"]) {
    const rows = COMMANDS.filter((row) => row.id === id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ handler: "shell", palette: false, bindings: [] });
    expect(rows[0]).not.toHaveProperty("windows");
  }
});
it("normalizes keyword, trims URL, caps name, and merges the actual snapshot", async () => {
  await render();
  await draft(" WIKI ", " X".repeat(70));
  await act(async () => add().click());
  const expected = save.mock.calls[0]![0];
  expect(expected[0]).toEqual(first);
  expect(expected[1]).toEqual({
    keyword: "wiki",
    name: " X".repeat(70).trim().slice(0, 60),
    template: "https://search.example/?q=%s",
  });
  expect(input("Keyword").value).toBe("");
  expect(host.textContent).toContain("merge unless you override the keyword");
});
it("overwrites only the matching user keyword and preserves unrelated rows", async () => {
  value = [{ ...first }, { keyword: "g", name: "Google", template: "https://google.com/search?q=%s" }];
  await render();
  await draft(" GH ", "Replacement");
  await act(async () => add().click());
  expect(save.mock.calls[0]![0]).toEqual([
    value[1],
    { keyword: "gh", name: "Replacement", template: "https://search.example/?q=%s" },
  ]);
  expect(value).toHaveLength(2);
});
it("removes only the original focused keyword and retains the draft", async () => {
  value = [{ ...first }, { keyword: "g", name: "Google", template: "https://google.com/search?q=%s" }];
  await render();
  await draft();
  remove("gh").focus();
  await act(async () => {
    expect(await invokeScopedControl("remove-keyword-search-engine")).toBe(true);
  });
  expect(save).toHaveBeenCalledWith([value[1]]);
  expect(input("Keyword").value).toBe(" WIKI ");
});
it("preserves false ACK and offers transport recovery without erasing the draft", async () => {
  await render();
  await draft();
  save.mockResolvedValueOnce(false);
  await act(async () => add().click());
  expect(host.textContent).toContain("weren’t saved");
  expect(input("Keyword").value).toBe(" WIKI ");
  await act(async () => add().click());
  expect(save).toHaveBeenCalledTimes(2);
  expect(input("Keyword").value).toBe("");
});
it("validates keyword, name and URL through actual input Enter without a mutation", async () => {
  await render();
  for (const [keyword, name, template, message] of [
    ["1bad", "Name", "https://search.example/?q=%s", "Keywords start with a letter"],
    ["good", " ", "https://search.example/?q=%s", "Name the engine"],
    ["good", "Name", "https://user:secret@example.com/?q=%s", SEARCH_ENGINE_TEMPLATE_ERROR],
  ]) {
    await draft(keyword, name, template);
    await act(async () =>
      input("Search URL").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
    );
    expect(host.textContent).toContain(message);
  }
  expect(save).not.toHaveBeenCalled();
});
it("keeps IME composition separate and dispatches genuine keyboard Enter", async () => {
  await render();
  await draft();
  await act(async () =>
    input("Search URL").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
    ),
  );
  expect(save).not.toHaveBeenCalled();
  await act(async () =>
    input("Search URL").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
  );
  expect(save).toHaveBeenCalledTimes(1);
});
it("synchronously reserves pending and preserves the exact active rejection", async () => {
  await render();
  await draft();
  const held = deferred<boolean>();
  save.mockReturnValueOnce(held.promise);
  add().focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("add-keyword-search-engine");
    expect(() => invokeScopedControl("add-keyword-search-engine")).toThrow();
  });
  const original = new Error("Original transport failure");
  await act(async () => {
    held.reject(original);
    await expect(completion).rejects.toBe(original);
  });
  expect(input("Keyword").value).toBe(" WIKI ");
  expect(add().disabled).toBe(false);
  expect(save).toHaveBeenCalledTimes(1);
});
it("retains synchronous original onSave failure and recovers through the same Add control", async () => {
  await render();
  await draft();
  const original = new Error("Synchronous transport failure");
  save.mockImplementationOnce(() => {
    throw original;
  });
  await act(async () => add().click());
  expect(state.toast).toHaveBeenCalledWith(original);
  expect(input("Keyword").value).toBe(" WIKI ");
  await act(async () => add().click());
  expect(input("Keyword").value).toBe("");
});
it("old snapshot ACK cannot erase new draft or clear fresh pending after A to B to A", async () => {
  await render();
  await draft();
  const old = deferred<boolean>();
  save.mockReturnValueOnce(old.promise);
  await act(async () => add().click());
  value = [{ ...first, name: "Replacement" }];
  await render();
  value = [{ ...first }];
  await render();
  await draft("new", "Fresh", "https://fresh.example/?q=%s");
  const fresh = deferred<boolean>();
  save.mockReturnValueOnce(fresh.promise);
  await act(async () => add().click());
  await act(async () => old.resolve(true));
  expect(add().disabled).toBe(true);
  expect(input("Keyword").value).toBe("new");
  await act(async () => fresh.resolve(true));
  expect(input("Keyword").value).toBe("");
});
it("original Private/window retirement preserves original rejection and refuses old notices", async () => {
  await render();
  await draft();
  const held = deferred<boolean>();
  save.mockReturnValueOnce(held.promise);
  add().focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("add-keyword-search-engine");
  });
  state.privateMode = true;
  await render();
  state.privateMode = false;
  state.windowId = "two";
  await render();
  await draft("new");
  const original = new Error("Retired failure");
  await act(async () => {
    held.reject(original);
    await expect(completion).rejects.toBe(original);
  });
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(state.toast).not.toHaveBeenCalled();
  expect(input("Keyword").value).toBe("new");
});
it("returns original retired success without replacing the current draft", async () => {
  await render();
  await draft();
  const held = deferred<boolean>();
  save.mockReturnValueOnce(held.promise);
  add().focus();
  let completion: unknown;
  await act(async () => {
    completion = invokeScopedControl("add-keyword-search-engine");
  });
  value = [{ ...first, name: "New snapshot" }];
  await render();
  await edit("Keyword", "fresh");
  await act(async () => {
    held.resolve(true);
    expect(await completion).toBe(true);
  });
  expect(input("Keyword").value).toBe("fresh");
});
it("keeps pending across equivalent snapshot rerenders and refuses unrelated focus", async () => {
  await render();
  expect(() => invokeScopedControl("remove-keyword-search-engine")).toThrow();
  await draft();
  const held = deferred<boolean>();
  save.mockReturnValueOnce(held.promise);
  await act(async () => add().click());
  value = value.map((row) => ({ ...row }));
  await render();
  expect(add().disabled).toBe(true);
  await act(async () => held.resolve(true));
  expect(input("Keyword").value).toBe("");
});
