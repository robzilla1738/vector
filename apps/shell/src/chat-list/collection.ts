import type { ConversationSummary, RpcArgs } from "@aux/contracts";

export type ConversationQuery = {
  archived: boolean;
  query?: string;
  workspaceId?: string;
  policy: "complete" | "paged" | "preview";
  previewLimit?: 3 | 5 | 10;
};
export type ConversationCollectionState = {
  byId: Readonly<Record<string, ConversationSummary>>;
  ids: readonly string[];
  loading: boolean;
  more: boolean;
  error: string;
};
type PageReader = (params: NonNullable<RpcArgs<"conversations.list">[0]>) => Promise<ConversationSummary[]>;
const initial = (): ConversationCollectionState => ({
  byId: Object.create(null),
  ids: [],
  loading: true,
  more: false,
  error: "",
});
export const conversationCursor = (item: ConversationSummary) => ({
  updatedAt: item.updatedAt,
  chatId: item.chatId,
});

function sameData(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(right);
  return (
    keys.length === Object.keys(left).length &&
    keys.every((key) => Object.hasOwn(left, key) && sameData(Reflect.get(left, key), Reflect.get(right, key)))
  );
}

/** One paginated producer for sidebar organization, history, archive and Home. */
export class ConversationCollection {
  private state: ConversationCollectionState;
  private listeners = new Set<() => void>();
  private sequence = 0;
  private active = false;
  private loading = false;
  private retryMode: "reset" | "refresh" | "append" = "reset";
  constructor(
    readonly query: ConversationQuery,
    private read: PageReader,
    private admitted: () => boolean,
    initiallyLoading = true,
  ) {
    this.state = { ...initial(), loading: initiallyLoading };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  start() {
    this.active = true;
  }
  stop() {
    this.active = false;
    ++this.sequence;
    this.loading = false;
  }
  current() {
    if (!this.active) return false;
    if (!this.admitted()) {
      this.stop();
      return false;
    }
    return true;
  }
  private publish(patch: Partial<ConversationCollectionState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
  invalidate() {
    ++this.sequence;
    this.loading = false;
    this.publish({ loading: false });
  }
  remove(chatId: string) {
    if (!Object.hasOwn(this.state.byId, chatId)) return;
    const byId = Object.assign(Object.create(null), this.state.byId);
    delete byId[chatId];
    this.publish({ byId, ids: this.state.ids.filter((id) => id !== chatId) });
  }
  update(item: ConversationSummary) {
    if (!Object.hasOwn(this.state.byId, item.chatId)) return;
    const byId = Object.assign(Object.create(null), this.state.byId);
    byId[item.chatId] = item;
    this.publish({ byId });
  }
  retry = () => this.load(this.retryMode);
  async load(mode: "reset" | "refresh" | "append" = "reset") {
    if (!this.current() || (this.loading && mode === "append")) return;
    const version = ++this.sequence;
    this.loading = true;
    this.retryMode = mode;
    this.publish({ loading: true, error: "" });
    const current = () => this.current() && version === this.sequence;
    const complete = this.query.policy === "complete";
    const pageSize = this.query.policy === "preview" ? (this.query.previewLimit ?? 3) : 40;
    const target = complete
      ? Infinity
      : mode === "refresh"
        ? Math.max(pageSize, this.state.ids.length)
        : pageSize;
    const found: ConversationSummary[] = [];
    let before =
      mode === "append" && this.state.ids.length
        ? conversationCursor(this.state.byId[this.state.ids.at(-1)!]!)
        : undefined;
    try {
      for (;;) {
        if (!current()) return;
        const limit = complete
          ? 200
          : Math.min(200, target + (this.query.policy === "paged" ? 1 : 0) - found.length);
        const page = await this.read({
          archived: this.query.archived,
          limit,
          ...(this.query.query ? { query: this.query.query } : {}),
          ...(this.query.workspaceId ? { workspaceId: this.query.workspaceId } : {}),
          ...(before ? { before } : {}),
        });
        if (!current()) return;
        found.push(...page);
        if (
          page.length < limit ||
          !page.length ||
          (!complete && found.length >= target + (this.query.policy === "paged" ? 1 : 0))
        )
          break;
        const next = conversationCursor(page.at(-1)!);
        if (before && next.updatedAt === before.updatedAt && next.chatId === before.chatId)
          throw new Error("Conversation history did not advance. Retry to refresh the list.");
        before = next;
      }
      const selected = found.slice(0, target);
      const byId: Record<string, ConversationSummary> = Object.assign(
        Object.create(null),
        mode === "append" ? this.state.byId : {},
      );
      const ids = mode === "append" ? [...this.state.ids] : [];
      for (const item of selected) {
        if (!byId[item.chatId]) ids.push(item.chatId);
        // Preserve unchanged entities, so refreshes retain row identity and focus.
        const previous = this.state.byId[item.chatId];
        byId[item.chatId] = previous && sameData(previous, item) ? previous : item;
      }
      const sameOrder =
        ids.length === this.state.ids.length && ids.every((id, index) => id === this.state.ids[index]);
      const sameEntities = sameOrder && ids.every((id) => byId[id] === this.state.byId[id]);
      this.publish({
        byId: sameEntities ? this.state.byId : byId,
        ids: sameOrder ? this.state.ids : ids,
        more: !complete && this.query.policy === "paged" && found.length > target,
      });
    } catch (reason) {
      if (current()) this.publish({ error: reason instanceof Error ? reason.message : String(reason) });
    } finally {
      if (current()) {
        this.loading = false;
        this.publish({ loading: false });
      }
    }
  }
}
