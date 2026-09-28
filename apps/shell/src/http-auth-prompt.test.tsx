// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { HttpAuthPrompt } from "./components/HttpAuthPrompt";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("re-enables the form when the native host declines an HTTP auth response", async () => {
  vi.spyOn(bridge, "httpAuthRequests").mockResolvedValue([
    { id: "auth-1", origin: "http://127.0.0.1:4812", proxy: false, realm: "Fixture", retry: false },
  ]);
  vi.spyOn(bridge, "respondHttpAuth").mockResolvedValue(false);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HttpAuthPrompt />));
    const form = document.body.querySelector("form")!;
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(bridge.respondHttpAuth).toHaveBeenCalledWith("auth-1", { username: "", password: "" });
    expect(document.body.querySelector('[role="alert"]')?.textContent).toContain("could not be completed");
    expect(document.body.querySelector("button.primary")?.hasAttribute("disabled")).toBe(false);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});
