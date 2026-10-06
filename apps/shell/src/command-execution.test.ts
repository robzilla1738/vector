import { describe, expect, it, vi } from "vitest";
import { commandExecutor } from "./command-execution";

describe("acknowledged command dispatch", () => {
  it("keeps a form open until the registered action acknowledges success", async () => {
    let acknowledge!: () => void;
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          acknowledge = resolve;
        }),
    );
    const executor = commandExecutor(() => action, vi.fn());
    let closed = false;
    const saving = executor.execute("save", {}).then(() => {
      closed = true;
    });
    await Promise.resolve();
    expect(closed).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);
    acknowledge();
    await saving;
    expect(closed).toBe(true);
  });
  it("propagates awaited failures and reports keyboard failures exactly once", async () => {
    const error = new Error("native refused");
    const report = vi.fn();
    const action = vi.fn(async () => {
      throw error;
    });
    const executor = commandExecutor(() => action, report);
    await expect(executor.execute("save", {})).rejects.toBe(error);
    expect(report).not.toHaveBeenCalled();
    expect(executor.run("save", {})).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(report).toHaveBeenCalledExactlyOnceWith(error);
  });
  it("refuses unavailable, foreign-window and missing-handler commands without invoking them", async () => {
    const action = vi.fn();
    const report = vi.fn();
    const executor = commandExecutor(
      (id, context: { window: string }) =>
        id === "save" && context.window === "normal" ? action : undefined,
      report,
    );
    for (const [id, window] of [
      ["missing", "normal"],
      ["save", "private"],
    ]) {
      expect(executor.run(id!, { window: window! })).toBe(false);
      await expect(executor.execute(id!, { window: window! })).rejects.toThrow(/unavailable/);
    }
    expect(action).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });
  it("reports synchronous keyboard action errors once", () => {
    const error = new Error("invalid payload");
    const report = vi.fn();
    const executor = commandExecutor(
      () => () => {
        throw error;
      },
      report,
    );
    expect(executor.run("save", {})).toBe(true);
    expect(report).toHaveBeenCalledExactlyOnceWith(error);
  });
});
