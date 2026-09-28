// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

const { capabilities } = vi.hoisted(() => ({
  capabilities: vi.fn(async () => ({
    buildId: "154.0.8037.58+abcdef012345+123456789abc",
    sourceCommit: "123456789abcdef0123456789abcdef012345678",
  })),
}));
vi.mock("../../bridge", () => ({ bridge: { capabilities }, inMock: true, inNativeHost: false }));

import { AboutAuxSetting } from "./AboutAux";

it("shows the installed Chromium version and build identity", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<AboutAuxSetting active />));
    expect(capabilities).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("Chromium 154.0.8037.58");
    expect(container.textContent).toContain("Build abcdef01");
    expect(container.textContent).toContain("Source 12345678");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
