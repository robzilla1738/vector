import assert from 'node:assert/strict';
const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 ';
const wrapperKeys = ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record'];
/** Bounded structural validation keeps original nested bytes and rejects duplicate
 * keys at every object level, including escaped spellings. No authority is minted. */
function original(raw, retainRecord = false) {
  assert.equal(typeof raw, 'string'); assert.ok(Buffer.byteLength(raw) <= 16384, 'Original guest reply exceeds bound');
  const string = /"(?:[^"\\]|\\.)*"/y;
  const scalar = /(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/y;
  let offset = 0, nodes = 0, record;
  const space = () => { while (/\s/.test(raw[offset] ?? '') && offset < raw.length) offset++; };
  function text() { string.lastIndex = offset; const token = string.exec(raw); assert.ok(token, 'Invalid original guest string'); offset = string.lastIndex; return JSON.parse(token[0]); }
  function value(depth) {
    assert.ok(depth <= 8 && ++nodes <= 2048, 'Original guest structural bound exhausted'); space();
    if (raw[offset] === '{') {
      offset++; space(); const seen = new Set();
      if (raw[offset] === '}') { offset++; return; }
      while (offset < raw.length) {
        const key = text(); assert.ok(Buffer.byteLength(key) <= 128); assert.ok(!seen.has(key), 'Duplicate original guest field'); seen.add(key);
        space(); assert.equal(raw[offset++], ':'); space(); const start = offset; value(depth + 1);
        if (retainRecord && depth === 1 && key === 'record') { assert.equal(raw[start], '{'); record = raw.slice(start, offset); }
        space(); if (raw[offset] === '}') { offset++; return; }
        assert.equal(raw[offset++], ','); space();
      }
      assert.fail('Incomplete original guest object');
    } else if (raw[offset] === '[') {
      offset++; space(); if (raw[offset] === ']') { offset++; return; }
      while (offset < raw.length) { value(depth + 1); space(); if (raw[offset] === ']') { offset++; return; } assert.equal(raw[offset++], ','); space(); }
      assert.fail('Incomplete original guest array');
    } else if (raw[offset] === '"') text();
    else { scalar.lastIndex = offset; assert.ok(scalar.exec(raw), 'Invalid original guest scalar'); offset = scalar.lastIndex; }
  }
  space(); assert.equal(raw[offset], '{'); value(1); space(); assert.equal(offset, raw.length, 'Trailing original guest bytes');
  const decoded = JSON.parse(raw); return { decoded, record };
}
export function decodeOriginalGuestRecord(raw) { return original(raw).decoded; }
export function extractOriginalGuestFixtureRecord(raw) {
  assert.equal(typeof raw, 'string'); assert.ok(raw.startsWith(prefix)); assert.ok(Buffer.byteLength(raw) <= 16384);
  const { decoded, record } = original(raw.slice(prefix.length), true);
  assert.deepEqual(Object.keys(decoded).sort(), [...wrapperKeys].sort()); assert.equal(typeof record, 'string'); return record;
}
