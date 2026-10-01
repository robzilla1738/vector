import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("../../scripts/native-slot.mjs", () => ({ withNativeSlot: (action: () => unknown) => action() }));
vi.mock("node:child_process", async () => ({
  ...await vi.importActual<typeof import("node:child_process")>("node:child_process"),
  execFileSync: vi.fn((_command: string, args: string[]) => writeFileSync(args.at(-1)!, Buffer.alloc(2048))),
}));
import { execFileSync } from "node:child_process";
import { createEvidence } from "../../tests/host/lib/evidence.mjs";
const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); vi.clearAllMocks(); });
const windows = [
  { id: 101, layer: 0, width: 1200, height: 949 },
  { id: 102, layer: 0, width: 520, height: 640 },
  { id: 103, layer: 1, width: 520, height: 640 },
];
function evidence() {
  const directory = mkdtempSync(join(tmpdir(), "aux-capture-window-test-"));
  directories.push(directory);
  return createEvidence(directory, { windows: async () => windows });
}
it("captures the requested compact window instead of the larger normal window", async () => {
  const target = evidence();
  const capture = await target.capture("quick-ask", { windowId: 102 });
  expect(capture.windowId).toBe(102);
  expect(execFileSync).toHaveBeenCalledWith("/usr/sbin/screencapture", ["-x", "-l", "102", expect.stringContaining("quick-ask.png")], expect.any(Object));
  expect(target.captures).toEqual([capture]);
  await expect(target.capture("quick-ask", { windowId: 102 })).rejects.toThrow(/overwritten/);
});
it("refuses invalid, foreign and non-visible-layer window IDs before capturing", async () => {
  const target = evidence();
  for (const [index, windowId] of [-1, 1.5, 999, 103].entries()) await expect(target.capture(`invalid-${index}`, { windowId })).rejects.toThrow(index < 2 ? /positive/ : /No journey window/);
  expect(execFileSync).not.toHaveBeenCalled();
  expect(target.captures).toEqual([]);
});
