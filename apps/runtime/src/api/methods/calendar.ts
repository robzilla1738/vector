import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_calendar_connections_list(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Calendar accounts are managed in Aux.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.list();
}
async function h_calendar_auth_start(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Calendar accounts are connected in Aux.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.start();
}
async function h_calendar_connections_revoke(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Calendar accounts are managed in Aux.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.revoke(params.connectionId);
}
async function h_calendar_events_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Calendar reads require an Aux account grant.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.events(params);
}
async function h_calendar_taskGrants_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope } = ctx;
  if (client.external && !scope)
    throw new AuxError("permission_denied", "Calendar task grants require a scoped connection.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.taskGrants(params.taskId);
}
async function h_calendar_taskGrants_create(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Calendar task grants are managed in Aux.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.grantTask(params.taskId, params.expectedRevision, params.connectionId);
}
async function h_calendar_taskGrants_revoke(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Calendar task grants are managed in Aux.");
  if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
  return s.calendar.revokeTaskGrant(params.taskId, params.grantId);
}
async function h_calendar_taskEvents_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope } = ctx;
  if (client.external && !scope)
    throw new AuxError("permission_denied", "Calendar task reads require a scoped connection.");
  if (!s.operations) throw new AuxError("backend_unavailable", "Calendar operations are unavailable.");
  return (await s.operations.invokeCalendarTaskEvents(params)).result;
}

export const calendarMethods: Partial<Record<MethodName, MethodHandler>> = {
  "calendar.connections.list": h_calendar_connections_list,
  "calendar.auth.start": h_calendar_auth_start,
  "calendar.connections.revoke": h_calendar_connections_revoke,
  "calendar.events.list": h_calendar_events_list,
  "calendar.taskGrants.list": h_calendar_taskGrants_list,
  "calendar.taskGrants.create": h_calendar_taskGrants_create,
  "calendar.taskGrants.revoke": h_calendar_taskGrants_revoke,
  "calendar.taskEvents.list": h_calendar_taskEvents_list,
};
