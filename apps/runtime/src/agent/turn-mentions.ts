import {
  consumeControlledAttachmentNavigation,
  retireControlledAttachmentNavigation,
  type ControlledAttachmentNavigationReceipt,
} from "../services/pages/controlled-navigation.js";
import { AuxError, MentionRefsSchema, type MentionRef } from "@aux/contracts";

type TabMention = Extract<MentionRef, { kind: "tab" }>;
export type MentionPage = Pick<TabMention, "pageId" | "url" | "documentEpoch" | "sessionId">;
export type MentionAccess = "read" | "act";
export type MentionAvailability = { status: "available" } | { status: "unavailable"; reason: string };
export class MentionUnavailable extends AuxError {
  readonly unavailable: Extract<MentionAvailability, { status: "unavailable" }>;
  constructor(reason: string) {
    super("permission_denied", reason);
    this.unavailable = { status: "unavailable", reason };
  }
}
export interface MentionAuthority {
  space(ref: Extract<MentionRef, { kind: "space" }>): readonly MentionPage[] | undefined;
  skill(ref: Extract<MentionRef, { kind: "skill" }>): boolean;
  connector(ref: Extract<MentionRef, { kind: "connector" }>): boolean;
}
type Turn = {
  refs: readonly MentionRef[];
  pages: Map<string, TabMention>;
  owned: Set<string>;
  navigation: Map<string, symbol>;
  privateTask: boolean;
};

/** Authority belongs to one active turn. A title change never changes authority. */
export class TurnMentions {
  private readonly turns = new Map<string, Turn>();
  constructor(
    private readonly page: (pageId: string) => MentionPage | undefined,
    private readonly authority?: MentionAuthority,
  ) {}

  begin(
    runId: string,
    raw: readonly MentionRef[],
    ownedPageIds: readonly string[] = [],
    context: { defaultPages?: readonly MentionPage[]; privateTask?: boolean } = {},
  ): void {
    if (this.turns.has(runId)) throw new Error("Mention turn is already active");
    const refs = MentionRefsSchema.parse(raw);
    const pages = new Map<string, TabMention>();
    for (const ref of refs) {
      if (ref.kind === "skill" && !this.authority?.skill(ref))
        throw new Error("This skill changed or is unavailable.");
      if (ref.kind === "connector" && !this.authority?.connector(ref))
        throw new Error("This connector is unavailable.");
      const space = ref.kind === "space" ? this.authority?.space(ref) : undefined;
      if (ref.kind === "space" && !space) throw new Error("This Space changed or is unavailable.");
      const tabs = space
        ? space.map((member) => ({ ...member, title: "", access: "read" as const, kind: "tab" as const }))
        : ref.kind === "tab"
          ? [ref]
          : ref.kind === "group"
            ? ref.members.map((member) => ({ ...member, kind: "tab" as const }))
            : [];
      for (const tab of tabs) {
        const previous = pages.get(tab.pageId);
        if (
          previous &&
          (previous.url !== tab.url ||
            previous.sessionId !== tab.sessionId ||
            previous.documentEpoch !== tab.documentEpoch)
        )
          throw new Error("Conflicting mention snapshots");
        pages.set(tab.pageId, previous?.access === "act" ? previous : tab);
      }
    }
    for (const page of context.defaultPages ?? [])
      if (!pages.has(page.pageId)) pages.set(page.pageId, { ...page, kind: "tab", title: "", access: "act" });
    for (const pageId of ownedPageIds) {
      if (pages.has(pageId)) continue;
      const page = this.page(pageId);
      if (!page) throw new MentionUnavailable("The run-created attachment is unavailable.");
      pages.set(pageId, { ...page, kind: "tab", title: "", access: "act" });
    }
    this.turns.set(runId, {
      refs,
      pages,
      owned: new Set(ownedPageIds),
      navigation: new Map(),
      privateTask: context.privateTask === true,
    });
  }

  end(runId: string): void {
    this.turns.delete(runId);
  }
  has(runId: string): boolean {
    return this.turns.has(runId);
  }
  clear(): void {
    this.turns.clear();
  }

  created(runId: string, pageId: string): void {
    const turn = this.turns.get(runId);
    if (!turn) throw new Error("Mention turn has ended");
    if (!turn.pages.has(pageId)) {
      const page = this.page(pageId);
      if (!page) throw new MentionUnavailable("The created attachment is unavailable.");
      turn.pages.set(pageId, { ...page, kind: "tab", title: "", access: "act" });
    }
    turn.owned.add(pageId);
  }
  ownedPages(runId: string): string[] {
    return [...(this.turns.get(runId)?.owned ?? [])];
  }

  require(runId: string, pageId: string, access: MentionAccess): MentionAvailability {
    const turn = this.turns.get(runId);
    if (!turn) return { status: "unavailable", reason: "The turn has ended." };
    if (turn.privateTask && !turn.owned.has(pageId))
      return { status: "unavailable", reason: "Private tasks can only use their isolated owned tabs." };
    const current = this.page(pageId);
    if (!current) return { status: "unavailable", reason: "This tab is closed." };
    const snapshot = turn.pages.get(pageId);
    if (!snapshot) return { status: "unavailable", reason: "Mention this tab before using it." };
    if (access === "act" && snapshot.access !== "act")
      return { status: "unavailable", reason: "This mention grants read access only." };
    if (
      current.sessionId !== snapshot.sessionId ||
      current.url !== snapshot.url ||
      current.documentEpoch !== snapshot.documentEpoch
    )
      return {
        status: "unavailable",
        reason: "This tab changed outside this turn. Mention it again to continue.",
      };
    return { status: "available" };
  }

  async withPage<T>(
    runId: string,
    pageId: string,
    access: MentionAccess,
    dispatch: () => Promise<T>,
  ): Promise<T | Extract<MentionAvailability, { status: "unavailable" }>> {
    const before = this.require(runId, pageId, access);
    if (before.status === "unavailable") return before;
    const turn = this.turns.get(runId);
    const result = await dispatch();
    if (this.turns.get(runId) !== turn)
      return { status: "unavailable", reason: "The turn changed while using this tab." };
    const after = this.require(runId, pageId, access);
    return after.status === "unavailable" ? after : result;
  }

  /** Only a dispatch-owned navigation receipt may advance an unchanged snapshot. */
  async navigate<T>(
    runId: string,
    pageId: string,
    dispatch: () => Promise<{ result: T; page: MentionPage }>,
  ): Promise<T | Extract<MentionAvailability, { status: "unavailable" }>> {
    const access = this.require(runId, pageId, "act");
    if (access.status === "unavailable") return access;
    const turn = this.turns.get(runId)!;
    if (turn.navigation.has(pageId))
      return { status: "unavailable", reason: "A navigation is already in progress." };
    const token = Symbol();
    turn.navigation.set(pageId, token);
    try {
      const { result, page } = await dispatch();
      const current = this.page(pageId);
      if (
        this.turns.get(runId) !== turn ||
        turn.navigation.get(pageId) !== token ||
        !current ||
        page.pageId !== pageId ||
        current.url !== page.url ||
        current.sessionId !== page.sessionId ||
        current.documentEpoch !== page.documentEpoch
      )
        return { status: "unavailable", reason: "The tab or turn changed during navigation." };
      const snapshot = turn.pages.get(pageId);
      if (snapshot) {
        if (page.sessionId !== snapshot.sessionId || page.documentEpoch <= snapshot.documentEpoch)
          return { status: "unavailable", reason: "Navigation did not produce a matching document receipt." };
        turn.pages.set(pageId, { ...snapshot, ...page });
      }
      return result;
    } finally {
      if (turn.navigation.get(pageId) === token) turn.navigation.delete(pageId);
    }
  }

  /** A real native command may replace its driver incarnation. Caller-shaped
   * page/session objects cannot advance this path: only the private completed
   * continuation token can be consumed against the original turn snapshot. */
  async navigateAttachment<T>(
    runId: string,
    pageId: string,
    dispatch: (
      mentionAuthority: () => void,
    ) => Promise<{ result: T; receipt?: ControlledAttachmentNavigationReceipt }>,
  ): Promise<T | Extract<MentionAvailability, { status: "unavailable" }>> {
    const access = this.require(runId, pageId, "act");
    if (access.status === "unavailable") return access;
    const turn = this.turns.get(runId)!;
    const original = this.page(pageId);
    if (!original || turn.navigation.has(pageId))
      return { status: "unavailable", reason: "The original navigation attachment is unavailable or busy." };
    const before = { ...original };
    const token = Symbol();
    turn.navigation.set(pageId, token);
    const mentionAuthority = () => {
      const snapshot = turn.pages.get(pageId);
      if (
        this.turns.get(runId) !== turn ||
        turn.navigation.get(pageId) !== token ||
        (snapshot &&
          (snapshot.url !== before.url ||
            snapshot.sessionId !== before.sessionId ||
            snapshot.documentEpoch !== before.documentEpoch))
      )
        throw new MentionUnavailable(
          "The original mentioned turn or snapshot changed during native navigation.",
        );
    };
    let originalReceipt: ControlledAttachmentNavigationReceipt | undefined;
    const refuse = async (
      reason: string,
    ): Promise<Extract<MentionAvailability, { status: "unavailable" }>> => {
      if (originalReceipt) await retireControlledAttachmentNavigation(originalReceipt);
      return { status: "unavailable", reason };
    };
    try {
      const { result, receipt } = await dispatch(mentionAuthority);
      originalReceipt = receipt;
      if (!receipt) {
        mentionAuthority();
        const current = this.page(pageId);
        if (
          !current ||
          current.sessionId !== before.sessionId ||
          current.url !== before.url ||
          current.documentEpoch !== before.documentEpoch
        )
          return await refuse("Input without a transition receipt changed its original attachment.");
        return result;
      }
      if (this.turns.get(runId) !== turn || turn.navigation.get(pageId) !== token)
        return await refuse("The turn changed during native navigation.");
      const page = consumeControlledAttachmentNavigation(receipt, runId, pageId, before, mentionAuthority);
      const current = this.page(pageId);
      if (
        !page ||
        !current ||
        page.sessionId === before.sessionId ||
        page.documentEpoch !== before.documentEpoch + 1 ||
        current.url !== page.url ||
        current.sessionId !== page.sessionId ||
        current.documentEpoch !== page.documentEpoch
      )
        return await refuse("Native navigation did not produce its original fresh attachment receipt.");
      const snapshot = turn.pages.get(pageId);
      if (snapshot) {
        if (
          snapshot.url !== before.url ||
          snapshot.sessionId !== before.sessionId ||
          snapshot.documentEpoch !== before.documentEpoch
        )
          return await refuse("The original mention snapshot changed during navigation.");
        turn.pages.set(pageId, { ...snapshot, ...page });
      }
      return result;
    } catch (error) {
      if (originalReceipt) {
        try {
          await retireControlledAttachmentNavigation(originalReceipt);
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Original mention attachment and retirement failed",
            { cause: error },
          );
        }
      }
      throw error;
    } finally {
      if (turn.navigation.get(pageId) === token) turn.navigation.delete(pageId);
    }
  }

  sourcePages(runId: string): readonly MentionPage[] {
    return [...(this.turns.get(runId)?.pages.values() ?? [])];
  }
  hasPageSelection(runId: string): boolean {
    return (
      this.turns
        .get(runId)
        ?.refs.some((ref) => ref.kind === "tab" || ref.kind === "group" || ref.kind === "space") ?? false
    );
  }
  selectedPages(runId: string): string[] {
    const turn = this.turns.get(runId);
    return turn
      ? [...turn.pages.keys()].filter((pageId) => this.require(runId, pageId, "read").status === "available")
      : [];
  }

  list(
    runId: string,
    pages: readonly { pageId: string; title: string; url: string }[],
  ): Array<{ pageId: string; title: string; url: string }> {
    const turn = this.turns.get(runId);
    if (!turn) return [];
    const all = turn.refs.some((ref) => ref.kind === "tabs");
    return pages
      .filter((page) => all || turn.pages.has(page.pageId) || turn.owned.has(page.pageId))
      .map(({ pageId, title, url }) => ({ pageId, title, url }));
  }

  grants(runId: string): { skills: string[]; connectors: string[] } {
    const refs = this.turns.get(runId)?.refs ?? [];
    return {
      skills: refs.flatMap((ref) =>
        ref.kind === "skill" && this.authority?.skill(ref) ? [ref.routineId] : [],
      ),
      connectors: refs.flatMap((ref) =>
        ref.kind === "connector" && this.authority?.connector(ref) ? [ref.connectorId] : [],
      ),
    };
  }
}
