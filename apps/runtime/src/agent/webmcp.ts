import { createHash } from "node:crypto";
import {
  AuxError,
  EffectRequestSchema,
  WebmcpCallResultSchema,
  WebmcpToolSchema,
  type EffectActor,
  type EffectRequest,
  type SuspensionRequest,
  type WebmcpCallResult,
  type WebmcpTool,
} from "@aux/contracts";
import { decide, type DecideDeps } from "../safety/decide.js";

/** A tool is a write unless it says it is read-only and not consequential. */
export function webmcpToolIsWrite(tool: Pick<WebmcpTool, "readOnly" | "consequential">): boolean {
  return tool.readOnly !== true || tool.consequential === true;
}

export function webmcpTurn(pageId: string, name: string): { turnId: string; threadId: string } {
  return {
    turnId: `webmcp:${pageId}:${name}`.slice(0, 200),
    threadId: `page:${pageId}`.slice(0, 200),
  };
}

export interface WebmcpNative {
  webmcpList?(pageId: string): Promise<{ tools: unknown }>;
  webmcpCall?(pageId: string, name: string, input: string): Promise<unknown>;
}

export interface WebmcpActor {
  profileId: string;
  scope: { kind: "workspace" | "task"; id: string };
  actor: EffectActor;
  turnId: string;
  threadId: string;
  runId?: string;
}

export type WebmcpOutcome =
  | { status: "tools"; tools: WebmcpTool[] }
  | { status: "called"; result: string | null; success: true }
  | {
      status: "ask";
      approvalId?: string;
      request: EffectRequest;
      suspension: SuspensionRequest;
      turnId: string;
      threadId: string;
      instruction: string;
      action: string;
      origin: string;
    };

function requireBridge(native: WebmcpNative | undefined): asserts native is Required<WebmcpNative> {
  if (!native?.webmcpList || !native.webmcpCall) {
    throw new AuxError("capability_unsupported", "WebMCP is not exposed for this page.");
  }
}

/**
 * Document tools use the same live agent policy and original document fence as browser actions.
 */
export async function runWebmcp(
  native: WebmcpNative | undefined,
  request: { pageId: string; op: "tools" } | { pageId: string; op: "call"; name: string; input: string },
  actor: WebmcpActor,
  deps: DecideDeps,
  origin: string,
  current: () => void,
): Promise<WebmcpOutcome> {
  requireBridge(native);
  current();
  const tools = WebmcpToolSchema.array().parse((await native.webmcpList(request.pageId)).tools);
  current();
  if (request.op === "tools") return { status: "tools", tools };
  const tool = tools.find((item) => item.name === request.name);
  if (!tool) throw new AuxError("not_found", `This page has no WebMCP tool named ${request.name}.`);
  const input = request.input || "{}";
  if (webmcpToolIsWrite(tool)) {
    const action = `webmcp:${tool.name}`.slice(0, 200);
    const effectRequest = EffectRequestSchema.parse({
      profileId: actor.profileId,
      scope: actor.scope,
      actor: actor.actor,
      effect: "write",
      category: "submit",
      action,
      origin,
      dataClasses: [],
      provenance: "page",
      invocationDigest: createHash("sha256")
        .update(JSON.stringify([request.pageId, tool.name, input]))
        .digest("hex"),
      turnId: actor.turnId,
      threadId: actor.threadId,
      ...(actor.runId ? { runId: actor.runId } : {}),
      requestedAt: Date.now(),
    });
    const policy = JSON.stringify([
      deps.managedRules(),
      deps.agentPolicy(actor.runId),
      deps.approvals.runAuthorityRevision(actor.runId),
    ]);
    const decision = await decide(effectRequest, deps, { phase: "dispatch", runId: actor.runId });
    current();
    if (
      JSON.stringify([
        deps.managedRules(),
        deps.agentPolicy(actor.runId),
        deps.approvals.runAuthorityRevision(actor.runId),
      ]) !== policy
    )
      throw new AuxError("permission_denied", "Agent policy changed before this site tool could run.");
    if (decision.status === "deny") {
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    }
    if (decision.status === "ask") {
      return {
        status: "ask",
        approvalId: decision.suspension.approvalId,
        request: effectRequest,
        suspension: decision.suspension,
        turnId: actor.turnId,
        threadId: actor.threadId,
        instruction: decision.suspension.instruction,
        action,
        origin,
      };
    }
  }
  current();
  const called: WebmcpCallResult = WebmcpCallResultSchema.parse(
    await native.webmcpCall(request.pageId, tool.name, input),
  );
  current();
  if (!called.success) {
    throw new AuxError("step_failed", called.result || `WebMCP tool ${tool.name} failed.`);
  }
  return { status: "called", result: called.result, success: true };
}
