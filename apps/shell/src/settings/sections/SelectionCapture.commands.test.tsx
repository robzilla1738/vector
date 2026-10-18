// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { invokeScopedControl } from "../../scoped-control-commands";
import { reportCommandCompletionFailure } from "../../command-completion";
import { SelectionCaptureSettings } from "./SelectionCapture";
const ids = [
  "save-selection-capture-settings",
  "save-selection-action",
  "reload-selection-capture-settings",
  "toggle-selection-action",
  "move-selection-action-up",
  "move-selection-action-down",
  "preview-selection-action",
  "remove-selection-action",
  "add-selection-action",
  "close-selection-action-preview",
  "record-selection-capture-shortcut",
  "disable-selection-capture-shortcut",
  "toggle-inline-assist",
];
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let settings: { selectionCapture: ReturnType<typeof defaultSelectionCaptureSettings> }, active: boolean;
const save = vi.fn();
const originalBridge = {
  windowId: bridge.windowId,
  windowKind: bridge.windowKind,
  privateMode: bridge.privateMode,
};
let originalConnected: boolean;
const held = <T,>() => {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
const named = (label: string) => document.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const button = (label: string) =>
  [
    ...document.querySelectorAll<HTMLButtonElement>("dialog button"),
    ...host.querySelectorAll<HTMLButtonElement>("button"),
  ].find((node) => node.textContent?.trim() === label)!;
const template = () => document.querySelector<HTMLTextAreaElement>("dialog textarea")!;
const saveButton = () =>
  document.querySelector<HTMLButtonElement>('dialog button[type="submit"]') ??
  button("Save Selection & Capture");
const saveCommand = () => saveButton().dataset.commandId!;
const invokeSave = () => invokeScopedControl(saveCommand());
async function render() {
  await act(async () =>
    root.render(<SelectionCaptureSettings active={active} settings={settings} onSave={save} />),
  );
}
async function openAction(name?: string) {
  const dialog = document.querySelector<HTMLDialogElement>("dialog");
  if (dialog && (!name || dialog.getAttribute("aria-label") === `Edit ${name}`)) return;
  if (dialog)
    await act(async () =>
      dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
  await act(async () =>
    (name
      ? named(`Edit ${name}`)
      : host.querySelector<HTMLButtonElement>(".selection-action-row button")!
    ).click(),
  );
}
async function write(text: string) {
  await openAction();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(template(), text);
    template().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function invoke(id: string, element: HTMLElement) {
  let result: unknown;
  await act(async () => {
    element.focus();
    result = invokeScopedControl(id);
  });
  return result;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 160, height: 36 },
  ] as unknown as DOMRectList);
  bridge.windowId = "original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  originalConnected = useStore.getState().connected;
  useStore.setState({ connected: true });
  settings = { selectionCapture: defaultSelectionCaptureSettings() };
  active = true;
  save.mockReset().mockResolvedValue(true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Object.assign(bridge, originalBridge);
  useStore.setState({ connected: originalConnected });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("registers the focused normal Settings commands without adding shortcuts", () => {
  for (const id of ids) {
    const rows = COMMANDS.filter((row) => row.id === id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      handler: "shell",
      section: "Application",
      dispatch: "scoped",
      focusShell: true,
      palette: false,
      windows: ["normal"],
      bindings: [],
      intercept: true,
    });
  }
});
it("uses the exact focused original row for moves/preview/removal and retains local-only content", async () => {
  const native = vi.spyOn(bridge, "invoke");
  await render();
  await openAction("Explain");
  await invoke("move-selection-action-up", named("Move Explain up"));
  expect(document.querySelector<HTMLInputElement>('[aria-label="Action 1 name"]')!.value).toBe("Explain");
  await invoke("preview-selection-action", button("Preview Explain"));
  expect(document.querySelector('[aria-label="Selection action preview"]')!.textContent).toContain(
    "Local preview · example content",
  );
  await invoke("close-selection-action-preview", button("Close preview"));
  await invoke("remove-selection-action", named("Remove Explain"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(3);
  expect(document.activeElement).toBe(button("Add selection action"));
  expect(save).toHaveBeenCalledTimes(1);
  expect(
    save.mock.calls[0]![0].selectionCapture.actions.some((action: { id: string }) => action.id === "explain"),
  ).toBe(false);
  expect(native).not.toHaveBeenCalled();
});
it("requires current-window admission before an original save dispatch", async () => {
  await render();
  await write("Draft to preserve {text}");
  saveButton().focus();
  bridge.windowId = "replacement";
  expect(() => invokeSave()).toThrow("current");
  expect(save).not.toHaveBeenCalled();
});
it("reserves same-tick saves and returns the original false ACK with retained draft", async () => {
  await render();
  await write("Same tick {text}");
  const old = held<boolean>();
  save.mockReturnValueOnce(old.promise);
  saveButton().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeSave() as Promise<unknown>;
    expect(() => invokeSave()).toThrow("current");
  });
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => old.resolve(false));
  expect(await completion).toBe(false);
  expect(template().value).toBe("Same tick {text}");
  expect(document.body.textContent).toContain("Your edits are still here");
});
it("does not let retired success overwrite a fresh window draft or clear its pending save", async () => {
  await render();
  await write("Original draft {text}");
  const old = held<boolean>(),
    fresh = held<boolean>();
  save.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  saveButton().focus();
  let oldCompletion!: Promise<unknown>, freshCompletion!: Promise<unknown>;
  await act(async () => {
    oldCompletion = invokeSave() as Promise<unknown>;
  });
  bridge.windowId = "replacement";
  await render();
  await write("Fresh draft {text}");
  saveButton().focus();
  await act(async () => {
    freshCompletion = invokeSave() as Promise<unknown>;
  });
  await act(async () => old.resolve(true));
  expect(await oldCompletion).toBe(true);
  expect(template().value).toBe("Fresh draft {text}");
  expect(button("Saving…").disabled).toBe(true);
  expect(document.body.textContent).not.toContain("Saved for this Profile");
  await act(async () => fresh.resolve(false));
  expect(await freshCompletion).toBe(false);
  expect(template().value).toBe("Fresh draft {text}");
  expect(document.body.textContent).toContain("Your edits are still here");
});
it("returns a retired original rejection without publishing it after committed Private ABA", async () => {
  await render();
  await write("Original draft {text}");
  const old = held<boolean>();
  save.mockReturnValueOnce(old.promise);
  saveButton().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeSave() as Promise<unknown>;
  });
  const reason = new Error("Original protected transport <diagnostic>");
  const observed = completion.catch((error) => error);
  bridge.privateMode = true;
  await render();
  bridge.privateMode = false;
  await render();
  await write("Current draft {text}");
  await act(async () => old.reject(reason));
  expect(await observed).toBe(reason);
  const errors = vi.fn();
  reportCommandCompletionFailure(completion, reason, errors);
  expect(errors).not.toHaveBeenCalled();
  expect(document.body.textContent).not.toContain(reason.message);
  expect(template().value).toBe("Current draft {text}");
});
it("retains actual external-revision conflict and suppresses stale acknowledged delivery", async () => {
  await render();
  await write("My unsaved source {text}");
  const old = held<boolean>();
  save.mockReturnValueOnce(old.promise);
  saveButton().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeSave() as Promise<unknown>;
  });
  settings = { selectionCapture: { ...settings.selectionCapture, revision: 1, inlineAssist: false } };
  await render();
  await act(async () => old.resolve(true));
  expect(await completion).toBe(true);
  expect(template().value).toBe("My unsaved source {text}");
  expect(document.body.textContent).toContain("changed in another window");
  expect(document.body.textContent).not.toContain("Saved for this Profile");
  await act(async () => button("Reload saved action").click());
  expect(template().value).not.toContain("My unsaved");
});
it("retires recording across connected incarnation and retains genuine Escape/modified-key input semantics", async () => {
  await render();
  const record = named("Record region-capture shortcut");
  await invoke("record-selection-capture-shortcut", record);
  await act(async () => useStore.setState({ connected: false }));
  await render();
  await act(async () => useStore.setState({ connected: true }));
  await render();
  await act(async () =>
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true }),
    ),
  );
  expect(document.body.textContent).toContain("Off. No capture shortcut requested.");
  await invoke("record-selection-capture-shortcut", record);
  await act(async () => record.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(record.textContent).toBe("Record shortcut");
  await invoke("record-selection-capture-shortcut", record);
  await act(async () =>
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true }),
    ),
  );
  await invoke(saveCommand(), saveButton());
  expect(save.mock.calls[0]![0].selectionCapture.regionCapture).toEqual({
    key: "9",
    command: true,
    ctrl: false,
    alt: true,
    shift: false,
  });
});

it("reproduces the original late-ACK busy leak using actual Save clicks after window retirement", async () => {
  await render();
  await write("Original pending action {text}");
  const old = held<boolean>();
  save.mockReturnValueOnce(old.promise);
  await act(async () => saveButton().click());
  expect(template().disabled).toBe(true);
  bridge.windowId = "replacement";
  await render();
  await openAction();
  try {
    expect(template().disabled).toBe(false);
  } finally {
    await act(async () => old.resolve(true));
  }
  expect(document.body.textContent).not.toContain("Saved for this Profile");
});
it("dispatches original checkbox, add and shortcut-disable controls without native capture", async () => {
  await render();
  const native = vi.spyOn(bridge, "invoke");
  await openAction();
  const enabled = document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!;
  await invoke("toggle-selection-action", enabled);
  expect(enabled.checked).toBe(false);
  await act(async () =>
    document
      .querySelector("dialog")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  const inline = host.querySelector<HTMLInputElement>('[aria-label="Enable inline assist"]')!;
  const previous = inline.checked;
  await invoke("toggle-inline-assist", inline);
  expect(inline.checked).toBe(!previous);
  const count = host.querySelectorAll(".selection-action-row").length;
  await invoke("add-selection-action", button("Add selection action"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(count);
  await act(async () => button("Cancel").click());
  const record = named("Record selection double-tap shortcut");
  await invoke("record-selection-capture-shortcut", record);
  await act(async () =>
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true }),
    ),
  );
  const off = button("Turn off");
  expect(off).toBeDefined();
  await invoke("disable-selection-capture-shortcut", off);
  await invoke(saveCommand(), saveButton());
  expect(save.mock.calls[0]![0].selectionCapture.selectionDoubleTap).toBe(null);
  expect(save.mock.calls[0]![0].selectionCapture.inlineAssist).toBe(!previous);
  expect(native).not.toHaveBeenCalled();
});
it("preserves a synchronous original save rejection and recovers through the same registered Save", async () => {
  await render();
  await write("Recover my draft {text}");
  const reason = new Error("Original synchronous save failure");
  save.mockImplementationOnce(() => {
    throw reason;
  });
  saveButton().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invokeSave() as Promise<unknown>;
    await expect(completion).rejects.toBe(reason);
  });
  expect(template().value).toBe("Recover my draft {text}");
  expect(document.body.textContent).toContain(reason.message);
  expect(saveButton().disabled).toBe(false);
  expect(await invoke(saveCommand(), saveButton())).toBe(true);
  expect(document.body.textContent).toContain("Saved for this Profile");
});

it("validates and saves the exact latest same-tick original draft", async () => {
  await render();
  await write("Earlier edited draft {text}");
  const target = template();
  let completion!: Promise<unknown>;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
      target,
      "Latest original draft {text}",
    );
    target.dispatchEvent(new Event("input", { bubbles: true }));
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
    await completion;
  });
  expect(save.mock.calls[0]![0].selectionCapture.actions[0].template).toBe("Latest original draft {text}");
});

it("permanently retires an observed uncommitted window mismatch rather than reviving A", async () => {
  await render();
  await write("Original before mismatch {text}");
  saveButton().focus();
  bridge.windowId = "replacement";
  expect(() => invokeSave()).toThrow("current");
  bridge.windowId = "original";
  expect(() => invokeSave()).toThrow("current");
  expect(save).not.toHaveBeenCalled();
});
it("does not revive held original ACK delivery after an observed no-render window ABA", async () => {
  await render();
  await openAction("Explain");
  await invoke("preview-selection-action", button("Preview Explain"));
  await write("Original held draft {text}");
  const old = held<boolean>();
  save.mockReturnValueOnce(old.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
  });
  const present = save.mock.calls[0]![1] as () => boolean;
  bridge.windowId = "replacement";
  expect(present()).toBe(false);
  bridge.windowId = "original";
  await act(async () => old.resolve(true));
  expect(await completion).toBe(true);
  expect(template().value).toBe("Original held draft {text}");
  expect(document.body.textContent).not.toContain("Saved for this Profile");
});

it("accepts its exact persisted revision broadcast before the save acknowledgement", async () => {
  await render();
  await write("My native save {text}");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
  });
  const submitted = save.mock.calls[0]![0].selectionCapture;
  settings = { selectionCapture: { ...submitted, revision: submitted.revision + 1 } };
  await render();
  expect(document.body.textContent).not.toContain("changed in another window");
  expect(button("Saving…").disabled).toBe(true);
  await act(async () => pending.resolve(true));
  expect(await completion).toBe(true);
  expect(document.body.textContent).toContain("Saved for this Profile");
  expect(saveButton().disabled).toBe(true);
  await openAction();
  expect(template().value).toBe("My native save {text}");
});

it("does not turn a matching broadcast into a successful save without an accepted acknowledgement", async () => {
  await render();
  await write("Still waiting for acknowledgement {text}");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
  });
  const submitted = save.mock.calls[0]![0].selectionCapture;
  settings = { selectionCapture: { ...submitted, revision: submitted.revision + 1 } };
  await render();
  await act(async () => pending.resolve(false));
  expect(await completion).toBe(false);
  expect(document.body.textContent).not.toContain("Saved for this Profile");
  expect(template().value).toBe("Still waiting for acknowledgement {text}");
  expect(button("Reload saved action")).toBeDefined();
});

it("does not retire a second save when the previous acknowledged broadcast arrives late", async () => {
  await render();
  await write("First accepted action {text}");
  await invoke(saveCommand(), saveButton());
  const first = save.mock.calls[0]![0].selectionCapture;
  await write("Second accepted action {text}");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
  });
  settings = { selectionCapture: { ...first, revision: first.revision + 1 } };
  await render();
  expect(button("Saving…").disabled).toBe(true);
  await act(async () => pending.resolve(true));
  expect(await completion).toBe(true);
  expect(document.body.textContent).toContain("Saved for this Profile");
  await openAction();
  expect(template().value).toBe("Second accepted action {text}");
});

it("reserves the actual local transaction before same-tick Cancel or Escape can dismiss a dispatched save", async () => {
  await render();
  await write("Keep the exact pending action {text}");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
  const cancel = button("Cancel");
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
    cancel.click();
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.querySelector("dialog")).toBe(dialog);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(button("Cancel").disabled).toBe(true);
  await act(async () => pending.resolve(false));
  expect(await completion).toBe(false);
  expect(template().value).toBe("Keep the exact pending action {text}");
  await act(async () => button("Cancel").click());
  expect(document.querySelector("dialog")).toBeNull();
});

it("preserves the same-window local draft read-only across an outage and requires explicit current-owner resume after the original ACK retires", async () => {
  await render();
  await write("Keep through the outage {text}");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    saveButton().focus();
    completion = invokeSave() as Promise<unknown>;
  });
  const originalDialog = document.querySelector("dialog");
  await act(async () => useStore.setState({ connected: false }));
  expect(document.querySelector("dialog")).toBe(originalDialog);
  expect(template().value).toBe("Keep through the outage {text}");
  expect(template().disabled).toBe(true);
  expect(document.body.textContent).toContain("runtime disconnected");
  expect(button("Resume editing")).toBeUndefined();
  await act(async () => useStore.setState({ connected: true }));
  expect(button("Resume editing").disabled).toBe(true);
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => pending.resolve(true));
  expect(await completion).toBe(true);
  expect(document.querySelector("dialog")).toBe(originalDialog);
  expect(document.body.textContent).not.toContain("Saved for this Profile");
  expect(template().disabled).toBe(true);
  expect(template().value).toBe("Keep through the outage {text}");
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => button("Resume editing").click());
  expect(document.querySelector("dialog")).toBe(originalDialog);
  expect(template().value).toBe("Keep through the outage {text}");
  expect(template().disabled).toBe(false);
  expect(save).toHaveBeenCalledTimes(1);
  await invoke(saveCommand(), saveButton());
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1]![0].selectionCapture).toMatchObject({
    revision: 0,
    actions: expect.arrayContaining([
      { ...settings.selectionCapture.actions[0], template: "Keep through the outage {text}" },
    ]),
  });
});

it("retains an outage draft but requires explicit saved-action reload if canonical settings changed before reconnect", async () => {
  await render();
  await write("Local disconnected draft {text}");
  await act(async () => useStore.setState({ connected: false }));
  settings = {
    selectionCapture: {
      ...settings.selectionCapture,
      revision: 1,
      actions: settings.selectionCapture.actions.map((action) =>
        action.id === "ask" ? { ...action, template: "New persisted version {text}" } : action,
      ),
    },
  };
  await render();
  expect(template().value).toBe("Local disconnected draft {text}");
  expect(button("Reload saved action").disabled).toBe(true);
  await act(async () => useStore.setState({ connected: true }));
  expect(template().value).toBe("Local disconnected draft {text}");
  expect(template().disabled).toBe(true);
  expect(button("Resume editing")).toBeUndefined();
  await act(async () => button("Reload saved action").click());
  expect(template().value).toBe("New persisted version {text}");
  expect(template().disabled).toBe(false);
  expect(save).not.toHaveBeenCalled();
});

it.each(["window", "private", "route"] as const)(
  "still retires the retained outage action editor when its original %s is retired",
  async (kind) => {
    await render();
    await write("Local retired draft {text}");
    await act(async () => useStore.setState({ connected: false }));
    if (kind === "window") bridge.windowId = "replacement";
    else if (kind === "private") bridge.privateMode = true;
    else active = false;
    await render();
    expect(document.querySelector("dialog")).toBeNull();
    expect(save).not.toHaveBeenCalled();
  },
);
