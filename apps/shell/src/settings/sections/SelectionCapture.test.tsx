// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { SelectionCaptureSettings } from "./SelectionCapture";
import { collectSettingsFields } from "../search";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const save = vi.fn();
let originalConnected: boolean;
const initial = () => ({ selectionCapture: defaultSelectionCaptureSettings() });
function Fixture() {
  const [settings, setSettings] = useState(initial);
  return (
    <SelectionCaptureSettings
      active
      settings={settings}
      onSave={async (patch) => {
        if (!(await save(patch))) return false;
        const value = patch.selectionCapture as ReturnType<typeof defaultSelectionCaptureSettings>;
        setSettings({ selectionCapture: { ...value, revision: value.revision + 1 } });
        return true;
      }}
    />
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 160, height: 36 },
  ] as unknown as DOMRectList);
  originalConnected = useStore.getState().connected;
  useStore.setState({ connected: true });
  save.mockReset().mockResolvedValue(true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState({ connected: originalConnected });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  [
    ...document.querySelectorAll<HTMLButtonElement>("dialog button"),
    ...host.querySelectorAll<HTMLButtonElement>("button"),
  ].find((node) => node.textContent?.trim() === label)!;
const named = (label: string) => document.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const click = async (node: HTMLElement) => act(async () => node.click());
const openAction = async (name: string) => click(named(`Edit ${name}`));
const write = async (node: HTMLInputElement | HTMLTextAreaElement, value: string) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(
      node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value",
    )!.set!.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });

it("indexes the overview and controls and previews/reorders/edits actions without any model or capture call", async () => {
  const invoke = vi.spyOn(bridge, "invoke");
  await act(async () => root.render(<Fixture />));
  expect(collectSettingsFields(host).map((field) => field.label)).toEqual([
    "Ask about what you select",
    "Selection actions",
    "Selection double-tap shortcut",
    "Region-capture shortcut",
    "Inline assist",
  ]);
  await openAction("Explain");
  await click(button("Preview Explain"));
  expect(document.querySelector('[aria-label="Selection action preview"]')?.textContent).toContain(
    "Selected text (source content)",
  );
  await click(named("Move Explain up"));
  expect(document.querySelector<HTMLInputElement>('[aria-label="Action 1 name"]')!.value).toBe("Explain");
  expect(document.activeElement).toBe(document.querySelector('[aria-label="Action 1 name"]'));
  await write(
    document.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!,
    "Translate into Spanish: {text}",
  );
  expect(save).not.toHaveBeenCalled();
  expect(invoke).not.toHaveBeenCalled();
  await click(button("Update"));
  expect(save.mock.calls[0]![0].selectionCapture.actions[0]).toMatchObject({
    id: "explain",
    template: "Translate into Spanish: {text}",
  });
  expect(button("Save Selection & Capture").disabled).toBe(true);
  expect(document.body.textContent).toContain("Saved for this Profile");
  expect(invoke).not.toHaveBeenCalled();
});

it("preserves edits after a failed save and provides explicit recovery", async () => {
  await act(async () => root.render(<Fixture />));
  await click(button("Add selection action"));
  expect(document.querySelector('[aria-label="Add selection action"][role="dialog"]')).not.toBeNull();
  expect(document.activeElement).toBe(document.querySelector('[aria-label="Action 5 name"]'));
  save.mockResolvedValueOnce(false);
  await click(button("Save"));
  expect(document.body.textContent).toContain("Your edits are still here");
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(4);
  await click(button("Cancel"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(4);
});

it("retains an acknowledged save while the settings broadcast is still in flight", async () => {
  await act(async () => root.render(<SelectionCaptureSettings active settings={initial()} onSave={save} />));
  await click(button("Add selection action"));
  await click(button("Save"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(5);
  expect(button("Save Selection & Capture").disabled).toBe(true);
  await openAction("New action");
  await write(document.querySelector<HTMLInputElement>('[aria-label="Action 5 name"]')!, "Next revision");
  await click(button("Update"));
  expect(save.mock.calls[1]![0].selectionCapture.revision).toBe(1);
});

it("detects external revisions without overwriting an unsaved template", async () => {
  let settings = initial();
  const render = async () =>
    act(async () => root.render(<SelectionCaptureSettings active settings={settings} onSave={save} />));
  await render();
  await click(host.querySelector<HTMLButtonElement>(".selection-action-row button")!);
  await write(
    document.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!,
    "My unsaved action {text}",
  );
  settings = { selectionCapture: { ...settings.selectionCapture, revision: 1, inlineAssist: false } };
  await render();
  expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!.value).toBe(
    "My unsaved action {text}",
  );
  expect(document.body.textContent).toContain("changed in another window");
  expect(button("Save Selection & Capture").disabled).toBe(true);
  expect(button("Update").disabled).toBe(true);
  await click(button("Reload saved action"));
  expect(
    document.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!.value,
  ).not.toContain("My unsaved");
});

it("records modified shortcuts, rejects collisions and does not claim native registration from a save", async () => {
  await act(async () => root.render(<Fixture />));
  const record = named("Record region-capture shortcut");
  record.focus();
  await click(record);
  await act(async () =>
    record.dispatchEvent(new KeyboardEvent("keydown", { key: "t", metaKey: true, bubbles: true })),
  );
  expect(document.body.textContent).toContain("already used by New Tab");
  expect(button("Save Selection & Capture").disabled).toBe(true);
  await click(record);
  await act(async () =>
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true }),
    ),
  );
  await click(button("Save Selection & Capture"));
  expect(save.mock.calls[0]![0].selectionCapture.regionCapture).toEqual({
    key: "9",
    command: true,
    ctrl: false,
    alt: true,
    shift: false,
  });
  expect(document.body.textContent).toContain("Native shortcut registration has not been confirmed");
  expect(document.body.textContent).not.toContain("Registered for this Profile");
});

it("only displays a native acknowledgement for the exact saved preference revision", async () => {
  const settings = initial();
  settings.selectionCapture.regionCapture = { key: "9", command: true, ctrl: false, alt: true, shift: false };
  const status = {
    revision: 0,
    selectionDoubleTap: { registered: false },
    regionCapture: { registered: true },
  };
  await act(async () =>
    root.render(<SelectionCaptureSettings active settings={settings} nativeStatus={status} onSave={save} />),
  );
  expect(document.body.textContent).toContain("Registered for this Profile");
  await act(async () =>
    root.render(
      <SelectionCaptureSettings
        active
        settings={{ selectionCapture: { ...settings.selectionCapture, revision: 1 } }}
        nativeStatus={status}
        onSave={save}
      />,
    ),
  );
  expect(document.body.textContent).not.toContain("Registered for this Profile");
  expect(document.body.textContent).toContain("has not been confirmed");
});

it("cancels only the local action and returns focus while keeping the unrelated page draft", async () => {
  await act(async () => root.render(<Fixture />));
  const inline = host.querySelector<HTMLInputElement>('[aria-label="Enable inline assist"]')!;
  await click(inline);
  const trigger = named("Edit Explain");
  await click(trigger);
  await write(document.querySelector<HTMLTextAreaElement>("dialog textarea")!, "Discard this edit {text}");
  await click(named("Move Explain up"));
  expect(host.querySelector(".selection-action-title")?.textContent).toBe("Ask Aux");
  await click(button("Cancel"));
  expect(document.activeElement).toBe(trigger);
  expect(save).not.toHaveBeenCalled();
  expect(inline.checked).toBe(false);
  await openAction("Explain");
  expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).not.toContain("Discard");
  await click(button("Cancel"));
  await click(button("Add selection action"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(4);
  await click(button("Cancel"));
  expect(document.activeElement).toBe(button("Add selection action"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(4);
  expect(save).not.toHaveBeenCalled();
});

it("saves only the action then rebases pending inline and shortcut edits onto its exact acknowledged revision", async () => {
  await act(async () => root.render(<Fixture />));
  const inline = host.querySelector<HTMLInputElement>('[aria-label="Enable inline assist"]')!;
  await click(inline);
  const record = named("Record region-capture shortcut");
  await click(record);
  await act(async () =>
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true }),
    ),
  );
  await openAction("Explain");
  await write(
    document.querySelector<HTMLTextAreaElement>("dialog textarea")!,
    "Save just this action {text}",
  );
  await click(button("Update"));
  expect(document.querySelector("dialog")).toBeNull();
  expect(save).toHaveBeenCalledTimes(1);
  const actionSave = save.mock.calls[0]![0].selectionCapture;
  expect(actionSave).toMatchObject({ revision: 0, inlineAssist: true, regionCapture: null });
  expect(actionSave.actions[1].template).toBe("Save just this action {text}");
  expect(actionSave.actions.filter((action: { id: string }) => action.id !== "explain")).toEqual(
    initial().selectionCapture.actions.filter((action) => action.id !== "explain"),
  );
  expect(inline.checked).toBe(false);
  expect(button("Save Selection & Capture").disabled).toBe(false);
  await click(button("Save Selection & Capture"));
  expect(save.mock.calls[1]![0].selectionCapture).toMatchObject({
    revision: 1,
    inlineAssist: false,
    regionCapture: { key: "9", command: true, alt: true },
  });
  expect(save.mock.calls[1]![0].selectionCapture.actions).toEqual(actionSave.actions);
});

it("retains the original local action across replacement and explicitly reloads its exact current identity", async () => {
  let settings = initial();
  const render = () =>
    act(async () => root.render(<SelectionCaptureSettings active settings={settings} onSave={save} />));
  await render();
  await click(host.querySelector<HTMLInputElement>('[aria-label="Enable inline assist"]')!);
  await openAction("Explain");
  await write(document.querySelector<HTMLTextAreaElement>("dialog textarea")!, "Original local draft {text}");
  const replacement = {
    ...settings.selectionCapture.actions[1]!,
    name: "Replaced Explain",
    template: "External source template {text}",
  };
  settings = {
    selectionCapture: {
      ...settings.selectionCapture,
      revision: 1,
      actions: settings.selectionCapture.actions.map((action) =>
        action.id === replacement.id ? replacement : action,
      ),
    },
  };
  await render();
  expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
    "Original local draft {text}",
  );
  expect(button("Update").disabled).toBe(true);
  expect(save).not.toHaveBeenCalled();
  await click(button("Reload saved action"));
  expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(replacement.template);
  await write(
    document.querySelector<HTMLTextAreaElement>("dialog textarea")!,
    "Reviewed current action {text}",
  );
  await click(button("Update"));
  expect(save.mock.calls[0]![0].selectionCapture).toMatchObject({ revision: 1, inlineAssist: true });
  expect(save.mock.calls[0]![0].selectionCapture.actions[1]).toMatchObject({
    id: "explain",
    name: "Replaced Explain",
    template: "Reviewed current action {text}",
  });
  expect(host.querySelector<HTMLInputElement>('[aria-label="Enable inline assist"]')!.checked).toBe(false);
});

it("never replaces a removed original action when explicitly reloading an old editor", async () => {
  let settings = initial();
  const render = () =>
    act(async () => root.render(<SelectionCaptureSettings active settings={settings} onSave={save} />));
  await render();
  await openAction("Explain");
  await write(
    document.querySelector<HTMLTextAreaElement>("dialog textarea")!,
    "Preserved removed action {text}",
  );
  settings = {
    selectionCapture: {
      ...settings.selectionCapture,
      revision: 1,
      actions: settings.selectionCapture.actions.filter((action) => action.id !== "explain"),
    },
  };
  await render();
  await click(button("Reload saved action"));
  expect(document.body.textContent).toContain("original action was removed");
  expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
    "Preserved removed action {text}",
  );
  expect(button("Update").disabled).toBe(true);
  expect(save).not.toHaveBeenCalled();
  await click(button("Cancel"));
  expect(host.querySelectorAll(".selection-action-row")).toHaveLength(3);
});

it("preserves a new local action through explicit review of a newer saved revision without committing another owner's changes", async () => {
  let settings = initial();
  const render = () =>
    act(async () => root.render(<SelectionCaptureSettings active settings={settings} onSave={save} />));
  await render();
  await click(button("Add selection action"));
  await write(
    document.querySelector<HTMLInputElement>('dialog input:not([type="checkbox"])')!,
    "My new action",
  );
  await write(
    document.querySelector<HTMLTextAreaElement>("dialog textarea")!,
    "Keep the new unsaved source {text}",
  );
  settings = { selectionCapture: { ...settings.selectionCapture, revision: 1, inlineAssist: false } };
  await render();
  expect(button("Save").disabled).toBe(true);
  expect(save).not.toHaveBeenCalled();
  await click(button("Review current settings"));
  expect(document.querySelector<HTMLInputElement>('dialog input:not([type="checkbox"])')!.value).toBe(
    "My new action",
  );
  expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
    "Keep the new unsaved source {text}",
  );
  await click(button("Save"));
  expect(save.mock.calls[0]![0].selectionCapture).toMatchObject({ revision: 1, inlineAssist: false });
  expect(save.mock.calls[0]![0].selectionCapture.actions.slice(0, 4)).toEqual(
    settings.selectionCapture.actions,
  );
  expect(save.mock.calls[0]![0].selectionCapture.actions[4]).toMatchObject({
    name: "My new action",
    template: "Keep the new unsaved source {text}",
  });
});
