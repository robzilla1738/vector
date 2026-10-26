import assert from 'node:assert/strict';
import {createAuxPaletteInvocation as make} from './invocation-helper.mjs';
const state=make(), first=state.begin(); assert(!state.allows('a')); first.accept('a'); assert(state.allows('a'));
const oldAction=state.capture(), oldSelection=state.capture(true); state.edit();assert(!first.unedited());assert(oldAction());assert(!oldSelection());
const second=state.begin();assert(!first.current());assert(!oldAction());first.accept('a');assert(!state.allows('a'));second.accept('b');assert(state.allows('b'));assert(second.unedited());
state.invalidate();assert(!second.current());assert(!state.allows('b'));
console.log('PASS invocation readiness, early edits, stale completion/action and delayed selection fences');
