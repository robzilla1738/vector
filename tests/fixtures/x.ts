import { randomUUID, createHash } from "node:crypto";
import { Repo, EventBus, TaskService, openDb } from "@aux/runtime";
import type { XScope } from "@aux/contracts/x";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { XAccountRecords } from "../../apps/runtime/src/services/x-store.js";
import { XAccountService } from "../../apps/runtime/src/services/x-accounts.js";
/** Current encrypted X account/task fixture; all provider responses remain synthetic. */
export function xFixture(
  scopes: XScope[] = [
    "tweet.read",
    "users.read",
    "offline.access",
    "tweet.write",
    "bookmark.read",
    "bookmark.write",
    "follows.read",
    "follows.write",
    "dm.read",
    "dm.write",
  ],
) {
  const repo = new Repo(openDb(":memory:"));
  const secrets = new Map<string, string>(),
    native = {
      available: () => true,
      readSecret: async (name: string) => ({ value: secrets.get(name) }),
      storeSecret: async (name: string, value: string) => {
        if (value) secrets.set(name, value);
        else secrets.delete(name);
        return { ok: true as const };
      },
    } as NativeBridge;
  const records = new XAccountRecords(repo),
    record = {
      connectionId: randomUUID(),
      userId: "123456789",
      username: "fixture_owner",
      label: "Fixture account",
      epoch: randomUUID(),
      secretName: `x_oauth_${createHash("sha256").update("default").digest("hex")}_${randomUUID()}`,
      clientId: "fixture-public-client",
      scopes,
      state: "active" as const,
      createdAt: 1,
      updatedAt: 1,
    };
  records.save(record);
  secrets.set(
    record.secretName,
    JSON.stringify({
      accessToken: "fixture-never-live-access",
      refreshToken: "fixture-never-live-refresh",
      scopes,
      expiresAt: Date.now() + 3600_000,
      clientId: record.clientId,
    }),
  );
  const accounts = new XAccountService({
    records,
    native,
    clientId: record.clientId,
    redirectUri: "http://127.0.0.1:18764/oauth/x/callback",
  });
  const tasks = new TaskService(repo, new EventBus(repo)),
    workspace = tasks.createWorkspace("X fixture"),
    task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: "X fixture work",
      objective: "Use admitted fixture data",
      criteria: [{ criterionId: "done", description: "Verified", verification: "manual" }],
    });
  return { repo, records, record, accounts, secrets, native, tasks, workspace, task };
}
