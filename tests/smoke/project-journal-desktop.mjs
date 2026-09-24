// Exercise the task-scoped project journal through a real Aux native approval.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { closeAux, launchApp, shellWindow } from './launch.mjs';

const root = resolve(import.meta.dirname, '../..');
const mcpRequire = createRequire(join(root, 'packages/mcp/package.json'));
const { Client } = mcpRequire('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = mcpRequire('@modelcontextprotocol/sdk/client/stdio.js');
const temporary = mkdtempSync(join(tmpdir(), 'aux-project-journal-'));
const repository = join(temporary, 'source');
mkdirSync(repository);
const git = (...args) => execFileSync('/usr/bin/git', ['-C', repository, ...args], {
  encoding: 'utf8', env: { PATH: '/usr/bin:/bin', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' },
}).trim();
git('init', '-q');
git('config', 'user.name', 'Fixture');
git('config', 'user.email', 'fixture@example.test');
writeFileSync(join(repository, 'app.txt'), 'before\n');
git('add', '.');
git('commit', '-qm', 'Fixture');

let app;
let client;
try {
  app = await launchApp({ args: ['--use-mock-keychain'], env: {
    PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary,
    AUX_PROFILE_DIR: join(temporary, 'profile'), AUX_DATA_DIR: join(temporary, 'data'), AUX_LOAD_DOTENV: '0',
  } });
  const page = await shellWindow(app);
  await page.locator('.app').waitFor();
  await app.evaluate(({ dialog }, path) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [path] });
    dialog.showMessageBox = async (_window, options) => {
      if (!options.detail.includes('Revision 1') || !options.detail.includes('after'))
        throw new Error('Project approval omitted the task revision or proposed content');
      return { response: 1, checkboxChecked: false };
    };
  }, repository);
  const setup = await page.evaluate(async () => {
    const selection = await window.aux.selectRepository();
    if (!selection) throw new Error('Repository selection failed');
    const project = await window.aux.createProject(selection.selectionId);
    const space = await window.aux.invoke('workspaces.create', { name: 'Journal fixture' });
    const task = await window.aux.invoke('tasks.create', {
      workspaceId: space.workspaceId, title: 'Edit fixture', objective: 'Change app.txt once.',
      criteria: [{ criterionId: 'changed', description: 'File changed', verification: 'manual' }],
      resources: [{ resourceId: 'checkout', kind: 'repository', projectId: project.projectId,
        locator: project.path, label: 'Fixture checkout' }],
    });
    const config = await window.aux.agentConfig({ name: 'Project journal smoke', client: 'codex',
      scope: { kind: 'task', workspaceId: space.workspaceId, taskId: task.taskId } });
    return { project, task, config };
  });
  client = new Client({ name: 'aux-project-journal-smoke', version: '1.0.0' });
  await client.connect(new StdioClientTransport({ command: setup.config.command, args: setup.config.args,
    env: { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, ...setup.config.env }, stderr: 'pipe' }));
  const call = async (name, args) => {
    const response = await client.callTool({ name, arguments: args });
    assert.ok(!response.isError, `${name}: ${JSON.stringify(response)}`);
    return JSON.parse(response.content.find(item => item.type === 'text').text);
  };
  const scope = { taskId: setup.task.taskId, expectedRevision: setup.task.revision,
    projectId: setup.project.projectId };
  const prior = await call('aux_development_read_file', { ...scope, name: 'app.txt' });
  const saved = await call('aux_development_write_file', { ...scope, name: 'app.txt',
    expectedHash: prior.sha256, content: 'after\n' });
  assert.equal(saved.content, 'after\n');
  assert.equal(readFileSync(join(setup.project.path, 'app.txt'), 'utf8'), 'after\n');
  assert.equal(readFileSync(join(repository, 'app.txt'), 'utf8'), 'before\n');
  const receipt = await call('aux_task_receipt', { taskId: setup.task.taskId });
  assert.deepEqual(receipt.unresolvedOperations, []);
  const db = new DatabaseSync(join(temporary, 'data', 'aux-state.sqlite'), { readOnly: true });
  try {
    const invocation = db.prepare(`SELECT i.status, i.effect_outcome AS outcome, i.inputs
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id
      WHERE o.site_key='aux.project' AND o.name='file.write'`).get();
    assert.equal(invocation?.status, 'completed');
    assert.equal(invocation?.outcome, 'observed');
    assert.equal(JSON.parse(invocation.inputs).taskId, setup.task.taskId);
    assert.ok(!invocation.inputs.includes('after\n'), 'Journal must not contain file content');
  } finally { db.close(); }
  console.log('Native task-scoped project approval, isolated file write, and observed receipt passed.');
} finally {
  await client?.close().catch(() => {});
  if (app) await closeAux(app).catch(() => {});
  rmSync(temporary, { recursive: true, force: true });
}
