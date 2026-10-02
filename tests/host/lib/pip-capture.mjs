import assert from 'node:assert/strict';

// Selection fences come from a fresh private native receipt, never window geometry.
export async function captureOwnedPip(t, name, page, surfaceKind, state) {
  if (!t.appearanceEnabled) return undefined;
  assert.ok(typeof page?.pageId === 'string' && page.pageId.length > 0, 'Missing actual opener page');
  assert.ok(['video-pip', 'document-pip'].includes(surfaceKind), 'Unknown child kind');
  const raw = JSON.parse(await t.discoverPipAppearance({ ownerPageId: page.pageId, surfaceKind, notBefore: new Date().toISOString() }));
  assert.equal(raw.producer, 'aux-native-pip-appearance');
  assert.equal(raw.version, 1);
  assert.equal(raw.pid, t.app.pid, 'Child belongs to another process');
  assert.equal(raw.ownerPageId, page.pageId, 'Child belongs to another page');
  assert.equal(raw.surfaceKind, surfaceKind, 'Child kind changed');
  assert.ok(Number.isInteger(raw.windowId) && raw.windowId > 0 && Number.isInteger(raw.ownerWindowId) && raw.ownerWindowId > 0 && raw.windowId !== raw.ownerWindowId, 'Missing actual owner/child window');
  assert.ok(typeof raw.registrationGeneration === 'string' && /^[1-9][0-9]{0,19}$/.test(raw.registrationGeneration) && BigInt(raw.registrationGeneration) <= 18446744073709551615n, 'Invalid child registration');
  return t.capturePip(name, { windowId: raw.windowId, state, expectedOwner: {
    ownerPageId: raw.ownerPageId, ownerWindowId: raw.ownerWindowId,
    registrationGeneration: raw.registrationGeneration, surfaceKind: raw.surfaceKind,
  } });
}
