import { configureModel, tool } from '../lib/l10-trust-fixtures.mjs';
import { fixturePage } from '../lib/fixture.mjs';
import { shell, press, loadedPage } from '../fixtures/legacy-ui.mjs';

export const journey = {
  id: 'cdp-retirement-performance', title: 'Twenty physical Stop and takeover trials with original final CDP counters',
  features: ['inboundAgents'], needs: ['accessibility', 'screen-recording'], model: 'loopback',
  launch: ({ appearance }) => ({ args: ['--aux-native-performance-observer'], env: { AUX_RUN_ENGINE: 'agent-loop' }, perf: !appearance }),
  timeoutMs: 600_000, owner: 'l10_trust',
};
const dispatchCode = 'for (let m4Dispatch = 0; m4Dispatch < 120; m4Dispatch++) { snapshot(); sleep(50); } submitResult("Disposable read workload ended.");';

export async function run(t) {
  t.assert.equal(t.appearanceEnabled, false, 'Original input timings require the dedicated performance run');
  await configureModel(t);
  t.fixture.route('/m4/source', fixturePage('M4 disposable source', '<button type="button">M4 physical takeover target</button><p>Disposable read-only scope.</p>'));
  const source = await loadedPage(t, '/m4/source');
  let task, workspace, liveRun, preparedTrial, failure;
  const title = 'Disposable M4 read task';
  const openTasks = async () => {
    await press(t, shell('More', 'AXPopUpButton')); await press(t, shell('Tasks', 'AXMenuItem'));
  };
  try {
    await t.step('approve one original task resource through person controls', { kind: 'ui', features: ['inboundAgents'] }, async () => {
      await press(t, shell('Personal', 'AXPopUpButton')); await press(t, shell('New space', 'AXMenuItem'));
      const name = { role: 'AXTextField', scope: 'shell', index: 0 };
      await t.ax.waitFor(name); t.assert.equal((await t.ax.query(name))[0].placeholder, 'Name');
      await t.ax.type('Disposable M4 workspace', name); await press(t, shell('Create', 'AXButton'));
      workspace = await t.until('actual M4 workspace exists', async () => (await t.rpc('workspaces.list')).find(value => value.name === 'Disposable M4 workspace'));
      await openTasks(); await press(t, shell('New task', 'AXButton'));
      await t.ax.type(title, shell('Title', 'AXTextField'));
      await t.ax.type('Read only the attached disposable source while the person stops or takes over.', shell('Objective', 'AXTextArea'));
      await t.ax.type('Never mutate the source or acquire any additional tab.', shell('What must be true when this is done?', 'AXTextArea'));
      await press(t, shell('Save task', 'AXButton'));
      task = await t.until('actual saved M4 task exists', async () => (await t.rpc('tasks.list', { workspaceId: workspace.workspaceId })).find(value => value.title === title));
      await press(t, shell('Attach current tab', 'AXButton'));
      const resource = await t.until('original source resource attached', async () => (await t.rpc('tasks.get', { taskId: task.taskId })).task.resources.find(value => value.locator === source.pageId));
      await press(t, shell(`${resource.label} access`, 'AXPopUpButton'));
      await press(t, { role: 'AXMenuItem', name: 'Read', match: 'exact', scope: 'window', index: 0 });
      task = await t.until('person-approved read revision persisted', async () => {
        const value = (await t.rpc('tasks.get', { taskId: task.taskId })).task;
        return value.resources.length === 1 && value.resources[0].access === 'read' && value;
      });
      await t.capture('m4-person-approved-resource'); await press(t, shell('Close tasks', 'AXButton'));
      return { ax: await t.ax.dump(), rpc: { task } };
    });
    for (const mode of ['stop', 'takeover']) {
      await t.step(`twenty actual AC ${mode} trials`, { kind: 'rpc', features: ['inboundAgents'] }, async () => {
        const report = await t.measureCdpRetirement({ mode,
          prepareTrial: async (index, signal) => {
            signal.throwIfAborted(); t.assert.equal(liveRun, undefined);
            const before = new Set((await t.rpc('runs.list')).map(value => value.runId));
            t.model.respond(payload => !payload.tools?.length ? { content: title }
              : tool('repl', { code: dispatchCode }, `m4-${mode}-${index}`));
            await t.rpc('pages.activate', { pageId: source.pageId });
            await openTasks(); await press(t, shell(title, 'AXButton'));
            await press(t, shell('Run on current tab', 'AXButton'));
            liveRun = await t.until('genuine protected read workload starts', async () => {
              const row = (await t.rpc('runs.list')).find(value => !before.has(value.runId));
              if (!row) return false;
              // Retain the original newly created run even if refresh/setup fails.
              liveRun = row;
              preparedTrial = { runId: row.runId };
              const details = (await t.rpc('runs.get', { runId: row.runId })).run;
              t.assert.notEqual(details.status, 'failed', details.statusMessage);
              return details.status === 'running' && details;
            });
            const copies = (await t.rpc('pages.list')).filter(page => page.agentIsolation?.runId === liveRun.runId);
            if (copies.length === 1) preparedTrial.originalCopy = copies[0];
            t.assert.equal(copies.length, 1); t.assert.equal(copies[0].ownedByRuntime, true);
            t.assert.equal(copies[0].agentIsolation.taskId, task.taskId);
            t.assert.equal(copies[0].agentIsolation.taskRevision, task.revision);
            if (mode === 'takeover') await press(t, shell('Open temporary tab', 'AXButton'));
            return preparedTrial;
          },
          performPhysicalInput: async (owned, mode, signal) => {
            signal.throwIfAborted();
            const selector = mode === 'stop' ? shell('Stop', 'AXButton')
              : { role: 'AXButton', name: 'M4 physical takeover target', match: 'exact', scope: 'page', index: 0 };
            await t.ax.waitFor(selector, 'enabled'); await t.ax.click(selector);
            // This observation is setup/diagnostic only. Original input timing,
            // native retirement, zero dispatch and Worker ACK come from native.
            return { runId: owned.runId, afterClick: (await t.rpc('runs.get', { runId: owned.runId })).run.status };
          },
          cleanupTrial: async owned => {
            // prepareTrial may reject before returning its already-created scope.
            owned ??= preparedTrial;
            if (!owned) return;
            const errors = [];
            try { await t.rpc('runs.cancel', { runId: owned.runId }); } catch (error) { errors.push(error); }
            try {
              const original = (await t.rpc('pages.list')).find(page => page.pageId === owned.originalCopy?.pageId);
              if (original?.controller === 'human' && original.agentIsolation?.isolationId === owned.originalCopy.agentIsolation.isolationId) {
                // Genuine person close after takeover; never agent cleanup scope.
                await t.rpc('pages.activate', { pageId: original.pageId }); await t.ax.key('command+w', 'hid');
                await t.until('original held fixture tab genuinely closed', async () => !(await t.rpc('pages.list')).some(page => page.pageId === original.pageId));
              }
            } catch (error) { errors.push(error); }
            if (errors.length) {
              const debt = new AggregateError(errors, 'Original M4 run/tab cleanup failed');
              debt.ownedTrial = owned;
              throw debt;
            }
            liveRun = undefined;
            preparedTrial = undefined;
          },
        });
        return { ax: await t.ax.dump(), rpc: { performance: report } };
      });
    }
  } catch (error) { failure = error; }
  if (liveRun) {
    try { await t.rpc('runs.cancel', { runId: liveRun.runId }); }
    catch (cleanup) { throw new AggregateError([failure, cleanup].filter(Boolean), 'M4 primary and final run cleanup failed'); }
  }
  if (failure) throw failure;
}
