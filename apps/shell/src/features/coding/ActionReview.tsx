import { useState } from "react";
import type { SafetyAction } from "@aux/contracts";
type Action = NonNullable<SafetyAction["reviewedActions"]>[number];
export function ActionReview({ actions }: { actions: Action[] }) {
  return (
    <ol>
      {actions.map((action, index) => (
        <li key={index}>
          <ReviewedAction action={action} />
        </li>
      ))}
    </ol>
  );
}
function ReviewedAction({ action }: { action: Action }) {
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState(false);
  const truncated = !full && action.arguments.length > 65536;
  return (
    <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary>
        {action.action} {action.target}
      </summary>
      <p>{action.destination}</p>
      {expanded && (
        <>
          <pre>{truncated ? action.arguments.slice(0, 65536) : action.arguments}</pre>
          {truncated && (
            <button type="button" onClick={() => setFull(true)}>
              Showing first 64 KiB · Load full action
            </button>
          )}
        </>
      )}
    </details>
  );
}
