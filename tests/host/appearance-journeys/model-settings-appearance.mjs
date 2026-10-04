import assert from 'node:assert/strict';
import { captureSettingsChatHandoff } from '../lib/settings-chat-handoff-appearance.mjs';
import { configureModel } from '../lib/l10-trust-fixtures.mjs';
import { captureModelSettingsAppearance } from '../lib/model-settings-appearance.mjs';
export const journey = { id: 'model-settings-appearance', title: 'Original loopback Models roles, limits and unavailable key removal', features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 150000, owner: 'Trust' };
export async function run(t) {
  assert.equal(t.appearanceEnabled, true);
  t.signal.throwIfAborted();
  return t.step('original read-only Models settings and connection menu', { kind: 'ui', features: ['electronMigration'] }, async () => {
    t.signal.throwIfAborted();
    await configureModel(t);
    t.signal.throwIfAborted();
    const original=await captureModelSettingsAppearance(t);
    if(!t.narrowEnabled)return original;
    const handoff=await captureSettingsChatHandoff(t);
    return {...original,settingsChatHandoff:handoff,ax:handoff.ax,rpc:handoff.rpc};
  });
}
