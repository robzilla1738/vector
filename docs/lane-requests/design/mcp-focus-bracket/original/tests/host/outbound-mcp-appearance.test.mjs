import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { OutboundMcpGrantSchema, OutboundMcpToolSchema } from '@aux/contracts';
import { captureOutboundMcpAppearance, appearanceToolName } from './lib/outbound-mcp-appearance.mjs';

function fixture() {
  const grants = [{ grantId: 'greet-original', serverId: 'server-original', toolName: 'greet', revokedAt: 1 }];
  const server = { serverId: 'server-original', workspaceId: 'workspace-original', state: 'approved' };
  const captures = [], effects = [];
  const records = { 'settings.get': { original: true }, 'workspace.get': { workspaceId: 'workspace-original' }, 'pages.list': [], 'runs.list': [] };
  let focused = false;
  const t = { appearanceEnabled: true, narrowEnabled: true, app: { pid: 913 }, rpc: async method => structuredClone(records[method]), until: async (_label, read) => { const result = await read(); assert.ok(result); return result; }, capture: async (name, options) => { captures.push({ name, options }); } };
  t.ax = { pid: 913, windows: async () => [{ id: 12, layer: 0, width: 800, height: 700 }], waitFor: async () => {}, query: async () => [{ focused }], focus: async () => { focused = true; }, hover: async selector => { effects.push(selector.name); }, key: async chord => { effects.push(chord); }, press: async selector => {
    effects.push(selector.name);
    if (selector.name === 'Approve tool grant') grants.push({ grantId: 'long-original', serverId: server.serverId, toolName: appearanceToolName, revokedAt: null });
    if (selector.name === 'Revoke tool') grants.find(row => row.grantId === 'long-original').revokedAt = 2;
  } };
  const args = { choose: async (label, name) => { effects.push([label, name]); }, grants: () => structuredClone(grants), servers: () => [structuredClone(server)], server, sourceDigest: 'd'.repeat(64), space: { workspaceId: server.workspaceId, name: 'Personal' } };
  return { t, args, captures, effects, grants, records, server };
}
test('ordinary and non-narrow appearance perform no additional actions', async () => {
  assert.deepEqual(await captureOutboundMcpAppearance({ appearanceEnabled: false }), { status: 'not-requested' });
  assert.deepEqual(await captureOutboundMcpAppearance({ appearanceEnabled: true, narrowEnabled: false }), { status: 'not-requested' });
});
test('real review precedes consent; three original-window captures require exact grant and retire it', async () => {
  const { t, args, captures, effects, grants } = fixture();
  const result = await captureOutboundMcpAppearance(t, args);
  assert.equal(result.grantId, 'long-original'); assert.equal(grants[1].revokedAt, 2);
  assert.deepEqual(captures.map(row => row.options.windowId), [12, 12, 12]);
  assert.deepEqual(captures.map(row => row.options.state), ['outbound-narrow-long-tool-ungranted-review', 'outbound-narrow-long-tool-active-revoke-focused', 'outbound-narrow-long-tool-active-call-hovered']);
  assert.equal(effects.filter(item => item === 'Approve tool grant').length, 1);
  assert.equal(effects.filter(item => item === 'Revoke tool').length, 1);
  assert.ok(!effects.includes('Run approved tool'));
});
test('out-of-range/ambiguous frames and foreign approved source refuse before any input', async () => {
  for (const kind of ['wide', 'ambiguous', 'source']) {
    const { t, args, effects, server } = fixture();
    if (kind === 'wide') t.ax.windows = async () => [{ id: 12, layer: 0, width: 901, height: 700 }];
    if (kind === 'ambiguous') t.ax.windows = async () => [{ id: 12, layer: 0, width: 800, height: 700 }, { id: 13, layer: 0, width: 800, height: 700 }];
    if (kind === 'source') server.state = 'revoked';
    await assert.rejects(captureOutboundMcpAppearance(t, args)); assert.deepEqual(effects, []);
  }
});
test('focused readiness and postcapture state/window/owner drift retain failure and cleanup debt', async () => {
  for (const kind of ['focus', 'settings', 'window', 'owner', 'revoke']) {
    const { t, args, grants, records } = fixture(); const originalCapture = t.capture;
    if (kind === 'focus') t.ax.query = async () => [{ focused: false }];
    else t.capture = async (name, options) => {
      await originalCapture(name, options);
      if (!name.endsWith('revoke-focused')) return;
      if (kind === 'settings') records['settings.get'].original = false;
      if (kind === 'window') t.ax.windows = async () => [{ id: 99, layer: 0, width: 800, height: 700 }];
      if (kind === 'owner') t.app = { pid: 913 };
      if (kind === 'revoke') t.ax.press = async () => { throw new Error('original revoke failure'); };
    };
    await assert.rejects(captureOutboundMcpAppearance(t, args));
    if (kind === 'focus') assert.equal(grants[1].revokedAt, 2);
    if (kind === 'owner' || kind === 'revoke') assert.equal(grants[1].revokedAt, null);
  }
});
test('fixed stdio producer actually returns original greet and schema-bounded long tool catalog', async () => {
  const child = spawn(process.execPath, [new URL('./fixtures/outbound-mcp-appearance-server.mjs', import.meta.url).pathname], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', stderr = ''; child.stdout.on('data', bytes => { output += bytes; }); child.stderr.on('data', bytes => { stderr += bytes; });
  const closed = new Promise((resolve, reject) => { child.once('error', reject); child.once('close', code => resolve(code)); });
  child.stdin.end(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) + '\n');
  assert.equal(await closed, 0); assert.equal(stderr, '');
  const response = JSON.parse(output); assert.deepEqual(response.result.tools.map(tool => tool.name), ['greet', appearanceToolName]);
  for (const tool of response.result.tools) OutboundMcpToolSchema.parse(tool);
  OutboundMcpGrantSchema.parse({ grantId: '22222222-2222-4222-8222-222222222222', serverId: '11111111-1111-4111-8111-111111111111', toolName: appearanceToolName, scope: { kind: 'workspace', workspaceId: 'workspace-original' }, mode: 'standing', outputTokenLimit: 2000, createdAt: 1 });
  assert.equal(appearanceToolName.length, 185); assert.ok(appearanceToolName.length <= 200);
  assert.deepEqual(response.result.tools[1].inputSchema, { type: 'object', properties: { name: { type: 'string' } } });
});

test('appearance fixture adds only the fixed long tool; original functional producer remains exact', () => {
  const original = readFileSync(new URL('./fixtures/outbound-mcp-server.mjs', import.meta.url), 'utf8');
  const variant = readFileSync(new URL('./fixtures/outbound-mcp-appearance-server.mjs', import.meta.url), 'utf8');
  const restored = variant.replace('const longTool = { name: "tool_" + "x".repeat(180), description: "Owned long-name appearance fixture; no external effects", inputSchema: { type: "object", properties: { name: { type: "string" } } } };\n    ', '').replace('}, longTool] }', '}] }');
  assert.equal(restored, original);
});
