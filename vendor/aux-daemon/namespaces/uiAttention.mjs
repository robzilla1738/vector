/** The `uiAttention` tRPC namespace: which agent surfaces are focused or visible, per account.
 * The state is the supplied in-memory map, which the supplied notification code still reads. */
const INACTIVE_ENTRY_TTL_MS = 30_000;
const ACTIVE_ENTRY_TTL_MS = 60_000;

function pruneInactive(surfaces) {
  const now = Date.now();
  for (const [surfaceId, entry] of surfaces) {
    const age = now - entry.updatedAt;
    if (age > ACTIVE_ENTRY_TTL_MS || !entry.focused && !entry.visible && age > INACTIVE_ENTRY_TTL_MS) surfaces.delete(surfaceId);
  }
}

/** A report older than the surface's last sequence is ignored. */
function record(attentionByAccountId, accountId, report) {
  const surfaces = attentionByAccountId.get(accountId) ?? new Map();
  const previous = surfaces.get(report.surfaceId);
  if (previous?.sequence !== undefined && (report.sequence === undefined || report.sequence <= previous.sequence)) return;
  const entry = {surfaceId: report.surfaceId, focused: report.focused, visible: report.visible, updatedAt: Date.now()};
  if (report.engaged !== undefined) entry.engaged = report.engaged;
  if (report.sessionId) entry.sessionId = report.sessionId;
  if (report.sequence !== undefined) entry.sequence = report.sequence;
  surfaces.set(report.surfaceId, entry);
  attentionByAccountId.set(accountId, surfaces);
  pruneInactive(surfaces);
}

export function create({accountProcedure, z, uiAttention: u}) {
  const report = z.object({
    surfaceId: z.string().trim().min(1).max(128), focused: z.boolean(), visible: z.boolean(), engaged: z.boolean().optional(),
    sessionId: z.string().trim().min(1).optional(), sequence: z.number().int().nonnegative().optional(),
  });
  return {
    reportAgentManagerSessionAttention: accountProcedure.input(report).mutation(({ctx, input}) => {
      record(u.attentionByAccountId, ctx.accountId, input);
      return {ok: true};
    }),
  };
}
