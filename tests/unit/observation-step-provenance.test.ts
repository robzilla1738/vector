import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { expect, it, vi } from "vitest";
import { EventBus, MockModelClient, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { Observation, PlanStep, StepOutcome } from "@aux/contracts";

it("attaches the exact saved SDK observation to the step it authorized", async () => {
  const repo = new Repo(openDb(":memory:"));
  const observed: Observation = {
    observationId: "original", pageId: "p1", documentEpoch: 1, revision: 7,
    observedAt: Date.now(), scope: "full",
    content: { url: "https://source.test/", title: "Title", viewport: { width: 100, height: 100, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "Original evidence", headings: [], elements: [],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false,
      stats: { elementsTotal: 0, elementsShown: 0, textChars: 17, approxTokens: 5 } },
  };
  const model = new MockModelClient().scriptToolSteps([
    { toolCalls: [{ toolCallId: "read-snapshot", toolName: "snapshot", input: {} }] },
    { toolCalls: [{ toolCallId: "read-heading", toolName: "act", input: { steps: [{ id: "extract-heading", op: "extract", fields: [{ name: "title", selector: "h1" }] }] } }] },
    { toolCalls: [{ toolCallId: "finish", toolName: "submit_result", input: { report: "Original evidence" } }] },
  ]);
  const execute = vi.fn(async (program: { steps: PlanStep[] }, context: { onStep?: (outcome: StepOutcome, step: PlanStep) => void }) => {
    const step = program.steps[0]!;
    const outcome: StepOutcome = { stepId: step.id, op: step.op, status: "ok", startedAt: Date.now(), durationMs: 1 };
    context.onStep?.(outcome, step);
    return { status: "completed" as const, steps: [outcome] };
  });
  const pages = { get: (id: string) => fixturePage(id, observed.content.url, observed.documentEpoch),
    observe: async () => observed, execute, livePageIds: () => ["p1"] };
  const recorded: { stepId: string; artifactId?: string }[] = [];
  const coordinator = new RunCoordinator({ repo, events: new EventBus(repo), pages: pages as never,
    turnMentions: fixtureTurnMentions((id) => pages.get(id)), model: () => model,
    defaultModel: () => "mock/model", recordModelCall: () => {},
    saveObservation: () => "original-observation-artifact",
    onStepRecorded: (_runId, _outcome, step, artifactId) => recorded.push({ stepId: step.id, artifactId }),
  });
  const run = await coordinator.start({ goal: "Read the heading", pageIds: ["p1"] });
  await vi.waitFor(() => expect(repo.getRun(run.runId)?.status, repo.getRun(run.runId)?.error).toBe("completed"));
  expect(execute).toHaveBeenCalledOnce();
  expect(recorded).toEqual([{ stepId: "extract-heading", artifactId: "original-observation-artifact" }]);
  repo.db.close();
});
