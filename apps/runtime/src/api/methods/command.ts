import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_command_ranking_list(ctx: MethodCtx): Promise<unknown> {
  const { commandRanking } = ctx;
  return commandRanking.list();
}
async function h_command_ranking_record(ctx: MethodCtx): Promise<unknown> {
  const { commandRanking, params } = ctx;
  return commandRanking.record(params.query, params.candidateKey, params.source);
}
async function h_command_ranking_clear(ctx: MethodCtx): Promise<unknown> {
  const { commandRanking } = ctx;
  return commandRanking.clear();
}

export const commandMethods: Partial<Record<MethodName, MethodHandler>> = {
  "command.ranking.list": h_command_ranking_list,
  "command.ranking.record": h_command_ranking_record,
  "command.ranking.clear": h_command_ranking_clear,
};
