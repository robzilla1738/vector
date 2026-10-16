import { browserContextPage } from "./browser-context-page.js";
import type { TurnSourceContext } from "@aux/contracts/turn-source-context";
import {
  retireControlledAttachmentNavigation,
  finalizeControlledAttachmentNavigation,
  type ControlledAttachmentNavigationReceipt,
} from "./pages/controlled-navigation.js";
import type { ValidatedTaskRead } from "@aux/contracts";
import {
  AuxError,
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
  nativeTurnContext?: string;
  privateTask?: boolean;
  /** Trusted engine source binding for narrower children; never RPC arguments. */
  sourcePageIds?: readonly string[];
}
export interface TurnMentionDependencies {
  /** Set only by the admitted native OTR runtime, never by a turn request. */
  privateBrowserProfile?: boolean;
  prepareReadPage?(pageId: string): Promise<void>;
  page(pageId: string): PageTarget | undefined;
  authorizeRead?(runId: string, pageId: string, taskRead?: ValidatedTaskRead): Promise<() => void>;
  organization(): Promise<ProfileOrganizationSnapshot>;
  turnSourceContext?(token: string): Promise<TurnSourceContext>;
  routine(routineId: string): Routine | undefined;
  connectors(context: MentionContext): ConnectorCatalog;
}
type Active = {
  token: symbol;
  authority: TurnMentions;
  refs: MentionRef[];
  context: MentionContext;
  organization?: ProfileOrganizationSnapshot;
  sourceContext?: TurnSourceContext;
  currentSourceContext?: TurnSourceContext;
  defaultPageIds: Set<string>;
  unavailableImplicitPages: string[];
};

/** Profile-owned, active-turn authority. Persisted refs are instructions to validate, never grants by themselves. */
export class TurnMentionService {
  private turns = new Map<string, Active>();
  private starts = new Map<string, symbol>();
  constructor(private readonly deps: TurnMentionDependencies) {}
  private page = (pageId: string): MentionPage | undefined => {
    const page = browserContextPage(() => this.deps.page(pageId));
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
      const hasPageSelection = refs.some(
        (ref) => ref.kind === "tab" || ref.kind === "group" || ref.kind === "space",
      );
      const sourceContext = context.nativeTurnContext
        ? await this.sourceContext(context.nativeTurnContext)
        : undefined;
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
      const defaults = new Set<string>();
      if (!hasPageSelection) {
        if (context.sourcePageIds) for (const pageId of context.sourcePageIds) defaults.add(pageId);
        else if (sourceContext) {
          if (sourceContext.activePageId) defaults.add(sourceContext.activePageId);
          const spaceId = sourceContext.layout?.window.activeSpaceId;
          if (
            spaceId &&
            sourceContext.layout?.shared.spaces.some((space) => space.id === spaceId && !space.archived)
          )
            for (const [pageId, memberSpace] of Object.entries(sourceContext.layout.shared.tabSpace))
              if (memberSpace === spaceId) defaults.add(pageId);
        }
      }
      for (const pageId of defaults) {
        const page = browserContextPage(() => this.deps.page(pageId));
        // A window's ordinary New Tab/Settings pages are not website context.
        // Explicit and restored selections still go through their strict reader checks.
        if (!context.sourcePageIds && sourceContext) {
          let website = false;
          try {
            const url = new URL(page?.url ?? "");
            website = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
          } catch {
            // An incomplete/internal address cannot provide implicit website context.
          }
          if (!website) {
            defaults.delete(pageId);
            continue;
          }
        }
        if (page) selected.add(pageId);
      }
      const unavailableImplicitPages: string[] = [];
      if (
        this.deps.prepareReadPage &&
        selected.size &&
        (!context.privateTask || this.deps.privateBrowserProfile)
      ) {
        await Promise.all(
          [...selected].map(async (pageId) => {
            try {
              await this.deps.prepareReadPage!(pageId);
            } catch (error) {
              if (
                !hasPageSelection &&
                !context.sourcePageIds &&
                defaults.has(pageId) &&
                error instanceof AuxError &&
                error.code === "ref_stale"
              ) {
                defaults.delete(pageId);
                unavailableImplicitPages.push(pageId);
                return;
              }
              throw error;
            }
          }),
        );
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
              .entries.some((entry) => entry.connectorId === ref.connectorId && entry.state === "active"),
        }),
        refs,
        context,
        organization,
        sourceContext,
        currentSourceContext: sourceContext,
        defaultPageIds: defaults,
        unavailableImplicitPages,
      };
      active.authority.begin(runId, refs, ownedPageIds, {
        defaultPages: [...defaults].map(this.page).filter((page): page is MentionPage => !!page),
        privateTask: context.privateTask && !this.deps.privateBrowserProfile,
      });
      if (context.privateTask)
        for (const source of active.authority.sourcePages(runId)) {
          const current = this.page(source.pageId);
          if (
            !current ||
            current.url !== source.url ||
            current.documentEpoch !== source.documentEpoch ||
            current.sessionId !== source.sessionId
          )
            throw new MentionUnavailable(
              "The private task source changed before its isolated tabs were created.",
            );
        }
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
  sourcePages(runId: string): readonly MentionPage[] {
    return this.turns.get(runId)?.authority.sourcePages(runId) ?? [];
  }
  hasPageSelection(runId: string): boolean {
    return this.turns.get(runId)?.authority.hasPageSelection(runId) ?? false;
  }
  /** An answer may retain its unchanged selection without reopening a person reader under the run's lease. */
  async revalidateSelection(runId: string): Promise<void> {
    const active = await this.refresh(runId);
    if (!active) throw new MentionUnavailable("The original answer source changed.");
    for (const source of active.authority.sourcePages(runId)) {
      if (!this.defaultScopeCurrent(active, source.pageId, runId))
        throw new MentionUnavailable("The original window's selected source Space changed.");
      const current = active.authority.require(runId, source.pageId, "read");
      if (current.status === "unavailable") throw new MentionUnavailable(current.reason);
    }
  }

  async assertRestartOwner(runId: string): Promise<void> {
    const active = await this.refresh(runId);
    if (!active) throw new MentionUnavailable("The restored native source changed.");
    const source = active.currentSourceContext;
    if (!source) throw new MentionUnavailable("A current native Aux owner is required.");
    const workspace = active.context.workspaceId;
    const selected = source.layout?.window.activeSpaceId;
    if (
      workspace &&
      !source.layout?.shared.spaces.some(
        (space) => space.id === selected && !space.archived && space.workspaceId === workspace,
      )
    )
      throw new MentionUnavailable("Continue from the original workspace.");
    for (const pageId of active.context.sourcePageIds ?? []) {
      const page = this.deps.page(pageId);
      if (page?.windowId && page.windowId !== source.windowId)
        throw new MentionUnavailable("The original source pages belong to another Aux window.");
    }
  }

  private async sourceContext(token: string) {
    if (!this.deps.turnSourceContext)
      throw new MentionUnavailable("Original window source authority is unavailable.");
    return this.deps.turnSourceContext(token);
  }
  unavailableImplicitPages(runId: string): readonly string[] {
    return this.turns.get(runId)?.unavailableImplicitPages ?? [];
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
    if (active.context.nativeTurnContext) {
      const current = await this.sourceContext(active.context.nativeTurnContext);
      if (this.turns.get(runId) !== active || current.windowId !== active.sourceContext?.windowId)
        return undefined;
      active.currentSourceContext = current;
    }
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
  private defaultScopeCurrent(active: Active, pageId: string, runId: string): boolean {
    if (
      !active.defaultPageIds.has(pageId) ||
      active.context.sourcePageIds ||
      active.authority.ownedPages(runId).includes(pageId)
    )
      return true;
    const original = active.sourceContext,
      current = active.currentSourceContext;
    const spaceId = original?.layout?.window.activeSpaceId;
    if (!spaceId) return current?.activePageId === original?.activePageId;
    if (current?.layout?.window.activeSpaceId !== spaceId) return false;
    return original?.layout?.shared.tabSpace[pageId] === spaceId
      ? current?.layout?.shared.tabSpace[pageId] === spaceId
      : pageId === original?.activePageId && current?.activePageId === pageId;
  }
  async require(runId: string, pageId: string, access: MentionAccess): Promise<MentionAvailability> {
    const active = await this.refresh(runId);
    const unavailable: MentionAvailability = {
      status: "unavailable",
      reason: "This turn or its Space snapshot changed. Mention the sources again.",
    };
    if (!active) return unavailable;
    if (!this.defaultScopeCurrent(active, pageId, runId))
      return { status: "unavailable", reason: "The original window’s selected source Space changed." };
    const initial = active.authority.require(runId, pageId, access);
    if (initial.status === "unavailable") return initial;
    if (access === "read" && this.deps.prepareReadPage) await this.deps.prepareReadPage(pageId);
    if ((await this.refresh(runId)) !== active || !this.defaultScopeCurrent(active, pageId, runId))
      return unavailable;
    return active.authority.require(runId, pageId, access);
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
    const active = await this.refresh(runId);
    if (!active) throw new MentionUnavailable("This turn has ended.");
    checkSource();
    if (
      active.authority.hasPageSelection(runId) ||
      active.authority.ownedPages(runId).includes(pageId) ||
      active.context.privateTask
    ) {
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
    if ((await this.refresh(runId)) !== active)
      throw new MentionUnavailable("Original source window retired before dispatch.");
    recheckPolicy?.();
    const result = await dispatch();
    recheckPolicy?.();
    if ((await this.refresh(runId)) !== active)
      throw new MentionUnavailable("Original source window retired during dispatch.");
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
