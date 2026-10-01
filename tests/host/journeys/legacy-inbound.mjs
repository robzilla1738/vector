import { realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTabLayout } from '../lib/tab-layout.mjs';
import { shell, settings, press, loadedPage } from '../fixtures/legacy-ui.mjs';

export const journey = { id: 'inbound-agents', title: 'Issue and revoke a disposable scoped connection through Settings and packaged MCP', features: ['inboundAgents'], devAcceptance: ['inboundAgents', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 120000, owner: 'LJ' };
export async function run(t) {
  let workspace;
  let other;
  await t.step('create native Spaces and a saved task through the normal UI', { kind: 'ui', features: ['inboundAgents'] }, async () => {
    await loadedPage(t, '/red');
    await setTabLayout(t, 'vertical', { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 });
    const spaceMenu = { role: 'AXPopUpButton', name: '^(Personal|Disposable agent connection journey|Excluded connection workspace)$', match: 'regex', scope: 'shell', index: 0 };
    const create = async name => {
      await press(t, spaceMenu);
      await press(t, shell('New space', 'AXMenuItem'));
      const input = { role: 'AXTextField', scope: 'shell', index: 0 };
      await t.ax.waitFor(input);
      t.assert.equal((await t.ax.query(input))[0].placeholder, 'Name');
      await t.ax.type(name, input);
      await press(t, shell('Create', 'AXButton'));
      await t.ax.waitFor(shell('New space'), 'absent');
      return t.until('native Space and runtime workspace agree', async () => (await t.rpc('workspaces.list')).find(item => item.name === name));
    };
    workspace = await create('Disposable agent connection journey');
    other = await create('Excluded connection workspace');
    await press(t, spaceMenu);
    await press(t, shell(workspace.name, 'AXMenuItem'));
    await press(t, shell('More', 'AXPopUpButton'));
    await press(t, shell('Tasks', 'AXMenuItem'));
    await press(t, shell('New task', 'AXButton'));
    await t.ax.waitFor(shell('Title', 'AXTextField'));
    await t.ax.type('Disposable scoped connection task', shell('Title', 'AXTextField'));
    await t.ax.type('Verify only disposable connection scope.', shell('Objective', 'AXTextArea'));
    await t.ax.type('The connection cannot observe another Space.', shell('What must be true when this is done?', 'AXTextArea'));
    await press(t, shell('Save task', 'AXButton'));
    const task = await t.until('saved native task belongs to selected Space', async () => (await t.rpc('tasks.list', { workspaceId: workspace.workspaceId })).find(item => item.title === 'Disposable scoped connection task'));
    t.assert.equal(task.workspaceId, workspace.workspaceId);
    t.assert.equal(task.state, 'open');
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('inbound-task-prerequisite');
    await press(t, shell('Close tasks', 'AXButton'));
    return { ax, rpc: { workspace, excluded: other, task } };
  });
  const require = createRequire(resolve(import.meta.dirname, '../../../apps/runtime/package.json'));
  const { Client } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/client')).href);
  const { StdioClientTransport } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/client/stdio')).href);
  const client = new Client({ name: 'aux-native-journey', version: '0.1.0' });
  let created;
  try {
    await t.step('create the scoped native connection and prove packaged MCP cannot see another workspace', { kind: 'ui', features: ['inboundAgents'] }, async () => {
      await settings(t, 'Developers & External Agents');
      await t.ax.type('LJ disposable scoped connection', shell('Connection name', 'AXTextField'));
      await press(t, shell('Connection workspace', 'AXPopUpButton'));
      await press(t, { name: workspace.name, role: 'AXMenuItem', match: 'exact', scope: 'window', index: 0 });
      await press(t, shell('Connection scope', 'AXPopUpButton'));
      await press(t, { name: 'All tasks in workspace', role: 'AXMenuItem', match: 'exact', scope: 'window', index: 0 });
      await press(t, shell('Create scoped connection', 'AXButton'));
      created = await t.until('native scoped connection created', async () => (await t.rpc('agentConnections.list')).find(connection => connection.name === 'LJ disposable scoped connection'));
      t.assert.deepEqual(created.scope, { kind: 'workspace', workspaceId: workspace.workspaceId });
      t.assert.equal(created.client, 'codex');
      const configField = shell('Agent configuration', 'AXTextArea');
      await t.ax.waitFor(configField);
      const field = await t.ax.query(configField);
      const config = field.flatMap(record => record.names).find(text => text.includes('[mcp_servers.aux-browser]'));
      t.assert.ok(config, 'Freshly issued disposable configuration must be present');
      const read = key => JSON.parse(config.match(new RegExp(`^${key} = (.+)$`, 'm'))?.[1] ?? 'null');
      const command = read('command');
      const args = read('args');
      const token = read('AUX_MCP_TOKEN');
      const dataDir = read('AUX_DATA_DIR');
      t.assert.match(command, /\/Aux\.app\/Contents\/Helpers\/Aux Runtime$/);
      t.assert.deepEqual(args, [join(dirname(dirname(command)), 'Resources/aux-runtime/dist/mcp.js')]);
      t.assert.match(token, /^auxc_[A-Za-z0-9_-]{40,80}$/);
      t.assert.equal(realpathSync(dataDir), realpathSync(join(t.app.userDataDir, 'Default/Aux Runtime Data')));
      const db = new DatabaseSync(join(dataDir, 'aux-state.sqlite'), { readOnly: true });
      try { t.assert.equal(db.prepare('SELECT token_hash FROM agent_connections WHERE connection_id=?').get(created.connectionId).token_hash, createHash('sha256').update(token).digest('hex')); }
      finally { db.close(); }
      const transport = new StdioClientTransport({ command, args, env: { PATH: process.env.PATH, AUX_DATA_DIR: dataDir, AUX_MCP_TOKEN: token, AUX_MCP_SCOPE_KIND: 'workspace' }, stderr: 'pipe' });
      await client.connect(transport);
      const tools = await client.listTools();
      t.assert.ok(tools.tools.some(tool => tool.name === 'aux_workspaces_list'));
      const result = await client.callTool({ name: 'aux_workspaces_list', arguments: {} });
      t.assert.match(JSON.stringify(result), new RegExp(workspace.workspaceId));
      t.assert.doesNotMatch(JSON.stringify(result), new RegExp(other.workspaceId));
      const ax = await t.ax.dump({ scope: 'shell' });
      await t.capture('inbound-connection-scoped');
      return { ax, rpc: { connection: created, mcp: result } };
    });
    await t.step('revoke the native connection and prove the same packaged MCP loses access', { kind: 'ui', features: ['inboundAgents'] }, async () => {
      await press(t, shell('Revoke', 'AXButton'));
      const rpc = await t.until('native connection revoked', async () => (await t.rpc('agentConnections.list')).find(connection => connection.connectionId === created.connectionId && connection.revokedAt));
      const result = await client.callTool({ name: 'aux_workspaces_list', arguments: {} });
      t.assert.match(JSON.stringify(result), /permission_denied|no longer authorized/i);
      await t.ax.waitFor({ ...shell('Connection revoked.'), match: 'contains' });
      const ax = await t.ax.dump({ scope: 'shell' });
      await t.capture('inbound-connection-revoked');
      return { ax, rpc: { connection: rpc, deniedMcp: result } };
    });
  } finally { await client.close(); }
}
