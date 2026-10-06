import { expect, it } from "vitest";
import { makePage, makeRun } from "../mock/fixtures";
import { runPresence } from "./RunPresence";

it("gives human page control precedence over working state and names saved task presence", () => {
  const run = makeRun({ status: "running", pageIds: ["page"], config: { taskId: "task-1" } });
  const page = makePage(0, { pageId: "page", controller: "human" });
  expect(runPresence(run, [page])).toEqual({
    state: "human",
    label: "You’re in control",
    detail: "Aux waits while you use this page.",
  });
  expect(runPresence(run, [{ ...page, controller: "agent" }])).toEqual({
    state: "working",
    label: "Aux is working",
    detail: "Saved task is active.",
  });
});

it("distinguishes input, pause, review, and completed states", () => {
  const states = ["needs_input", "paused", "interrupted", "completed"] as const;
  expect(states.map((status) => runPresence(makeRun({ status }), []).state)).toEqual([
    "waiting",
    "paused",
    "review",
    "done",
  ]);
  expect(
    runPresence(makeRun({ status: "completed", pageIds: ["page"] }), [
      makePage(0, { pageId: "page", controller: "human" }),
    ]).state,
  ).toBe("done");
});
