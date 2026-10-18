import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { EventBus, Repo, TaskService, openDb } from "@aux/runtime";
import {
  initializeFieldCodec,
  encryptedFieldsForDatabase,
} from "../../apps/runtime/src/store/field-codec.js";
import { ChannelStore } from "../../apps/runtime/src/services/channel-store.js";
import { profileSecrets } from "../support/profile-secrets.js";
import { seedChannel } from "../fixtures/channels.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
async function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const profileId = randomUUID();
  const codec = await initializeFieldCodec(db, profileSecrets(profileId).native, profileId);
  const repo = new Repo(db, codec),
    tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Disposable channel space");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Synthetic thread",
    objective: "Synthetic task",
    criteria: [
      { criterionId: "response", description: "Respond to the synthetic request", verification: "manual" },
    ],
  });
  return { repo, db, task, ...seedChannel(repo, workspace.workspaceId, task.taskId) };
}

describe("durable protected messenger records", () => {
  it("protects every body, hides provider identities from indexes and binds each body to its exact row", async () => {
    const f = await fixture();
    const tables = Object.keys(encryptedFieldsForDatabase(f.db)).filter((table) =>
      table.startsWith("channel_"),
    );
    expect(tables).toHaveLength(6);
    for (const table of tables) {
      const rows = f.db.prepare(`SELECT * FROM ${table}`).all();
      expect(rows).toHaveLength(1);
      const raw = JSON.stringify(rows);
      for (const text of ["Protected messenger", "Protected person", "Protected bot", "300:400"])
        expect(raw).not.toContain(text);
    }
    expect(f.store.peer(f.connection.connectionId, f.peerKey)?.name).toBe("Protected person");
    expect(f.store.thread(f.connection.connectionId, f.peerKey, f.threadKey)?.taskId).toBe(f.task.taskId);
    const row = f.db.prepare("SELECT body FROM channel_messages").get() as { body: string };
    expect(() =>
      f.repo.revealRecordField(
        "channel_messages",
        [f.connection.connectionId, "wrong-message"],
        "body",
        row.body,
      ),
    ).toThrow();
  });

  it("keeps message deduplication and checkpoint advancement in one durable transaction", async () => {
    const f = await fixture();
    expect(f.store.receive(f.connection, f.message, { provider: "telegram", offset: 6 })).toBe(false);
    expect(f.store.messages(f.connection.connectionId, ["completed"])).toHaveLength(1);
    expect(f.store.cursor(f.connection)).toEqual({ provider: "telegram", offset: 6 });
    expect(() =>
      f.repo.transaction(() => {
        f.store.receive(
          f.connection,
          { ...f.message, messageId: "300:401" },
          { provider: "telegram", offset: 7 },
        );
        throw new Error("synthetic commit failure");
      }),
    ).toThrow("synthetic commit failure");
    expect(f.store.messages(f.connection.connectionId, ["pending"])).toHaveLength(0);
    expect(f.store.cursor(f.connection)).toEqual({ provider: "telegram", offset: 6 });
    f.store.receive(f.connection, null, null);
    expect(f.store.cursor(f.connection)).toBeUndefined();
  });

  it("retires old inputs, checkpoints and unsent replies when a connection changes", async () => {
    const f = await fixture();
    f.store.receive(f.connection, { ...f.message, messageId: "300:401" });
    f.store.saveDelivery({ ...f.delivery, state: "sending" });
    const pending = { ...f.delivery, deliveryId: randomUUID(), state: "pending" as const };
    f.store.saveDelivery(pending);
    const changed = { ...f.connection, revision: randomUUID(), updatedAt: Date.now() };
    f.store.save(changed, f.connection.revision);
    expect(f.store.cursor(changed)).toBeUndefined();
    expect(f.store.messages(changed.connectionId, ["pending"])).toHaveLength(0);
    expect(f.store.messages(changed.connectionId, ["retired"])).toHaveLength(1);
    expect(
      f.store
        .deliveries(changed.connectionId)
        .map((item) => item.state)
        .sort(),
    ).toEqual(["failed", "unknown"]);
    expect(() => f.store.receive(f.connection, { ...f.message, messageId: "300:402" })).toThrow(
      /changed or stopped/,
    );
    expect(() => f.store.save(f.connection, f.connection.revision)).toThrow(/changed/);
  });

  it("keeps ambiguous deliveries unknown after a process restart", async () => {
    const f = await fixture();
    f.store.saveDelivery({ ...f.delivery, state: "sending" });
    const reopened = new ChannelStore(f.repo);
    reopened.recover();
    reopened.recover();
    expect(reopened.deliveries(f.connection.connectionId)[0]?.state).toBe("unknown");
  });

  it("removes only the selected connection and all of its protected children", async () => {
    const f = await fixture();
    const other = seedChannel(f.repo, f.connection.workspaceId, f.task.taskId);
    f.store.remove(f.connection.connectionId);
    expect(f.store.get(f.connection.connectionId)).toBeUndefined();
    for (const table of [
      "channel_peers",
      "channel_threads",
      "channel_messages",
      "channel_outbox",
      "channel_cursors",
    ])
      expect(
        f.db.prepare(`SELECT count(*) n FROM ${table} WHERE connection_id=?`).get(f.connection.connectionId),
      ).toMatchObject({ n: 0 });
    expect(other.store.messages(other.connection.connectionId, ["completed"])).toHaveLength(1);
    expect(f.db.prepare("PRAGMA secure_delete").get()).toMatchObject({ secure_delete: 0 });
  });

  it("refuses a changed public connection binding even when the body is authentic", async () => {
    const f = await fixture();
    f.db
      .prepare("UPDATE channel_connections SET revision=? WHERE connection_id=?")
      .run(randomUUID(), f.connection.connectionId);
    expect(() => f.store.get(f.connection.connectionId)).toThrow(/identity does not match/);
  });

  it("cannot move a stable delivery identity to another recipient or connection", async () => {
    const f = await fixture();
    const other = seedChannel(f.repo, f.connection.workspaceId, f.task.taskId);
    expect(() => f.store.saveDelivery({ ...f.delivery, conversationId: "another-recipient" })).toThrow(
      /another channel reply/,
    );
    expect(() =>
      f.store.saveDelivery({ ...f.delivery, connectionId: other.connection.connectionId }),
    ).toThrow(/another channel reply/);
    expect(f.store.deliveries(f.connection.connectionId)[0]?.conversationId).toBe("300");
    expect(() => f.store.receive(f.connection, null, { provider: "slack" })).toThrow(/another messenger/);
    expect(f.store.cursor(f.connection)).toEqual({ provider: "telegram", offset: 5 });
  });
});
