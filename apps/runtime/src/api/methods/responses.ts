import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_responses_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
  await s.responses.flush(); // capture persists asynchronously — readers see everything landed so far
  if (!ctx.externalRunId) return s.responses.list(params.pageId, params as never);
  const records = s.responses.listForDocument(s.pages.get(params.pageId), params as never);
  const checks: Array<() => void> = [];
  for (const record of records)
    checks.push(await s.pages.authorizeAgentResponseRead(ctx.externalRunId, record.requestId, ctx.taskRead));
  checks.forEach((check) => check());
  return records;
}
async function h_responses_body(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
  await s.responses.flush();
  const record = s.repo.getResponse(params.requestId);
  const check = ctx.externalRunId
    ? await s.pages.authorizeAgentResponseRead(ctx.externalRunId, params.requestId, ctx.taskRead)
    : undefined;
  const b = ctx.externalRunId
    ? record && s.responses.bodyForDocument(params.requestId, s.pages.get(record.pageId))
    : s.responses.body(params.requestId);
  if (!b) throw new AuxError("not_found", `no captured body for ${params.requestId}`);
  check?.();
  return { mediaType: b.mediaType, dataBase64: b.buffer.toString("base64") };
}

export const responsesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "responses.list": h_responses_list,
  "responses.body": h_responses_body,
};
