import type { Layout } from "./workspace";

/** A reviewed Tidy result becomes visible only after Profile organization confirms the write. */
export async function commitTidyLayout(input: {
  before: Layout;
  after: Layout;
  current(): Layout;
  persist(layout: Layout): void;
  flush(): Promise<void>;
  publish(layout: Layout): void;
}): Promise<void> {
  const changed = () => new Error("Tabs changed while saving this Tidy change. Review them before trying again.");
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
