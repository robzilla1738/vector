// Internal ChildProcess lifecycle boundary. It cannot choose a capture command.
export function waitForCaptureExit(child, recordUncertainStatus) {
  return new Promise((accept, reject) => {
    let spawned = false, uncertain = false, exited = false;
    let statusTask = Promise.resolve();
    const record = phase => {
      statusTask = statusTask.then(() => recordUncertainStatus(phase)).catch(() => {
        // Failed status persistence cannot establish a durable receipt. Keep
        // actual process ownership and fail the capture after its real exit.
        uncertain = true;
      });
      return statusTask;
    };
    const timer = setTimeout(() => {
      uncertain = true;
      record('capture-stop-requested-outcome-uncertain').then(() => {
        if (exited) return;
        try { child.kill('SIGTERM'); }
        catch { record('capture-stop-request-failed-outcome-uncertain'); }
      });
      // Ignoring SIGTERM leaves the actual child and job lock pending.
    }, 15 * 60_000);
    child.once('spawn', () => { spawned = true; });
    child.on('error', () => {
      if (exited) return;
      uncertain = true;
      if (spawned) {
        record('capture-child-error-awaiting-actual-exit');
        return;
      }
      clearTimeout(timer);
      exited = true;
      reject(Error('Capture process unavailable before spawn'));
    });
    child.once('exit', code => {
      if (exited) return;
      exited = true;
      clearTimeout(timer);
      // This listener is deliberately synchronous; status failures are handled
      // above and cannot reject an unobserved async event-listener promise.
      statusTask.then(() => {
        if (code === 0 && !uncertain) accept();
        else reject(Error('Capture failed or outcome uncertain'));
      });
    });
  });
}
