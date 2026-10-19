/** Positive agent-tab ownership; daemon/services.md tabs and native/surfaces.md agent bubble. */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { type AgentStorage, fail } from './storage.js';
import type { Bridge, Session } from './types.js';
export type AutoClosePolicy = 'keep' | 'on-completion';
const identitySchema = z.object({
  ownershipToken: z.string().uuid(),
  sessionId: z.string(),
  targetId: z.string().min(1),
  tabId: z.number().int().nonnegative(),
  documentId: z.string().min(1),
  documentUrl: z.string(),
  title: z.string().default(''),
  url: z.string(),
});
export interface OwnedTab {
  id: string;
  sessionId: string;
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
  targetId: string;
  tabId: number;
  title: string;
  url: string;
  createdByAgent: true;
  autoClosePolicy: AutoClosePolicy;
  createdAt: number;
}
interface Record
  extends Omit<OwnedTab, 'targetId' | 'tabId' | 'title' | 'url'> {
  ownershipToken: string;
  state: 'pending' | 'owned' | 'closed' | 'released';
  targetId?: string;
  tabId?: number;
  documentId?: string;
  documentUrl?: string;
  title?: string;
  url?: string;
}
export class OwnedTabs {
  constructor(
    private store: AgentStorage,
    private bridge: Bridge | undefined,
    private session: (accountId: number, id: string) => Session,
    private emit: (session: Session, type: string, data: unknown) => void,
  ) {}
  private command(...args: Parameters<Bridge['command']>) {
    if (!this.bridge)
      fail('PRECONDITION_FAILED', 'Browser bridge is unavailable');
    return this.bridge.command(...args);
  }
  private records(accountId: number, sessionId?: string): Record[] {
    this.store.requireAccount(accountId);
    return Object.values(this.store.all(accountId, 'ownedTabs')).filter(
      (row): row is Record =>
        !!row &&
        typeof row === 'object' &&
        'sessionId' in row &&
        (!sessionId || row.sessionId === sessionId),
    );
  }
  private binding(session: Session) {
    if (!session.browserBinding || !this.bridge)
      fail(
        'PRECONDITION_FAILED',
        'Bind a connected browser profile before creating agent tabs',
      );
    return {
      accountId: session.accountId,
      profileId: session.browserBinding.profileId,
      browserMode: session.browserBinding.browserMode,
    };
  }
  private scoped(row: Record, session: Session) {
    const binding = session.browserBinding;
    return (
      !!binding &&
      row.profileId === binding.profileId &&
      row.browserMode === binding.browserMode
    );
  }
  private save(row: Record) {
    this.store.set(row.accountId, 'ownedTabs', row.id, row);
  }
  private view(row: Record): OwnedTab {
    if (
      row.state !== 'owned' ||
      row.targetId === undefined ||
      row.tabId === undefined ||
      !row.documentId ||
      row.documentUrl === undefined
    )
      fail('CONFLICT', 'Agent tab ownership is not live');
    return {
      id: row.id,
      sessionId: row.sessionId,
      accountId: row.accountId,
      profileId: row.profileId,
      browserMode: row.browserMode,
      targetId: row.targetId,
      tabId: row.tabId,
      title: row.title ?? '',
      url: row.url ?? row.documentUrl,
      createdByAgent: true,
      autoClosePolicy: row.autoClosePolicy,
      createdAt: row.createdAt,
    };
  }
  async create(
    accountId: number,
    sessionId: string,
    input: { url: string; active?: boolean; autoClosePolicy?: AutoClosePolicy },
    signal?: AbortSignal,
  ) {
    const session = this.session(accountId, sessionId),
      route = this.binding(session);
    if (session.permissionMode === 'read-only')
      fail('FORBIDDEN', 'Read-only sessions cannot create browser tabs');
    const url = new URL(input.url);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      fail(
        'BAD_REQUEST',
        'Agent tabs require an HTTP(S) URL without credentials',
      );
    if (
      this.records(accountId, sessionId).filter((row) =>
        ['pending', 'owned'].includes(row.state),
      ).length >= 20
    )
      fail(
        'PRECONDITION_FAILED',
        'Close or release an existing agent tab before creating more',
      );
    const row: Record = {
      id: randomUUID(),
      ownershipToken: randomUUID(),
      sessionId,
      accountId,
      profileId: route.profileId,
      browserMode: route.browserMode,
      createdByAgent: true,
      autoClosePolicy:
        input.autoClosePolicy ?? this.policy(accountId, sessionId),
      createdAt: Date.now(),
      state: 'pending',
    };
    this.save(row);
    const result = identitySchema.parse(
      await this.command(
        route,
        {
          method: 'tabs.owned.create',
          params: {
            ...route,
            sessionId,
            ownershipToken: row.ownershipToken,
            url: url.href,
            active: input.active ?? false,
          },
        },
        { ...(signal ? { signal } : {}), timeoutMs: 20000 },
      ),
    );
    if (
      result.ownershipToken !== row.ownershipToken ||
      result.sessionId !== sessionId
    )
      fail('CONFLICT', 'Created tab ownership identity does not match');
    Object.assign(row, result, { state: 'owned' });
    this.save(row);
    this.emit(this.session(accountId, sessionId), 'agent-tab-created', {
      tab: this.view(row),
    });
    return this.view(row);
  }
  async list(
    accountId: number,
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<OwnedTab[]> {
    const session = this.session(accountId, sessionId),
      records = this.records(accountId, sessionId).filter(
        (row) =>
          ['pending', 'owned'].includes(row.state) && this.scoped(row, session),
      );
    if (!records.length) return [];
    const route = this.binding(session);
    const result = z
      .object({ tabs: z.array(identitySchema) })
      .parse(
        await this.command(
          route,
          { method: 'tabs.owned.list', params: { ...route, sessionId } },
          { ...(signal ? { signal } : {}), timeoutMs: 15000 },
        ),
      );
    const live: OwnedTab[] = [];
    for (const row of records) {
      const actual = result.tabs.find(
        (tab) =>
          tab.ownershipToken === row.ownershipToken &&
          tab.sessionId === row.sessionId &&
          (!row.targetId || tab.targetId === row.targetId) &&
          (!row.documentId || tab.documentId === row.documentId) &&
          (!row.documentUrl || tab.documentUrl === row.documentUrl),
      );
      if (!actual) {
        if (row.state === 'pending' && Date.now() - row.createdAt < 60000)
          continue;
        row.state = 'released';
        this.save(row);
        this.emit(this.session(accountId, sessionId), 'agent-tab-released', {
          id: row.id,
          targetId: row.targetId ?? null,
          reason: 'target-or-document-changed',
        });
        continue;
      }
      Object.assign(row, actual, { state: 'owned' });
      this.save(row);
      live.push(this.view(row));
    }
    return live;
  }
  async resolve(
    accountId: number,
    targetId: string,
    profileId?: string,
    browserMode?: 'default' | 'incognito',
  ) {
    for (const row of this.records(accountId).filter(
      (row) =>
        row.state === 'owned' &&
        row.targetId === targetId &&
        (!profileId || row.profileId === profileId) &&
        (!browserMode || row.browserMode === browserMode),
    )) {
      const found = (await this.list(accountId, row.sessionId)).find(
        (tab) => tab.id === row.id,
      );
      if (found) return found;
    }
    return null;
  }
  async close(
    accountId: number,
    sessionId: string,
    id: string,
    expected?: { targetId: string; tabId: number },
    signal?: AbortSignal,
    authorize?: () => void,
  ) {
    const current = (await this.list(accountId, sessionId, signal)).find(
      (row) => row.id === id,
    );
    if (
      !current ||
      (expected &&
        (current.targetId !== expected.targetId ||
          current.tabId !== expected.tabId))
    )
      fail(
        'CONFLICT',
        'This exact tab is no longer positively owned by the session',
      );
    const row = this.records(accountId, sessionId).find((row) => row.id === id);
    if (!row) fail('NOT_FOUND', 'Agent tab record does not exist');
    const session = this.session(accountId, sessionId);
    authorize?.();
    const response = z.object({ closed: z.literal(true) }).parse(
      await this.command(
        this.binding(session),
        {
          method: 'tabs.owned.close',
          params: {
            ...current,
            documentId: row.documentId,
            documentUrl: row.documentUrl,
            ownershipToken: row.ownershipToken,
          },
        },
        { ...(signal ? { signal } : {}), timeoutMs: 10000 },
      ),
    );
    row.state = 'closed';
    this.save(row);
    this.emit(this.session(accountId, sessionId), 'agent-tab-closed', {
      id: row.id,
      targetId: current.targetId,
    });
    return response;
  }
  async navigate(
    accountId: number,
    sessionId: string,
    targetId: string,
    url: string,
    signal?: AbortSignal,
  ) {
    const destination = new URL(url);
    if (
      !['http:', 'https:'].includes(destination.protocol) ||
      destination.username ||
      destination.password
    )
      fail(
        'BAD_REQUEST',
        'Agent navigation requires HTTP(S) without credentials',
      );
    url = destination.href;
    const tab = (await this.list(accountId, sessionId, signal)).find(
      (row) => row.targetId === targetId,
    );
    if (!tab) fail('CONFLICT', 'Agent tab document ownership changed');
    const row = this.records(accountId, sessionId).find(
      (row) => row.id === tab.id,
    );
    if (!row) fail('NOT_FOUND', 'Agent tab record does not exist');
    const session = this.session(accountId, sessionId);
    const result = identitySchema.parse(
      await this.command(
        this.binding(session),
        {
          method: 'tabs.owned.navigate',
          params: {
            ...tab,
            documentId: row.documentId,
            documentUrl: row.documentUrl,
            ownershipToken: row.ownershipToken,
            url,
          },
        },
        { ...(signal ? { signal } : {}), timeoutMs: 20000 },
      ),
    );
    if (
      result.targetId !== row.targetId ||
      result.ownershipToken !== row.ownershipToken ||
      result.sessionId !== sessionId
    )
      fail('CONFLICT', 'Navigated tab identity changed');
    Object.assign(row, result);
    this.save(row);
    this.emit(this.session(accountId, sessionId), 'agent-tab-updated', {
      tab: this.view(row),
    });
    return this.view(row);
  }
  has(accountId: number, sessionId: string, targetId: string) {
    return this.records(accountId, sessionId).some(
      (row) => row.state === 'owned' && row.targetId === targetId,
    );
  }
  async cleanup(
    accountId: number,
    sessionId: string,
    policyOnly = false,
    authorize?: () => void,
  ) {
    const tabs = await this.list(accountId, sessionId);
    let closed = 0;
    for (const tab of tabs) {
      if (policyOnly && tab.autoClosePolicy !== 'on-completion') continue;
      await this.close(
        accountId,
        sessionId,
        tab.id,
        { targetId: tab.targetId, tabId: tab.tabId },
        undefined,
        authorize,
      );
      closed++;
    }
    return { closed };
  }
  policy(accountId: number, sessionId: string): AutoClosePolicy {
    this.session(accountId, sessionId);
    return z
      .enum(['keep', 'on-completion'])
      .parse(
        this.store.get(accountId, 'ownedTabPolicies', sessionId) ?? 'keep',
      );
  }
  setPolicy(
    accountId: number,
    sessionId: string,
    autoClosePolicy: AutoClosePolicy,
  ) {
    this.session(accountId, sessionId);
    this.store.set(accountId, 'ownedTabPolicies', sessionId, autoClosePolicy);
    for (const row of this.records(accountId, sessionId))
      if (['owned', 'pending'].includes(row.state)) {
        row.autoClosePolicy = autoClosePolicy;
        this.save(row);
      }
    return { autoClosePolicy };
  }
  async terminate(accountId: number, sessionId: string) {
    let closed = 0;
    try {
      closed = (await this.cleanup(accountId, sessionId, true)).closed;
    } catch {}
    for (const row of this.records(accountId, sessionId).filter((row) =>
      ['owned', 'pending'].includes(row.state),
    )) {
      try {
        const session = this.session(accountId, sessionId);
        if (this.scoped(row, session) && this.bridge)
          await this.bridge.command(
            this.binding(session),
            {
              method: 'tabs.owned.release',
              params: {
                ...this.binding(session),
                sessionId,
                ownershipToken: row.ownershipToken,
              },
            },
            { timeoutMs: 5000 },
          );
      } catch {}
      row.state = 'released';
      this.save(row);
    }
    return { closed };
  }
}
