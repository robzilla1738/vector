import { randomUUID } from "node:crypto";
import { vi } from "vitest";
import { NullNativeBridge } from "@aux/runtime";
import type {
  ImportCategory,
  ImportExtensionSelection,
  ImportExtensionReview,
  NativeBrowserImportReceipt,
} from "@aux/contracts";

/** Local protocol fixture, never native import qualification or a filesystem reader. */
export class NativeImportFixture extends NullNativeBridge {
  override available() {
    return true;
  }
  readonly token = "original-window-token";
  readonly sourceHandle = "opaque-native-snapshot";
  readonly jobs = new Map<string, NativeBrowserImportReceipt>();
  readonly categories: ImportCategory[] = ["bookmarks", "history", "tabs", "passwords", "extensions"];
  held = false;
  ownerAlive = true;
  turnSourceContext = vi.fn(async (token: string) => {
    if (!this.ownerAlive || token !== this.token) throw new Error("Original window retired");
    return { windowId: "original-window", activePageId: null, revision: 0, layout: null };
  });
  browserImportDiscover = vi.fn(async (token: string) => {
    await this.turnSourceContext(token);
    const categories = this.categories.map((category) => ({ category, available: true }));
    return {
      sources: [
        {
          id: "chrome",
          label: "Chrome",
          profiles: ["Reviewed"],
          categories,
          profileCategories: [{ profileId: "Reviewed", categories }],
        },
      ],
      snapshots: [{ sourceId: "chrome", profileId: "Reviewed", sourceHandle: this.sourceHandle }],
    };
  });
  browserImportExtensionReview = vi.fn(
    async (input: { token: string; sourceHandle: string }): Promise<ImportExtensionReview> => {
      await this.turnSourceContext(input.token);
      if (input.sourceHandle !== this.sourceHandle) throw new Error("Original snapshot changed");
      return { reviewId: randomUUID(), candidates: [] };
    },
  );
  browserImportBegin = vi.fn(
    async (input: {
      token: string;
      operationId: string;
      sourceHandle: string;
      categories: ImportCategory[];
      extensionReview: ImportExtensionSelection | Record<string, never>;
    }) => {
      await this.turnSourceContext(input.token);
      if (input.sourceHandle !== this.sourceHandle) throw new Error("Original snapshot changed");
      const receipt: NativeBrowserImportReceipt = {
        operationId: input.operationId,
        unknown: false,
        done: !this.held,
        cancelled: false,
        progress: input.categories.map((category) => ({
          source: "chrome",
          label: "Chrome",
          profileId: "Reviewed",
          category,
          state: this.held ? "running" : "done",
          imported: this.held ? 500 : 2,
          skipped: 0,
        })),
      };
      this.jobs.set(input.operationId, receipt);
      return structuredClone(receipt);
    },
  );
  browserImportPoll = vi.fn(async (operationId: string) =>
    structuredClone(this.jobs.get(operationId) ?? { operationId, unknown: true }),
  );
  browserImportCancel = vi.fn(async (operationId: string) => {
    const job = this.jobs.get(operationId);
    if (job) job.cancelled = true;
    return this.browserImportPoll(operationId);
  });
  finish(operationId: string) {
    const job = this.jobs.get(operationId);
    if (!job?.progress) throw new Error("No accepted operation");
    job.done = true;
    for (const result of job.progress) result.state = "done";
  }
}
export async function flushImport() {
  for (let turn = 0; turn < 8; ++turn) await new Promise<void>((resolve) => setImmediate(resolve));
}
