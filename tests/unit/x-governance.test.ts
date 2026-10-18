import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDb, Repo } from "@aux/runtime";
import { xAuthorizer } from "../../apps/runtime/src/services/x-governance.js";
import type { XDispatch } from "../../apps/runtime/src/services/x-operations.js";
import type { XGrantService } from "../../apps/runtime/src/services/x-grants.js";
import type { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import type { Decision } from "@aux/contracts";
const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
function fixture(privateProfile = false) {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const input: XDispatch = {
    runId: "x-run",
    taskId: randomUUID(),
    taskRevision: 1,
    workspaceId: randomUUID(),
    grantId: randomUUID(),
    connectionId: randomUUID(),
    accountRevision: "a".repeat(64),
    operation: "posts.create",
    args: { text: "Exact original body" },
    actionId: randomUUID(),
    effect: "send",
    source: {
      connectionId: randomUUID(),
      userId: "123456789",
      username: "fixture_owner",
      label: "Synthetic account",
      revision: "a".repeat(64),
      state: "active",
      operations: ["posts.create"],
      scopes: ["tweet.write", "tweet.read", "users.read", "offline.access"],
      createdAt: 1,
      updatedAt: 1,
    },
    request: {
      url: "https://api.x.com/2/tweets",
      method: "POST",
      effect: "send",
      objectId: "me",
      sha256: "b".repeat(64),
      body: JSON.stringify({
        raw: Buffer.from("To: person@example.test\r\nSubject: Review\r\n\r\nBody").toString("base64url"),
      }),
    },
  };
  repo.saveRun({
    runId: input.runId,
    status: "running",
    goal: "Fixture",
    pageIds: [],
    config: { taskId: input.taskId, taskRevision: 1, xGrantIds: [input.grantId] },
    createdAt: 1,
  });
  const requireGrant = vi.fn(),
    fence = vi.fn(),
    park = vi.fn();
  const decide = vi.fn().mockResolvedValue({ status: "allow" } as Decision);
  const authorize = xAuthorizer({
    repo,
    profileId: "fixture",
    privateProfile,
    closed: () => false,
    grants: { require: requireGrant } as unknown as XGrantService,
    gate: { policyFence: () => fence, park } as unknown as SafetyDispatchGate,
    decide,
  });
  return { repo, input, requireGrant, fence, park, decide, authorize };
}
it("governs egress and sends separately with exact account, content digest, review content and send policy", async () => {
  const f = fixture(),
    check = await f.authorize(f.input, new AbortController().signal);
  check();
  expect(f.decide.mock.calls.map(([request]) => request.effect)).toEqual(["egress", "write"]);
  expect(f.decide.mock.calls[1]![0]).toMatchObject({
    category: "submit",
    invocationDigest: f.input.request.sha256,
    scope: { kind: "task", id: f.input.taskId },
  });
  expect(f.decide.mock.calls[1]![1].policyCategories).toEqual(["send"]);
  expect(f.decide.mock.calls[1]![1].reviewedActions[0]).toMatchObject({
    target: "fixture_owner / me",
    destination: f.input.request.url,
  });
  expect(f.decide.mock.calls[1]![1].reviewedActions[0].arguments).toContain("Exact original body");
  expect(f.fence).toHaveBeenCalledTimes(2);
  f.requireGrant.mockImplementation(() => {
    throw Error("revoked");
  });
  expect(check).toThrow(/revoked/);
});
it("parks the original request before dispatch when existing decide requires consent", async () => {
  const f = fixture();
  f.decide.mockResolvedValueOnce({
    status: "ask",
    suspension: { kind: "approval", instruction: "Review original X send", approvalId: randomUUID() },
  } as Decision);
  await expect(f.authorize(f.input, new AbortController().signal)).rejects.toMatchObject({
    code: "needs_input",
    detail: { park: { kind: "approval" } },
  });
  expect(f.park).toHaveBeenCalledTimes(1);
  expect(f.decide).toHaveBeenCalledTimes(1);
});
it("fences cancelled, private, ungranted and Labs-disabled original runs", async () => {
  const f = fixture(),
    controller = new AbortController();
  controller.abort();
  await expect(f.authorize(f.input, controller.signal)).rejects.toThrow();
  f.repo.setSetting("featureOverrides", { connectors: false });
  await expect(f.authorize(f.input, new AbortController().signal)).rejects.toMatchObject({
    code: "feature_unavailable",
  });
  f.repo.setSetting("featureOverrides", {});
  const privateRun = fixture(true);
  await expect(privateRun.authorize(privateRun.input, new AbortController().signal)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.decide).not.toHaveBeenCalled();
});
it("cancellation during governance prevents a second decision or successful authorization", async () => {
  const f = fixture(),
    controller = new AbortController();
  f.decide.mockImplementationOnce(async () => {
    controller.abort();
    return { status: "allow" } as Decision;
  });
  await expect(f.authorize(f.input, controller.signal)).rejects.toThrow();
  expect(f.decide).toHaveBeenCalledTimes(1);
});
