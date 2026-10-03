import { expect, it, vi } from "vitest";
import { commandExecutor } from "./command-execution";
import { guardCommandCompletion, reportCommandCompletionFailure } from "./command-completion";
it("each invocation independently retains the same rejection object and reports only its own current owner", async () => {
  const shared = new Error("Original private failure"),
    report = vi.fn();
  const retired = guardCommandCompletion(Promise.reject(shared), () => false),
    active = guardCommandCompletion(Promise.reject(shared), () => true);
  await expect(retired).rejects.toBe(shared);
  await expect(active).rejects.toBe(shared);
  reportCommandCompletionFailure(retired, shared, report);
  reportCommandCompletionFailure(active, shared, report);
  expect(report).toHaveBeenCalledExactlyOnceWith(shared);
});
it("primitive failure and unrelated ordinary completion retain their own reporting semantics", async () => {
  const report = vi.fn(),
    retired = guardCommandCompletion(Promise.reject("original primitive"), () => false),
    ordinary = Promise.reject("ordinary failure");
  await expect(retired).rejects.toBe("original primitive");
  await expect(ordinary).rejects.toBe("ordinary failure");
  reportCommandCompletionFailure(retired, "original primitive", report);
  reportCommandCompletionFailure(ordinary, "ordinary failure", report);
  expect(report).toHaveBeenCalledExactlyOnceWith("ordinary failure");
});
it("execute preserves the actual guarded completion and run gates late failure without changing its result", async () => {
  let reject!: (reason: unknown) => void,
    current = true;
  const original = new Promise<never>((_, fail) => {
    reject = fail;
  });
  const completion = guardCommandCompletion(original, () => current),
    report = vi.fn();
  const executor = commandExecutor(() => () => completion, report);
  expect(executor.execute("original", {})).toBe(completion);
  expect(executor.run("original", {})).toBe(true);
  current = false;
  const failure = new Error("Original failure");
  reject(failure);
  await expect(completion).rejects.toBe(failure);
  expect(report).not.toHaveBeenCalled();
});
it("a current owner still reports through real run, and ordinary synchronous failure remains rejected", async () => {
  const failure = new Error("Active failure"),
    report = vi.fn(),
    completion = guardCommandCompletion(Promise.reject(failure), () => true);
  const executor = commandExecutor(() => () => completion, report);
  expect(executor.run("original", {})).toBe(true);
  await expect(completion).rejects.toBe(failure);
  expect(report).toHaveBeenCalledExactlyOnceWith(failure);
  const sync = commandExecutor(
    () => () => {
      throw failure;
    },
    report,
  );
  await expect(sync.execute("original", {})).rejects.toBe(failure);
});
