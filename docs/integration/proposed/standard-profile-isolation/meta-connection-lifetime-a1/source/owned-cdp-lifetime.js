// Opt-in ownership for the dedicated Meta CDP client. Socket close is physical
// transport completion only; it is never proof of browser-context service drain.
function auxCreateOwnedCdpLifetime(unknown) {
  const attempts = new Set(), sockets = new Map();
  let closing = false, unavailable = false, socketIdentity, closePromise;
  function assertOpen() {
    if (closing || unavailable) throw Error('Aux OAuth connection is closed or unavailable');
  }
  function trackAttempt(operation) {
    assertOpen();
    const promise = Promise.resolve().then(operation);
    attempts.add(promise);
    promise.then(() => attempts.delete(promise), () => attempts.delete(promise));
    return promise;
  }
  function requestClose(socket) {
    try { socket.close(1000, 'Aux OAuth connection closing'); }
    catch { unknown(); }
  }
  function trackSocket(socket) {
    if (sockets.has(socket)) return;
    let resolve;
    const physicalClose = new Promise(done => { resolve = done; });
    const closed = () => {
      socket.removeEventListener('close', closed);
      socket.removeEventListener('error', failed);
      sockets.delete(socket);
      if (!closing) { unavailable = true; unknown(); }
      resolve();
    };
    const failed = () => { unknown(); }; // An error is not physical close.
    sockets.set(socket, physicalClose);
    socket.addEventListener('close', closed, {once: true});
    socket.addEventListener('error', failed);
    // A socket already closed before subscription lacks an observed completion.
    // Keep its record pending; never reconstruct physical proof from readyState.
    if (socket.readyState === 3) { unavailable = true; unknown(); }
    if (socketIdentity && socketIdentity !== socket) {
      unavailable = true;
      unknown();
      requestClose(socket);
      throw Error('Aux OAuth connection cannot change its authenticated socket');
    }
    socketIdentity = socket;
    if (closing || unavailable) requestClose(socket);
  }
  function beginClose() {
    closing = true;
    for (const socket of sockets.keys()) requestClose(socket);
  }
  function waitClosed() {
    if (closePromise) return closePromise;
    beginClose();
    closePromise = (async () => {
      // Already-admitted authorization/connection attempts may create sockets
      // after close was requested. trackSocket immediately closes those too.
      while (attempts.size) await Promise.allSettled([...attempts]);
      while (sockets.size) await Promise.all([...sockets.values()]);
    })();
    return closePromise;
  }
  return {assertOpen, trackAttempt, trackSocket, beginClose, waitClosed,
    get closing() { return closing; },
    get unavailable() { return unavailable; }};
}
