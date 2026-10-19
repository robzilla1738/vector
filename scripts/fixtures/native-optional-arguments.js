// Run in a disposable Aux extension page after integrating and compiling 0105.
// Uses the public renderer bindings and native parser; skips subscription updates.
(async () => {
  const results = [];
  const sessions = [];
  const check = async (label, operation, shouldReject = false) => {
    let rejected = false;
    let error;
    try {
      await operation();
    } catch (failure) {
      rejected = true;
      error = String(failure);
    }
    results.push({ label, pass: rejected === shouldReject, error });
  };
  const create = async (...args) => {
    const result = await chrome.auxOmnibox.createSession(...args);
    if (!result || typeof result.sessionId !== 'string') {
      throw new Error('Missing search session identity');
    }
    sessions.push(result.sessionId);
    return result.sessionId;
  };
  try {
    await check('createSession omitted options', () => create());
    await check('createSession undefined options', () => create(undefined));
    await check('createSession null options', () => create(null));
    await check('createSession object options', () => create({}));
    await check('createSession rejects malformed options', () => create(7), true);
    const session = await create({ surface: 'newtab' });
    for (const [label, options] of [['undefined', undefined], ['null', null], ['object', {}]]) {
      await check(`queryAutocomplete ${label} options`, () =>
        chrome.auxOmnibox.queryAutocomplete(session, '', options));
    }
    await check('queryAutocomplete omitted options', () =>
      chrome.auxOmnibox.queryAutocomplete(session, ''));
    await check('queryAutocomplete rejects malformed options', () =>
      chrome.auxOmnibox.queryAutocomplete(session, '', true), true);
    await check('queryAutocomplete still rejects oversized input', () =>
      chrome.auxOmnibox.queryAutocomplete(session, 'x'.repeat(8193)), true);
    await chrome.auxOmnibox.stopAutocomplete(session, true);
  } finally {
    for (const session of sessions) {
      await chrome.auxOmnibox.destroySession(session);
    }
  }
  console.table(results);
  if (results.some(result => !result.pass)) {
    throw new Error('Optional native API argument regression');
  }
  return results;
})();
