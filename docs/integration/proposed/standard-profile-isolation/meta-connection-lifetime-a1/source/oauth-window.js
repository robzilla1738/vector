async function openOAuthWindow(url, signal) {
  const owner = auxBrokerBoundary();
  owner.registerProducerStop(auxStopRefreshProducers);
  // Browser-global/redirected work keeps its independent native browser owner.
  // This record settles only the dedicated Meta context and CDP transport.
  const {CdpClient} = await Promise.resolve().then(() => (init_client$7(), client_exports));
  signal.throwIfAborted();
  const client = new CdpClient({logId: 'cdp-oauth-window'});
  client.enableOwnedLifetime(() => owner.noteUntracked());
  let requestClose, closePromise, setup, browserContextId, closing = false;
  const closeRequested = new Promise(resolve => { requestClose = resolve; });
  // This record outlives the authorization response and flow-map deletion. It
  // owns the original secure client, creation attempt, context ID and socket.
  const retained = owner.awaited(async () => {
    await closeRequested;
    await Promise.allSettled([setup]);
    try {
      if (browserContextId) {
        // No reconnect is permitted after the original owned socket is lost.
        // timeoutMs=0 prevents a command timeout from becoming completion.
        const result = await withoutReplContext(() => client.send(
          'Target.disposeAuxBrowserContextAndObserve', {browserContextId},
          undefined, {timeoutMs: 0}));
        if (result?.profileObjectDestroyed !== true ||
            result?.storagePartitionsMemoryOnly !== true ||
            result?.serviceCleanupState !== 'unknown') owner.noteUntracked();
        // The qualified native OTR storage has no direct persistent partition
        // writer. Memory teardown is not disk drain; redirected/global services
        // remain in the independently required browser participant, not this
        // Meta transport owner. This does not release that browser reservation.
      }
    } catch {
      // Unsupported command, connection loss or refusal remains unknown. The
      // original dispose-on-detach fallback still applies when the socket closes.
      owner.noteUntracked();
    } finally {
      await client.closeOwnedAndWait();
    }
  });
  retained.catch(() => owner.noteUntracked());
  const close = () => {
    if (!closePromise) {
      closing = true;
      signal.removeEventListener('abort', close);
      requestClose();
      closePromise = retained;
    }
    return closePromise;
  };
  const check = () => {
    signal.throwIfAborted();
    if (closing) throw Error('Aux OAuth window is closing');
  };
  signal.addEventListener('abort', close, {once: true});
  // Start only after the retained owner exists. Cleanup waits for this exact
  // creation attempt, including a context allocated just before cancellation.
  setup = (async () => {
    check();
    const created = await client.send('Target.createBrowserContext',
      {disposeOnDetach: true}, undefined, {beforeSend: check});
    browserContextId = created.browserContextId;
    check();
    const {targetId} = await client.send('Target.createTarget',
      {browserContextId, url, newWindow: true, width: 540, height: 720},
      undefined, {beforeSend: check});
    check();
    return {async focus() {
      check();
      await client.send('Target.activateTarget', {targetId}, undefined, {beforeSend: check});
    }};
  })();
  try {
    return await setup;
  } catch (error) {
    await close();
    throw Error('Could not open the private Meta sign-in window. Please try again.', {cause: error});
  }
}
