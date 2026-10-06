import { shellIconPlusSm } from "./icons";
import { staticGhostButtonProps as auxClassGhostButtonProps } from "../ui/class-props";

/** The home composer is already the empty chat state's primary action. */
export function RecentWorkEmpty({
  view,
  onCreateTask,
}: {
  view: "chats" | "routines";
  onCreateTask(): void;
}) {
  return (
    <div className={`home-empty home-empty-${view}`}>
      <p>
        {view === "chats" ? "Your conversations will appear here." : "Your saved routines will appear here."}
      </p>
      {view === "routines" && (
        <button {...auxClassGhostButtonProps} onClick={onCreateTask}>
          {shellIconPlusSm}Create a task
        </button>
      )}
    </div>
  );
}
