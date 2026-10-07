import { expect, it } from "vitest";
import { BrowserImporter, Repo, openDb } from "@aux/runtime";
import { NativeImportFixture, flushImport } from "../fixtures/native-browser-import.js";

function operation(f: NativeImportFixture) {
  const call = f.browserImportBegin.mock.calls[0];
  if (!call) throw new Error("Native fixture operation missing");
  return call[0].operationId;
}

const selections = [{ sourceId: "chrome", profileId: "Reviewed", categories: ["history" as const] }];
function fixture() {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    native = new NativeImportFixture();
  const importer = new BrowserImporter({ repo, native, emit: () => {} });
  return { db, repo, native, importer };
}
it("persists native operation identity before dispatch and keeps keys and snapshots out of receipts", async () => {
  const f = fixture();
  try {
    const begin = f.native.browserImportBegin.getMockImplementation();
    if (!begin) throw new Error("Native fixture dispatcher missing");
    f.native.browserImportBegin.mockImplementation(async (input) => {
      const durable = JSON.stringify(f.repo.getSetting("browser-import.receipts.v1"));
      expect(durable).toContain(input.operationId);
      expect(durable).not.toContain(input.token);
      expect(durable).not.toContain(input.sourceHandle);
      return begin(input);
    });
    await f.importer.preview(f.native.token);
    const extensionReview = await f.importer.reviewExtensions(
      { sourceId: "chrome", profileId: "Reviewed" },
      f.native.token,
    );
    const selection = selections[0];
    if (!selection) throw new Error("Reviewed import selection missing");
    const { jobId } = await f.importer.start(
      {
        selections: [
          {
            ...selection,
            categories: f.native.categories,
            extensionReview: { reviewId: extensionReview.reviewId, choices: [] },
          },
        ],
      },
      f.native.token,
    );
    await flushImport();
    const status = await f.importer.status(jobId, f.native.token);
    expect(status).toMatchObject({ done: true, cancelled: false });
    expect(status.progress.map((item) => item.category)).toEqual(f.native.categories);
    expect(status.progress.every((item) => item.imported === 2)).toBe(true);
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(1);
    expect(f.repo.listBookmarks()).toEqual([]);
    expect(f.repo.listHistory()).toEqual([]);
  } finally {
    f.db.close();
  }
});
it("rejoins accepted native work after runtime restart without redispatching or inventing completion", async () => {
  const f = fixture();
  f.native.held = true;
  try {
    await f.importer.preview(f.native.token);
    const { jobId } = await f.importer.start({ selections }, f.native.token);
    await flushImport();
    const restored = new BrowserImporter({ repo: f.repo, native: f.native, emit: () => {} });
    expect(await restored.status(jobId, f.native.token)).toMatchObject({
      done: false,
      progress: [{ imported: 500 }],
    });
    const id = operation(f.native);
    f.native.finish(id);
    expect(await restored.status(jobId, f.native.token)).toMatchObject({
      done: true,
      progress: [{ imported: 500 }],
    });
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(1);
    await f.importer.close();
    await restored.close();
    // A durable prepared identity proves the provider request was never sent.
    // It can retire without a fictional native completion receipt.
    const prepared = {
      jobId: "imp_prepared_before_native_dispatch",
      done: false,
      cancelled: false,
      selections,
      startedAt: 1,
      updatedAt: 1,
      revision: 0,
      nativeOperations: [
        {
          operationId: "never-dispatched-native-operation",
          sourceId: "chrome",
          profileId: "Reviewed",
          categories: ["history" as const],
          state: "prepared" as const,
        },
      ],
      progress: [
        {
          source: "chrome",
          label: "Chrome",
          profileId: "Reviewed",
          category: "history" as const,
          state: "running" as const,
          imported: 0,
          skipped: 0,
        },
      ],
    };
    f.repo.setSetting("browser-import.receipts.v1", [prepared]);
    const unsent = new BrowserImporter({ repo: f.repo, native: f.native, emit: () => {} });
    expect(await unsent.status(prepared.jobId, f.native.token)).toMatchObject({
      done: true,
      cancelled: true,
      progress: [{ imported: 0 }],
    });
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(1);
    await unsent.close();
  } finally {
    f.db.close();
  }
});
it("unknown native receipts retain confirmed counts and require exact human acknowledgement before a new import", async () => {
  const f = fixture();
  f.native.held = true;
  try {
    await f.importer.preview(f.native.token);
    const { jobId } = await f.importer.start({ selections }, f.native.token);
    await flushImport();
    f.native.jobs.clear();
    await expect(f.importer.close()).rejects.toThrow("unknown accepted effects");
    const restored = new BrowserImporter({ repo: f.repo, native: f.native, emit: () => {} });
    await restored.preview(f.native.token);
    expect(await restored.status(jobId, f.native.token)).toMatchObject({
      done: false,
      interrupted: true,
      progress: [{ imported: 500 }],
    });
    await expect(restored.start({ selections }, f.native.token)).rejects.toThrow("explicitly review");
    f.native.held = false;
    const next = await restored.start({ selections, acknowledgeInterruptedJobId: jobId }, f.native.token);
    await flushImport();
    expect(await restored.status(next.jobId, f.native.token)).toMatchObject({ done: true });
    expect(await restored.status(jobId, f.native.token)).toMatchObject({
      done: false,
      acknowledged: true,
      progress: [{ imported: 500 }],
    });
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(2);
    await restored.close();
  } finally {
    f.db.close();
  }
});
it("creation-aware close waits for accepted native completion and cancels future batches", async () => {
  const f = fixture();
  f.native.held = true;
  try {
    await f.importer.preview(f.native.token);
    await f.importer.start({ selections }, f.native.token);
    await flushImport();
    let joined = false;
    const closing = f.importer.close().then(() => {
      joined = true;
    });
    await flushImport();
    expect(joined).toBe(false);
    expect(f.native.browserImportCancel).toHaveBeenCalled();
    f.native.finish(operation(f.native));
    await closing;
    expect(joined).toBe(true);
    expect(f.native.browserImportBegin).toHaveBeenCalledTimes(1);
    await expect(f.importer.preview(f.native.token)).rejects.toThrow("closing");
  } finally {
    f.db.close();
  }
});
it("a retired original window cannot dispatch a saved native snapshot", async () => {
  const f = fixture();
  try {
    await f.importer.preview(f.native.token);
    f.native.ownerAlive = false;
    await expect(f.importer.start({ selections }, f.native.token)).rejects.toThrow("retired");
    expect(f.native.browserImportBegin).not.toHaveBeenCalled();
  } finally {
    f.db.close();
  }
});
