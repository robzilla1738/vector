import { expect, it, vi } from "vitest";
import { openDb, Repo, type NativeBridge } from "@aux/runtime";
import { CloudSettingsService } from "../../apps/runtime/dist/services/cloud-settings.js";

it.each(["clear", "status"] as const)("retires a pending %s owner lookup without a late repository change", async (operation) => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    let began!: () => void;
    const started = new Promise<void>((resolve) => {
      began = resolve;
    });
    let finish!: (owner: { windowId: string; activePageId: null }) => void;
    const source = new Promise<{ windowId: string; activePageId: null }>((resolve) => {
      finish = resolve;
    });
    const storeSecret = vi.fn();
    const settings = new CloudSettingsService(repo, {
      turnSourceContext: () => {
        began();
        return source;
      },
      storeSecret,
    } as unknown as NativeBridge);
    const mutation = operation === "clear"
      ? settings.clear(0, "original-window-token")
      : settings.readStatus("original-window-token");
    const rejected = expect(mutation).rejects.toMatchObject({ code: "cancelled" });
    await started;
    const closed = settings.close();
    finish({ windowId: "original-window", activePageId: null });
    await rejected;
    await closed;
    expect(repo.hasSetting("cloudExecutionRevision")).toBe(false);
    expect(settings.status()).toEqual({ configured: false, revision: 0 });
    expect(storeSecret).not.toHaveBeenCalled();
  } finally {
    db.close();
  }
});
