// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { SelectionCaptureSettings } from "./SelectionCapture";
import { collectSettingsFields } from "../search";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const save = vi.fn();
const initial = () => ({ selectionCapture: defaultSelectionCaptureSettings() });
function Fixture() {
  const [settings, setSettings] = useState(initial);
  return <SelectionCaptureSettings active settings={settings} onSave={async patch => {
    if (!await save(patch)) return false;
    const value = patch.selectionCapture as ReturnType<typeof defaultSelectionCaptureSettings>;
    setSettings({ selectionCapture: { ...value, revision: value.revision + 1 } });
    return true;
  }}/>;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 160, height: 36 }] as unknown as DOMRectList);
  save.mockReset().mockResolvedValue(true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent?.trim() === label)!;
const named = (label: string) => host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const click = async (node: HTMLElement) => act(async () => node.click());
const write = async (node: HTMLInputElement | HTMLTextAreaElement, value: string) => act(async () => {
  Object.getOwnPropertyDescriptor(node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value")!.set!.call(node, value);
  node.dispatchEvent(new Event("input", { bubbles: true }));
});

it("indexes all four fields and previews/reorders/edits actions without any model or capture call", async () => {
  const invoke = vi.spyOn(bridge, "invoke");
  await act(async () => root.render(<Fixture/>));
  expect(collectSettingsFields(host).map(field => field.label)).toEqual([
    "Selection actions", "Selection double-tap shortcut", "Region-capture shortcut", "Inline assist",
  ]);
  await click(button("Preview Explain"));
  expect(host.querySelector('[aria-label="Selection action preview"]')?.textContent).toContain("Selected text (source content)");
  await click(named("Move Explain up"));
  expect(host.querySelector<HTMLInputElement>('[aria-label="Action 1 name"]')!.value).toBe("Explain");
  await write(host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!, "Translate into Spanish: {text}");
  expect(save).not.toHaveBeenCalled(); expect(invoke).not.toHaveBeenCalled();
  await click(button("Save Selection & Capture"));
  expect(save.mock.calls[0]![0].selectionCapture.actions[0]).toMatchObject({ id: "explain", template: "Translate into Spanish: {text}" });
  expect(button("Save Selection & Capture").disabled).toBe(true);
  expect(host.textContent).toContain("Saved for this Profile");
  expect(invoke).not.toHaveBeenCalled();
});

it("preserves edits after a failed save and provides explicit recovery", async () => {
  await act(async () => root.render(<Fixture/>));
  await click(button("Add selection action"));
  save.mockResolvedValueOnce(false);
  await click(button("Save Selection & Capture"));
  expect(host.textContent).toContain("Your edits are still here");
  expect(host.querySelectorAll("textarea")).toHaveLength(5);
  await click(button("Reload saved settings"));
  expect(host.querySelectorAll("textarea")).toHaveLength(4);
});

it("retains an acknowledged save while the settings broadcast is still in flight", async () => {
  await act(async () => root.render(<SelectionCaptureSettings active settings={initial()} onSave={save}/>));
  await click(button("Add selection action"));
  await click(button("Save Selection & Capture"));
  expect(host.querySelectorAll("textarea")).toHaveLength(5);
  expect(button("Save Selection & Capture").disabled).toBe(true);
  await write(host.querySelector<HTMLInputElement>('[aria-label="Action 5 name"]')!, "Next revision");
  await click(button("Save Selection & Capture"));
  expect(save.mock.calls[1]![0].selectionCapture.revision).toBe(1);
});

it("detects external revisions without overwriting an unsaved template", async () => {
  let settings = initial();
  const render = async () => act(async () => root.render(<SelectionCaptureSettings active settings={settings} onSave={save}/>));
  await render();
  await write(host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!, "My unsaved action {text}");
  settings = { selectionCapture: { ...settings.selectionCapture, revision: 1, inlineAssist: false } };
  await render();
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!.value).toBe("My unsaved action {text}");
  expect(host.textContent).toContain("changed in another window");
  expect(button("Save Selection & Capture").disabled).toBe(true);
  await click(button("Reload saved settings"));
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!.value).not.toContain("My unsaved");
});

it("records modified shortcuts, rejects collisions and does not claim native registration from a save", async () => {
  await act(async () => root.render(<Fixture/>));
  const record = named("Record region-capture shortcut");
  record.focus(); await click(record);
  await act(async () => record.dispatchEvent(new KeyboardEvent("keydown", { key: "t", metaKey: true, bubbles: true })));
  expect(host.textContent).toContain("already used by New Tab");
  expect(button("Save Selection & Capture").disabled).toBe(true);
  await click(record);
  await act(async () => record.dispatchEvent(new KeyboardEvent("keydown", { key: "9", metaKey: true, altKey: true, bubbles: true })));
  await click(button("Save Selection & Capture"));
  expect(save.mock.calls[0]![0].selectionCapture.regionCapture).toEqual({ key: "9", command: true, ctrl: false, alt: true, shift: false });
  expect(host.textContent).toContain("Native shortcut registration has not been confirmed");
  expect(host.textContent).not.toContain("Registered for this Profile");
});

it("only displays a native acknowledgement for the exact saved preference revision", async () => {
  const settings = initial();
  settings.selectionCapture.regionCapture = { key: "9", command: true, ctrl: false, alt: true, shift: false };
  const status = { revision: 0, selectionDoubleTap: { registered: false }, regionCapture: { registered: true } };
  await act(async () => root.render(<SelectionCaptureSettings active settings={settings} nativeStatus={status} onSave={save}/>));
  expect(host.textContent).toContain("Registered for this Profile");
  await act(async () => root.render(<SelectionCaptureSettings active settings={{ selectionCapture: { ...settings.selectionCapture, revision: 1 } }} nativeStatus={status} onSave={save}/>));
  expect(host.textContent).not.toContain("Registered for this Profile");
  expect(host.textContent).toContain("has not been confirmed");
});
