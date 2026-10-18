// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const available = vi.hoisted(() => ({ vault: true }));
vi.mock("../../use-feature", () => ({ useFeature: () => available.vault }));
import { PasswordsAutofillSettings } from "./PasswordsAutofill";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  available.vault = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  history.replaceState(null, "", "/settings/passwords-autofill");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("opens the existing Vault route without requesting a secret or claiming an external account", async () => {
  const invoke = vi.spyOn(bridge, "invoke");
  await act(async () => root.render(<PasswordsAutofillSettings active settings={{}} onSave={vi.fn()} />));
  const open = host.querySelector<HTMLButtonElement>('[aria-label="Open Aux Vault"]')!;
  expect(open).toBeTruthy();
  await act(async () => open.click());
  expect(location.pathname).toBe("/settings/vault");
  expect(useStore.getState().settingsCategory).toBe("Connections");
  expect(invoke).not.toHaveBeenCalled();
  expect(host.textContent).not.toMatch(/1Password|connected account/);
});
it("keeps native password management available when Aux Vault capability is absent", async () => {
  available.vault = false;
  await act(async () => root.render(<PasswordsAutofillSettings active settings={{}} onSave={vi.fn()} />));
  expect(host.querySelector('[aria-label="Open Aux Vault"]')).toBeNull();
  expect(host.textContent).toContain("Saved passwords");
  expect(host.textContent).toContain("Chromium’s Profile store");
});
