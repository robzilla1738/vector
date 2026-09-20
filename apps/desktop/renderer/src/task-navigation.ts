import type {Task} from '@vector/contracts';
import {call, useStore} from './store';
import {rememberTask} from './task-drafts';

/** Returning from a run must select its task, never start an unscoped replacement. */
export async function openSavedTask(taskId: string): Promise<void> {
  const {task} = await call<{task:Task}>('tasks.get', {taskId});
  rememberTask(task.workspaceId, task.taskId);
  useStore.getState().setOverlay('tasks');
}
