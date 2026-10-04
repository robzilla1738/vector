/** Retains the original losing execution of the saved-credential caller.
 * No replacement wait/deadline, effect, or authority is created. */
export function retainSavedCredentialExecution(originalPromise) {
  let settled = false, rejected = false, failure;
  originalPromise.then(() => { settled = true; }, reason => { failure = reason; rejected = true; settled = true; });
  return Object.freeze({
    get receipt() { return Object.freeze({ settled, pending: !settled, failed: rejected }); },
    assertDrained(primaryFailure) {
      if (!settled || rejected && failure !== primaryFailure) {
        const debt = new AggregateError(rejected ? [failure] : [],
          'Original saved credential execution or late cleanup remains unresolved', { cause: failure });
        Object.defineProperty(debt, 'retainedOriginalExecution', { value: originalPromise });
        throw debt;
      }
    },
  });
}
