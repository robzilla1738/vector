import assert from 'node:assert/strict';
import test from 'node:test';
import {create} from './tools/toolsets.mjs';

const registered = [];
const tools = {registerDirectFixedTool: (context, tool) => (registered.push(tool.name), tool), getAgentToolName: (server, name) => `mcp__${server}__${name}`, isReadOnlySubagent: () => false,
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
