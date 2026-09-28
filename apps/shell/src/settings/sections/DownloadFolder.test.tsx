// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

const { downloadFolder, chooseDownloadFolder } = vi.hoisted(() => ({
  downloadFolder: vi.fn(async () => ({ path: "/tmp/Downloads", custom: false })),
  chooseDownloadFolder: vi.fn(async (reset = false) => ({
    path: reset ? "/tmp/Downloads" : "/tmp/Aux exports",
    custom: !reset,
  })),
}));
vi.mock("../../bridge", () => ({
  bridge: { privateMode: false, downloadFolder, chooseDownloadFolder },
  inMock: true,
  inNativeHost: false,
}));

import { DownloadFolderSetting } from "./DownloadFolder";

it("shows the Profile folder and offers a reversible native folder choice", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<DownloadFolderSetting active />));
    expect(downloadFolder).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("/tmp/Downloads");
    await act(async () => container.querySelector<HTMLButtonElement>("button")!.click());
    expect(chooseDownloadFolder).toHaveBeenCalledWith(false);
    expect(container.textContent).toContain("/tmp/Aux exports");
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Use default")!.click());
    expect(chooseDownloadFolder).toHaveBeenCalledWith(true);
    expect(container.textContent).toContain("/tmp/Downloads");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
