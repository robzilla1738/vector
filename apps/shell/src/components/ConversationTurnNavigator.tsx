import type { KeyboardEvent } from "react";
import type { Run } from "@aux/contracts";
import { useStore } from "../store";
import { Tooltip } from "../ui/tooltip";
import { ConversationViewAction } from "./ConversationViewControls";
import "./ConversationTurnNavigator.css";

export function ConversationTurnNavigator({
  turns,
  activeTurn,
  current,
  reveal,
}: {
  turns: readonly Run[];
  activeTurn?: string;
  current(): boolean;
  reveal(runId: string): void;
}) {
  if (turns.length < 2) return null;
  const active = turns.some((turn) => turn.runId === activeTurn) ? activeTurn : turns.at(-1)?.runId;
  const navigate = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : event.key === "ArrowUp"
            ? Math.max(0, index - 1)
            : event.key === "ArrowDown"
              ? Math.min(buttons.length - 1, index + 1)
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    buttons[next]?.focus();
  };
  return (
    <nav className="conversation-turn-nav" aria-label="Turn navigation" onKeyDown={navigate}>
      {turns.map((turn, index) => (
        <Tooltip
          key={turn.runId}
          content={turn.goal.length > 240 ? `${turn.goal.slice(0, 240)}…` : turn.goal}
        >
          {(descriptionId) => (
            <ConversationViewAction
              command="jump-conversation-to-turn"
              current={() => current() && useStore.getState().runs.includes(turn)}
              aria-label={`Jump to loaded turn ${index + 1}: ${turn.goal.slice(0, 160)}`}
              aria-describedby={descriptionId}
              aria-current={turn.runId === active ? "location" : undefined}
              tabIndex={turn.runId === active ? 0 : -1}
              invoke={() => reveal(turn.runId)}
            >
              <span aria-hidden="true" />
            </ConversationViewAction>
          )}
        </Tooltip>
      ))}
    </nav>
  );
}
