import { captureMemoryAppearance } from '../lib/memory-appearance.mjs';
export const journey = { id: 'memory-appearance', title: 'Owned long Space Memory notes and real search selection', features: ['memory', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 150000, owner: 'Design reviewer' };
export async function run(t) { await t.step('person authors and selects only original disposable Space memory', { kind: 'ui', features: ['memory', 'spaces'] }, () => captureMemoryAppearance(t)); }
