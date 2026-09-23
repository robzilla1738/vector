import type { RunFailure } from "@aux/contracts";

/** Only classify errors emitted by Aux’s permission boundary, never arbitrary page text. */
export function permissionFailure(error: string | undefined): RunFailure | undefined {
  if (error === "permission denied for navigate (invalid destination)") return {
    category: "model_output",
    message: "Aux couldn’t resolve the page address. Add the full website address to your request and try again.",
    retryable: false,
    action: "edit_request",
  };
  const match = /^permission denied for [a-zA-Z]+ \(effect:(read|write|egress|destructive)\)$/.exec(error ?? "");
  if (!match) return undefined;
  const action = ({ read: "read pages", write: "interact with pages", egress: "navigate between pages", destructive: "run page scripts" } as Record<string, string>)[match[1]!];
  return {
    category: "permission",
    message: `This task needs permission to ${action}. Review Agent permissions, then retry when you’re ready.`,
    retryable: true,
    action: "permission_settings",
  };
}
