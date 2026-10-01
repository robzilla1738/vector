import {call, useStore} from './store';
import {rememberTask} from './task-drafts';
import type {Routine} from '@aux/contracts';

let request = 0;

/** Returning from a run must select its task, never start an unscoped replacement. */
export async function openSavedTask(taskId: string): Promise<void> {
  const navigation = beginNavigation();
  const {task} = await call('tasks.get', {taskId});
  if(!navigation.current())return;
  await openTaskSurface(task.workspaceId, taskId, navigation);
}

/** Command search opens the exact Skill in its Space without running it. */
export async function openSavedSkill(skill: Pick<Routine,'routineId'|'workspaceId'>): Promise<void> {
  await openTaskSurface(skill.workspaceId, undefined, beginNavigation(), skill.routineId);
}

function beginNavigation() {
  const version=++request;
  const origin=useStore.getState();
  const current=()=>{
    const state=useStore.getState();
    return version===request && state.mode===origin.mode && state.overlay===origin.overlay
      && state.conversationId===origin.conversationId && state.activePageId===origin.activePageId
      && state.layout.activeSpaceId===origin.layout.activeSpaceId && state.railView===origin.railView
      && state.railOpen===origin.railOpen;
  };
  return {current};
}

async function openTaskSurface(workspaceId:string, taskId:string|undefined, navigation:ReturnType<typeof beginNavigation>, skillId?:string):Promise<void>{
  const current=navigation.current;
  await useStore.getState().refreshSpaces();
  if(!current())return;
  let space = useStore.getState().layout.spaces.find(space => space.workspaceId === workspaceId);
  if (!space) {
    const archived = useStore.getState().layout.archivedSpaces?.find(space => space.workspaceId === workspaceId);
    if (archived) {
      await useStore.getState().restoreSpace(archived.id,false);
      if(!current())return;
    }
    space = useStore.getState().layout.spaces.find(space => space.workspaceId === workspaceId);
  }
  if (!space) throw new Error("This Space is unavailable. Restore it before opening saved work.");
  useStore.getState().switchSpace(space.id);
  rememberTask(workspaceId, taskId??null);
  useStore.setState({skillSelection:skillId?{routineId:skillId,workspaceId}:null});
  useStore.getState().setOverlay('tasks');
}
