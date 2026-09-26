import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_responses_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
  await s.responses.flush(); // capture persists asynchronously — readers see everything landed so far
  return s.responses.list(params.pageId, params as never);
}
async function h_responses_body(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
  await s.responses.flush();
  const b = s.responses.body(params.requestId);
  if (!b) throw new AuxError("not_found", `no captured body for ${params.requestId}`);
  return { mediaType: b.mediaType, dataBase64: b.buffer.toString("base64") };
}

export const responsesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "responses.list": h_responses_list,
  "responses.body": h_responses_body,
};
