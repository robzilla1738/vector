// Meta's HTTP exchange has a concrete transport lifetime. Its separate CDP
// sign-in window still lacks authenticated physical context/connection cleanup;
// never promote this partial ownership to whole-login settlement.
function auxRunMetaLogin(signal, operation) {
  if (auxDaemonClosing) throw Error('AUX_DAEMON_SHUTTING_DOWN');
  const owner = auxBrokerBoundary();
  owner.registerProducerStop(auxStopRefreshProducers);
  owner.noteUntracked();
  return owner.awaited(async () => {
    signal.throwIfAborted();
    const {Agent, Client, buildConnector} = require_undici$1();
    const scope = auxCreateRefreshIo({fetch, Agent, Client, buildConnector,
      lookup: auxRefreshDnsLookup, signal, unknown: () => owner.noteUntracked()});
    try {
      const result = await auxRefreshIoContext.run(scope, operation);
      if (!scope.requests) {
        owner.noteUntracked();
        throw Error('Meta OAuth transport was not used');
      }
      return result;
    } finally {
      await scope.close();
    }
  });
}
