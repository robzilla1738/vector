import { guardCommandCompletion } from "../command-completion";

/** Preserve the existing then/catch/finally chain, including synchronous producer refusal. */
export function constructOperationChain<T>(
  producer: () => Promise<T>,
  completed: (value: T) => T | Promise<T>,
  rejected: (reason: unknown) => never,
  finished: () => void,
  current: () => boolean,
): Promise<T> {
  let native: Promise<T>;
  try {
    native = producer();
  } catch (reason) {
    native = Promise.reject(reason);
  }
  return guardCommandCompletion(native.then(completed).catch(rejected).finally(finished), current);
}

/** Preserve an immediate async operation's sole await and cleanup before its completion. */
export function constructAwaitedOperation<T, R>(
  producer: () => Promise<T>,
  completed: (value: T) => R,
  rejected: ((reason: unknown) => never) | undefined,
  finished: () => void,
  current: () => boolean,
): Promise<R> {
  const completion = (async () => {
    try {
      return completed(await producer());
    } catch (reason) {
      if (rejected) rejected(reason);
      throw reason;
    } finally {
      finished();
    }
  })();
  return guardCommandCompletion(completion, current);
}
