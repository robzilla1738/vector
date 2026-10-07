// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AgentModeControl } from "./AgentModeControl";
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
  const select = host.querySelector("select")!;
  expect(select.value).toBe("ask");
  await act(async () => {
    select.value = "full";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(save).not.toHaveBeenCalled();
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>("dialog button")]
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
  const select = host.querySelector("select")!;
  expect(select.selectedOptions[0]!.textContent).toBe("Skip confirmation");
  await act(async () => {
    select.value = "ask";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(save).toHaveBeenCalledWith({ agentMode: "ask", agentPolicyRevision: 5 });
});
