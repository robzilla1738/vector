import type {Task} from '@aux/contracts';
import {call, useStore} from './store';
import {rememberTask} from './task-drafts';

let request = 0;

/** Returning from a run must select its task, never start an unscoped replacement. */
export async function openSavedTask(taskId: string): Promise<void> {
  const version=++request;
  const origin=useStore.getState();
  const current=()=>{
    const state=useStore.getState();
    return version===request && state.mode===origin.mode && state.overlay===origin.overlay
      && state.conversationId===origin.conversationId && state.activePageId===origin.activePageId
      && state.layout.activeSpaceId===origin.layout.activeSpaceId && state.railView===origin.railView
      && state.railOpen===origin.railOpen;
  };
  const {task} = await call<{task:Task}>('tasks.get', {taskId});
  if(!current())return;
  await useStore.getState().refreshSpaces();
  if(!current())return;
  let space = useStore.getState().layout.spaces.find(space => space.workspaceId === task.workspaceId);
  if (!space) {
    const archived = useStore.getState().layout.archivedSpaces?.find(space => space.workspaceId === task.workspaceId);
    if (archived) {
      await useStore.getState().restoreSpace(archived.id,false);
      if(!current())return;
    }
    space = useStore.getState().layout.spaces.find(space => space.workspaceId === task.workspaceId);
  }
  if (!space) throw new Error("This task’s Space is unavailable. Restore its Space before opening the task.");
  useStore.getState().switchSpace(space.id);
  rememberTask(task.workspaceId, task.taskId);
  useStore.getState().setOverlay('tasks');
}
