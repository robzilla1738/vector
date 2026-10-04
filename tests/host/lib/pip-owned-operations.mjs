/** Bounded original operations, without process/page rediscovery. An issued
 * operation which times out retains its original Promise and eventual ACK or
 * rejection for the original App guardian, including pre-ACK pages.open. */
export function createPipOwnedOperations(originalOwners, getDeadline) {
  const entries = new Set();
  const bounded = operation => {
    const deadline = getDeadline();
    if (!Number.isFinite(deadline) || Date.now() >= deadline)
      return Promise.reject(new Error('Original PiP caller deadline elapsed'));
    const entry = { originalOwners, deadline, pending: true, issued: false, timedOut: false };
    entries.add(entry);
    const promise = Promise.resolve().then(() => {
      // Reservation and producer execution are separate turns. Retiring the
      // original interval before the microtask must never launch the producer.
      if (Date.now() >= deadline) throw new Error('Original PiP caller deadline elapsed');
      entry.issued = true;
      return operation();
    });
    entry.promise = promise;
    promise.then(result => { entry.pending = false; entry.result = result; if (!entry.timedOut) entries.delete(entry); }, reason => { entry.pending = false; entry.reason = reason; if (!entry.timedOut) entries.delete(entry); });
    let timer;
    const completion = Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => {
        entry.timedOut = true;
        // A producer never issued has no late effect debt. Original callers
        // still receive its truthful deadline rejection.
        if (!entry.issued) entries.delete(entry);
        reject(new Error('Original PiP caller deadline elapsed'));
      }, Math.max(0, deadline - Date.now()));
    })]);
    return completion.finally(() => clearTimeout(timer));
  };
  return { bounded, retained: () => [...entries].filter(entry => entry.issued && (entry.pending || entry.timedOut)) };
}
