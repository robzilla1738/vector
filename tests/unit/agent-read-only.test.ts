import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { expect, it, vi } from "vitest";
import { EventBus, MockModelClient, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { Observation } from "@aux/contracts";

it("keeps an explicitly read-only SDK child from dispatching a write", async () => {
  const repo = new Repo(openDb(":memory:"));
  const observed = { observationId: "o", pageId: "p", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
    content: { url: "https://source.test/", title: "Page", viewport: { width: 1, height: 1, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 },
      frames: [], text: "Save", headings: [], elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main", selector: { role: { role: "button", name: "Save" } } }],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false, stats: { elementsTotal: 1, elementsShown: 1, textChars: 4, approxTokens: 1 } },
  } as Observation;
  const model = new MockModelClient().scriptToolSteps([
    { toolCalls: [{ toolCallId: "snapshot", toolName: "snapshot", input: {} }] },
    { toolCalls: [{ toolCallId: "write", toolName: "act", input: { steps: [{ id: "click", op: "click", target: "r1" }] } }] },
    { toolCalls: [{ toolCallId: "done", toolName: "submit_result", input: { report: "The page was read; no changes were made." } }] },
  ]);
  const execute = vi.fn();
  const pages = { get: (id: string) => fixturePage(id, observed.content.url, 1), observe: async () => observed, execute, livePageIds: () => ["p"] };
  const coordinator = new RunCoordinator({ repo, events: new EventBus(repo), pages: pages as never,
    turnMentions: fixtureTurnMentions((id) => pages.get(id)), model: () => model, defaultModel: () => "mock/model", recordModelCall: () => {} });
  const run = await coordinator.start({ goal: "Read this page", pageIds: ["p"], subagentProfile: "read_only" });
  await vi.waitFor(() => expect(repo.getRun(run.runId)?.status, repo.getRun(run.runId)?.error).toBe("completed"));
  expect(execute).not.toHaveBeenCalled();
  expect(coordinator.durable.unresolved(run.runId)).toHaveLength(0);
  repo.db.close();
});
