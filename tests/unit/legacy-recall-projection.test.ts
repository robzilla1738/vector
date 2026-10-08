import { afterEach, beforeEach, expect, it } from "vitest";
import type { Run } from "@aux/contracts";
import { openDb } from "@aux/runtime/database";
import { Repo } from "@aux/runtime/repository";
import { TranscriptStore, type ModelMessage } from "@aux/runtime";
import { projectLegacyRecall } from "../../apps/runtime/dist/agent/loop/legacy-recall.js";
import { ConversationBranches } from "../../apps/runtime/dist/services/conversation-branches.js";

const heading = "Auto-recalled memory (verify against the live page before citing):";
const recalled: ModelMessage = {
  role: "user",
  content: `${heading}\n- Saved article — https://example.test/article\n  FORGOTTEN_ARTICLE_SNIPPET`,
};
const answer: ModelMessage = { role: "assistant", content: "Completed the original work." };
let db: ReturnType<typeof openDb>, repo: Repo, transcript: TranscriptStore;
beforeEach(() => {
  db = openDb(":memory:");
  repo = new Repo(db);
  transcript = new TranscriptStore(db);
});
afterEach(() => db.close());

function save(id: string, config: Run["config"] = {}, goal = `Request for ${id}`): Run {
  const run: Run = {
    runId: id,
    goal,
    pageIds: [],
    status: "completed",
    createdAt: 1,
    config: { implementation: "agent-loop", ...config },
  };
  repo.saveRun(run);
  return run;
}
function task(run: Run): ModelMessage {
  return { role: "user", content: `Task: ${run.goal}` };
}

it("omits only the original generated row without needing the forgotten article, preserving human/tool/park history", () => {
  const run = save("original", {}, `Explain this quotation: ${heading}`);
  const steer: ModelMessage = {
    role: "user",
    content: `The user interrupted this turn with a correction. Apply it from here — do not repeat work already journaled.\n\n<interrupted_request>\n${heading}\n</interrupted_request>`,
  };
  const call: ModelMessage = {
    role: "assistant",
    content: [{ type: "tool-call", toolCallId: "effect", toolName: "click", input: {} }],
  };
  const result: ModelMessage = {
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "effect",
        toolName: "click",
        output: { type: "json", value: { alreadyExecuted: true } },
      },
    ],
  };
  transcript.append(run.runId, [task(run), recalled, call, result, steer]);
  transcript.park(run.runId, { toolCallId: "question", toolName: "ask_user_question", pendingResults: [] });
  const before = db.prepare("SELECT * FROM run_transcript ORDER BY seq").all();
  const changes = db.prepare("SELECT total_changes() AS total").get();
  const projected = projectLegacyRecall(repo, transcript, run.runId);
  expect(projected).toEqual([task(run), call, result, steer]);
  expect(JSON.stringify(projected)).not.toContain("FORGOTTEN_ARTICLE_SNIPPET");
  expect(db.prepare("SELECT * FROM run_transcript ORDER BY seq").all()).toEqual(before);
  expect(db.prepare("SELECT total_changes() AS total").get()).toEqual(changes);
  expect(transcript.openPark(run.runId)?.toolCallId).toBe("question");
});

it.each(["changed context", "wrong sequence", "authored later", "unrecorded fork"])(
  "refuses ambiguous %s without removing stored text",
  (kind) => {
    const run = save("ambiguous", kind === "unrecorded fork" ? { branchSourceRunIds: ["missing"] } : {});
    transcript.append(run.runId, [task(run)]);
    if (kind === "wrong sequence")
      transcript.park(run.runId, { toolCallId: "old", toolName: "question", pendingResults: [] });
    if (kind === "authored later") transcript.append(run.runId, [answer]);
    transcript.append(run.runId, [recalled]);
    if (kind === "changed context")
      repo.saveRun({ ...run, config: { ...run.config, context: "Changed source context" } });
    const before = transcript.entries(run.runId);
    expect(() => projectLegacyRecall(repo, transcript, run.runId)).toThrow("Use New Chat");
    expect(transcript.entries(run.runId)).toEqual(before);
  },
);

it("projects old branch drafts and nested forks through exact ordered source lineage; new branches store no legacy recall", async () => {
  const source = save("source", { chatId: "source-chat" });
  transcript.append(source.runId, [task(source), recalled, answer]);
  const metadata = {
    sourceRunId: source.runId,
    sourceRunIds: [source.runId],
    mode: "branch",
    windowId: "window",
  };
  repo.setSetting("conversationBranch:old-branch", metadata);
  transcript.append("conversation-branch:old-branch", transcript.load(source.runId));
  const branches = new ConversationBranches(repo);
  expect(branches.prefix("old-branch")).toEqual([task(source), answer]);
  const child = save("child", { chatId: "old-branch", branchSourceRunIds: [source.runId] });
  transcript.append(child.runId, [...transcript.load(source.runId), task(child), answer]);
  repo.setSetting("conversationBranch:nested", {
    ...metadata,
    sourceRunId: child.runId,
    sourceRunIds: [child.runId],
  });
  transcript.append("conversation-branch:nested", transcript.load(child.runId));
  expect(branches.prefix("nested")).toEqual([task(source), answer, task(child), answer]);
  const fresh = await branches.create(source.runId, "branch", "window", async () => {});
  expect(transcript.load(`conversation-branch:${fresh.chatId}`)).toEqual([task(source), answer]);
  expect(transcript.load(source.runId)).toContainEqual(recalled);
  const old = transcript.load("conversation-branch:old-branch");
  transcript.truncateFrom("conversation-branch:old-branch", 0);
  transcript.append("conversation-branch:old-branch", [
    { role: "user", content: "Different authored task" },
    ...old.slice(1),
  ]);
  expect(() => branches.prefix("old-branch")).toThrow("Use New Chat");
});

it("proves an exact subagent fork after its original parent continued, and refuses a missing parent", () => {
  const parent = save("parent"),
    child = save("child", { subagentProfile: "research" });
  transcript.append(parent.runId, [task(parent), recalled, answer]);
  transcript.append(child.runId, [...transcript.load(parent.runId), task(child), answer]);
  transcript.append(parent.runId, [{ role: "assistant", content: "Later parent turn" }]);
  db.prepare("INSERT INTO workspaces(workspace_id,name,created_at) VALUES('workspace','Research',1)").run();
  db.prepare(
    "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,state,body,created_at) VALUES('group',?,'workspace','active','{}',1)",
  ).run(parent.runId);
  db.prepare(
    "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,state,body,created_at) VALUES('agent','group',?,?,'completed',?,1)",
  ).run(child.runId, child.runId, JSON.stringify({ sourceRunId: parent.runId }));
  expect(projectLegacyRecall(repo, transcript, child.runId)).toEqual([
    task(parent),
    answer,
    task(child),
    answer,
  ]);
  db.prepare("UPDATE subagents SET body=? WHERE agent_id='agent'").run(
    JSON.stringify({ sourceRunId: "missing" }),
  );
  expect(() => projectLegacyRecall(repo, transcript, child.runId)).toThrow("Use New Chat");
  expect(transcript.load(child.runId)).toContainEqual(recalled);
});

it("preserves the incomplete-tool fork boundary and rejects a changed request snapshot", () => {
  const run = save("original");
  const call: ModelMessage = {
    role: "assistant",
    content: [{ type: "tool-call", toolCallId: "pending", toolName: "click", input: {} }],
  };
  transcript.append(run.runId, [task(run), recalled, call]);
  expect(transcript.forkPrefix(run.runId, repo)).toEqual([task(run)]);
  expect(() => projectLegacyRecall(repo, transcript, run.runId, [recalled])).toThrow("Use New Chat");
  expect(transcript.load(run.runId)).toEqual([task(run), recalled, call]);
});
