import { Zap } from "../ui/icons";

/** Home owns the chat composer; its section header opens routine management. */
export function RecentWorkEmpty({ view }: { view: "chats" | "routines" }) {
  return (
    <div className={`home-empty home-empty-${view}`}>
      {view === "routines" ? (
        <>
          <span className="home-empty-icon" aria-hidden>
            <Zap width={20} height={20} />
          </span>
          <h3>No routines</h3>
          <p>Let Aux handle the tasks you do on repeat.</p>
        </>
      ) : (
        <p>Your conversations will appear here.</p>
      )}
    </div>
  );
}
