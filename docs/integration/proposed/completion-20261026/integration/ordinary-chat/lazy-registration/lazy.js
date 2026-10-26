var auxLazyDesktopReplResolvers;
function auxCreateLazyDesktopRepl(factory, accountId, sessionId, sessionCreatedAt) {
  let repl, disposal, disposed = false;
  const owner = AccountRegistry.getAccount(accountId);
  const createdAt = owner?.createdAt, incarnationId = owner?.incarnationId;
  const resolve = () => {
    if (disposed) throw Error('The desktop tool session has closed.');
    const current = AccountRegistry.getAccount(accountId), session = SessionStore.get(accountId, sessionId);
    if (!owner || !current || current.createdAt !== createdAt || current.incarnationId !== incarnationId ||
        !session || String(session.createdAt) !== String(sessionCreatedAt))
      throw Error('The originating desktop tool account or session changed.');
    return repl ??= factory();
  };
  const lazy = {
    run(...args) { return resolve().run(...args); },
    dispose() { if (!disposed) { disposed = true; disposal = repl?.dispose(); } return disposal; },
  };
  (auxLazyDesktopReplResolvers ??= new WeakMap()).set(lazy, resolve);
  return lazy;
}
