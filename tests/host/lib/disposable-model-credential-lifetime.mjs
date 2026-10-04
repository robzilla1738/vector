import assert from 'node:assert/strict';
/** Wait for an already retained original close without issuing another effect,
 * rediscovering a process, or extending the acquisition reservation. */
export async function awaitOriginalCredentialClose(originalClose, deadline) {
  assert.ok(originalClose && typeof originalClose.then === 'function');
  const remaining = deadline - performance.now();
  assert.ok(Number.isFinite(remaining) && remaining > 0,
    'Original credential close deadline expired; original owner and debt retained');
  let timer;
  try {
    const result = await Promise.race([originalClose, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Original credential close deadline expired; original owner and debt retained')), remaining);
    })]);
    assert.ok(performance.now() < deadline,
      'Original credential close arrived after its reservation; original debt retained');
    return result;
  } finally { clearTimeout(timer); }
}
