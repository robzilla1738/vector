import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb } from "@aux/runtime/database";
import { Repo } from "@aux/runtime/repository";

it("keeps advisory utility accounting without adding browser searches to the chat library", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    repo.saveRun({
      runId: "utility",
      goal: "Find a website",
      status: "failed",
      pageIds: [],
      config: { implementation: "utility-generation" },
      createdAt: 20,
    });
    repo.saveRun({
      runId: "chat",
      goal: "Research a website",
      status: "completed",
      pageIds: [],
      createdAt: 10,
    });
    expect(repo.getRun("utility")?.status).toBe("failed");
    expect(repo.listConversations().map((chat) => chat.chatId)).toEqual(["chat"]);
  } finally {
    db.close();
  }
});

it("finds old prompts across all saved history, groups complete chats and paginates tied timestamps", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-history-"));
  const db = openDb(join(dir, "state.sqlite"));
  try {
    const repo = new Repo(db);
    for (let i = 0; i < 605; i++)
      repo.saveRun({
        runId: `run-${String(i).padStart(4, "0")}`,
        goal: i === 0 ? "Find 100%_literal needle" : "A saved prompt",
        status: "completed",
        pageIds: [],
        createdAt: Math.floor(i / 3),
        ...(i < 2 ? { config: { chatId: "old-chat" } } : {}),
      });
    const found = repo.listRuns(40, { groupByChat: true, query: "100%_literal" });
    expect(found.map((run) => run.runId)).toEqual(["run-0001"]);
    expect(repo.listRuns(40, { groupByChat: true, query: "100%_missing" })).toEqual([]);
    expect(repo.listRuns(40, { chatId: "old-chat" }).map((run) => run.runId)).toEqual([
      "run-0001",
      "run-0000",
    ]);
    const ids: string[] = [];
    let before;
    while (true) {
      const page = repo.listRuns(40, { groupByChat: true, before });
      ids.push(...page.map((run) => run.runId));
      if (page.length < 40) break;
      const last = page.at(-1)!;
      before = { createdAt: last.createdAt, runId: last.runId };
    }
    expect(ids.length).toBe(604);
    expect(new Set(ids).size).toBe(604);
    expect(ids.at(-1)).toBe("run-0001");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

it("filters complete conversations by their current Space before pagination and search", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  try {
    for (const [chatId, workspaceId] of [
      ["a", "space-one"],
      ["b", "space-two"],
      ["c", "space-one"],
      ["d", null],
    ] as const) {
      repo.saveRun({
        runId: `${chatId}-first`,
        goal: "Original needle",
        status: "completed",
        pageIds: [],
        createdAt: 10,
        config: { chatId },
      });
      repo.saveRun({
        runId: `${chatId}-second`,
        goal: "Follow-up",
        status: "completed",
        pageIds: [],
        createdAt: 20,
        config: { chatId },
      });
      repo.setSetting(`conversationWorkspace:${chatId}`, workspaceId);
    }
    const first = repo.listConversations(1, { workspaceId: "space-one", query: "needle" });
    expect(first.map((item) => item.chatId)).toEqual(["c"]);
    expect(first[0]?.turnCount).toBe(2);
    const before = { updatedAt: first[0]!.updatedAt, chatId: first[0]!.chatId };
    expect(
      repo
        .listConversations(1, { workspaceId: "space-one", query: "needle", before })
        .map((item) => item.chatId),
    ).toEqual(["a"]);
    repo.setSetting("conversationWorkspace:c", "space-two");
    expect(repo.listConversations(40, { workspaceId: "space-one" }).map((item) => item.chatId)).toEqual([
      "a",
    ]);
    expect(repo.listConversations(40, { workspaceId: "space-two" }).map((item) => item.chatId)).toEqual([
      "c",
      "b",
    ]);
    repo.archiveConversation("a", true);
    expect(repo.listConversations(40, { workspaceId: "space-one" })).toEqual([]);
    expect(
      repo.listConversations(40, { workspaceId: "space-one", archived: true }).map((item) => item.chatId),
    ).toEqual(["a"]);
    expect(repo.listConversations(40).some((item) => item.chatId === "d")).toBe(true);
  } finally {
    db.close();
  }
});

it("recovers attachment-only drafts and removes them from the draft index after their first turn", () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  try {
    repo.setSetting("conversationAttachments:prepared", [
      { filename: "Plan.txt", createdAt: 10, content: "Private source text" },
    ]);
    repo.setSetting("conversationImages:prepared", [
      { filename: "Capture.png", createdAt: 20 },
      { filename: "Removed.png", createdAt: 30, removed: true },
    ]);
    repo.setSetting("conversationImages:removed-only", [
      { filename: "Removed.png", createdAt: 40, removed: true },
    ]);
    repo.setSetting("conversationAttachments:empty", []);
    expect(repo.preparedConversations()).toEqual([
      { chatId: "prepared", title: "Capture.png", attachmentCount: 2, updatedAt: 20 },
    ]);
    repo.saveRun({
      runId: "first-turn",
      goal: "Use my attachments",
      status: "completed",
      pageIds: [],
      createdAt: 50,
      config: { chatId: "prepared" },
    });
    expect(repo.preparedConversations()).toEqual([]);
  } finally {
    db.close();
  }
});

it("finds report answers in earlier turns while preserving current titles, archive and Space filters", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    for (const [runId, createdAt, result] of [
      ["earlier-report", 1, { report: "Distinctive report answer" }],
      ["latest-answer", 2, { answer: "A different answer" }],
    ] as const)
      repo.saveRun({
        runId,
        createdAt,
        goal: "Ordinary question",
        status: "completed",
        pageIds: [],
        config: { chatId: "report-chat" },
        result,
      });
    repo.setSetting("conversationWorkspace:report-chat", "workspace");
    repo.renameConversation("report-chat", "Renamed conversation");
    const found = repo.listConversations(40, { query: "distinctive REPORT", workspaceId: "workspace" });
    expect(found.map((item) => [item.title, item.latestRun.runId])).toEqual([
      ["Renamed conversation", "latest-answer"],
    ]);
    expect(repo.listConversations(40, { query: "Distinctive report", workspaceId: "other" })).toEqual([]);
    repo.archiveConversation("report-chat", true);
    expect(repo.listConversations(40, { query: "Distinctive report" })).toEqual([]);
    expect(repo.listConversations(40, { query: "Distinctive report", archived: true })).toHaveLength(1);
  } finally {
    db.close();
  }
});
