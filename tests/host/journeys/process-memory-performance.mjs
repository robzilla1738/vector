import { createRpc } from '../lib/rpc.mjs';
import { configureModel } from '../lib/l10-trust-fixtures.mjs';
import { fixturePage } from '../lib/fixture.mjs';
import { shell, settings, press, loadedPage } from '../fixtures/legacy-ui.mjs';

export const journey = {
  id: 'process-memory-performance', title: 'Twenty original AC kernel samples with ten human tabs and five executing VMs',
  features: ['inboundAgents'], devAcceptance: ['inboundAgents', 'spaces'],
  needs: ['accessibility', 'screen-recording'], model: 'loopback',
  launch: ({ appearance }) => ({ args: ['--aux-native-performance-observer'], env: { AUX_RUN_ENGINE: 'agent-loop' }, perf: !appearance }),
  timeoutMs: 600_000, owner: 'root',
};

export async function run(t) {
  t.assert.equal(t.appearanceEnabled, false, 'Kernel budgets require a separate performance run');
  await configureModel(t);
  const pages = [];
  let workspace, task, connection, scopedRpc, parent, parentHold, failure;
  const title = 'Disposable native memory task';
  const taskDetails = () => t.rpc('tasks.get', { taskId: task.taskId });
  try {
    await t.step('retain ten genuine human fixture tabs and measure twenty idle AC samples', { kind: 'rpc', features: ['inboundAgents'] }, async () => {
      for (let index = 0; index < 10; index++) {
        const path = `/memory/human-${index + 1}`;
        t.fixture.route(path, fixturePage(`Aux memory source ${index + 1}`, '<p>Disposable memory workload source.</p>'));
        pages.push(await loadedPage(t, path));
      }
      const report = await t.measureProcessMemory({ mode: 'idle', idlePageIds: pages.map(page => page.pageId) });
      return { ax: await t.ax.dump(), rpc: { performance: report } };
    });
    await t.step('approve five actual task resources through desktop controls', { kind: 'ui', features: ['inboundAgents'] }, async () => {
      await press(t, shell('Personal', 'AXPopUpButton'));
      await press(t, shell('New space', 'AXMenuItem'));
      const name = { role: 'AXTextField', scope: 'shell', index: 0 };
      await t.ax.waitFor(name); t.assert.equal((await t.ax.query(name))[0].placeholder, 'Name');
      await t.ax.type('Disposable memory workspace', name); await press(t, shell('Create', 'AXButton'));
      workspace = await t.until('new native workspace exists', async () => (await t.rpc('workspaces.list')).find(item => item.name === 'Disposable memory workspace'));
      await press(t, shell('More', 'AXPopUpButton')); await press(t, shell('Tasks', 'AXMenuItem'));
      await press(t, shell('New task', 'AXButton'));
      await t.ax.type(title, shell('Title', 'AXTextField'));
      await t.ax.type('Hold the disposable parent while five isolated read-only memory workloads execute.', shell('Objective', 'AXTextArea'));
      await t.ax.type('Only the five person-approved fixture resources may be copied.', shell('What must be true when this is done?', 'AXTextArea'));
      await press(t, shell('Save task', 'AXButton'));
      task = await t.until('saved native source task exists', async () => (await t.rpc('tasks.list', { workspaceId: workspace.workspaceId })).find(item => item.title === title));
      for (const page of pages.slice(0, 5)) {
        await t.rpc('pages.activate', { pageId: page.pageId });
        await press(t, shell('Attach current tab', 'AXButton'));
        const resource = await t.until('current human tab attached to saved revision', async () => (await taskDetails()).task.resources.find(item => item.kind === 'page' && item.locator === page.pageId));
        await press(t, shell(`${resource.label} access`, 'AXPopUpButton'));
        await press(t, { role: 'AXMenuItem', name: 'Read', match: 'exact', scope: 'window', index: 0 });
        await t.until('desktop read grant persisted', async () => (await taskDetails()).task.resources.some(item => item.resourceId === resource.resourceId && item.access === 'read'));
      }
      task = (await taskDetails()).task;
      t.assert.equal(task.resources.length, 5);
      t.assert.ok(task.resources.every(resource => resource.access === 'read'));
      const ax = await t.ax.dump(); await t.capture('memory-person-approved-resources');
      await press(t, shell('Close tasks', 'AXButton'));
      return { ax, rpc: { task } };
    });
    await t.step('issue a fresh disposable workspace connection through Settings', { kind: 'ui', features: ['inboundAgents'] }, async () => {
      await settings(t, 'Developers & External Agents');
      await t.ax.type('Disposable native memory connection', shell('Connection name', 'AXTextField'));
      await press(t, shell('Connection workspace', 'AXPopUpButton'));
      await press(t, { role: 'AXMenuItem', name: workspace.name, match: 'exact', scope: 'window', index: 0 });
      await press(t, shell('Connection scope', 'AXPopUpButton'));
      await press(t, { role: 'AXMenuItem', name: 'All tasks in workspace', match: 'exact', scope: 'window', index: 0 });
      await press(t, shell('Create scoped connection', 'AXButton'));
      connection = await t.until('new UI-issued connection exists', async () => (await t.rpc('agentConnections.list')).find(item => item.name === 'Disposable native memory connection'));
      t.assert.deepEqual(connection.scope, { kind: 'workspace', workspaceId: workspace.workspaceId });
      const configField = shell('Agent configuration', 'AXTextArea'); await t.ax.waitFor(configField);
      const config = (await t.ax.query(configField)).flatMap(record => record.names).find(value => value.includes('[mcp_servers.aux-browser]'));
      t.assert.ok(config, 'Only the newly issued disposable configuration is used');
      const token = JSON.parse(config.match(/^AUX_MCP_TOKEN = (.+)$/m)?.[1] ?? 'null');
      t.assert.match(token, /^auxc_[A-Za-z0-9_-]{40,80}$/);
      scopedRpc = createRpc(async () => ({ ...await t.app.descriptor(), token }));
      const ax = await t.ax.dump(); await t.capture('memory-disposable-scoped-connection');
      await t.ax.key('escape', 'hid');
      return { ax, rpc: { connection } };
    });
    await t.step('sample twenty AC trials while five genuine bounded VM cells execute', { kind: 'rpc', features: ['inboundAgents'] }, async () => {
      t.model.respond(payload => {
        if (!payload.tools?.length) return { content: 'Disposable memory task' };
        t.assert.equal(parentHold, undefined, 'Only one real parent model request may be held');
        parentHold = t.model.holdText('Disposable parent waiting.', ' Parent released.');
        return parentHold.response;
      });
      parent = await scopedRpc('tasks.start', { taskId: task.taskId, expectedRevision: task.revision,
        pageIds: pages.slice(0, 5).map(page => page.pageId), maxTokens: 250000, maxCostUsd: 5, deadlineMs: 180000 });
      await t.until('actual parent reaches held provider response', () => Boolean(parentHold) && t.model.pendingHolds === 1);
      const startedRunId = parent.runId;
      parent = (await scopedRpc('runs.get', { runId: startedRunId })).run;
      t.assert.equal(parent.runId, startedRunId);
      const workload = await t.startSubagentMemoryWorkload({ scopedRpc, parent, parentHold, idlePageIds: pages.map(page => page.pageId) });
      try {
        // Provider setup only. Every trial independently requires fresh native
        // executing-cell evidence and original kernel brackets.
        await t.until('all five real REPL requests reached provider holds', () => t.model.pendingHolds === 5, 30_000);
      } catch (error) {
        try { await workload.cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'VM setup and cleanup failed'); }
        throw error;
      }
      const report = await t.measureProcessMemory({ mode: 'executing', workload, idlePageIds: pages.map(page => page.pageId) });
      return { ax: await t.ax.dump(), rpc: { performance: report, parentRunId: parent.runId } };
    });
  } catch (error) { failure = error; }
  {
    const cleanup = [];
    parentHold?.cancel();
    if (parent) cleanup.push(scopedRpc('runs.cancel', { runId: parent.runId }));
    if (connection) cleanup.push(t.rpc('agentConnections.revoke', { connectionId: connection.connectionId }));
    const results = await Promise.allSettled(cleanup);
    const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
    if (errors.length) throw new AggregateError([failure, ...errors].filter(Boolean), 'Disposable parent/connection cleanup failed');
  }
  if (failure) throw failure;
}
