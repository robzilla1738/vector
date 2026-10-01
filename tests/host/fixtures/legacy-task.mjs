import { shell, press } from './legacy-ui.mjs';

export async function createNativeSpace(t, name) {
  await press(t, { role: 'AXPopUpButton', name: 'Switch space, current:', match: 'contains', scope: 'shell', index: 0 });
  await press(t, shell('New space', 'AXMenuItem'));
  const input = { role: 'AXTextField', scope: 'shell', index: 0 };
  await t.ax.waitFor(input);
  t.assert.equal((await t.ax.query(input))[0].placeholder, 'Name');
  await t.ax.type(name, input);
  await press(t, shell('Create', 'AXButton'));
  await t.ax.waitFor(shell('New space'), 'absent');
  return t.until('native Space and runtime workspace agree', async () => (await t.rpc('workspaces.list')).find(item => item.name === name));
}

export async function saveNativeTask(t, workspace, title, objective, criterion) {
  if (!(await t.ax.query(shell('Tasks', 'AXButton'))).length) await press(t, shell('Show sidebar', 'AXButton'));
  await press(t, shell('Tasks', 'AXButton'));
  await press(t, shell('New task', 'AXButton'));
  await t.ax.type(title, shell('Title', 'AXTextField'));
  await t.ax.type(objective, shell('Objective', 'AXTextArea'));
  await t.ax.type(criterion, shell('What must be true when this is done?', 'AXTextArea'));
  await press(t, shell('Save task', 'AXButton'));
  const task = await t.until('native saved task committed in selected Space', async () => (await t.rpc('tasks.list', { workspaceId: workspace.workspaceId })).find(item => item.title === title));
  t.assert.equal(task.workspaceId, workspace.workspaceId);
  t.assert.equal(task.state, 'open');
  t.assert.equal(task.objective, objective);
  t.assert.equal(task.criteria.length, 1);
  t.assert.equal(task.criteria[0].description, criterion);
  await press(t, shell('Close tasks', 'AXButton'));
  return task;
}
