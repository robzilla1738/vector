import test from 'node:test';
import assert from 'node:assert/strict';
import { advertisedBlobLength } from './blob-length';

test('private chunked reads have unknown length; explicit zero and malformed headers remain distinct', () => {
  const result = (length: string | null) => ({ headers: new Headers(length === null ? {} : { 'content-length': length }) });
  assert.equal(advertisedBlobLength(result(null)), null);
  assert.equal(advertisedBlobLength(result('0')), 0);
  assert.equal(advertisedBlobLength(result('1048576')), 1048576);
  for (const invalid of ['1garbage', '-1', '9007199254740993']) assert(Number.isNaN(advertisedBlobLength(result(invalid))));
});
