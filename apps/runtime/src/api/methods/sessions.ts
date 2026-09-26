import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_sessions_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.listSessions();
}

export const sessionsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "sessions.list": h_sessions_list,
};
