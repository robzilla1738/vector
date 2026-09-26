import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, newProgramId } from "@aux/contracts";

async function h_programs_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.listPrograms();
}
async function h_programs_run(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.runProgram(params as never);
}
async function h_programs_save(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as {
    name: string;
    description?: string;
    siteKey: string;
    steps?: unknown[];
    nodes?: unknown[];
    parameters: string[];
  };
  if (!p.steps?.length && !p.nodes?.length)
    throw new AuxError("invalid_params", "programs.save needs steps or nodes");
  const program = {
    programId: newProgramId(),
    name: p.name,
    description: p.description,
    version: 1,
    siteKey: p.siteKey,
    parameters: p.parameters,
    // stepsJson holds {steps,nodes} — legacy rows hold a bare steps array
    stepsJson: JSON.stringify(p.nodes?.length ? { steps: p.steps ?? [], nodes: p.nodes } : (p.steps ?? [])),
    useCount: 0,
    createdAt: Date.now(),
  };
  s.repo.saveProgram(program);
  return program;
}
async function h_programs_delete(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  s.repo.deleteProgram(params.programId);
  return { ok: true };

  // sessions / chrome
}
async function h_programs_validate(ctx: MethodCtx): Promise<unknown> {
  const { params } = ctx;
  // schema already parsed — add structural checks the schema can't express
  const p = (params as { program: unknown }).program;
  const errors: string[] = [];
  const prog = p as { steps?: { id: string; op: string }[]; nodes?: unknown[] };
  if (!prog.steps?.length && !prog.nodes?.length) errors.push("program has neither steps nor nodes");
  const ids = new Set<string>();
  for (const st of prog.steps ?? []) {
    if (ids.has(st.id)) errors.push(`duplicate step id ${st.id}`);
    ids.add(st.id);
  }
  (prog.steps ?? []).forEach((st, i, arr) => {
    if (st.op === "expectDownload" && i === arr.length - 1)
      errors.push("expectDownload must precede the trigger step");
  });
  return { ok: errors.length === 0, errors };
}

export const programsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "programs.list": h_programs_list,
  "programs.run": h_programs_run,
  "programs.save": h_programs_save,
  "programs.delete": h_programs_delete,
  "programs.validate": h_programs_validate,
};
