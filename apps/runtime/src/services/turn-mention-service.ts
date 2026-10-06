import {
  retireControlledAttachmentNavigation,
  finalizeControlledAttachmentNavigation,
  type ControlledAttachmentNavigationReceipt,
} from "./pages/controlled-navigation.js";
import type { ValidatedTaskRead } from "@aux/contracts";
import {
  MentionRefsSchema,
  type ConnectorCatalog,
  type MentionRef,
  type ProfileOrganizationSnapshot,
  type PageTarget,
  type Routine,
} from "@aux/contracts";
import {
  TurnMentions,
  MentionUnavailable,
  type MentionAccess,
  type MentionAvailability,
  type MentionPage,
} from "../agent/turn-mentions.js";
export interface MentionContext {
  workspaceId?: string;
  taskId?: string;
  taskRevision?: number;
}
export interface TurnMentionDependencies {
  prepareReadPage?(pageId: string): Promise<void>;
  page(pageId: string): PageTarget | undefined;
  authorizeRead?(runId: string, pageId: string, taskRead?: ValidatedTaskRead): Promise<() => void>;
  organization(): Promise<ProfileOrganizationSnapshot>;
  routine(routineId: string): Routine | undefined;
  connectors(context: MentionContext): ConnectorCatalog;
}
type Active = {
  token: symbol;
  authority: TurnMentions;
  refs: MentionRef[];
  context: MentionContext;
  organization?: ProfileOrganizationSnapshot;
};

/** Profile-owned, active-turn authority. Persisted refs are instructions to validate, never grants by themselves. */
export class TurnMentionService {
  private turns = new Map<string, Active>();
  private starts = new Map<string, symbol>();
  constructor(private readonly deps: TurnMentionDependencies) {}
  private page = (pageId: string): MentionPage | undefined => {
    const page = this.deps.page(pageId);
    if (!page?.sessionId || page.viewStatus === "detached" || page.viewStatus === "crashed") return undefined;
    return {
      pageId: page.pageId,
      url: page.url,
      documentEpoch: page.documentEpoch,
      sessionId: page.sessionId,
    };
  };
  async begin(
    runId: string,
    raw: readonly MentionRef[],
    ownedPageIds: readonly string[],
    context: MentionContext = {},
  ) {
    this.end(runId);
    const token = Symbol();
    this.starts.set(runId, token);
    try {
      const refs = MentionRefsSchema.parse(raw);
      const organization = refs.some((ref) => ref.kind === "space")
        ? await this.deps.organization()
        : undefined;
      if (this.starts.get(runId) !== token) throw new Error("This turn ended while resolving its sources.");
      const selected = new Set<string>();
      for (const ref of refs) {
        if (ref.kind === "tab") selected.add(ref.pageId);
        if (ref.kind === "group") for (const member of ref.members) selected.add(member.pageId);
        if (ref.kind === "space")
          for (const [pageId, spaceId] of Object.entries(organization?.shared?.tabSpace ?? {}))
            if (spaceId === ref.spaceId) selected.add(pageId);
      }
      if (this.deps.prepareReadPage && selected.size) {
        await Promise.all([...selected].map((pageId) => this.deps.prepareReadPage!(pageId)));
        if (this.starts.get(runId) !== token)
          throw new MentionUnavailable("This turn changed while preparing its sources.");
      }
      const active: Active = {
        token,
        authority: new TurnMentions(this.page, {
          space: (ref) => {
            const snapshot = active.organization;
            const shared = snapshot?.shared;
            const space = shared?.spaces.find((space) => space.id === ref.spaceId && !space.archived);
            if (
              !space ||
              !shared ||
              snapshot?.revision !== ref.revision ||
              space.workspaceId !== ref.workspaceId
            )
              return undefined;
            const ids = Object.keys(shared.tabSpace).filter(
              (pageId) => shared.tabSpace[pageId] === ref.spaceId,
            );
            const pages = ids.map(this.page);
            return pages.some((page) => !page)
              ? undefined
              : pages.filter((page): page is MentionPage => !!page);
          },
          skill: (ref) => {
            const routine = this.deps.routine(ref.routineId);
            return !!routine && !routine.archivedAt && routine.revision === ref.revision;
          },
          connector: (ref) =>
            !!active.context.workspaceId &&
            this.deps
              .connectors(active.context)
              .entries.some(
                (entry) =>
                  entry.connectorId === ref.connectorId &&
                  entry.state === "active",
              ),
        }),
        refs,
        context,
        organization,
      };
      active.authority.begin(runId, refs, ownedPageIds);
      this.turns.set(runId, active);
      return { refs: active.refs, token };
    } finally {
      if (this.starts.get(runId) === token) this.starts.delete(runId);
    }
  }
  async acknowledge<T>(
    runId: string,
    refs: readonly MentionRef[],
    ownedPageIds: readonly string[],
    context: MentionContext,
    commit: (validated: readonly MentionRef[]) => T,
  ): Promise<T> {
    const started = await this.begin(runId, refs, ownedPageIds, context);
    if (this.turns.get(runId)?.token !== started.token)
      throw new MentionUnavailable("This turn changed before its message was acknowledged.");
    const token = started.token;
    try {
      return commit(started.refs);
    } catch (error) {
      this.endIfCurrent(runId, token);
      throw error;
    }
  }
  end(runId: string) {
    this.starts.delete(runId);
    this.turns.get(runId)?.authority.end(runId);
    this.turns.delete(runId);
  }
  endIfCurrent(runId: string, token: symbol) {
    if (this.turns.get(runId)?.token === token) this.end(runId);
  }
  clear() {
    for (const id of new Set([...this.starts.keys(), ...this.turns.keys()])) this.end(id);
  }
  has(runId: string) {
    return this.turns.has(runId);
  }
  selectedPages(runId: string): string[] {
    return this.turns.get(runId)?.authority.selectedPages(runId) ?? [];
  }
  ownedPages(runId: string): string[] {
    return this.turns.get(runId)?.authority.ownedPages(runId) ?? [];
  }
  created(runId: string, pageId: string) {
    const active = this.turns.get(runId);
    if (!active) throw new Error("This turn has ended.");
    active.authority.created(runId, pageId);
  }
  private async refresh(runId: string): Promise<Active | undefined> {
    const active = this.turns.get(runId);
    if (!active) return undefined;
    if (active.refs.some((ref) => ref.kind === "space")) {
      const current = await this.deps.organization();
      if (this.turns.get(runId) !== active) return undefined;
      active.organization = current;
      if (
        active.refs.some(
          (ref) =>
            ref.kind === "space" &&
            (current.revision !== ref.revision ||
              !current.shared?.spaces.some(
                (space) =>
                  space.id === ref.spaceId && !space.archived && space.workspaceId === ref.workspaceId,
              )),
        )
      )
        return undefined;
    }
    return active;
  }
  async require(runId: string, pageId: string, access: MentionAccess): Promise<MentionAvailability> {
    const active = await this.refresh(runId);
    const unavailable: MentionAvailability = {
      status: "unavailable",
      reason: "This turn or its Space snapshot changed. Mention the sources again.",
    };
    if (!active) return unavailable;
    const initial = active.authority.require(runId, pageId, access);
    if (initial.status === "unavailable") return initial;
    if (access === "read" && this.deps.prepareReadPage) await this.deps.prepareReadPage(pageId);
    return this.turns.get(runId) === active ? active.authority.require(runId, pageId, access) : unavailable;
  }

  capture(runId: string): symbol {
    const active = this.turns.get(runId);
    if (!active) throw new MentionUnavailable("This turn has ended.");
    return active.token;
  }
  async assert(runId: string, pageId: string, access: MentionAccess, expectedTurn?: symbol): Promise<void> {
    const active = this.turns.get(runId);
    const result = await this.require(runId, pageId, access);
    if (!active || this.turns.get(runId) !== active || (expectedTurn && active.token !== expectedTurn))
      throw new MentionUnavailable("This turn changed while checking its sources.");
    if (result.status === "unavailable") throw new MentionUnavailable(result.reason);
  }
  async use<T>(
    runId: string,
    pageId: string,
    access: MentionAccess,
    dispatch: () => Promise<T>,
    taskRead?: ValidatedTaskRead,
  ): Promise<T> {
    const active = this.turns.get(runId);
    await this.assert(runId, pageId, access, active?.token);
    if (!active || this.turns.get(runId) !== active)
      throw new MentionUnavailable("The turn changed before using this tab.");
    const recheckPolicy =
      access === "read" ? await this.deps.authorizeRead?.(runId, pageId, taskRead) : undefined;
    await this.assert(runId, pageId, access, active.token);
    recheckPolicy?.();
    const result = await dispatch();
    recheckPolicy?.();
    if (!active || this.turns.get(runId) !== active)
      throw new MentionUnavailable("The turn changed while using this tab.");
    await this.assert(runId, pageId, access, active.token);
    return result;
  }
  /** Compose current producer-owned page authority with an explicit person's narrower turn selection.
   * The synchronous source check must come from the real task/lease owner, never tool input.
   */
  async useSourcePage<T>(
    runId: string,
    pageId: string,
    access: MentionAccess,
    checkSource: () => void,
    dispatch: () => Promise<T>,
  ): Promise<T> {
    const active = this.turns.get(runId);
    if (!active) throw new MentionUnavailable("This turn has ended.");
    checkSource();
    if (active.refs.length || active.authority.ownedPages(runId).includes(pageId)) {
      const result = await this.use(runId, pageId, access, dispatch);
      checkSource();
      return result;
    }
    if (access === "read" && this.deps.prepareReadPage) {
      await this.deps.prepareReadPage(pageId);
      if (this.turns.get(runId) !== active)
        throw new MentionUnavailable("This turn ended while preparing its source.");
      checkSource();
    }
    const before = this.page(pageId);
    if (!before) throw new MentionUnavailable("The authorized source attachment is unavailable.");
    const recheckPolicy = access === "read" ? await this.deps.authorizeRead?.(runId, pageId) : undefined;
    checkSource();
    const ready = this.page(pageId);
    if (
      this.turns.get(runId) !== active ||
      !ready ||
      ready.sessionId !== before.sessionId ||
      (access === "read" && (ready.url !== before.url || ready.documentEpoch !== before.documentEpoch))
    )
      throw new MentionUnavailable("This turn or source changed while authorizing its read.");
    recheckPolicy?.();
    const result = await dispatch();
    recheckPolicy?.();
    if (this.turns.get(runId) !== active)
      throw new MentionUnavailable("This turn changed while using its approved source.");
    checkSource();
    const current = this.page(pageId);
    if (
      !current ||
      current.sessionId !== before.sessionId ||
      (access === "read" && (current.url !== before.url || current.documentEpoch !== before.documentEpoch))
    )
      throw new MentionUnavailable("The approved source document changed while using it.");
    return result;
  }
  /** Transport retains reviewed tool-grant semantics, including legitimate single-use consumption. */
  async useConnector<T>(
    runId: string,
    connectorId: string,
    toolName: string | undefined,
    dispatch: () => Promise<T>,
  ): Promise<T> {
    const active = this.turns.get(runId);
    const permission = this.requireConnector(runId, connectorId, toolName);
    if (!active || permission.status === "unavailable")
      throw new MentionUnavailable(
        permission.status === "unavailable" ? permission.reason : "This turn ended.",
      );
    const result = await dispatch();
    if (this.turns.get(runId) !== active || !active.authority.grants(runId).connectors.includes(connectorId))
      throw new MentionUnavailable("This turn or its connector changed during the tool call.");
    return result;
  }
  /** Only current routine bodies are exposed; mention refs never grant plugin capabilities. */
  skills(runId: string): Routine[] {
    const active = this.turns.get(runId);
    if (!active) return [];
    const ids = active.authority.grants(runId).skills;
    if (active.refs.some((ref) => ref.kind === "skill" && !ids.includes(ref.routineId)))
      throw new MentionUnavailable("A mentioned skill changed. Mention its current revision again.");
    return ids.flatMap((id) => {
      const routine = this.deps.routine(id);
      return routine ? [routine] : [];
    });
  }
  async withPage<T>(
    runId: string,
    pageId: string,
    access: MentionAccess,
    dispatch: () => Promise<T>,
  ): Promise<T | Extract<MentionAvailability, { status: "unavailable" }>> {
    try {
      return await this.use(runId, pageId, access, dispatch);
    } catch (error) {
      if (error instanceof MentionUnavailable) return error.unavailable;
      throw error;
    }
  }
  async navigate<T>(
    runId: string,
    pageId: string,
    dispatch: () => Promise<{ result: T; page: MentionPage }>,
  ): Promise<T | Extract<MentionAvailability, { status: "unavailable" }>> {
    const active = await this.refresh(runId);
    if (!active) return { status: "unavailable", reason: "This turn or its Space snapshot changed." };
    const result = await active.authority.navigate(runId, pageId, dispatch);
    return (await this.refresh(runId)) === active
      ? result
      : { status: "unavailable", reason: "This turn or its Space snapshot changed during navigation." };
  }
  async navigateUse<T>(
    runId: string,
    pageId: string,
    dispatch: () => Promise<{ result: T; page: MentionPage }>,
  ): Promise<T> {
    const outcome = await this.navigate(runId, pageId, async () => {
      const receipt = await dispatch();
      return { result: { value: receipt.result }, page: receipt.page };
    });
    if ("status" in outcome) throw new MentionUnavailable(outcome.reason);
    return outcome.value;
  }
  async navigateAttachmentUse<T>(
    runId: string,
    pageId: string,
    dispatch: (
      mentionAuthority: () => void,
      revalidateMentionSource: () => Promise<void>,
    ) => Promise<{ result: T; receipt: ControlledAttachmentNavigationReceipt }>,
  ): Promise<T> {
    const active = await this.refresh(runId);
    if (!active) throw new MentionUnavailable("This turn or its Space snapshot changed.");
    const revalidateMentionSource = async () => {
      if ((await this.refresh(runId)) !== active)
        throw new MentionUnavailable(
          "This turn or its Space snapshot changed before attachment publication.",
        );
    };
    let originalReceipt: ControlledAttachmentNavigationReceipt | undefined;
    try {
      const outcome = await active.authority.navigateAttachment(runId, pageId, async (mentionAuthority) => {
        const receipt = await dispatch(mentionAuthority, revalidateMentionSource);
        originalReceipt = receipt.receipt;
        await revalidateMentionSource();
        return { result: { value: receipt.result }, receipt: receipt.receipt };
      });
      await revalidateMentionSource();
      if ("status" in outcome) throw new MentionUnavailable(outcome.reason);
      finalizeControlledAttachmentNavigation(originalReceipt!);
      return outcome.value;
    } catch (error) {
      if (originalReceipt) {
        try {
          await retireControlledAttachmentNavigation(originalReceipt);
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Original mention navigation and retirement failed",
            { cause: error },
          );
        }
      }
      throw error;
    }
  }
  list(runId: string, pages: readonly { pageId: string; title: string; url: string }[]) {
    return this.turns.get(runId)?.authority.list(runId, pages) ?? [];
  }
  requireSkill(runId: string, routineId: string): MentionAvailability {
    return this.turns.get(runId)?.authority.grants(runId).skills.includes(routineId)
      ? { status: "available" }
      : { status: "unavailable", reason: "Mention this current skill before using it." };
  }
  requireConnector(runId: string, connectorId: string, toolName?: string): MentionAvailability {
    const active = this.turns.get(runId);
    if (!active || !active.authority.grants(runId).connectors.includes(connectorId))
      return { status: "unavailable", reason: "Mention this connector before using it." };
    const catalog = this.deps.connectors(active.context);
    const authorized = catalog.access.some(
      (grant) =>
        grant.connectorId === connectorId && (grant.kind === "calendar" || grant.toolName === toolName),
    );
    return authorized
      ? { status: "available" }
      : { status: "unavailable", reason: "Connect this server and enable the tool for the current task." };
  }
}
