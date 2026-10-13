import { expect, it, vi } from "vitest";
import type { ConversationSummary } from "@aux/contracts";
import { makeRun } from "../mock/fixtures";
import { ConversationCollection } from "./collection";

const item = (id: string): ConversationSummary => ({
  chatId: id,
  privateTask: false,
  title: id,
  archived: false,
  createdAt: 1,
  updatedAt: 1,
  turnCount: 1,
  latestRun: makeRun({ runId: id, config: { chatId: id } }),
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}
it.each([3, 5, 10] as const)("limits only the sidebar preview to %i chats", async (previewLimit) => {
  const rows = Array.from({ length: 237 }, (_, index) => item(String(index)));
  const read = vi.fn(async ({ limit, before }: { limit?: number; before?: { chatId: string } }) => {
    const start = before ? rows.findIndex((row) => row.chatId === before.chatId) + 1 : 0;
    return rows.slice(start, start + (limit ?? 40));
  });
  const preview = new ConversationCollection(
    { archived: false, policy: "preview", previewLimit },
    read,
    () => true,
  );
  preview.start();
  await preview.load();
  expect(preview.getSnapshot().ids).toHaveLength(previewLimit);
  expect(read).toHaveBeenLastCalledWith({ archived: false, limit: previewLimit });
  const history = new ConversationCollection(
    { archived: false, policy: "complete", previewLimit },
    read,
    () => true,
  );
  history.start();
  await history.load();
  expect(history.getSnapshot().ids).toHaveLength(rows.length);
  expect(history.getSnapshot().more).toBe(false);
});
it("keeps unchanged entity identities while replacing changed summaries", async () => {
  let rows = [item("a"), item("b")];
  const collection = new ConversationCollection(
    { archived: false, policy: "paged" },
    async () => rows,
    () => true,
  );
  collection.start();
  await collection.load();
  const original = collection.getSnapshot();
  rows = rows.map((row) => ({ ...row }));
  await collection.load("refresh");
  expect(collection.getSnapshot().byId).toBe(original.byId);
  expect(collection.getSnapshot().ids).toBe(original.ids);
  rows = rows.map((row) => (row.chatId === "b" ? { ...row, title: "Renamed" } : row));
  await collection.load("refresh");
  expect(collection.getSnapshot().byId.a).toBe(original.byId.a);
  expect(collection.getSnapshot().byId.b?.title).toBe("Renamed");
});
it("rejects retired owner replies and older replies from the same query", async () => {
  const first = deferred<ConversationSummary[]>(),
    second = deferred<ConversationSummary[]>();
  let admitted = true;
  const read = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const collection = new ConversationCollection({ archived: false, policy: "paged" }, read, () => admitted);
  collection.start();
  const old = collection.load();
  const current = collection.load("refresh");
  second.resolve([item("new")]);
  await current;
  first.resolve([item("old")]);
  await old;
  expect(collection.getSnapshot().ids).toEqual(["new"]);
  const retired = deferred<ConversationSummary[]>();
  read.mockReturnValueOnce(retired.promise);
  const pending = collection.load("refresh");
  admitted = false;
  retired.resolve([item("foreign")]);
  await pending;
  expect(collection.getSnapshot().ids).toEqual(["new"]);
});
it("does not resurrect an acknowledged removal from a pending refresh", async () => {
  const pending = deferred<ConversationSummary[]>();
  const read = vi
    .fn()
    .mockResolvedValueOnce([item("__proto__")])
    .mockReturnValueOnce(pending.promise);
  const collection = new ConversationCollection({ archived: false, policy: "paged" }, read, () => true);
  collection.start();
  await collection.load();
  const refresh = collection.load("refresh");
  collection.invalidate();
  collection.remove("__proto__");
  pending.resolve([item("__proto__")]);
  await refresh;
  expect(collection.getSnapshot().ids).toEqual([]);
  expect(Object.getPrototypeOf(collection.getSnapshot().byId)).toBeNull();
});
it("never reads an inadmissible owner", async () => {
  const read = vi.fn();
  const collection = new ConversationCollection(
    { archived: false, policy: "paged" },
    read,
    () => false,
    false,
  );
  collection.start();
  await collection.load();
  expect(read).not.toHaveBeenCalled();
  expect(collection.getSnapshot().loading).toBe(false);
});
