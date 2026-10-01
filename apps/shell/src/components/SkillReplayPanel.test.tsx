// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Routine } from "@aux/contracts";
import { SkillReplayPanel } from "./SkillReplayPanel";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", async importOriginal => ({ ...await importOriginal<typeof import("../store")>(), call: rpc }));
vi.mock("../use-feature", () => ({ featureStage: () => "on", useFeature: () => true }));
let root: Root;
let host: HTMLDivElement;
const routine = { routineId: "skill-1", revision: 2, sourceTaskId: "task-1", sourceTaskRevision: 1,
  sourceRunId: "run-1", parameters: [{ name: "topic", label: "Topic" }] } as Routine;
const source = { runId: "run-1", goal: "Search", createdAt: 1, status: "completed", pageIds: ["page-1"],
  config: { taskId: "task-1", taskRevision: 1 } };

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  rpc.mockReset();
  rpc.mockImplementation(async (method: string) => method === "runs.list" ? [source] : {});
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

function input(label: string, value: string) {
  const field = [...host.querySelectorAll("input")].find(node => node.getAttribute("aria-label") === label)!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
function button(text: string) {
  return [...host.querySelectorAll("button")].find(node => node.textContent?.trim() === text)!;
}

it("requires the exact source tab and reviewed source value before preparing an inert replay", async () => {
  const onChanged = vi.fn(async () => {});
  await act(async () => root.render(<SkillReplayPanel routine={routine} pageId="other-page" disabled={false} onChanged={onChanged}/>));
  input("Recorded source value for Topic", "hosting");
  expect((button("Prepare replay from run") as HTMLButtonElement).disabled).toBe(true);
  await act(async () => root.render(<SkillReplayPanel routine={routine} pageId="page-1" disabled={false} onChanged={onChanged}/>));
  await act(async () => (button("Prepare replay from run") as HTMLButtonElement).click());
  expect(rpc).toHaveBeenCalledWith("routines.replay.compile", {
    routineId: "skill-1", expectedRevision: 2, sourceRunId: "run-1", pageId: "page-1",
    samples: { topic: "hosting" },
  });
  expect(rpc).not.toHaveBeenCalledWith("routines.replay.test", expect.anything());
});
