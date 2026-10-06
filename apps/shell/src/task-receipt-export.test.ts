import { expect, it } from "vitest";
import { TaskReceiptSchema } from "@aux/contracts";
import { taskReceiptMarkdown } from "./task-receipt-export";
it("preserves uncertainty, provenance and stale evidence without embedding active content", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "task-1",
    taskRevision: 2,
    objective: "Compare ![tracker](https://example.test/image) <script>bad()</script>",
    generatedAt: 0,
    status: "uncertain",
    criteria: [
      {
        criterion: { criterionId: "c1", description: "Verify result", verification: "manual" },
        status: "stale",
        evidence: [
          {
            stale: true,
            reason: "Page changed",
            record: {
              evidenceId: "e1",
              taskId: "task-1",
              taskRevision: 1,
              criterionId: "c1",
              kind: "browser_observation",
              actor: "external_client",
              summary: "Client says done",
              recordedAt: 0,
              observedAt: 0,
              runSequence: 1,
              source: { url: "https://example.test", pageId: "p1", documentEpoch: 2 },
              snapshot: { title: "Captured title", text: "Private captured body" },
            },
          },
        ],
        review: {
          reviewId: "review-1",
          taskId: "task-1",
          taskRevision: 1,
          criterionId: "c1",
          outcome: "accepted",
          actor: "desktop_user",
          evidenceIds: ["e1"],
          note: "Reviewed earlier evidence",
          recordedAt: 0,
          evidenceSequence: 1,
        },
      },
    ],
    unresolvedActions: [{ intentId: "effect-1", runId: "run-1", pageId: "p1", status: "uncertain" }],
    browserChanges: [
      {
        stepId: "step-1",
        runId: "run-1",
        pageId: "p1",
        taskRevision: 1,
        op: "fill",
        status: "ok",
        target: "#field",
        startedAt: 1,
        before: { value: "PRIVATE_BEFORE_VALUE" },
        after: { value: "PRIVATE_AFTER_VALUE" },
      },
    ],
    unresolvedOperations: [
      {
        invocationId: "inv-1",
        runId: "run-1",
        operation: "example.test/submit",
        effectClass: "write",
        status: "interrupted",
        effectOutcome: "unknown",
        startedAt: 1,
        error: "Disconnected",
      },
    ],
    runs: [
      {
        runId: "run-1",
        status: "failed",
        taskRevision: 1,
        currentRevision: false,
        error: "Unknown result",
        durationMs: 2500,
      },
    ],
    modelCalls: 2,
    knownCostUsd: 0.01,
    costComplete: false,
  });
  const exported = taskReceiptMarkdown(receipt);
  expect(exported).toContain("**Outcome uncertain**");
  expect(exported).toContain("**Stale evidence:** Page changed");
  expect(exported).toContain("Client-submitted claim");
  expect(exported).toContain("Evidence reviewed: e1");
  expect(exported).toContain("effect-1 — uncertain");
  expect(exported).toContain("task revision 1 (earlier)");
  expect(exported).toContain("example.test/submit");
  expect(exported).toContain("inv-1");
  expect(exported).toContain("some costs are unknown or estimated");
  expect(exported).not.toContain("Private captured body");
  expect(exported).toContain("Before-state omitted from this export.");
  expect(exported).toContain("After-state omitted from this export.");
  expect(exported).not.toContain("PRIVATE_BEFORE_VALUE");
  expect(exported).not.toContain("PRIVATE_AFTER_VALUE");
  expect(exported).not.toContain("![tracker]");
  expect(exported).not.toContain("<script>");
  expect(taskReceiptMarkdown(receipt, true)).toContain("Private captured body");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_BEFORE\\_VALUE");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_AFTER\\_VALUE");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_AFTER\\_VALUE");
});

it("exports command provenance and limitations with command text and output opt-in", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "t",
    taskRevision: 1,
    objective: "Check project",
    generatedAt: 0,
    status: "needs_review",
    criteria: [
      {
        criterion: { criterionId: "c", description: "Checks pass", verification: "test" },
        status: "needs_review",
        evidence: [
          {
            stale: false,
            record: {
              evidenceId: "e",
              taskId: "t",
              taskRevision: 1,
              criterionId: "c",
              kind: "command_snapshot",
              actor: "desktop_user",
              summary: "Local command result: succeeded (exit 0)",
              recordedAt: 0,
              observedAt: 0,
              runSequence: 0,
              source: { sha256: "a".repeat(64) },
              snapshot: {
                title: "Saved local command result",
                text: "PRIVATE_COMMAND_AND_OUTPUT <script>bad()</script>",
              },
            },
          },
        ],
      },
    ],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
  const exported = taskReceiptMarkdown(receipt);
  expect(exported).toContain("Saved local command result selected by user");
  expect(exported).not.toContain("PRIVATE_COMMAND_AND_OUTPUT");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_COMMAND\\_AND\\_OUTPUT");
  expect(taskReceiptMarkdown(receipt, true)).not.toContain("<script>");
});

it("labels page actions as irreversible and keeps browser observations opt-in", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "t",
    taskRevision: 1,
    objective: "Submit form",
    generatedAt: 0,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
    remoteActions: [
      {
        stepId: "s",
        runId: "r",
        pageId: "p",
        taskRevision: 1,
        op: "click",
        status: "ok",
        startedAt: 1,
        browserObserved: "PRIVATE_CONFIRMATION",
        remoteConfirmed: false,
        uncertain: false,
      },
    ],
  });
  expect(taskReceiptMarkdown(receipt)).toContain("cannot be reversed by browser undo");
  expect(taskReceiptMarkdown(receipt)).toContain("no remote confirmation");
  expect(taskReceiptMarkdown(receipt)).not.toContain("PRIVATE_CONFIRMATION");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_CONFIRMATION");
});

it("keeps bookmarked titles and addresses out of the default export", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "t",
    taskRevision: 1,
    objective: "Save",
    generatedAt: 0,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
    bookmarkChanges: [
      {
        stepId: "s",
        runId: "r",
        pageId: "p",
        taskRevision: 1,
        status: "ok",
        startedAt: 1,
        title: "PRIVATE_TITLE",
        url: "https://private.test/",
      },
    ],
  });
  expect(taskReceiptMarkdown(receipt)).not.toContain("PRIVATE_TITLE");
  expect(taskReceiptMarkdown(receipt)).not.toContain("private.test");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_TITLE");
  expect(taskReceiptMarkdown(receipt, true)).toContain("private.test");
});

it("redacts downloaded filenames and paths unless captured text is selected", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "t",
    taskRevision: 1,
    objective: "Download",
    generatedAt: 0,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
    downloadChanges: [
      {
        stepId: "s",
        runId: "r",
        pageId: "p",
        taskRevision: 1,
        status: "completed",
        startedAt: 1,
        filename: "PRIVATE_REPORT.pdf",
        sourceUrl: "https://private.test/report",
        path: "/tmp/PRIVATE_REPORT.pdf",
        size: 6,
        cleanupAvailable: true,
      },
    ],
  });
  const ordinary = taskReceiptMarkdown(receipt);
  expect(ordinary).toContain("cleanup available");
  expect(ordinary).not.toContain("PRIVATE_REPORT");
  expect(ordinary).not.toContain("private.test");
  const withText = taskReceiptMarkdown(receipt, true);
  expect(withText).toContain("PRIVATE\\_REPORT.pdf");
  expect(withText).toContain("private.test/report");
});

it("redacts history visit text unless captured text is selected", () => {
  const receipt = TaskReceiptSchema.parse({
    taskId: "t",
    taskRevision: 1,
    objective: "Browse",
    generatedAt: 0,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
    historyChanges: [
      {
        stepId: "s",
        runId: "r",
        pageId: "p",
        taskRevision: 1,
        status: "ok",
        startedAt: 1,
        url: "https://private.test/visit",
        title: "PRIVATE_VISIT",
        visitedAt: 1,
      },
    ],
  });
  expect(taskReceiptMarkdown(receipt)).not.toContain("private.test");
  expect(taskReceiptMarkdown(receipt)).not.toContain("PRIVATE_VISIT");
  expect(taskReceiptMarkdown(receipt, true)).toContain("private.test/visit");
  expect(taskReceiptMarkdown(receipt, true)).toContain("PRIVATE\\_VISIT");
});
