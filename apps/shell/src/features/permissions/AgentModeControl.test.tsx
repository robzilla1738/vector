// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AgentModeControl } from "./AgentModeControl";
import { bridge } from "../../bridge";
const originalOwner = {
  windowId: bridge.windowId,
  windowKind: bridge.windowKind,
  privateMode: bridge.privateMode,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  Object.assign(bridge, { windowId: "original", windowKind: "normal", privateMode: false });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Object.assign(bridge, originalOwner);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("saves the compact Skip confirmation choice only after opt-in, using the current revision", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () =>
    root.render(
      <AgentModeControl
        compact
        active
        policy={{ agentMode: "ask", agentPolicyRevision: 4, agentPolicies: [] }}
        onSave={save}
      />,
    ),
  );
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Confirmation mode"]')!;
  expect(trigger.dataset.mode).toBe("ask");
  await act(async () => trigger.click());
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')]
      .find((button) => button.textContent?.startsWith("Skip confirmation"))!
      .click(),
  );
  expect(save).not.toHaveBeenCalled();
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>('dialog[role="alertdialog"] button')]
      .find((b) => b.textContent === "Skip confirmation")!
      .click(),
  );
  expect(save).toHaveBeenCalledWith({ agentMode: "full", agentPolicyRevision: 4 });
});
it("renders a saved Skip confirmation choice and can return to Ask first", async () => {
  const save = vi.fn().mockResolvedValue(true);
  await act(async () =>
    root.render(
      <AgentModeControl
        compact
        active
        policy={{ agentMode: "full", agentPolicyRevision: 5, agentPolicies: [] }}
        onSave={save}
      />,
    ),
  );
  const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Confirmation mode"]')!;
  expect(trigger.textContent).toContain("Skip confirmation");
  await act(async () => trigger.click());
  expect(document.querySelector('[role="menuitemradio"][aria-checked="true"]')?.textContent).toContain(
    "Skip confirmation",
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')]
      .find((button) => button.textContent?.startsWith("Ask first"))!
      .click(),
  );
  expect(save).toHaveBeenCalledWith({ agentMode: "ask", agentPolicyRevision: 5 });
});

it.each(["disabled", "inactive", "window", "kind", "private"] as const)(
  "retires an open mode menu across a %s owner roundtrip without moving later focus",
  async (transition) => {
    const save = vi.fn().mockResolvedValue(true);
    const policy = { agentMode: "ask" as const, agentPolicyRevision: 4, agentPolicies: [] };
    const render = (changed = false) =>
      act(async () =>
        root.render(
          <>
            <AgentModeControl
              compact
              active={!(changed && transition === "inactive")}
              disabled={changed && transition === "disabled"}
              policy={policy}
              onSave={save}
            />
            <textarea aria-label="Continue writing" />
          </>,
        ),
      );
    await render();
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Confirmation mode"]')!;
    await act(async () => trigger.click());
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    if (transition === "window") bridge.windowId = "other";
    if (transition === "kind") bridge.windowKind = "quick-ask";
    if (transition === "private") bridge.privateMode = true;
    await render(true);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.disabled).toBe(transition === "disabled" || transition === "inactive");
    const input = host.querySelector("textarea")!;
    input.focus();
    Object.assign(bridge, { windowId: "original", windowKind: "normal", privateMode: false });
    await render();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(input);
    expect(trigger.disabled).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await act(async () => trigger.click());
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  },
);
