// Only the count-pinned routine/session callbacks below use this registry.
// Their awaited bodies retain existing native FS/agent/child owners. A timer,
// abort, caller rejection or socket timeout is never physical completion.
function auxCreateManagedProducerLifetimes(boundary, isClosing, clock = globalThis) {
  const pending = new Set(), stops = new Set();
  let closing = false, shutdown;
  const admitted = () => !closing && !isClosing();
  function run(callback) {
    if (!admitted()) return Promise.reject(Error('AUX_MANAGED_PRODUCER_CLOSED'));
    let physical;
    try {
      // A domain failure from a reviewed, fully awaited body is still an
      // observed completion. Native boundary failures are not converted here.
      physical = boundary.awaited(async () => {
        try { return { ok: true, value: await callback() }; }
        catch (error) { return { ok: false, error }; }
      });
    } catch (error) { return Promise.reject(error); }
    pending.add(physical);
    physical.then(() => pending.delete(physical), () => pending.delete(physical));
    return physical.then(result => {
      if (!result.ok) throw result.error;
      return result.value;
    });
  }
  function subscribe(register, callback) {
    if (!admitted()) throw Error('AUX_MANAGED_PRODUCER_CLOSED');
    let subscribed = true;
    const detach = register((...args) => {
      if (!subscribed || !admitted()) return;
      const work = run(() => callback(...args));
      work.catch(() => {}); // Event sources may intentionally ignore returns.
      return work;
    });
    const stop = () => { if (subscribed) { subscribed = false; detach(); stops.delete(stop); } };
    stops.add(stop); return stop;
  }
  function timer(callback, delay, repeat) {
    if (!admitted()) throw Error('AUX_MANAGED_PRODUCER_CLOSED');
    let active = true;
    const fire = () => {
      if (!active || !admitted()) return;
      if (!repeat) { active = false; stops.delete(stop); }
      run(callback).catch(() => {});
    };
    const handle = repeat ? clock.setInterval(fire, delay) : clock.setTimeout(fire, delay);
    const stop = () => {
      active = false;
      repeat ? clock.clearInterval(handle) : clock.clearTimeout(handle);
      stops.delete(stop);
    };
    stops.add(stop); return handle;
  }
  function stop() {
    if (shutdown) return shutdown;
    closing = true;
    // Unsubscription and cancellation cover only callbacks not yet admitted.
    const failures = [];
    for (const dispose of [...stops]) try { dispose(); } catch (error) { failures.push(error); }
    shutdown = (async () => {
      while (pending.size) {
        for (const result of await Promise.allSettled([...pending]))
          if (result.status === 'rejected') failures.push(result.reason);
      }
      if (failures.length) throw new AggregateError(failures, 'Aux managed producers did not settle');
    })();
    return shutdown;
  }
  return Object.freeze({ run, subscribe, timer, stop, admitted });
}
let auxManagedProducerRegistry;
function auxManagedProducers() {
  if (!auxManagedProducerRegistry) {
    const boundary = auxBrokerBoundary();
    auxManagedProducerRegistry = auxCreateManagedProducerLifetimes(boundary, () => auxDaemonClosing);
    boundary.registerProducerStop(auxStopLocalIntervals);
  }
  return auxManagedProducerRegistry;
}
function auxStopLocalIntervals() { return auxManagedProducerRegistry?.stop(); }
function auxManagedInterval(callback, delay) { return auxManagedProducers().timer(callback, delay, true); }
function auxManagedTimeout(callback, delay) { return auxManagedProducers().timer(callback, delay, false); }
function auxManagedEvent(emitter, event, callback) { return auxManagedProducers().subscribe(listener => emitter.on(event, listener), callback); }
function auxManagedConnect(callback) { return auxManagedProducers().subscribe(listener => globalExtensionBridge.onConnect(listener), callback); }
function auxManagedLifecycle(callback) { return auxManagedProducers().run(callback); }
function auxManagedBrowserClose(command, route) {
  return auxManagedLifecycle(() => auxManagedBrowserCloseBody(command, route));
}
async function auxManagedBrowserCloseBody(command, route) {
  const clearGroup = command.method === 'Aux.clearAiTabsGroup';
  if (!clearGroup && !(command.method === 'Aux.controlTab' && command.params?.action === 'close'))
    throw Error('AUX_MANAGED_BROWSER_COMMAND_UNREVIEWED');
  let dispatched = false;
  try {
    // The bridge validates response id AND originating connection id. The
    // supplied handler awaits chrome.tabs.remove / WebContentsDestroyed.
    const result = await globalExtensionBridge.sendCommandToExtension(command,
      { ...route, auxManagedWrite: () => { dispatched = true; } });
    const valid = result?.success === true && (clearGroup
      ? Number.isSafeInteger(result.closedCount) && result.closedCount >= 0
      : result.action === 'close' && typeof result.closed === 'boolean' &&
        (result.targetId === undefined || result.targetId === command.params.targetId));
    if (!valid) throw Error('AUX_BROWSER_CLOSE_ACK_INVALID');
    return result;
  } catch (error) {
    // Before dispatch the exact command never reached the browser. After it,
    // timeout/disconnect/cancel/error cannot establish physical settlement.
    if (dispatched) auxBrokerBoundary().noteUntracked();
    throw error;
  }
}
