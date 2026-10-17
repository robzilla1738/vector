// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DownloadSchema } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { Downloads } from "./Downloads";

const original = useStore.getState();
const completed = DownloadSchema.parse({
  id: "fixture-download",
  filename: "Synthetic fixture.txt",
  path: "/tmp/aux-fixture-download.txt",
  size: 26214,
  state: "completed",
  startedAt: Date.now() - 60000,
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState({ downloads: [completed], connected: false, overlay: null, toasts: [] });
  vi.spyOn(bridge, "downloadsSnapshot").mockResolvedValue([completed]);
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(original, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function button(label: string) {
  const node = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.getAttribute("aria-label") === label || item.textContent?.trim() === label,
  );
  if (!node) throw new Error(`Missing download action ${label}`);
  return node;
}
it("uses native file actions while the runtime is offline and retains row failures", async () => {
  const open = vi.spyOn(bridge, "openPath").mockResolvedValue("File moved"),
    reveal = vi.spyOn(bridge, "revealPath").mockResolvedValue(true);
  const close = vi.fn();
  await act(async () => root.render(<Downloads presentation="recent" onClose={close} />));
  expect(host.textContent).toContain("Recent Download History");
  expect(host.textContent).toContain("25.6 KB");
  expect(host.querySelector('[aria-label="Search downloads"]')).toBeNull();
  await act(async () => button("Open Synthetic fixture.txt").click());
  expect(open).toHaveBeenCalledExactlyOnceWith(completed.path);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("File moved");
  await act(async () => button("Reveal Synthetic fixture.txt in Finder").click());
  expect(reveal).toHaveBeenCalledExactlyOnceWith(completed.path);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await act(async () => button("Full Download History").click());
  expect(close).toHaveBeenCalledTimes(1);
  expect(useStore.getState().overlay).toBe("downloads");
});
it("keeps live transfer controls and refreshes them from the shared native projection", async () => {
  const active = {
    ...completed,
    state: "progressing" as const,
    canCancel: true,
    canResume: true,
    totalBytes: 100000,
  };
  vi.mocked(bridge.downloadsSnapshot).mockResolvedValue([active]);
  const control = vi.spyOn(bridge, "controlDownload").mockResolvedValue(undefined);
  await act(async () => root.render(<Downloads presentation="recent" />));
  await act(async () => button("Pause").click());
  expect(control).toHaveBeenLastCalledWith(active.id, "pause");
  await act(async () => useStore.getState().applyDownload({ ...active, paused: true }));
  expect(host.textContent).toContain("Paused");
  await act(async () => button("Resume").click());
  expect(control).toHaveBeenLastCalledWith(active.id, "resume");
  await act(async () => button("Cancel").click());
  expect(control).toHaveBeenLastCalledWith(active.id, "cancel");
});
it("retains visible downloads after a failed native snapshot and offers a real retry", async () => {
  vi.mocked(bridge.downloadsSnapshot).mockRejectedValueOnce(new Error("Native snapshot unavailable"));
  await act(async () => root.render(<Downloads presentation="recent" />));
  expect(host.textContent).toContain(completed.filename);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("Native snapshot unavailable");
  await act(async () => button("Try again").click());
  expect(bridge.downloadsSnapshot).toHaveBeenCalledTimes(2);
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
