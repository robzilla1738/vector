/** The `routines` tRPC namespace. Routines run on this device only: one bound to another device
 * or to the cloud is preserved but cannot be deleted or run here. Storage and scheduling are the
 * routine store (stores/routines.mjs), reached through the bundle's routine functions. */
import {requireCurrentDeviceRoutine} from '../stores/routines.mjs';

export function create({accountProcedure, z, routines: service}) {
  const account = {accountId: z.number().int().nonnegative()};
  const byId = accountProcedure.input(z.object({...account, routineId: z.string(), revision: z.number().int().positive().nullable().optional()}));

  const requireCurrentDevice = (accountId, routine) => requireCurrentDeviceRoutine(service.settings, accountId, routine);

  return {
    list: accountProcedure.input(z.object({...account, projectId: z.string().nullable().optional(), parentSessionId: z.string().optional(),
      type: service.typeSchema.optional(), includeDeleted: z.boolean().optional()})).query(({ctx, input}) => service.list(ctx.accountId, input)),
    summary: byId.query(({ctx, input}) => service.summary(ctx.accountId, input.routineId) ?? null),
    get: byId.query(({ctx, input}) => service.detail(ctx.accountId, input.routineId) ?? null),
    create: accountProcedure.input(service.createSchema.extend({...account, type: z.enum(['standalone', 'child']).default('standalone'), parentSessionId: z.string().min(1).optional()})
      .superRefine((routine, context) => {
        if (routine.type === 'child' && !routine.parentSessionId) context.addIssue({code: 'custom', path: ['parentSessionId'], message: 'Select a parent task.'});
      })).mutation(async ({ctx, input}) => service.create(ctx.accountId, input)),
    update: byId.input(service.updateSchema.extend({...account, routineId: z.string()})).mutation(async ({ctx, input}) => {
      const {accountId, routineId, ...changes} = input;
      return service.update(ctx.accountId, routineId, changes);
    }),
    delete: byId.mutation(async ({ctx, input}) => {
      const routine = service.get(ctx.accountId, input.routineId);
      if (!routine) throw Error('Routine not found.');
      requireCurrentDevice(ctx.accountId, routine);
      if (input.revision) await service.updateServer(ctx.accountId, input.routineId, input.revision, {status: 'deleted'});
      else await service.remove(ctx.accountId, input.routineId);
      return {deleted: true};
    }),
    runNow: byId.mutation(async ({ctx, input}) => {
      const routine = service.detail(ctx.accountId, input.routineId);
      if (!routine) throw Error('Routine not found.');
      requireCurrentDevice(ctx.accountId, routine);
      return service.run(ctx.accountId, routine);
    }),
  };
}
