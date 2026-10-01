import { demoRecorder } from "../../features/demonstration/service.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, RoutineShareEnvelopeSchema, RoutineShareSchema } from "@aux/contracts";
import { readFile } from "node:fs/promises";

async function h_routines_list(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, routines, taskEvidence } = ctx;
  if (method === "routines.replay.repair.propose") {
    if (client.external) {
      const routine = routines.get(params.routineId).routine;
      if (!client.scope || !routine.sourceTaskId) throw new AuxError("permission_denied", "Repair proposals require a bound task connection.");
      ctx.requireScopedTask(client.scope, routine.sourceTaskId);
      ctx.requireScopedPage(client.scope, params.pageId, client.connectionId);
    }
    return routines.proposeReplayRepair(params, ctx.s.pages);
  }
  if (method === "routines.replay.repair.apply") {
    if (client.external || client.codeMode) throw new AuxError("permission_denied", "Only the person can approve this target diff.");
    return routines.applyReplayRepair(params, ctx.s.pages);
  }
  const routineRead =
    method === "routines.list" ||
    method === "routines.suggest" ||
    method === "routines.get" ||
    method === "routines.runs" ||
    method === "routines.alerts" ||
    method === "routines.inbox" ||
    method === "routines.compare" ||
    method === "routines.export" ||
    method === "routines.exportSkill";
  if (client.external && (client.scope || !routineRead))
    throw new AuxError("permission_denied", "Routines are managed in Aux.");
  if (method === "routines.list") return routines.list(params);
  if (method === "routines.suggest") return routines.suggest(params);
  if (method === "routines.get") return routines.get(params.routineId);
  if (method === "routines.create") return routines.create(params);
  if (method === "routines.fromResult") return routines.fromResult(params);
  if (method === "routines.replay.compileDemonstration") return routines.compileDemonstrationReplay(params, demoRecorder(ctx.s));
  if (method === "routines.replay.compile") return routines.compileReplay(params, ctx.s.pages);
  if (method === "routines.replay.test") return routines.testReplay(params, ctx.s.pages);
  if (method === "routines.replay.result") return routines.resultReplay(params);
  if (method === "routines.update") return routines.update(params);
  if (method === "routines.pause")
    return routines.pause(params.routineId, params.expectedRevision, params.paused);
  if (method === "routines.archive")
    return routines.archive(params.routineId, params.expectedRevision, params.archived);
  if (method === "routines.run") return routines.run(params);
  if (method === "routines.runs") return routines.runs(params.routineId, params.limit);
  if (method === "routines.outcome") return routines.outcome(params.routineRunId, taskEvidence);
  if (method === "routines.reconcile")
    return routines.reconcile(params.routineRunId, params.outcome, params.note);
  if (method === "routines.alerts") return routines.alerts(params.limit);
  if (method === "routines.inbox") return routines.inbox(params);
  if (method === "routines.inboxRead") return routines.markInboxRead(params.routineRunId);
  if (method === "routines.ingestEvent") return routines.ingestEvent(params);
  if (method === "routines.compare") return routines.compare(params.leftRunId, params.rightRunId);
  if (method === "routines.export") return routines.exportRoutines(params.routineIds);
  if (method === "routines.exportSkill") return routines.exportSkillDocument(params.routineId);
  if (method === "routines.importSkill") return routines.importSkillDocument(params.path, params.workspaceId);
  if (method === "routines.import") {
    let shares = params.routines;
    if (!shares) {
      let raw: unknown;
      try {
        raw = JSON.parse(await readFile(params.path!, "utf8"));
      } catch (error) {
        throw new AuxError(
          "invalid_params",
          `Couldn't read the routine file. ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      const envelope = RoutineShareEnvelopeSchema.safeParse(raw);
      shares = envelope.success
        ? envelope.data.routines
        : Array.isArray(raw)
          ? raw.map((item) => RoutineShareSchema.parse(item))
          : [];
      if (!shares.length)
        throw new AuxError(
          "invalid_params",
          "That file doesn't contain routines. Export routines from Aux first.",
        );
    }
    return routines.importRoutines(shares, params.workspaceId);
  }
  return routines.due(params.now);
  // pages
}

export const routinesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "routines.replay.compileDemonstration": h_routines_list,
  "routines.list": h_routines_list,
  "routines.suggest": h_routines_list,
  "routines.get": h_routines_list,
  "routines.create": h_routines_list,
  "routines.fromResult": h_routines_list,
  "routines.replay.repair.propose": h_routines_list,
  "routines.replay.repair.apply": h_routines_list,
  "routines.replay.compile": h_routines_list,
  "routines.replay.test": h_routines_list,
  "routines.replay.result": h_routines_list,
  "routines.update": h_routines_list,
  "routines.pause": h_routines_list,
  "routines.archive": h_routines_list,
  "routines.run": h_routines_list,
  "routines.runs": h_routines_list,
  "routines.outcome": h_routines_list,
  "routines.reconcile": h_routines_list,
  "routines.due": h_routines_list,
  "routines.ingestEvent": h_routines_list,
  "routines.alerts": h_routines_list,
  "routines.inbox": h_routines_list,
  "routines.inboxRead": h_routines_list,
  "routines.export": h_routines_list,
  "routines.exportSkill": h_routines_list,
  "routines.importSkill": h_routines_list,
  "routines.import": h_routines_list,
  "routines.compare": h_routines_list,
};
