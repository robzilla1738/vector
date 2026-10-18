// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { McpOAuthSetup } from "./McpOAuthSetup";
const invoke = vi.hoisted(() => vi.fn());
vi.mock("../bridge", () => ({ bridge: { invoke } }));

it("explains the actual Slack registration gate and keeps unknown grants separate from supported scopes", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  invoke.mockResolvedValue({
    issuer: "https://mcp.slack.com",
    authorizationUrl: "https://slack.com/oauth/v2_user/authorize",
    automaticRegistration: false,
    configured: false,
    clientSecretRequired: true,
    officialProvider: "slack",
    tokenAuthMethods: ["client_secret_post"],
    supportedScopes: ["search:read.public", "chat:write"],
  });
  try {
    await act(async () =>
      root.render(<McpOAuthSetup serverId="11111111-1111-4111-8111-111111111111" onConfigured={() => {}} />),
    );
    const discover = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Check registration requirements",
    )!;
    await act(async () => discover.click());
    expect(container.textContent).toContain("internal or Marketplace app");
    expect(container.textContent).toContain("Supported scopes are not a record of granted access");
    const secret = container.querySelector<HTMLInputElement>('input[type="password"]')!;
    expect(secret.labels?.[0]?.textContent).toContain("Required client secret");
    const save = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Save Aux client registration",
    )!;
    expect(save.disabled).toBe(true);
    expect(container.textContent).not.toContain("Connected");
    expect(invoke).toHaveBeenCalledExactlyOnceWith("mcp.oauth.requirements", {
      serverId: "11111111-1111-4111-8111-111111111111",
    });
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
