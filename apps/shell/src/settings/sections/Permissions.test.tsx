// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { PermissionsSettings } from "./Permissions";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const settings = { agentMode: "auto", agentPolicyRevision: 7, agentPolicies: [] };
it("shows actual Auto defaults and keeps person-only categories unavailable", async () => {
  await act(async () => root.render(<PermissionsSettings active settings={settings} onSave={vi.fn()} />));
  expect(
    host.querySelector<HTMLSelectElement>('[aria-label="Payments and purchases permission"]')!
      .selectedOptions[0]!.textContent,
  ).toContain("Touch ID");
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Account security permission"]')!.disabled).toBe(
    true,
  );
  expect(host.querySelector<HTMLSelectElement>('[aria-label="CAPTCHA permission"]')!.disabled).toBe(true);
  expect(host.querySelector('[aria-label="Agent mode"] [aria-checked="true"]')!.textContent).toBe("Auto");
});
it("writes category policies separately with the original revision", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () => root.render(<PermissionsSettings active settings={settings} onSave={save} />));
  const select = host.querySelector<HTMLSelectElement>('[aria-label="Send messages permission"]')!;
  await act(async () => {
    select.value = "ask";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(save).toHaveBeenCalledWith({
    agentPolicies: [{ category: "send", access: "ask" }],
    agentPolicyRevision: 7,
  });
});
it("requires the Skip confirmation opt-in before saving mode", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () => root.render(<PermissionsSettings active settings={settings} onSave={save} />));
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
      .find((button) => button.textContent === "Skip confirmation")!
      .click(),
  );
  expect(save).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain("without asking or Touch ID");
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("dialog button")]
      .find((button) => button.textContent === "Keep current mode")!
      .click(),
  );
  expect(save).not.toHaveBeenCalled();
});

it("saves file access with its own revision and no agent-policy mutation", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () =>
    root.render(
      <PermissionsSettings
        active
        settings={{ ...settings, fileAccessMode: "guard", fileAccessRevision: 11 }}
        onSave={save}
      />,
    ),
  );
  expect(host.querySelector('[aria-label="File access"] [aria-checked="true"]')!.textContent).toBe("Guard");
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>('[aria-label="File access"] [role="radio"]')]
      .find((button) => button.textContent === "Read-only")!
      .click(),
  );
  expect(save).toHaveBeenCalledExactlyOnceWith({ fileAccessMode: "read-only", fileAccessRevision: 11 });
});
it("requires explicit Full file access opt-in before saving", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () =>
    root.render(
      <PermissionsSettings
        active
        settings={{ ...settings, fileAccessMode: "read-only", fileAccessRevision: 12 }}
        onSave={save}
      />,
    ),
  );
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>('[aria-label="File access"] [role="radio"]')]
      .find((button) => button.textContent === "Full")!
      .click(),
  );
  expect(save).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain("credentials and permission data remain protected");
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("dialog button")]
      .find((button) => button.textContent === "Use Full file access")!
      .click(),
  );
  expect(save).toHaveBeenCalledExactlyOnceWith({ fileAccessMode: "full", fileAccessRevision: 12 });
});

it.each(["inactive", "revision"])("retires a Full file opt-in when its %s owner changes", async (change) => {
  const save = vi.fn().mockResolvedValue(true);
  const initial = { ...settings, fileAccessMode: "guard", fileAccessRevision: 3 };
  await act(async () => root.render(<PermissionsSettings active settings={initial} onSave={save} />));
  await act(async () =>
    [...host.querySelectorAll<HTMLButtonElement>('[aria-label="File access"] [role="radio"]')]
      .find((button) => button.textContent === "Full")!
      .click(),
  );
  await act(async () =>
    root.render(
      <PermissionsSettings
        active={change !== "inactive"}
        settings={change === "revision" ? { ...initial, fileAccessRevision: 4 } : initial}
        onSave={save}
      />,
    ),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("dialog button")]
      .find((button) => button.textContent === "Use Full file access")!
      .click(),
  );
  expect(save).not.toHaveBeenCalled();
});

it("adds a grouped rule with its revision while preserving exact-site overrides", async () => {
  const siteRule = { category: "send", access: "block", site: "https://example.com" };
  const save = vi.fn().mockResolvedValue(true);
  await act(async () =>
    root.render(
      <PermissionsSettings active settings={{ ...settings, agentPolicies: [siteRule] }} onSave={save} />,
    ),
  );
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add ask rule"]')!.click());
  const dialog = document.querySelector('dialog[aria-label="Add ask rule"]')!;
  const category = dialog.querySelector<HTMLSelectElement>('[aria-label="Action category"]')!;
  expect(
    [...category.options].some((option) => option.value === "captcha" || option.value === "account_security"),
  ).toBe(false);
  await act(async () => {
    category.value = "send";
    category.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () =>
    dialog.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(save).toHaveBeenCalledExactlyOnceWith({
    agentPolicies: [siteRule, { category: "send", access: "ask" }],
    agentPolicyRevision: 7,
  });
});

it("keeps the rule editor open while saving and shows a rejected save without losing the draft", async () => {
  let finish!: (saved: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => root.render(<PermissionsSettings active settings={settings} onSave={save} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add ask rule"]')!.click());
  const editor = () => document.querySelector('dialog[aria-label="Add ask rule"]');
  const category = editor()!.querySelector<HTMLSelectElement>('[aria-label="Action category"]')!;
  await act(async () => {
    category.value = "send";
    category.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () =>
    editor()!
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(editor()).not.toBeNull();
  expect(category.disabled).toBe(true);
  await act(async () => finish(false));
  expect(editor()?.textContent).toContain("The rule was not saved");
  expect(category.value).toBe("send");
  expect(category.disabled).toBe(false);
});
