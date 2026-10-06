import type { OrganizationPersistence } from "./store/organization-persistence";
import { revertTidyRecord } from "./tidy-layout";
import type { Layout, TidyUndoRecord } from "./workspace";

/** A reviewed Tidy result becomes visible only after Profile organization confirms the write. */
export async function commitTidyLayout(input: {
  before: Layout;
  after: Layout;
  current(): Layout;
  persist(layout: Layout): void;
  flush(): Promise<void>;
  publish(layout: Layout): void;
}): Promise<void> {
  const changed = () =>
    new Error("Tabs changed while saving this Tidy change. Review them before trying again.");
  if (input.current() !== input.before) throw changed();
  input.persist(input.after);
  try {
    await input.flush();
  } catch (error) {
    // A failed host write remains queued for retry. Replace that queue with
    // the prior layout so a later retry cannot silently apply a failed review.
    input.persist(input.before);
    await input.flush().catch(() => {});
    throw error;
  }
  const latest = input.current();
  if (latest !== input.before) {
    input.persist(latest);
    await input.flush();
    throw changed();
  }
  input.publish(input.after);
}

/** Flush queued edits, re-read the host, and undo only while that Tidy state is still current. */
export async function undoTidyChange(
  session: Pick<OrganizationPersistence, "flush" | "refresh" | "commitReviewed">,
  receipt: TidyUndoRecord,
): Promise<Layout> {
  await session.flush();
  const reviewed = await session.refresh();
  const restored = revertTidyRecord(receipt, reviewed);
  await session.commitReviewed(reviewed, restored);
  return restored;
}
