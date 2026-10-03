import assert from 'node:assert/strict';

const keys = (value, expected) => assert.deepEqual(Object.keys(value ?? {}).sort(), expected.sort(), 'Unexpected utility owner fields');
const token = value => typeof value === 'string' && /^[A-F0-9]{32}$/.test(value) && !/^0+$/.test(value);
const pageId = value => typeof value === 'string' && (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value) || /^p_[a-z0-9_]{6,126}$/.test(value));

/** Native getter JSON allows numeric .0 spellings, but duplicate keys never admit ownership. */
export function readUtilityAppearanceJson(raw) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 4096, 'Native appearance exceeds original 4096-byte bound');
  const parsed = JSON.parse(raw);
  let offset = 0;
  const space = () => { while (/\s/.test(raw[offset] ?? '') && offset < raw.length) offset++; };
  const string = () => {
    const start = offset++;
    while (offset < raw.length) {
      if (raw[offset++] === '\\') offset++;
      else if (raw[offset - 1] === '"') return JSON.parse(raw.slice(start, offset));
    }
    throw new Error('Unterminated JSON string');
  };
  function value(depth) {
    assert.ok(depth <= 16, 'Native appearance nesting exceeds bound'); space();
    if (raw[offset] === '"') { string(); return; }
    if (raw[offset] === '{') {
      offset++; space(); const seen = new Set();
      if (raw[offset] === '}') { offset++; return; }
      for (;;) {
        space(); const key = string(); assert.ok(!seen.has(key), 'Duplicate native appearance field'); seen.add(key);
        space(); assert.equal(raw[offset++], ':'); value(depth + 1); space();
        if (raw[offset++] === '}') return;
        assert.equal(raw[offset - 1], ',');
      }
    }
    if (raw[offset] === '[') {
      offset++; space(); if (raw[offset] === ']') { offset++; return; }
      for (;;) { value(depth + 1); space(); if (raw[offset++] === ']') return; assert.equal(raw[offset - 1], ','); }
    }
    const match = /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(raw.slice(offset));
    assert.ok(match, 'Invalid native JSON token'); offset += match[0].length;
  }
  value(0); space(); assert.equal(offset, raw.length); return parsed;
}

export function decodeUtilityAppearanceOwner(value, { windowId, windowKind } = {}) {
  keys(value, ['producer', 'version', 'windowId', 'browserWindowId', 'windowKind', 'shellDocumentToken', 'pages']);
  assert.equal(value.producer, 'aux-native-utility-appearance-owner'); assert.equal(value.version, 1);
  assert.ok(Number.isSafeInteger(value.windowId) && value.windowId > 0 && value.windowId <= 2147483647);
  assert.ok(typeof value.browserWindowId === 'string' && /^[1-9][0-9]*$/.test(value.browserWindowId) && BigInt(value.browserWindowId) <= 2147483647n, 'Invalid native browser-window ID');
  assert.ok(['normal', 'little'].includes(value.windowKind), 'Unknown utility kind');
  if (windowId !== undefined) assert.equal(value.windowId, windowId, 'Utility/outer window mismatch');
  if (windowKind !== undefined) assert.equal(value.windowKind, windowKind, 'Utility/outer kind mismatch');
  assert.ok(token(value.shellDocumentToken), 'Invalid shell document token');
  assert.ok(Array.isArray(value.pages) && value.pages.length <= 1 && (value.windowKind !== 'little' || value.pages.length === 1), 'Invalid selected native guest');
  for (const page of value.pages) {
    keys(page, ['pageId', 'documentToken', 'selected']);
    assert.ok(pageId(page.pageId) && token(page.documentToken) && page.selected === true, 'Invalid selected native guest identity');
  }
  return Object.freeze({ ...value, pages: Object.freeze(value.pages.map(page => Object.freeze({ ...page }))) });
}

export function assertUtilityAppearanceOwner(actual, original) {
  assert.deepEqual(decodeUtilityAppearanceOwner(actual), decodeUtilityAppearanceOwner(original), 'Original utility owner retired or replaced');
}
