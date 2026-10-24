// Inserted into the supplied module. No caller path/profile/owner selectors.
function auxCreateBackgroundWriterLifetimes(boundary, stopSync, getServer) {
  let closing = false, shutdown;
  const pending = new Set(), failures = [], agents = new Set(), aborters = new Set();
  const assertOpen = () => {
    if (closing) throw Error('AUX_BACKGROUND_ADMISSION_CLOSED');
    boundary.assertOwner();
  };
  function retain(promise) {
    pending.add(promise);
    promise.then(() => pending.delete(promise), error => {
      pending.delete(promise); failures.push(error);
    });
    return promise;
  }
  // cleanup is only used by the concrete already-owned session disposer.
  // It remains admitted until the integrator closes the native broker.
  const cleanup = callback => retain(boundary.awaited(callback));
  const run = callback => {
    try { assertOpen(); } catch (error) { return Promise.reject(error); }
    return cleanup(callback);
  };
  function agent(value) {
    assertOpen(); agents.add(value);
    return () => agents.delete(value);
  }
  function aborter(value) {
    assertOpen(); aborters.add(value);
    return () => aborters.delete(value);
  }
  function stop() {
    if (shutdown) return shutdown;
    closing = true;
    shutdown = (async () => {
      const call = callback => { try { return Promise.resolve(callback()); } catch (error) { return Promise.reject(error); } };
      const results = await Promise.allSettled([
        call(stopSync),
        ...[...aborters].map(controller => call(() => controller.abort(Error('Aux is shutting down')))),
        ...[...agents].map(value => call(() => value.abort())),
        call(() => getServer()?.auxCloseAdmissionAndDrain())
      ]);
      for (const result of results) if (result.status === 'rejected') failures.push(result.reason);
      // Cancellation never releases a retained reader/writer. Newly registered
      // cleanup promises must also settle, even when their request already ended.
      while (pending.size) await Promise.allSettled([...pending]);
      if (failures.length) {
        boundary.noteUntracked();
        throw new AggregateError(failures, 'Aux background work did not settle successfully');
      }
    })();
    shutdown.catch(() => {});
    return shutdown;
  }
  return Object.freeze({assertOpen, run, cleanup, agent, aborter, stop, isClosing: () => closing});
}
function auxBackgroundWriters() {
  return auxBackgroundWriters.cached ??= auxCreateBackgroundWriterLifetimes(
    auxBrokerBoundary(), auxStopSyncProducers,
    () => typeof GlobalAgentSessionServer === 'undefined' ? undefined : GlobalAgentSessionServer);
}
function auxStopBackgroundWriters() { return auxBackgroundWriters().stop(); }
// execFile's abort callback can precede child close. Retain both, with no timeout
// masquerading as completion. Native descendant settlement remains independent.
function auxRunSkillArchiveTool(command, args, signal) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    let callbackDone = false, childClosed = false, failure, stdout;
    const settle = () => {
      if (callbackDone && childClosed) failure ? reject(failure) : resolve(stdout);
    };
    const child = child_process.execFile(command, args, {signal}, (error, output) => {
      callbackDone = true; failure = error; stdout = output; settle();
    });
    child.once('close', () => { childClosed = true; settle(); });
  });
}
