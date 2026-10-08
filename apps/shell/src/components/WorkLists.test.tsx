import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { workFixtures } from "../mock/work";
import { Routines } from "./Routines";
import { RoutineSchema, RoutineShareSchema, type MethodParams } from "@aux/contracts";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({ pages: normalizePages([]), activePageId: null, skillSelection: null });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("pauses the exact listed revision from its overflow menu and keeps unbound Skills from resuming", async () => {
  const handlers = workFixtures("workspace", true);
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation((method, params) => {
    const handler = handlers[method as keyof typeof handlers];
    if (!handler) return Promise.reject(new Error(`Unexpected ${method}`));
    return handler((params ?? {}) as Record<string, unknown>) as never;
  });
  await act(async () => root.render(<Routines workspaceId="workspace" />));
  expect(host.querySelectorAll(".ui-work-row")).toHaveLength(3);
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Actions for Weekly research brief"]')!.click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((b) => b.textContent === "Pause")!
      .click(),
  );
  expect(invoke).toHaveBeenCalledWith("routines.pause", {
    routineId: "preview-routine-0",
    expectedRevision: 1,
    paused: true,
  });
  expect(host.querySelector(".ui-work-row")?.textContent).toContain("Paused");
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Actions for Imported comparison template"]')!.click(),
  );
  expect(
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(
      (b) => b.textContent === "Resume",
    )!.disabled,
  ).toBe(true);
});

it("pages older Skills and inbox results, searches all definitions, and exports the full Space in bounded chunks", async () => {
  const skills = Array.from({ length: 501 }, (_, index) =>
    RoutineSchema.parse({
      routineId: `skill-${String(index).padStart(3, "0")}`,
      workspaceId: "workspace",
      revision: 1,
      title: index ? `Skill ${index}` : "Needle older Skill",
      objective: "Saved work",
      paused: index === 0,
      createdAt: 100,
      updatedAt: 100,
    }),
  ).reverse();
  const results = Array.from({ length: 65 }, (_, index) => ({
    title: `Result ${index}`,
    workspaceId: "workspace",
    triggerKind: "heartbeat",
    run: {
      routineRunId: `result-${String(index).padStart(3, "0")}`,
      routineId: "skill-000",
      revision: 1,
      status: "completed",
      parameters: {},
      createdAt: 100,
    },
  })).reverse();
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, raw) => {
    if (method === "routines.list") {
      const p = raw as MethodParams<"routines.list">;
      return skills
        .filter(
          (item) =>
            (!p.cursor || item.routineId < p.cursor.routineId) &&
            (!p.query || item.title.toLowerCase().includes(p.query.toLowerCase())) &&
            (p.status !== "paused" || item.paused),
        )
        .slice(0, p.limit ?? 50);
    }
    if (method === "routines.inbox") {
      const p = raw as MethodParams<"routines.inbox">;
      return results
        .filter((item) => !p.cursor || item.run.routineRunId < p.cursor.routineRunId)
        .slice(0, p.limit ?? 50);
    }
    if (method === "routines.export") {
      const p = raw as MethodParams<"routines.export">;
      return {
        format: "aux-routine@1",
        routines: skills
          .filter((item) => p.routineIds?.includes(item.routineId))
          .map((item) => RoutineShareSchema.parse(item)),
      };
    }
    return [];
  });
  const save = vi.spyOn(bridge, "saveFile").mockResolvedValue("/tmp/aux-routines.json");
  const click = async (text: string) =>
    act(async () => {
      [...host.querySelectorAll<HTMLButtonElement>("button")]
        .find((button) => button.textContent === text)!
        .click();
    });
  await act(async () => root.render(<Routines workspaceId="workspace" />));
  expect(host.querySelectorAll(".ui-work-row")).toHaveLength(50);
  await click("More Skills");
  expect(host.querySelectorAll(".ui-work-row")).toHaveLength(100);
  expect(invoke).toHaveBeenCalledWith(
    "routines.list",
    expect.objectContaining({
      cursor: { updatedAt: 100, routineId: "skill-451" },
    }),
  );
  await click("Older results");
  expect(host.querySelectorAll('[aria-label="Automation results inbox"] .routine-run')).toHaveLength(60);
  await click("Older results");
  expect(host.querySelectorAll('[aria-label="Automation results inbox"] .routine-run')).toHaveLength(65);
  await act(async () => {
    const input = host.querySelector<HTMLInputElement>('[aria-label="Search Skills"]')!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Needle");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await click("Paused");
  expect(invoke).toHaveBeenCalledWith(
    "routines.list",
    expect.objectContaining({ query: "Needle", status: "paused" }),
  );
  expect(host.querySelectorAll(".ui-work-row")).toHaveLength(1);
  expect(host.querySelector(".ui-work-row")?.textContent).toContain("Needle older Skill");
  await click("Export…");
  const envelope = JSON.parse(String(save.mock.calls[0]?.[1]));
  expect(envelope.routines).toHaveLength(501);
  expect(
    invoke.mock.calls
      .filter(([method]) => method === "routines.export")
      .map(([, p]) => (p as MethodParams<"routines.export">).routineIds?.length),
  ).toEqual([200, 200, 101]);
});

it("discards an older page that resolves after the Skill search changes", async () => {
  const routine = (index: number, title = `Skill ${index}`) =>
    RoutineSchema.parse({
      routineId: `skill-${index}`,
      workspaceId: "workspace",
      revision: 1,
      title,
      objective: "Saved work",
      createdAt: 100,
      updatedAt: index,
    });
  let resolveOlder!: (items: ReturnType<typeof routine>[]) => void;
  const older = new Promise<ReturnType<typeof routine>[]>((resolve) => {
    resolveOlder = resolve;
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, raw) => {
    if (method !== "routines.list") return [];
    const p = raw as MethodParams<"routines.list">;
    if (p.query) return [routine(1, "Needle Skill")];
    if (p.cursor) return older;
    return Array.from({ length: 50 }, (_, index) => routine(100 - index));
  });
  await act(async () => root.render(<Routines workspaceId="workspace" />));
  await act(async () => {
    [...host.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "More Skills")!
      .click();
  });
  await act(async () => {
    const input = host.querySelector<HTMLInputElement>('[aria-label="Search Skills"]')!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Needle");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => resolveOlder([routine(50, "Needle stale page")]));
  expect(host.querySelectorAll(".ui-work-row")).toHaveLength(1);
  expect(host.textContent).not.toContain("Needle stale page");
});

it("opens every older occurrence under its original Skill history", async () => {
  const routine = RoutineSchema.parse({
    routineId: "history",
    workspaceId: "workspace",
    revision: 1,
    title: "History Skill",
    objective: "Saved work",
    createdAt: 100,
    updatedAt: 100,
  });
  const runs = Array.from({ length: 65 }, (_, index) => ({
    routineRunId: `run-${String(index).padStart(3, "0")}`,
    routineId: routine.routineId,
    revision: 1,
    status: "completed",
    parameters: {},
    createdAt: 100,
    reason: `Receipt ${String(index).padStart(3, "0")}`,
  })).reverse();
  useStore.setState({ skillSelection: { workspaceId: "workspace", routineId: routine.routineId } });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, raw) => {
    if (method === "routines.list") return [routine];
    if (method === "routines.get") return { routine, runs: runs.slice(0, 30) };
    if (method === "routines.runs") {
      const p = raw as MethodParams<"routines.runs">;
      return runs
        .filter(
          (run) => run.routineId === p.routineId && (!p.cursor || run.routineRunId < p.cursor.routineRunId),
        )
        .slice(0, p.limit ?? 30);
    }
    return [];
  });
  await act(async () => root.render(<Routines workspaceId="workspace" />));
  expect(host.textContent).not.toContain("Receipt 000");
  const older = () =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent === "Older runs",
    );
  await act(async () => older()!.click());
  expect(invoke).toHaveBeenCalledWith("routines.runs", {
    routineId: "history",
    limit: 30,
    cursor: { createdAt: 100, routineRunId: "run-035" },
  });
  expect(host.textContent).toContain("Receipt 005");
  await act(async () => older()!.click());
  expect(host.textContent).toContain("Receipt 000");
  expect(older()).toBeUndefined();
});
