import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';
import { shell, press } from '../fixtures/legacy-ui.mjs';

export const appearanceToolName = 'tool_' + 'x'.repeat(180);

/** Real source discovery and explicit UI consent; ordinary qualification is unchanged. */
export async function captureOutboundMcpAppearance(t, { choose, grants, servers, server, sourceDigest, space } = {}) {
  if (!t.appearanceEnabled || !t.narrowEnabled) return { status: 'not-requested' };
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid && !t.signal?.aborted, 'Original MCP appearance owner retired');
  const owned = async action => { stable(); const result = await action(); stable(); return result; };
  assert.equal(server.workspaceId, space.workspaceId);
  const records = {};
  for (const method of ['settings.get', 'workspace.get', 'pages.list', 'runs.list']) records[method] = await owned(() => t.rpc(method));
  const inventory = async () => {
    const windows = (await owned(() => ax.windows())).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
    assert.equal(windows.length, 1, 'Only the original normal window may own MCP captures');
    const window = windows[0]; assert.ok(Number.isInteger(window.id) && window.id > 0);
    assert.ok(Number.isFinite(window.width) && window.width >= 720 && window.width <= 900, 'Actual MCP window must be within the explicit narrow preparation target');
    return window;
  };
  const originalWindow = await inventory();
  const approvedServer = structuredClone(servers().find(row => row.serverId === server.serverId));
  assert.equal(approvedServer?.state, 'approved');
  assert.equal(approvedServer.workspaceId, space.workspaceId);
  const originalGrants = structuredClone(grants());
  assert.equal(originalGrants.length, 1); assert.equal(originalGrants[0].toolName, 'greet'); assert.ok(originalGrants[0].revokedAt);
  let grant, started = false, primary; const debts = [];
  const unchanged = async () => {
    for (const [method, record] of Object.entries(records)) assert.deepEqual(await owned(() => t.rpc(method)), record);
    assert.deepEqual(await inventory(), originalWindow, 'Original native window/frame changed');
    assert.deepEqual(servers().find(row => row.serverId === server.serverId), approvedServer, 'Original approved source changed');
    for (const original of originalGrants) assert.deepEqual(grants().find(row => row.grantId === original.grantId), original);
  };
  const text = value => owned(() => ax.waitFor(shell(value, 'AXStaticText')));
  const capture = async (name, state) => { await unchanged(); await owned(() => captureHomeState(t, name, state)); await unchanged(); };
  try {
    started = true;
    await owned(() => choose('MCP tool', appearanceToolName));
    await owned(() => choose('MCP tool scope', 'This entire Space'));
    await owned(() => choose('MCP grant duration', 'Until revoked'));
    await owned(() => press(t, shell('Review tool grant', 'AXButton')));
    await owned(() => ax.waitFor(shell('Confirm this tool grant')));
    for (const value of [sourceDigest, appearanceToolName, `Every task in ${space.name}`, space.workspaceId, 'Until revoked']) await text(value);
    assert.deepEqual(grants(), originalGrants, 'Review must not create a grant');
    await capture('outbound-narrow-long-tool-review', 'outbound-narrow-long-tool-ungranted-review');
    await owned(() => press(t, shell('Approve tool grant', 'AXButton')));
    grant = await owned(() => t.until('original long tool grant', () => grants().find(row => row.toolName === appearanceToolName && !row.revokedAt)));
    assert.equal(grant.serverId, server.serverId); assert.equal(grants().length, originalGrants.length + 1);
    await text(appearanceToolName);
    await owned(() => ax.focus(shell('Revoke tool', 'AXButton')));
    const focused = await owned(() => ax.query(shell('Revoke tool', 'AXButton')));
    assert.equal(focused.length, 1); assert.equal(focused[0].focused, true);
    await capture('outbound-narrow-long-tool-revoke-focused', 'outbound-narrow-long-tool-active-revoke-focused');
    await owned(() => ax.hover(shell('Call tool…', 'AXButton')));
    await capture('outbound-narrow-long-tool-call-hovered', 'outbound-narrow-long-tool-active-call-hovered');
  } catch (error) { primary = error; }
  finally {
    if (started) try {
      stable();
      assert.deepEqual(await inventory(), originalWindow, 'Original cleanup window/frame changed');
      assert.deepEqual(servers().find(row => row.serverId === server.serverId), approvedServer);
      assert.equal(grants().filter(row => !row.revokedAt && row.toolName !== appearanceToolName).length, 0, 'Foreign active grant makes the native revoke control ambiguous');
      const active = grants().filter(row => row.toolName === appearanceToolName && !row.revokedAt);
      assert.ok(active.length <= 1, 'Ambiguous original long grant cannot be revoked by a borrowed control');
      if (active.length) {
        assert.equal(active[0].serverId, server.serverId);
        assert.equal((await owned(() => ax.query(shell('Revoke tool', 'AXButton')))).length, 1, 'Original revoke control must be unique');
        await owned(() => press(t, shell('Revoke tool', 'AXButton')));
        await owned(() => t.until('original long grant retired', () => grants().find(row => row.grantId === active[0].grantId && row.revokedAt)));
      } else await owned(() => ax.key('escape', 'hid'));
      assert.equal(grants().filter(row => !row.revokedAt).length, 0);
      await unchanged();
    } catch (error) { debts.push(error); }
  }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'MCP appearance preparation or original grant retirement unresolved');
  if (primary) throw primary;
  return { status: 'observed-original-narrow-long-tool', grantId: grant.grantId, retainedRevokedGrant: grants().find(row => row.grantId === grant.grantId) };
}
