// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { readResultDraft, writeResultDraft } from "../result-drafts";
import { SavedResultPreview } from "./SavedResultPreview";
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDialogElement, root: ReturnType<typeof createRoot>;
const close = vi.fn(),
  changed = vi.fn(),
  citation = vi.fn();
const file = (id = "one", chat = "a", content = "Name,Value\nOriginal,42", mediaType = "text/csv") => ({
  artifactId: id,
  chatId: chat,
  filename: "report.csv",
  mediaType,
  content,
  createdAt: 1,
  revision: 2,
});
type Pending<T> = { promise: Promise<T>; resolve(value: T): void; reject(reason: unknown): void };
function hold<T>(): Pending<T> {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
let reads: Pending<ReturnType<typeof file>>[],
  mutations: { method: string; params: unknown; pending: Pending<unknown> }[],
  exports: Pending<string | null>[],
  copies: Pending<void>[],
  data: Map<string, string>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  data = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  });
  writeResultDraft("one", null);
  writeResultDraft("two", null);
  useStore.setState({ ...initial, connected: false, toasts: [] }, true);
  close.mockReset();
  changed.mockReset();
  citation.mockReset();
  citation.mockReturnValue(true);
  reads = [];
  mutations = [];
  exports = [];
  copies = [];
  vi.spyOn(bridge, "invoke").mockImplementation((method, params) => {
    if (method === "results.read") {
      const pending = hold<ReturnType<typeof file>>();
      reads.push(pending);
      return pending.promise;
    }
    const pending = hold<unknown>();
    mutations.push({ method, params, pending });
    return pending.promise;
  });
  vi.spyOn(bridge, "saveFile").mockImplementation(() => {
    const pending = hold<string | null>();
    exports.push(pending);
    return pending.promise;
  });
  vi.spyOn(bridge, "saveWorkbook").mockImplementation(() => {
    const pending = hold<string | null>();
    exports.push(pending);
    return pending.promise;
  });
  vi.stubGlobal("navigator", {
    clipboard: {
      writeText: vi.fn(() => {
        const pending = hold<void>();
        copies.push(pending);
        return pending.promise;
      }),
    },
  });
  host = document.createElement("dialog");
  host.open = true;
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  writeResultDraft("one", null);
  writeResultDraft("two", null);
  useStore.setState(initial, true);
  bridge.windowId = originalWindow;
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const ids = {
  close: "close-saved-result-preview",
  toggle: "toggle-saved-result-source",
  copy: "copy-saved-result",
  menu: "toggle-saved-result-export",
  export: "export-saved-result",
  excel: "export-saved-result-excel",
  retry: "retry-saved-result-read",
  discard: "discard-saved-result-edits",
  save: "save-saved-result-version",
  attach: "attach-saved-result-copy",
};
async function render(chat = "a", id = "one", contextDisabled = false) {
  await act(async () =>
    root.render(
      <SavedResultPreview
        chatId={chat}
        artifactId={id}
        contextDisabled={contextDisabled}
        onClose={close}
        onVersionSaved={changed}
        onCitationOpen={citation}
      />,
    ),
  );
}
async function ready(draft = false) {
  if (draft)
    writeResultDraft("one", { chatId: "a", source: file().content, content: "Name,Value\nEdited,43" });
  await render();
  await act(async () => reads[0]!.resolve(file()));
}
const control = (id: string) => host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
const trigger = () => host.querySelector<HTMLButtonElement>('[aria-label="Export result"]')!;
const item = (name: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((node) =>
    node.textContent?.includes(name),
  )!;
async function command(id: string, node?: HTMLButtonElement) {
  let result!: Promise<unknown>;
  await act(async () => {
    (node ?? control(id)).focus();
    result = executeCommand(id);
    void result.catch(() => {});
  });
  return { result };
}
async function menu() {
  await act(async () => trigger().click());
}
it("all ten original actions use normal scoped metadata and close offline retains ACK", async () => {
  await ready();
  for (const id of Object.values(ids))
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
    });
  const ack = { closed: true };
  close.mockReturnValue(ack);
  await expect((await command(ids.close)).result).resolves.toBe(ack);
  expect(useStore.getState().connected).toBe(false);
});
it("actual Export menu pointer keeps original file args and closes/focuses original trigger", async () => {
  await ready();
  await menu();
  expect(document.querySelector<HTMLDialogElement>('[role="menu"]')?.open).toBe(true);
  await act(async () => item("Export file").click());
  expect(bridge.saveFile).toHaveBeenCalledExactlyOnceWith("report.csv", file().content);
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(trigger());
  await act(async () => exports[0]!.resolve("/tmp/report.csv"));
  expect(useStore.getState().toasts.map((value) => value.text)).toContain("Result exported");
});
it("focused remapped original menu opener and Excel item keep actual workbook ACK", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        [ids.menu]: [{ key: "j", command: true, alt: true }],
        [ids.excel]: [{ key: "k", command: true, alt: true }],
      },
    },
  });
  await ready();
  await act(async () => {
    trigger().focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  await act(async () => {
    item("Excel").focus();
    expect(dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(bridge.saveWorkbook).toHaveBeenCalledExactlyOnceWith(file().content, "csv");
  await act(async () => exports[0]!.resolve(null));
  expect(useStore.getState().toasts).toEqual([]);
});
it("saved version retains exact draft/source params, original ACK and durable draft cleanup", async () => {
  await ready(true);
  const operation = await command(ids.save);
  expect(mutations[0]).toMatchObject({
    method: "results.saveVersion",
    params: { chatId: "a", sourceArtifactId: "one", content: "Name,Value\nEdited,43" },
  });
  const ack = { artifactId: "new", filename: "report.csv", revision: 3 };
  await act(async () => mutations[0]!.pending.resolve(ack));
  await expect(operation.result).resolves.toBe(ack);
  expect(changed).toHaveBeenCalledExactlyOnceWith("new");
  expect(readResultDraft("one")).toBeNull();
});
it("attaches exact bounded edited copy and retains actual ACK/included state", async () => {
  await ready(true);
  const operation = await command(ids.attach);
  expect(mutations[0]).toMatchObject({
    method: "conversations.attachments.add",
    params: {
      chatId: "a",
      filename: "edited-report.csv",
      content: "Name,Value\nEdited,43",
      sourceArtifactId: "one",
    },
  });
  const ack = { attachmentId: "actual", included: true };
  await act(async () => mutations[0]!.pending.resolve(ack));
  await expect(operation.result).resolves.toBe(ack);
  expect(control(ids.attach).textContent).toBe("Copy attached");
  expect(control(ids.attach).disabled).toBe(true);
});
it("same-tick original mutation reservation rejects duplicate admission", async () => {
  await ready(true);
  await act(async () => {
    control(ids.save).click();
    control(ids.attach).click();
  });
  expect(mutations).toHaveLength(1);
  await act(async () =>
    mutations[0]!.pending.resolve({ artifactId: "new", filename: "report.csv", revision: 3 }),
  );
});
it("held save A→B→A cannot delete newest human draft or clear fresh busy", async () => {
  await ready(true);
  const old = await command(ids.save);
  await render("b", "two");
  await render();
  await act(async () => reads[2]!.resolve(file()));
  const freshDraft = { chatId: "a", source: file().content, content: "Name,Value\nFresh,99" };
  writeResultDraft("one", freshDraft);
  await render("a", "two");
  await render();
  await act(async () => reads[4]!.resolve(file()));
  const fresh = await command(ids.save);
  const oldAck = { artifactId: "old", filename: "report.csv", revision: 3 };
  await act(async () => mutations[0]!.pending.resolve(oldAck));
  await expect(old.result).resolves.toBe(oldAck);
  expect(readResultDraft("one")).toEqual(freshDraft);
  expect(changed).not.toHaveBeenCalled();
  expect(control(ids.save).disabled).toBe(true);
  const freshAck = { artifactId: "fresh", filename: "report.csv", revision: 3 };
  await act(async () => mutations[1]!.pending.resolve(freshAck));
  await expect(fresh.result).resolves.toBe(freshAck);
  expect(changed).toHaveBeenCalledExactlyOnceWith("fresh");
});
it("observed foreign window ABA refuses held mutation failure/toast and later local actions", async () => {
  await ready(true);
  const operation = await command(ids.attach);
  bridge.windowId = "foreign";
  await act(async () => control(ids.close).click());
  bridge.windowId = originalWindow;
  const reason = new Error("Original retired attach error");
  await act(async () => mutations[0]!.pending.reject(reason));
  await expect(operation.result).rejects.toBe(reason);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(useStore.getState().toasts).toEqual([]);
  control(ids.discard).focus();
  await expect(executeCommand(ids.discard)).rejects.toThrow();
  expect(readResultDraft("one")).not.toBeNull();
});
it("original active revision error stays inline, exact rejection and busy recover", async () => {
  await ready(true);
  const operation = await command(ids.save);
  const reason = new Error("Original revision failure");
  await act(async () => mutations[0]!.pending.reject(reason));
  await expect(operation.result).rejects.toBe(reason);
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(reason.message);
  expect(control(ids.save).disabled).toBe(false);
  expect(useStore.getState().toasts).toEqual([]);
});
it("Copy uses original human content and retires delayed clipboard toast after draft changes", async () => {
  await ready(true);
  const operation = await command(ids.copy);
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Name,Value\nEdited,43");
  await command(ids.discard);
  await act(async () => copies[0]!.resolve());
  await expect(operation.result).resolves.toBeUndefined();
  expect(useStore.getState().toasts).toEqual([]);
  expect(readResultDraft("one")).toBeNull();
});
it("held export rejection retains reason without presenting to new result", async () => {
  await ready();
  await menu();
  const operation = await command(ids.export, item("Export file"));
  await render("a", "two");
  await act(async () => reads[1]!.resolve(file("two")));
  const reason = new Error("Retired export");
  await act(async () => exports[0]!.reject(reason));
  await expect(operation.result).rejects.toBe(reason);
  expect(useStore.getState().toasts).toEqual([]);
});
it("Retry renews exact original read and current not_found revokes only original draft", async () => {
  await ready(true);
  await render("a", "two");
  await render();
  const reason = Object.assign(new Error("Actual missing"), { code: "not_found" });
  await act(async () => reads[2]!.reject(reason));
  expect(readResultDraft("one")).toBeNull();
  await command(ids.retry);
  expect(reads).toHaveLength(4);
  await act(async () => reads[3]!.resolve(file()));
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("old not_found after artifact ABA cannot revoke new same-artifact draft", async () => {
  writeResultDraft("one", { chatId: "a", source: file().content, content: "Retained human copy" });
  await render();
  await render("a", "two");
  await render();
  await act(async () => reads[2]!.resolve(file()));
  await act(async () => reads[0]!.reject(Object.assign(new Error("Old missing"), { code: "not_found" })));
  expect(readResultDraft("one")?.content).toBe("Retained human copy");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("original source conflict/context-disabled gates save/attach while export remains usable", async () => {
  writeResultDraft("one", { chatId: "a", source: "Earlier source", content: "My retained edits" });
  await render("a", "one", true);
  await act(async () => reads[0]!.resolve(file()));
  expect(control(ids.save).disabled).toBe(true);
  expect(control(ids.attach).disabled).toBe(true);
  expect(host.textContent).toContain("source changed");
  await menu();
  await command(ids.export, item("Export file"));
  expect(bridge.saveFile).toHaveBeenCalledWith("edited-report.csv", "My retained edits");
  await act(async () => exports[0]!.resolve(null));
});
it("hidden/unfocused/Private real controls refuse clipboard and mutations", async () => {
  await ready(true);
  control(ids.copy).hidden = true;
  control(ids.copy).focus();
  await expect(executeCommand(ids.copy)).rejects.toThrow();
  bridge.privateMode = true;
  control(ids.save).focus();
  await expect(executeCommand(ids.save)).rejects.toThrow();
  expect(copies).toEqual([]);
  expect(mutations).toEqual([]);
});

it("recorded markdown navigation retains modifier URL and retired source cannot fall back to new tab", async () => {
  const newTab = vi.fn().mockResolvedValue("actual-tab");
  useStore.setState({ newTab });
  await render();
  await act(async () =>
    reads[0]!.resolve(file("one", "a", "[Original source](https://example.test/original)", "text/markdown")),
  );
  const link = host.querySelector<HTMLAnchorElement>("a")!;
  await act(async () =>
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true })),
  );
  expect(citation).toHaveBeenCalledExactlyOnceWith("https://example.test/original", true);
  citation.mockClear();
  bridge.windowId = "foreign";
  await act(async () => link.click());
  bridge.windowId = originalWindow;
  await act(async () => link.click());
  expect(citation).not.toHaveBeenCalled();
  expect(newTab).not.toHaveBeenCalled();
});
it("remapped current Save reports the original revision failure inline without a global duplicate", async () => {
  useStore.setState({
    settings: { shortcutOverrides: { [ids.save]: [{ key: "l", command: true, alt: true }] } },
  });
  await ready(true);
  await act(async () => {
    control(ids.save).focus();
    expect(dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true);
  });
  const reason = new Error("Original remapped revision failure");
  await act(async () => mutations[0]!.pending.reject(reason));
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(reason.message);
  expect(useStore.getState().toasts).toEqual([]);
  expect(control(ids.save).disabled).toBe(false);
});

it("committed layout-cut result change cannot dispatch old result Copy before passive clear", async () => {
  let attack = false,
    completion: Promise<unknown> | undefined;
  function Probe({ attack }: { attack: boolean }) {
    useLayoutEffect(() => {
      if (attack) {
        control(ids.copy).focus();
        completion = executeCommand(ids.copy);
        void completion.catch(() => {});
      }
    }, [attack]);
    return null;
  }
  function View({ id, chat }: { id: string; chat: string }) {
    return (
      <>
        <SavedResultPreview artifactId={id} chatId={chat} onClose={close} />
        <Probe attack={attack} />
      </>
    );
  }
  await act(async () => root.render(<View id="one" chat="a" />));
  await act(async () => reads[0]!.resolve(file()));
  attack = true;
  await act(async () => root.render(<View id="two" chat="b" />));
  expect(copies).toEqual([]);
  await expect(completion).rejects.toThrow();
  await act(async () => reads[1]!.resolve(file("two", "b")));
  await command(ids.copy);
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(file("two", "b").content);
  await act(async () => copies[0]!.resolve());
});
