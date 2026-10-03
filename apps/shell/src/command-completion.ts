const guards = new WeakMap<Promise<unknown>, () => boolean>();
/** Each invocation has its own completion; result and original rejection remain unchanged. */
export function guardCommandCompletion<T>(original: Promise<T>, current: () => boolean): Promise<T> {
  const completion = original.then((value) => value);
  guards.set(completion, current);
  return completion;
}
/** Guard only this completion's notification, never its failure or another invocation. */
export function reportCommandCompletionFailure(
  completion: Promise<unknown>,
  reason: unknown,
  report: (reason: unknown) => void,
): void {
  const current = guards.get(completion);
  if (!current || current()) report(reason);
}
