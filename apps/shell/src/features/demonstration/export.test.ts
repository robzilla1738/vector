import { beforeEach, expect, it, vi } from "vitest";
import type { Demonstration } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call } from "../../store";
import { exportDemonstration, useRecording } from "./state";
vi.mock("../../bridge", () => ({ bridge: { saveFile: vi.fn() } }));
vi.mock("../../store", () => ({ call: vi.fn() }));
const demo: Demonstration = { id: "recording", pageId: "page", state: "stopped", steps: [], startedAt: 1 };
beforeEach(() => {
  vi.resetAllMocks();
  useRecording.setState({ demonstration: demo, busy: false, error: "" });
  vi.mocked(call).mockResolvedValue(demo);
});
it("holds the real export acknowledgement, rejects duplicates and retains failure for retry", async () => {
  let reject!: (error: Error) => void;
  vi.mocked(bridge.saveFile).mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const pending = exportDemonstration();
  await vi.waitFor(() => expect(bridge.saveFile).toHaveBeenCalledOnce());
  expect(useRecording.getState().busy).toBe(true);
  await expect(exportDemonstration()).rejects.toThrow("still running");
  expect(call).toHaveBeenCalledOnce();
  reject(new Error("Native save dialog unavailable"));
  await expect(pending).rejects.toThrow("Native save dialog unavailable");
  expect(useRecording.getState()).toMatchObject({
    busy: false,
    error: "Native save dialog unavailable",
    demonstration: demo,
  });
  vi.mocked(bridge.saveFile).mockResolvedValue("/fixture/export.json");
  await expect(exportDemonstration()).resolves.toBe("/fixture/export.json");
  expect(useRecording.getState()).toMatchObject({ busy: false, error: "" });
});
it("refuses a different recording while the original native read is held", async () => {
  let reply!: (value: Demonstration) => void;
  vi.mocked(call).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        reply = resolve;
      }),
  );
  const pending = exportDemonstration();
  useRecording.setState({ demonstration: { ...demo, id: "replacement" }, busy: false });
  reply(demo);
  await expect(pending).rejects.toThrow("Profile changed");
  expect(bridge.saveFile).not.toHaveBeenCalled();
  expect(useRecording.getState()).toMatchObject({
    busy: false,
    error: "",
    demonstration: { id: "replacement" },
  });
});
