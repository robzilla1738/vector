import { AuxError, MethodSchemas, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
function owner(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext || !ctx.s.projects)
    throw new AuxError("permission_denied", "Projects require their original local Aux window.");
  return { projects: ctx.s.projects, token: ctx.client.nativeTurnContext };
}
async function h_projects_files(ctx: MethodCtx) { const { projects, token } = owner(ctx); return projects.files(MethodSchemas["projects.files"].parse(ctx.params), token); }
async function h_projects_file(ctx: MethodCtx) { const { projects, token } = owner(ctx); return projects.file(MethodSchemas["projects.file"].parse(ctx.params), token); }
async function h_projects_changes(ctx: MethodCtx) { const { projects, token } = owner(ctx); return projects.changes(MethodSchemas["projects.changes"].parse(ctx.params), token); }
export const projectMethods: Partial<Record<MethodName, MethodHandler>> = {
  "projects.files": h_projects_files, "projects.file": h_projects_file, "projects.changes": h_projects_changes,
};
