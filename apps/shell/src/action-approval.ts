import { bridge } from "./bridge";
import { call, errToast, useStore } from "./store";
import { errorMessage } from "./error-message";
import type { TrustConfirmation } from "./features/trust/confirmation";

type Decision = "accept" | "acceptForOrigin" | "decline";
const controllers = new WeakMap<TrustConfirmation, SuspensionController>();
/** Card, page pill and command shortcuts share one exact request and pending operation. */
export class SuspensionController {
  private state = { busy: false, error: "" };
  private listeners = new Set<() => void>();
  private window = { id: bridge.windowId, kind: bridge.windowKind, privateMode: bridge.privateMode };
  private epoch: number | undefined;
  constructor(readonly request: TrustConfirmation) {
    this.epoch = request.pageId ? useStore.getState().pages.byId[request.pageId]?.documentEpoch : undefined;
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  current() {
    return (
      useStore.getState().confirmation === this.request &&
      bridge.windowId === this.window.id &&
      bridge.windowKind === this.window.kind &&
      bridge.privateMode === this.window.privateMode &&
      (!this.request.pageId ||
        this.epoch === undefined ||
        useStore.getState().pages.byId[this.request.pageId]?.documentEpoch === this.epoch)
    );
  }
  private publish(state: typeof this.state) {
    this.state = state;
    for (const listener of this.listeners) listener();
  }
  private assertCurrent() {
    if (!this.current()) throw new Error("This approval has ended or changed.");
  }
  private clear() {
    if (this.current()) useStore.setState({ confirmation: null });
  }
  async decide(decision: Decision) {
    this.assertCurrent();
    if (this.state.busy) return;
    if (decision !== "decline" && this.request.kind === "handoff")
      throw new Error("This action requires you to take over.");
    const approvalId = this.request.approvalId;
    if (!approvalId) {
      if (decision !== "decline") throw new Error("This approval is unavailable.");
      this.clear();
      return;
    }
    this.publish({ busy: true, error: "" });
    let authenticated = false;
    try {
      if (this.request.kind === "touch-id" && decision !== "decline") {
        const result = await bridge["auth.confirm"]({
          reason: this.request.instruction.slice(0, 1000),
          approvalId,
          expectedTurnId: this.request.turnId,
        });
        if (result.ok !== true || result.approvalId !== approvalId || result.turnId !== this.request.turnId)
          throw new Error("Device confirmation did not acknowledge this request.");
        authenticated = true;
        this.assertCurrent();
        if (decision === "acceptForOrigin") {
          const { AgentPolicySettingsSchema } = await import("@aux/contracts/agent-policy");
          this.assertCurrent();
          const settings = await call("settings.get", {});
          this.assertCurrent();
          const policy = AgentPolicySettingsSchema.parse({
            agentMode: settings.agentMode,
            agentPolicies: settings.agentPolicies,
            agentPolicyRevision: settings.agentPolicyRevision,
          });
          await call("settings.set", {
            agentPolicyRevision: policy.agentPolicyRevision,
            agentPolicies: [
              ...policy.agentPolicies.filter(
                (rule) => rule.category !== this.request.policyCategory || rule.site !== this.request.site,
              ),
              { category: this.request.policyCategory, site: this.request.site, access: "allow" },
            ],
          });
        }
      } else {
        await call("safety.approvals.decide", {
          decision: { decision, approvalId },
          expectedTurnId: this.request.turnId,
        });
      }
      this.clear();
    } catch (reason) {
      if (authenticated && this.current()) {
        this.clear();
        errToast(`The action was confirmed, but the site rule could not be saved. ${errorMessage(reason)}`);
      }
      this.publish({ busy: false, error: errorMessage(reason) });
      throw reason;
    } finally {
      if (this.state.busy) this.publish({ ...this.state, busy: false });
    }
  }
  async takeover(activate: (pageId: string) => unknown) {
    this.assertCurrent();
    if (this.state.busy) return;
    const pageId = this.request.pageId;
    if (!pageId) throw new Error("The requested page is unavailable.");
    this.publish({ busy: true, error: "" });
    try {
      await call("pages.takeover", { pageId });
      this.assertCurrent();
      await activate(pageId);
      this.clear();
    } catch (reason) {
      this.publish({ busy: false, error: errorMessage(reason) });
      throw reason;
    } finally {
      if (this.state.busy) this.publish({ ...this.state, busy: false });
    }
  }
}
export function suspensionController(request: TrustConfirmation) {
  let controller = controllers.get(request);
  if (!controller) {
    controller = new SuspensionController(request);
    controllers.set(request, controller);
  }
  return controller;
}
function original(input: { approvalId?: string; turnId: string }) {
  const current = useStore.getState().confirmation;
  if (
    !current ||
    current.turnId !== input.turnId ||
    (input.approvalId !== undefined && current.approvalId !== input.approvalId)
  )
    throw new Error("This approval has ended or changed.");
  return suspensionController(current);
}
export function decideAgentAction(input: { approvalId: string; turnId: string }, decision: Decision) {
  return original(input).decide(decision);
}
export function dismissAgentHandoff(turnId: string) {
  return original({ turnId }).decide("decline");
}
export function takeOverAgentAction(
  input: { pageId: string; turnId: string },
  activate: (pageId: string) => unknown,
) {
  const controller = original(input);
  if (controller.request.pageId !== input.pageId) throw new Error("This handoff has ended or changed.");
  return controller.takeover(activate);
}
