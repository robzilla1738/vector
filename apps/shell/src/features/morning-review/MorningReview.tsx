import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { executeCommand } from "../../commands";
import { useNightReview } from "./state";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";
export function MorningReviewInbox() {
  const { items, busy, error } = useNightReview();
  return (
    <section aria-label="Overnight review" aria-busy={busy}>
      <h2>Overnight review</h2>
      {!items.length && <p>Queue a goal, Skill or memory task for tonight.</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>
              {item.payload.kind === "goal"
                ? "Goal"
                : item.payload.kind === "routine"
                  ? "Skill"
                  : "Space memory"}
            </strong>
            <output>{item.status.replace("_", " ")}</output>
            {item.status === "proposed" && (
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void executeCommand("review-overnight-item", {
                    payload: { id: item.id, decision: "approve" },
                  })
                }
              >
                Approve
              </button>
            )}
            {item.status === "needs_review" && item.runId && (
              <button
                {...smallButtonProps}
                disabled={busy}
                onClick={() =>
                  void executeCommand("review-overnight-item", {
                    payload: { id: item.id, decision: "apply" },
                  })
                }
              >
                Apply
              </button>
            )}
            {!["done", "failed", "discarded"].includes(item.status) && (
              <button
                {...smallGhostButtonProps}
                disabled={busy}
                onClick={() =>
                  void executeCommand("review-overnight-item", {
                    payload: { id: item.id, decision: "discard" },
                  })
                }
              >
                Discard
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
    </section>
  );
}
