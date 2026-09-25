import { RoutineSchema, TaskSchema, TaskReceiptSchema } from '@aux/contracts';

/** Explicit preview fixtures, never installed in the native bridge. */
export function workFixtures(workspaceId: string, populated: boolean, connectorProject = false) {
  const now = Date.now();
  let tasks = populated ? ['Compare browser accessibility', 'Prepare the weekly research brief', 'Review saved project changes'].map((title, i) => TaskSchema.parse({
    taskId: connectorProject ? [`11111111-1111-4111-8111-111111111111`, `22222222-2222-4222-8222-222222222222`, `33333333-3333-4333-8333-333333333333`][i] : `preview-task-${i}`, workspaceId, title, objective: 'Review the recorded sources and produce a concise summary with evidence.',
    criteria: [{criterionId:`criterion-${i}`,description:'Every finding links to recorded evidence.',verification:'manual'}],
    resources: connectorProject && i === 0 ? [{resourceId:'project',kind:'repository',projectId:'44444444-4444-4444-8444-444444444444',locator:'/synthetic/project',label:'Web app',access:'read'}] : [],
    revision:1,state:i === 2 ? 'archived' : 'open',createdAt:now-86400000,updatedAt:now-i*3600000,
  })) : [];
  let routines = populated ? ['Weekly research brief', 'Monitor documentation changes', 'Imported comparison template'].map((title,i) => RoutineSchema.parse({
    routineId:`preview-routine-${i}`,workspaceId,title,objective:'Summarize changed sources and preserve their provenance.',
    ...(i<2 ? {sourceTaskId:connectorProject ? '22222222-2222-4222-8222-222222222222' : 'preview-task-1'} : {}),revision:1,createdAt:now,updatedAt:now,
    paused:i>0,trigger:i===0 ? {kind:'schedule',timezone:'America/Chicago',hour:9,minute:0,days:[1]} : {kind:'manual'},
  })) : [];
  const task = (id: unknown) => { const item=tasks.find(t=>t.taskId===id); if(!item)throw new Error('Preview task not found'); return item; };
  const routine = (id: unknown) => { const item=routines.find(t=>t.routineId===id); if(!item)throw new Error('Preview Skill not found'); return item; };
  return {
    'tasks.list': async () => tasks,
    'tasks.get': async (p: Record<string,unknown>) => ({task:task(p.taskId),revisions:[task(p.taskId)],runs:[],children:[]}),
    'tasks.receipt': async (p: Record<string,unknown>) => { const t=task(p.taskId); return TaskReceiptSchema.parse({taskId:t.taskId,taskRevision:t.revision,objective:t.objective,generatedAt:now,status:'needs_review',criteria:t.criteria.map(criterion=>({criterion,status:'unverified',evidence:[]})),unresolvedActions:[],runs:[],modelCalls:0,knownCostUsd:0,costComplete:true}); },
    'tasks.archive': async (p: Record<string,unknown>) => {const t=task(p.taskId); if(t.revision!==p.expectedRevision)throw new Error('Preview revision changed'); const next={...t,state:p.archived?'archived' as const:'open' as const,revision:t.revision+1};tasks=tasks.map(item=>item===t?next:item);return next;},
    'routines.list': async () => routines,
    'routines.alerts': async () => [],
    'routines.get': async (p: Record<string,unknown>) => ({routine:routine(p.routineId),runs:[]}),
    'routines.pause': async (p: Record<string,unknown>) => {const r=routine(p.routineId);if(r.revision!==p.expectedRevision)throw new Error('Preview revision changed');const next={...r,paused:!!p.paused,revision:r.revision+1};routines=routines.map(item=>item===r?next:item);return next;},
  };
}
