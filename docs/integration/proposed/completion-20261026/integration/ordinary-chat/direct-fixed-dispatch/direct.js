var auxDirectFixedTools;
function auxRegisterDirectFixedTool(context, tool) {
  const execute = tool.execute, originalDispose = tool.dispose;
  const owner = AccountRegistry.getAccount(context.accountId);
  const createdAt = owner?.createdAt, incarnation = owner?.incarnationId;
  const sessionCreatedAt = String(context.session.createdAt);
  const identity = value => JSON.stringify([value?.id, value?.mode, value?.userId, value?.authStatus, value?.provider]);
  const originalIdentity = identity(owner), epoch = externalOwnerEpoch(context.accountId);
  const pending = new Set(), controllers = new Set();
  let disposed = false, disposal;
  const assertOrigin = () => {
    const current = AccountRegistry.getAccount(context.accountId), session = SessionStore.get(context.accountId, context.session.id);
    if (disposed || !owner || !current || current.createdAt !== createdAt || current.incarnationId !== incarnation ||
        identity(current) !== originalIdentity || externalOwnerEpoch(context.accountId) !== epoch ||
        isExternalOwnerSuspended(context.accountId) || !session || String(session.createdAt) !== sessionCreatedAt)
      throw Error('The originating fixed tool account or session changed.');
  };
  const registered = function(...args) {
    const controller = new AbortController();
    const parent = args[2];
    const signal = parent ? AbortSignal.any([parent, controller.signal]) : controller.signal;
    controllers.add(controller);
    const operation = (async () => {
      assertOrigin(); signal.throwIfAborted();
      const held = auxCaptureReadFileScope(context);
      const stop = () => { void held.close().catch(() => {}); };
      const unsubscribe = onAccountAuthChange(changed => {
        if (changed !== context.accountId) return;
        try { assertOrigin(); held.guard.assertCurrent(); } catch (error) { controller.abort(error); }
      });
      signal.addEventListener('abort', stop, { once: true });
      const onUpdate = args[3];
      if (typeof onUpdate === 'function') args[3] = (...values) => {
        assertOrigin(); held.guard.assertCurrent(); signal.throwIfAborted(); return onUpdate(...values);
      };
      args[2] = signal;
      try {
        return await held.scope.awaited(async () => {
          assertOrigin(); held.guard.assertCurrent(); signal.throwIfAborted();
          // Keep the original promise alive even for direct APIs without abort support.
          const result = await execute.apply(tool, args);
          assertOrigin(); held.guard.assertCurrent(); signal.throwIfAborted();
          return result;
        });
      } finally {
        unsubscribe(); signal.removeEventListener('abort', stop); await held.close();
      }
    })();
    pending.add(operation);
    const finish = () => { pending.delete(operation); controllers.delete(controller); };
    operation.then(finish, finish);
    return operation;
  };
  tool.execute = registered;
  tool.dispose = () => {
    if (!disposed) {
      disposed = true;
      for (const controller of controllers) controller.abort(Error('The fixed tool session closed.'));
      disposal = Promise.allSettled([...pending]).then(() => originalDispose?.call(tool));
    }
    return disposal;
  };
  (auxDirectFixedTools ??= new WeakMap()).set(tool, registered);
  return tool;
}
function auxIsDirectFixedTool(tool) {
  const registered = tool && auxDirectFixedTools?.get(tool);
  return typeof registered === 'function' && registered === tool.execute;
}
