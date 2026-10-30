/** The `fullDiskAccess` tRPC namespace: checks and requests Full Disk Access through the
 * supplied Computer Use helper and Messages permission prompt. */
import {existsSync} from 'node:fs';

export function create({publicProcedure, z, TRPCError, fullDiskAccess: f}) {
  const assertMacOS = () => {
    if (process.platform !== 'darwin') throw new TRPCError({code: 'PRECONDITION_FAILED', message: 'Messages access is only available on macOS.'});
  };
  const check = async () => {
    assertMacOS();
    try {
      return (await f.runComputerUseCommand('permissions.check', {}, {noDialog: true})).fullDiskAccess ? 'granted' : 'not_detected';
    } catch {
      return 'unknown';
    }
  };
  return {
    check: publicProcedure.output(z.object({status: z.enum(['granted', 'not_detected', 'unknown'])})).query(async () => ({status: await check()})),
    request: publicProcedure.output(z.object({completed: z.boolean()})).mutation(async () => {
      assertMacOS();
      await f.prepareHelper();
      if (!existsSync(f.helperAppPath)) throw new TRPCError({code: 'PRECONDITION_FAILED', message: 'Aux Computer Use helper is not included in this build.'});
      return {completed: await f.contextAwarenessHelper.requestMessagesPermissions() || await check() === 'granted'};
    }),
  };
}
