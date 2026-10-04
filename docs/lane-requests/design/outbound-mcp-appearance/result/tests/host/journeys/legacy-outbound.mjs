import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { shell, settings, press } from '../fixtures/legacy-ui.mjs';
import { captureOutboundMcpAppearance } from '../lib/outbound-mcp-appearance.mjs';

export const journey = { id: 'outbound-mcp', title: 'Review a disposable local MCP source and grant, call and revoke one tool through Settings', features: ['outboundMcp'], devAcceptance: ['outboundMcp', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 120000, owner: 'LJ' };
export async function run(t) {
  const directory = join(t.app.userDataDir, 'outbound-mcp-fixture');
  mkdirSync(directory);
  const script = join(directory, 'server.mjs');
  writeFileSync(script, readFileSync(new URL(t.appearanceEnabled && t.narrowEnabled ? '../fixtures/outbound-mcp-appearance-server.mjs' : '../fixtures/outbound-mcp-server.mjs', import.meta.url)));
  const space = (await t.rpc('workspaces.list')).find(item => item.name === 'Personal');
  t.assert.ok(space);
  const read = query => {
    const db = new DatabaseSync(join(t.app.userDataDir, 'Default/Aux Runtime Data/aux-state.sqlite'), { readOnly: true });
    try { return query(db); } finally { db.close(); }
  };
  const servers = () => read(db => db.prepare('SELECT server_id AS serverId,workspace_id AS workspaceId,state FROM outbound_mcp_servers WHERE workspace_id=?').all(space.workspaceId));
  const grants = () => read(db => db.prepare('SELECT grant_id AS grantId,server_id AS serverId,tool_name AS toolName,revoked_at AS revokedAt FROM outbound_mcp_grants WHERE server_id=?').all(server.serverId));
  const source = { kind: 'local', command: realpathSync(process.execPath), args: [script], cwd: realpathSync(directory) };
  const sourceDigest = createHash('sha256').update(JSON.stringify(source)).digest('hex');
  const text = value => t.ax.waitFor(shell(value, 'AXStaticText'));
  const choose = async (label, name) => {
    await press(t, shell(label, 'AXPopUpButton'));
    await press(t, { name, role: 'AXMenuItem', match: 'exact', scope: 'window', index: 0 });
  };
  let server;
  let grant;
  await t.step('register the exact local source as pending before native review', { kind: 'ui', features: ['outboundMcp'] }, async () => {
    await settings(t, 'MCP & Connectors');
    await choose('MCP Space', 'Personal');
    await choose('MCP source type', 'Local command');
    await t.ax.type('Settings journey', shell('Server name', 'AXTextField'));
    await t.ax.type(process.execPath, shell('Executable path', 'AXTextField'));
    await t.ax.type(realpathSync(directory), shell('Working directory', 'AXTextField'));
    await t.ax.type(script, shell('Arguments, one per line', 'AXTextArea'));
    await press(t, shell('Save server for review', 'AXButton'));
    server = await t.until('native MCP registration', async () => servers()[0]);
    t.assert.equal(servers().length, 1, 'The fresh Space must contain exactly the UI-created server');
    t.assert.equal(server.state, 'pending');
    t.assert.equal(server.workspaceId, space.workspaceId);
    for (const value of ['Settings journey · pending', source.command, script, source.cwd, sourceDigest]) await text(value);
    t.assert.equal(read(db => db.prepare('SELECT COUNT(*) AS n FROM outbound_mcp_grants WHERE server_id=?').get(server.serverId).n), 0);
    await t.ax.waitFor(shell('Approve this server source', 'AXButton'));
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('outbound-source-review');
    return { ax, rpc: server };
  });
  await t.step('approve source, review only greet and grant it to the disposable Space', { kind: 'ui', features: ['outboundMcp'] }, async () => {
    await press(t, shell('Approve this server source', 'AXButton'));
    await text('Settings journey · approved');
    await t.until('source approved', async () => servers().find(item => item.serverId === server.serverId && item.state === 'approved'));
    await press(t, shell('Load available tools', 'AXButton'));
    await choose('MCP tool', 'greet');
    await choose('MCP tool scope', 'This entire Space');
    await choose('MCP grant duration', 'Until revoked');
    await press(t, shell('Review tool grant', 'AXButton'));
    await t.ax.waitFor(shell('Confirm this tool grant'));
    t.assert.equal(grants().length, 0, 'Review cannot create the grant');
    for (const value of [sourceDigest, 'greet', 'Every task in Personal', space.workspaceId, 'Until revoked']) await text(value);
    await t.capture('outbound-grant-review');
    await press(t, shell('Approve tool grant', 'AXButton'));
    grant = await t.until('native greet grant', async () => grants().find(item => item.toolName === 'greet'));
    t.assert.equal(grants().length, 1, 'Only the reviewed greet grant may exist');
    await t.ax.waitFor({ ...shell('Every task in Personal · until revoked · 2,000 output tokens · active', 'AXStaticText'), match: 'exact' });
    const ax = await t.ax.dump({ scope: 'shell' });
    return { ax, rpc: grant };
  });
  await t.step('call the granted tool through Settings and revoke its access', { kind: 'ui', features: ['outboundMcp'] }, async () => {
    await press(t, shell('Call tool…', 'AXButton'));
    await t.ax.type('{"name":"Aux"}', shell('MCP tool arguments', 'AXTextArea'));
    await press(t, shell('Run approved tool', 'AXButton'));
    await t.ax.waitFor({ ...shell('Hello, Aux'), match: 'contains' });
    const completed = await t.until('native completed MCP call', () => read(db => db.prepare("SELECT status FROM outbound_mcp_calls WHERE grant_id=? AND status='completed' LIMIT 1").get(grant.grantId)));
    await t.capture('outbound-tool-called');
    await press(t, shell('Revoke tool', 'AXButton'));
    const revoked = await t.until('native tool grant revoked', async () => grants().find(item => item.grantId === grant.grantId && item.revokedAt));
    await t.ax.waitFor(shell('Tool grant revoked.'));
    await t.ax.waitFor(shell('Call tool…', 'AXButton'), 'absent');
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('outbound-tool-revoked');
    return { ax, rpc: { completed, grant: revoked } };
  });
  if (t.appearanceEnabled && t.narrowEnabled) await t.step('observe the explicitly reviewed long MCP tool in the original narrow window', { kind: 'ui', features: ['outboundMcp'] }, async () => {
    const rpc = await captureOutboundMcpAppearance(t, { choose, grants, servers, server, sourceDigest, space });
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc };
  });
}
