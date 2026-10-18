import { afterEach, expect, it } from "vitest";
import { openDb, Repo, EventBus, TaskService } from "@aux/runtime";
import { workspaceMemoryText } from "@aux/contracts/memory-context";
import { workspacesMethods } from "../../apps/runtime/src/api/methods/workspaces.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

const repositories: Repo[] = [];
afterEach(() => {
  for (const repo of repositories.splice(0)) repo.close();
});
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  repositories.push(repo);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Synthetic owner documents");
  return { repo, tasks, workspaceId: workspace.workspaceId };
}
it("persists distinct owner documents, preserves root edits and bounds Space recall", () => {
  const f = fixture();
  const root = f.tasks.setWorkspaceMemory(f.workspaceId, 0, "Synthetic root context");
  const user = f.tasks.setWorkspaceMemoryDocument({
    workspaceId: f.workspaceId,
    expectedRevision: root.revision,
    path: "USER.md",
    content: "The synthetic Cedar workshop prefers concise progress reports.",
  });
  expect(user.contentUpdatedAt).toBe(root.contentUpdatedAt);
  const taxonomy = f.tasks.setWorkspaceMemoryDocument({
    workspaceId: f.workspaceId,
    expectedRevision: user.revision,
    path: "TAXONOMY.md",
    content: "Topics: workshop planning, reference research and project decisions.",
  });
  const updated = f.tasks.setWorkspaceMemory(
    f.workspaceId,
    taxonomy.revision,
    "Revised synthetic root context",
  );
  expect(updated.documents?.map((document) => document.path)).toEqual(["USER.md", "TAXONOMY.md"]);
  expect(f.tasks.workspaceMemory(f.workspaceId).documents).toEqual(updated.documents);
  const context = workspaceMemoryText(updated, 260);
  expect(context).toContain("Owner-written USER.md");
  expect(context).toContain("Owner-written TAXONOMY.md");
  expect(context.length).toBeLessThanOrEqual(260);
  expect(workspaceMemoryText({ ...updated, enabled: false })).toBe("");
  const other = f.tasks.createWorkspace("Other synthetic Space");
  expect(workspaceMemoryText(f.tasks.workspaceMemory(other.workspaceId))).toBe("");
  expect(f.tasks.searchWorkspaceMemory("Cedar").map((item) => item.workspaceId)).toEqual([f.workspaceId]);
});
it("rejects stale edits, secrets and arbitrary file paths, then removes the exact document", () => {
  const f = fixture();
  const first = f.tasks.setWorkspaceMemoryDocument({
    workspaceId: f.workspaceId,
    expectedRevision: 0,
    path: "USER.md",
    content: "Original synthetic owner document.",
  });
  expect(() =>
    f.tasks.setWorkspaceMemoryDocument({
      workspaceId: f.workspaceId,
      expectedRevision: 0,
      path: "USER.md",
      content: "Stale replacement",
    }),
  ).toThrow("Memory changed");
  expect(() =>
    f.tasks.setWorkspaceMemoryDocument({
      workspaceId: f.workspaceId,
      expectedRevision: first.revision,
      path: "USER.md",
      content: "api_key=sk_synthetic_private_credential_value",
    }),
  ).toThrow("sensitive details");
  expect(() =>
    f.tasks.setWorkspaceMemoryDocument({
      workspaceId: f.workspaceId,
      expectedRevision: first.revision,
      path: "../../secrets.txt",
      content: "Invalid path",
    }),
  ).toThrow();
  const removed = f.tasks.setWorkspaceMemoryDocument({
    workspaceId: f.workspaceId,
    expectedRevision: first.revision,
    path: "USER.md",
    content: null,
  });
  expect(removed.documents).toEqual([]);
  expect(workspaceMemoryText(removed)).toBe("");
});
it.each([{ external: true }, { codeMode: true }, { nativeTurnContext: undefined }])(
  "requires original normal-window authority before reading owner documents (%o)",
  async (client) => {
    const f = fixture();
    const context = {
      client: { nativeTurnContext: "synthetic-proof", ...client },
      params: {},
      s: {
        native: {
          turnSourceContext: async () => {
            throw new Error("Should not read native state");
          },
        },
        nativeIdentity: Promise.resolve({ privateSession: false }),
      },
      tasks: f.tasks,
    } as unknown as MethodCtx;
    await expect(workspacesMethods["workspaces.memory.setDocument"]!(context)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.tasks.workspaceMemory(f.workspaceId).revision).toBe(0);
  },
);
