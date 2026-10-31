import assert from 'node:assert/strict';
import test from 'node:test';
import {create} from './tools/toolsets.mjs';

const registered = [];
const tools = {registerDirectFixedTool: (context, tool) => (registered.push(tool.name), tool), getAgentToolName: (server, name) => `mcp__${server}__${name}`, isReadOnlySubagent: () => false, isHeadlessSessionTrigger: trigger => trigger === 'routine',
  mcpResultToAgentContent: async result => result.content, McpConnectionError: class {}, UnauthorizedError: class {}, McpError: class {}, ErrorCode: {}};
const {createMcpAgentTools} = create({typebox: {Unsafe: schema => schema}, tools});
const listed = [{serverName: 'srv', tool: {name: 'read', inputSchema: {type: 'object'}, annotations: {readOnlyHint: true}}}, {serverName: 'srv', tool: {name: 'send', inputSchema: {type: 'object'}}}];
const manager = {callTool: async (server, name) => ({content: [{type: 'text', text: name}]})};

test('MCP tools register with their session, so the dispatcher runs them', async () => {
  const offered = createMcpAgentTools(manager, listed, {session: {permissionMode: 'guard'}});
  assert.deepEqual(registered.splice(0), ['mcp__srv__read', 'mcp__srv__send']);
  assert.equal((await offered[1].execute('id', {})).isError, false);
});

test('a read-only chat is offered only read-only MCP tools, and a mode change stops the rest', async () => {
  assert.deepEqual(createMcpAgentTools(manager, listed, {session: {permissionMode: 'read-only'}}).map(tool => tool.name), ['mcp__srv__read']);
  const session = {permissionMode: 'guard'}, [, send] = createMcpAgentTools(manager, listed, {session});
  session.permissionMode = 'read-only';
  const refused = await send.execute('id', {});
  assert.equal(refused.isError, true);
  assert.match(refused.content[0].text, /read-only/);
});

test('Ask first asks before an MCP tool that can act; read-only tools and routines go straight on', async () => {
  const asked = [], suspend = async (kind, id, request) => { asked.push(request.scope.tool); return {verdict: 'deny'}; };
  const [read, send] = createMcpAgentTools(manager, listed, {suspend, session: {permissionMode: 'guard', runtimeConfig: {finalConfirm: true}}});
  assert.equal((await read.execute('id', {})).isError, false);
  assert.equal((await send.execute('id', {})).isError, true);
  assert.deepEqual(asked, ['mcp__srv__send']);
  const [, routine] = createMcpAgentTools(manager, listed, {suspend, session: {permissionMode: 'guard', trigger: 'routine', runtimeConfig: {finalConfirm: true}}});
  assert.equal((await routine.execute('id', {})).isError, false);
});
