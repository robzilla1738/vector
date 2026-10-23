// Internal lifecycle boundary; the CLI alone selects the restore executable.
export function waitForRestoreExit(child, checkpoint) {
  return new Promise((accept, reject) => {
    let spawned = false, uncertain = false, exited = false;
    let statusTask = Promise.resolve();
    const record = phase => {
      statusTask = statusTask.then(() => checkpoint({ phase })).catch(() => {
        // A missing durable record cannot establish restore success. Keep
        // ownership until actual exit even when progress persistence fails.
        uncertain = true;
      });
      return statusTask;
    };
    const timer = setTimeout(() => {
      uncertain = true;
      record('archive-stop-requested-outcome-uncertain').then(() => {
        if (exited) return;
        try { child.kill('SIGTERM'); }
        catch { record('archive-stop-request-failed-outcome-uncertain'); }
      });
      // SIGTERM is a request, not proof the importer has stopped using staging.
    }, 300_000);
    child.once('spawn', () => { spawned = true; });
    child.on('error', () => {
      if (exited) return;
      uncertain = true;
      if (spawned) {
        record('archive-child-error-awaiting-actual-exit');
        return;
      }
      clearTimeout(timer);
      exited = true;
      reject(Error('Restore client unavailable before spawn'));
    });
    child.once('exit', code => {
      if (exited) return;
      exited = true;
      clearTimeout(timer);
      statusTask.then(() => {
        if (code === 0 && !uncertain) accept();
        else reject(Error('Isolated archive import failed or outcome uncertain'));
      });
    });
  });
}
