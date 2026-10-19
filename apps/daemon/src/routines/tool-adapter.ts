/** Same schemas and scheduling validation as routines RPC; daemon/agent.md routine_update. */
import type { AgentEngine, Session } from '@aux/agent';
import { fail } from '@aux/agent';
import type { DaemonServices } from '../http/server.js';
import {
  createRoutineRouter,
  routineFields,
  validateRoutine,
} from './index.js';

type Input = {
  operation: 'create' | 'suggest' | 'update' | 'pause' | 'resume' | 'delete';
  routineId?: string | undefined;
  record?: Record<string, unknown> | undefined;
};
const permissionRank = { 'read-only': 0, guard: 1, 'full-access': 2 };
export function createRoutineToolAdapter(
  services: DaemonServices,
  engine: AgentEngine,
) {
  const caller = createRoutineRouter(services, engine).createCaller({
    store: services.store,
    clientKind: 'agent-tool',
  });
  return async (
    session: Session,
    input: Input,
    toolCallId: string,
    signal: AbortSignal,
  ) => {
    const { accountId } = session;
    if (session.incognito || session.parentId)
      fail(
        'FORBIDDEN',
        'Private or child tasks cannot manage persistent routines',
      );
    if (session.permissionMode === 'read-only')
      fail('FORBIDDEN', 'Read-only tasks cannot manage routines');
    signal.throwIfAborted();
    const creating =
      input.operation === 'create' || input.operation === 'suggest';
    if (creating && input.routineId)
      fail('BAD_REQUEST', 'New routines cannot specify an existing routine ID');
    if (!creating && !input.routineId)
      fail('BAD_REQUEST', 'This routine action requires routineId');
    if (['pause', 'resume', 'delete'].includes(input.operation) && input.record)
      fail('BAD_REQUEST', 'This routine action does not accept record changes');
    const before = creating
      ? undefined
      : await caller.get({ accountId, routineId: input.routineId ?? '' });
    const patch = routineFields
      .partial()
      .strict()
      .parse(input.record ?? {});
    const record = routineFields.strict().parse({
      ...(creating
        ? {
            projectId: session.projectId ?? null,
            model: session.model,
            permissionMode: session.permissionMode,
            runtimeConfig: session.runtimeConfig,
            browserBinding: session.browserBinding,
          }
        : routineFields.parse(before)),
      ...patch,
      ...(creating ? { createdBySessionId: session.id } : {}),
      ...(input.operation === 'suggest'
        ? { source: 'suggestion', state: 'draft' }
        : {}),
      ...(input.operation === 'pause' ? { state: 'paused' } : {}),
      ...(input.operation === 'resume' ? { state: 'active' } : {}),
      ...(input.operation === 'delete' ? { state: 'deleted' } : {}),
    });
    if (
      permissionRank[record.permissionMode] >
      permissionRank[session.permissionMode]
    )
      fail(
        'FORBIDDEN',
        'Routine policy cannot exceed the creating task permission',
      );
    if (
      JSON.stringify(record.runtimeConfig?.workingDirs ?? []) !==
      JSON.stringify(session.runtimeConfig?.workingDirs ?? [])
    )
      fail(
        'FORBIDDEN',
        'Routine working roots must match the authorizing task',
      );
    if (input.operation !== 'delete')
      validateRoutine(engine, accountId, record, Date.now());
    const preview = {
      operation: input.operation,
      ...(input.routineId ? { routineId: input.routineId } : {}),
      record,
    };
    return {
      preview,
      execute: async () => {
        signal.throwIfAborted();
        const current = engine.get(accountId, session.id);
        if (
          current.permissionMode === 'read-only' ||
          permissionRank[current.permissionMode] <
            permissionRank[record.permissionMode]
        )
          fail(
            'FORBIDDEN',
            'Task permission became more restrictive while awaiting approval',
          );
        if (
          JSON.stringify(current.runtimeConfig?.workingDirs ?? []) !==
          JSON.stringify(session.runtimeConfig?.workingDirs ?? [])
        )
          fail(
            'CONFLICT',
            'Task working roots changed while awaiting approval',
          );
        const key = `${session.id}:${toolCallId}`;
        const receipt = services.store.get(
          accountId,
          'routineToolResults',
          key,
        ) as { preview: string; status: string; result?: unknown } | null;
        if (receipt) {
          if (receipt.preview !== JSON.stringify(preview))
            fail(
              'CONFLICT',
              'Routine tool identity was reused with different arguments',
            );
          if (receipt.status === 'completed') return receipt.result;
          fail(
            'CONFLICT',
            'Prior routine operation has uncertain outcome; inspect routines before continuing',
          );
        }
        if (
          before &&
          JSON.stringify(
            await caller.get({ accountId, routineId: before.id }),
          ) !== JSON.stringify(before)
        )
          fail(
            'CONFLICT',
            'Routine changed while awaiting approval; review the new record',
          );
        services.store.set(accountId, 'routineToolResults', key, {
          preview: JSON.stringify(preview),
          status: 'pending',
        });
        const result = creating
          ? await caller.create({ accountId, ...record })
          : input.operation === 'delete'
            ? await caller.delete({
                accountId,
                routineId: input.routineId ?? '',
              })
            : input.operation === 'resume'
              ? await caller.activate({
                  accountId,
                  routineId: input.routineId ?? '',
                })
              : await caller.update({
                  accountId,
                  routineId: input.routineId ?? '',
                  ...record,
                });
        services.store.set(accountId, 'routineToolResults', key, {
          preview: JSON.stringify(preview),
          status: 'completed',
          result,
        });
        return result;
      },
    };
  };
}
