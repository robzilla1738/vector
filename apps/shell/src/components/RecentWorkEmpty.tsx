import { shellIconPlusSm } from "./icons";

/** The home composer is already the empty chat state's primary action. */
export function RecentWorkEmpty({ view, onCreateTask }: {
  view: "chats" | "routines";
  onCreateTask(): void;
}) {
  return <div className={`home-empty home-empty-${view}`}>
    <p>{view === "chats" ? "Your conversations will appear here." : "Your saved routines will appear here."}</p>
    {view === "routines" && <button className="btn ghost" onClick={onCreateTask}>{shellIconPlusSm}Create a task</button>}
  </div>;
}
