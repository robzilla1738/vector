import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeOriginalGuestRecord, extractOriginalGuestFixtureRecord } from './guest-original-record.mjs';
const record = '{"metric":"tab-switch","drawn":[{"visibleBounds":{"x":0.0,"y":1,"width":2,"height":3}}]}';
const wrapper = value => 'AUX_NATIVE_FIXTURE_REPLY_V1 {"producer":"aux-native-fixture-reply","version":1,"pid":2,"windowId":3,"sequence":"1","operation":"completeGuestPresentation","record":' + value + '}';
test('original nested .0 bytes remain exact while actual scalar decodes', () => { assert.ok(record.includes('0.0')); assert.equal(extractOriginalGuestFixtureRecord(wrapper(record)), record); assert.equal(decodeOriginalGuestRecord(record).drawn[0].visibleBounds.x, 0); });
test('duplicate nested guest scope and escaped equivalent keys refuse', () => { for (const field of ['"x":9,', '"\\u0078":9,']) assert.throws(() => extractOriginalGuestFixtureRecord(wrapper(record.replace('"x":0.0', field + '"x":0.0'))), /Duplicate/); });
test('duplicate original wrapper key refuses even when final parsed value matches', () => { assert.throws(() => extractOriginalGuestFixtureRecord(wrapper(record).replace('"pid":2', '"pid":2,"pid":2')), /Duplicate/); });
test('original size/depth/field-name and malformed JSON bounds refuse', () => { assert.throws(() => decodeOriginalGuestRecord('{"x":"' + 'a'.repeat(16384) + '"}')); assert.throws(() => decodeOriginalGuestRecord('{"x":' + '['.repeat(9) + '1' + ']'.repeat(9) + '}')); assert.throws(() => decodeOriginalGuestRecord('{"' + 'k'.repeat(129) + '":1}')); assert.throws(() => decodeOriginalGuestRecord('{"x":1,}')); assert.throws(() => decodeOriginalGuestRecord('{"x":1} extra')); });
