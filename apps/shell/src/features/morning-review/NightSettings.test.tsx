// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { DEFAULT_NIGHT_SHIFT } from "@aux/contracts";
vi.mock("../../use-feature", () => ({ featureStage: (feature: string) => feature === "overnightReview" ? "on" : "off", useFeature: () => false }));
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { NightSettings } from "./NightSettings";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.restoreAllMocks());

function view() {
  const initial = useStore.getState();
  const saved = { ...DEFAULT_NIGHT_SHIFT, enabled: false, nightlyUsd: 0.5, perTaskUsd: 0.2 };
  useStore.setState({ settings: { ...initial.settings, nightShift: saved } });
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const save = () => host.querySelector<HTMLButtonElement>("button")!;
  return { saved, host, root, save, close: async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); } };
}

it("awaits the actual registered settings command and keeps policy unchanged until its native acknowledgement", async () => {
  const f = view();
  let acknowledge!: (value: unknown) => void;
  const held = new Promise(resolve => { acknowledge = resolve; });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => {
    if (method !== "settings.set") throw new Error(`Unexpected call ${method}`);
    return held;
  });
  try {
    await act(async () => f.root.render(<NightSettings />));
    await act(async () => f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenCalledExactlyOnceWith("settings.set", { nightShift: { ...f.saved, enabled: true } });
    expect(f.save().disabled).toBe(true);
    expect(f.save().textContent).toBe("Saving…");
    expect([...f.host.querySelectorAll<HTMLInputElement>("input")].every(input => input.disabled)).toBe(true);
    expect(useStore.getState().settings.nightShift).toEqual(f.saved);
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenCalledTimes(1);
    await act(async () => acknowledge({}));
    expect(useStore.getState().settings.nightShift).toEqual({ ...f.saved, enabled: true });
    expect(f.save().disabled).toBe(false);
    expect(f.host.querySelector('[role="alert"]')).toBeNull();
  } finally { acknowledge({}); await f.close(); }
});

it("retains the edited policy after a rejected native save and retries through the same real command", async () => {
  const f = view();
  let reject!: (reason: Error) => void;
  const held = new Promise((_resolve, fail) => { reject = fail; });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementationOnce(async () => held).mockResolvedValue({});
  try {
    await act(async () => f.root.render(<NightSettings />));
    await act(async () => f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => f.save().click());
    await act(async () => reject(new Error("Native authority retirement was not acknowledged.")));
    expect(f.host.querySelector('[role="alert"]')?.textContent).toBe("Night shift settings could not be saved. Native authority retirement was not acknowledged.");
    expect(f.save().disabled).toBe(false);
    expect(f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
    expect(useStore.getState().settings.nightShift).toEqual(f.saved);
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenNthCalledWith(2, "settings.set", { nightShift: { ...f.saved, enabled: true } });
    expect(useStore.getState().settings.nightShift).toEqual({ ...f.saved, enabled: true });
    expect(f.host.querySelector('[role="alert"]')).toBeNull();
  } finally { reject(new Error("Fixture cleanup")); await f.close(); }
});
