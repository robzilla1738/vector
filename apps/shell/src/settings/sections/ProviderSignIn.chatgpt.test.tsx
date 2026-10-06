// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ProviderSignIn } from "./ProviderSignIn";

const mocks = vi.hoisted(() => ({ call: vi.fn(), openExternal: vi.fn() }));
vi.mock("../../store", () => ({ call: mocks.call }));
vi.mock("../../bridge", () => ({ bridge: { openExternal: mocks.openExternal } }));
vi.mock("./preference-command", () => ({
  PreferenceAction: ({
    children,
    invoke,
    disabled,
  }: {
    children: ReactNode;
    invoke: () => Promise<unknown>;
    disabled?: boolean;
  }) => createElement("button", { disabled, onClick: () => void invoke() }, children),
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("starts actual ChatGPT account consent and retires the exact pending receipt on dismissal", async () => {
  const attemptId = "a".repeat(43);
  mocks.call.mockImplementation(async (method: string) => {
    if (method === "models.auth.start")
      return {
        attemptId,
        provider: "chatgpt",
        phase: "pending",
        expiresAt: Date.now() + 300000,
        authorizationUrl: "https://auth.openai.com/api/accounts/authorize?state=synthetic",
      };
    if (method === "models.auth.cancel")
      return { attemptId, provider: "chatgpt", phase: "cancelled", expiresAt: Date.now() + 300000 };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () => root.render(<ProviderSignIn onConnected={async () => {}} />));
    const button = [...host.querySelectorAll("button")].find(
      (b) => b.textContent === "Continue with ChatGPT",
    );
    expect(button).toBeDefined();
    await act(async () => button!.click());
    expect(mocks.call).toHaveBeenCalledWith("models.auth.start", { provider: "chatgpt" });
    expect(mocks.openExternal).toHaveBeenCalledWith(
      "https://auth.openai.com/api/accounts/authorize?state=synthetic",
    );
    expect(host.textContent).toContain("Aux receives no ChatGPT conversations");
    await act(async () => root.unmount());
    expect(mocks.call).toHaveBeenCalledWith("models.auth.cancel", { attemptId });
  } finally {
    host.remove();
  }
});
