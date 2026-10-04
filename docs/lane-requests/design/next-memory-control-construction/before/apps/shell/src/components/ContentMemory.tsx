import { ActionMenu, DetailPane, ListRow, TextField } from "../ui";
import { shellIconGlobe } from "./icons";
import { useEffect, useLayoutEffect, useMemo, useId, useRef, useState, useCallback, type ReactNode } from "react";
import type { ContentMemoryDocument, ContentMemoryMatch, ContentMemoryPolicy, WorkspaceMemory, ShellCommandId } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { executeCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";

type InputEvent = React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
class ControlBinding {
  #element: HTMLElement | null = null;
  #action: ((element: HTMLElement) => unknown) | null = null;
  #cleanup: (() => void) | undefined;
  constructor(readonly command: ShellCommandId, readonly scopeId: string) {}
  #register() {
    this.#cleanup?.(); this.#cleanup = undefined;
    const original = this.#element, action = this.#action;
    if (original && action) this.#cleanup = registerScopedControl(original, this.command, this.scopeId, () => action(original));
  }
  attach = (element: HTMLElement | null) => { this.#element = element; if (element) element.dataset.commandId = this.command; this.#register(); };
  publish(action: (element: HTMLElement) => unknown) {
    this.#action = action; this.#register();
    return () => { this.#action = null; this.#register(); };
  }
  run(event: InputEvent | undefined, onError: (reason: unknown) => void) {
    const completion = executeCommand(this.command, { payload: { scopeId: this.scopeId }, nativeInputEvent: event?.nativeEvent });
    void completion.catch(reason => reportCommandCompletionFailure(completion, reason, onError));
  }
}
function useControl(command: ShellCommandId, scopeId: string, action: (element: HTMLElement) => unknown, onError: (reason: unknown) => void) {
  const binding = useMemo(() => new ControlBinding(command, scopeId), [command, scopeId]);
  useLayoutEffect(() => binding.publish(action));
  return { attach: binding.attach, run: (event?: InputEvent) => binding.run(event, onError) };
}
function ContentControl({ command, scopeId, action, onError, children, disabled = false, className = "btn sm", kind = "button", checked, value, inputId }: {
  command: ShellCommandId; scopeId: string; action(value?: string): unknown; onError(reason: unknown): void; children?: ReactNode;
  disabled?: boolean; className?: string; kind?: "button" | "checkbox" | "select" | "summary"; checked?: boolean; value?: number; inputId?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (element) return registerScopedControl(element, command, scopeId, () => action(element instanceof HTMLSelectElement ? element.value : undefined));
  });
  const attach = (node: HTMLElement | null) => { ref.current = node; };
  const run = (event: InputEvent) => { const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent }); void completion.catch(reason => reportCommandCompletionFailure(completion, reason, onError)); };
  if (kind === "checkbox") return <input id={inputId} type="checkbox" data-command-id={command} ref={attach} checked={checked} disabled={disabled} onChange={run} />;
  if (kind === "select") return <select id={inputId} aria-label="Page-content retention" data-command-id={command} ref={attach} disabled={disabled} value={value} onChange={run}>{children}</select>;
  if (kind === "summary") return <summary data-command-id={command} ref={attach} onClick={event => { event.preventDefault(); run(event); }}>{children}</summary>;
  return <button data-command-id={command} ref={attach} className={className} disabled={disabled} onClick={run}>{children}</button>;
}
class MenuActivations {
  #actions = new WeakMap<HTMLElement, () => void>();
  set(node: HTMLElement, action: () => void) { this.#actions.set(node, action); }
  invoke(node: HTMLElement) { this.#actions.get(node)?.(); }
}
function ContentRow({ item, selected, disabled, workspaceId, read, open, forget, current, onError }: {
  item: ContentMemoryMatch; selected: boolean; disabled: boolean; workspaceId: string;
  read(): unknown; open(): unknown; forget(): unknown; current(): void; onError(reason: unknown): void;
}) {
  const scopeId = `${workspaceId}:${item.memoryId}`;
  const reader = useControl("read-content-memory", scopeId, read, onError);
  const menuReader = useControl("read-content-memory", scopeId, read, onError);
  const opener = useControl("open-content-memory-source", scopeId, open, onError);
  const forgetter = useControl("forget-content-memory", scopeId, forget, onError);
  const toggles = useMemo(() => new MenuActivations(), []);
  const menu = useControl("toggle-content-memory-actions", scopeId, element => { current(); toggles.invoke(element); }, onError);
  return <ListRow title={item.title} leading={shellIconGlobe} selected={selected} disabled={disabled} openRef={reader.attach} onOpen={reader.run}
    description={<><span className="memory-match-source">{item.url} · {new Date(item.capturedAt).toLocaleDateString()}</span><span className="memory-match-snippet">{item.snippet}</span></>}
    trailing={<ActionMenu label={`Actions for ${item.title}`} triggerControl={(node, activate) => { menu.attach(node); if (node) toggles.set(node, activate); }} onTrigger={menu.run} actions={[
      { label: "Read saved text", disabled, controlRef: menuReader.attach, onSelect: menuReader.run },
      { label: "Open live source", controlRef: opener.attach, onSelect: opener.run },
      { label: "Forget", danger: true, disabled, controlRef: forgetter.attach, onSelect: forgetter.run },
    ]} />} />;
}
function ContentDetail({ document, question, busy, workspaceId, ask, close, setQuestion, onError }: {
  document: ContentMemoryDocument; question: string; busy: boolean; workspaceId: string; ask(): unknown; close(): unknown; setQuestion(value: string): void; onError(reason: unknown): void;
}) {
  const closer = useControl("close-content-memory-detail", `${workspaceId}:${document.memoryId}`, close, onError);
  return <DetailPane className="content-memory-document" title={document.title} metadata="Historical article · This Space" closeRef={closer.attach} onClose={closer.run}>
    <p className="hint">Saved {new Date(document.capturedAt).toLocaleString()} from {document.url}. This is a historical copy; open the source to check for updates.</p>
    <div className="content-memory-text">{document.text}</div>
    <p className="hint">Ask Aux sends up to 8,000 characters of this saved article to your selected AI provider. The saved copy may be older than the live page.</p>
    <div className="row"><input className="field-input" aria-label="Question about saved article" placeholder="Ask about this saved article…" value={question} onChange={event => setQuestion(event.target.value)}/><ContentControl command="ask-content-memory" scopeId={`${workspaceId}:${document.memoryId}`} action={ask} onError={onError} disabled={busy || !question.trim()}>Ask Aux</ContentControl></div>
  </DetailPane>;
}

class ContentScope {
  constructor(readonly workspaceId: string, readonly key: unknown) {}
  #active = true;
  #pending: { kind: string; query?: ContentScope } | null = null;
  get active() { return this.#active; }
  retire() { this.#active = false; }
  begin(kind: string, query?: ContentScope) {
    if (this.#pending?.kind === "read" && !this.#pending.query?.active) this.#pending = null;
    if (this.#pending) return null;
    return this.#pending = { kind, query };
  }
  finish(operation: object) { if (this.#pending !== operation) return false; this.#pending = null; return true; }
}
export function ContentMemory({ memory }: { memory: WorkspaceMemory }) {
  return <ContentMemoryContent key={memory.workspaceId} memory={memory} />;
}

function ContentMemoryContent({ memory }: { memory: WorkspaceMemory }) {
  const layout = useStore(state => state.layout);
  const ownerKey = JSON.stringify([...layout.spaces, ...(layout.archivedSpaces ?? [])].filter(space => space.workspaceId === memory.workspaceId).map(space => space.id));
  const privateMode = bridge.privateMode;
  const ownsWorkspace = useCallback(() => {
    const live = useStore.getState().layout;
    const matches = [...live.spaces, ...(live.archivedSpaces ?? [])].filter(space => space.workspaceId === memory.workspaceId);
    return matches.length === 1 && JSON.stringify(matches.map(space => space.id)) === ownerKey;
  }, [memory.workspaceId, ownerKey]);
  const [policyState, setPolicyState] = useState<{ scope: ContentScope; value: ContentMemoryPolicy } | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [needsFreshBackup, setNeedsFreshBackup] = useState(false);
  const [possiblyRemoved, setPossiblyRemoved] = useState(false);
  const [revision, setRevision] = useState(0);
  const loadScope = useMemo(() => new ContentScope(memory.workspaceId, [memory.revision, revision, privateMode, ownerKey]), [memory.workspaceId, memory.revision, revision, privateMode, ownerKey]);
  useLayoutEffect(() => () => loadScope.retire(), [loadScope]);
  const policy = policyState?.scope === loadScope ? policyState.value : null;
  const setPolicy = useCallback((value: ContentMemoryPolicy) => setPolicyState({ scope: loadScope, value }), [loadScope]);
  const policySnapshot = JSON.stringify(policy);
  const scope = useMemo(() => new ContentScope(memory.workspaceId, [memory.revision, memory.enabled, revision, policySnapshot, privateMode, ownerKey]), [memory.workspaceId, memory.revision, memory.enabled, revision, policySnapshot, privateMode, ownerKey]);
  useLayoutEffect(() => () => scope.retire(), [scope]);
  const queryScope = useMemo(() => new ContentScope(scope.workspaceId, [scope, query]), [scope, query]);
  useLayoutEffect(() => () => queryScope.retire(), [queryScope]);
  const [documentState, setDocumentState] = useState<{ scope: ContentScope; value: ContentMemoryDocument } | null>(null);
  const document = documentState?.scope === scope ? documentState.value : null;
  const setDocument = (value: ContentMemoryDocument | null) => setDocumentState(value ? { scope, value } : null);
  const [questionState, setQuestionState] = useState<{ scope: ContentScope; value: string } | null>(null);
  const question = questionState?.scope === scope ? questionState.value : "";
  const setQuestion = (value: string) => setQuestionState({ scope, value });
  const questionScope = useMemo(() => new ContentScope(scope.workspaceId, [scope, document, question]), [scope, document, question]);
  useLayoutEffect(() => () => questionScope.retire(), [questionScope]);
  const [searchState, setSearchState] = useState<{ scope: ContentScope; items: ContentMemoryMatch[]; complete: boolean } | null>(null);
  const visibleMatches = searchState?.scope === queryScope ? searchState.items : [];
  const searching = !!query.trim() && !!policy?.enabled && memory.enabled !== false && !(searchState?.scope === queryScope && searchState.complete);
  const [operationState, setOperationState] = useState<{ scope: ContentScope; query?: ContentScope; operation: { kind: string } } | null>(null);
  const busy = operationState?.scope === scope && (!operationState.query || operationState.query === queryScope);
  const [confirmScope, setConfirmScope] = useState<ContentScope | null>(null);
  const confirmClear = confirmScope === scope;
  const setConfirmClear = (value: boolean) => setConfirmScope(value ? scope : null);
  const [errorScope, setErrorScope] = useState<ContentScope | null>(null);
  const enabledId = useId();
  const retentionId = useId();
  const current = () => scope.active && !bridge.privateMode && ownsWorkspace() && policyState?.scope === loadScope;
  const assertCurrent = () => { if (!current()) throw new Error("This Space’s article controls changed."); };
  const report = (reason: unknown) => { if (current()) { setErrorScope(scope); setError(String(reason)); } };
  const begin = (kind: string) => { assertCurrent(); const operation = scope.begin(kind, kind === "read" ? queryScope : undefined); if (!operation) return null; setOperationState({ scope, query: operation.query, operation }); setError(""); return operation; };
  const finish = (operation: { kind: string }) => { if (scope.finish(operation) && current()) setOperationState(null); };
  const sameRecord = (a: ContentMemoryMatch | ContentMemoryDocument, b: ContentMemoryMatch | ContentMemoryDocument) =>
    a.memoryId === b.memoryId && a.profileId === b.profileId && a.workspaceId === b.workspaceId && a.pageId === b.pageId
    && a.documentEpoch === b.documentEpoch && a.url === b.url && a.title === b.title && a.capturedAt === b.capturedAt;
  const checkItem = (item: ContentMemoryMatch) => { assertCurrent(); if (!queryScope.active || item.workspaceId !== memory.workspaceId || !visibleMatches.some(row => sameRecord(item, row))) throw new Error("This remembered article changed."); };
  const readSequence = useRef(0);
  const detailOpener = useRef<HTMLElement | null>(null);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.contentMemory.updated" && event.payload.workspaceId === memory.workspaceId) setRevision(value => value + 1);
  }), [memory.workspaceId]);
  useEffect(() => {
    if (bridge.privateMode || !ownsWorkspace()) return;
    void call("workspaces.contentMemory.policy", { workspaceId: loadScope.workspaceId })
      .then(value => { if (loadScope.active && !bridge.privateMode && ownsWorkspace()) setPolicy(value); })
      .catch(reason => { if (loadScope.active && !bridge.privateMode && ownsWorkspace()) { setErrorScope(loadScope); setError(String(reason)); } });
  }, [loadScope, ownsWorkspace, setPolicy]);
  useEffect(() => {
    const term = query.trim();
    if (!term || !policy?.enabled || memory.enabled === false || bridge.privateMode) return;
    const timer = setTimeout(() => {
      void call("workspaces.contentMemory.search", { workspaceId: queryScope.workspaceId, query: term })
        .then(value => { if (queryScope.active && !bridge.privateMode && ownsWorkspace()) setSearchState({ scope: queryScope, items: value, complete: true }); })
        .catch(reason => { if (queryScope.active && !bridge.privateMode && ownsWorkspace()) { setSearchState({ scope: queryScope, items: [], complete: true }); setErrorScope(scope); setError(String(reason)); } });
    }, 180);
    return () => clearTimeout(timer);
  }, [scope, queryScope, memory.enabled, policy?.enabled, query, ownsWorkspace]);
  function read(item: ContentMemoryMatch) {
    checkItem(item);
    if (!policy?.enabled || memory.enabled === false) throw new Error("Article recall is paused.");
    const operation = begin("read"); if (!operation) return;
    const request = ++readSequence.current;
    detailOpener.current = window.document.activeElement as HTMLElement;
    setDocument(null);
    return guardCommandCompletion((async () => {
    try {
      const saved = await call("workspaces.contentMemory.get", { workspaceId: memory.workspaceId, memoryId: item.memoryId });
      if (!current() || !queryScope.active || request !== readSequence.current) return saved;
      if (!saved || !sameRecord(item, saved)) throw new Error("This saved article is no longer available in its original version.");
      setDocument(saved); return saved;
    } catch (reason) { if (current() && queryScope.active && request === readSequence.current) setDocument(null); throw reason; }
    finally { finish(operation); }
    })(), () => current() && queryScope.active && request === readSequence.current);
  }
  function ask() {
    assertCurrent();
    if (!document || document.workspaceId !== memory.workspaceId || !questionScope.active || !question.trim() || !policy?.enabled || memory.enabled === false) throw new Error("Choose the current saved article and question.");
    const operation = begin("ask"); if (!operation) return;
    return guardCommandCompletion((async () => {
    try {
      const run = await useStore.getState().startRun(question, { ownsDraft: true, reveal: false, scope: "new", chatId: crypto.randomUUID(), presentation: "conversation",
        memorySource: { workspaceId: memory.workspaceId, memoryId: document.memoryId } });
      if (run && current() && questionScope.active) { setQuestion(""); useStore.getState().openConversation(run.runId); }
      return run;
    }
    finally { finish(operation); }
    })(), () => current() && questionScope.active);
  }
  function change(next: ContentMemoryPolicy) {
    const operation = begin("policy"); if (!operation) return;
    loadScope.retire();
    return guardCommandCompletion((async () => {
    try {
      const saved = await call("workspaces.contentMemory.setPolicy", { workspaceId: memory.workspaceId, policy: next });
      if (!current()) return saved;
      if (policy && (next.retentionDays < policy.retentionDays
        || policy.allowedOrigins.some(origin => !next.allowedOrigins.includes(origin)))) { setNeedsFreshBackup(true); setPossiblyRemoved(true); }
      setPolicy(saved); setSearchState(null); return saved;
    }
    finally { finish(operation); }
    })(), current);
  }
  function forget(item?: ContentMemoryMatch) {
    if (item) checkItem(item); else { assertCurrent(); if (!confirmClear) throw new Error("Review forgetting the saved articles first."); }
    const operation = begin("forget"); if (!operation) return;
    return guardCommandCompletion((async () => {
    try {
      const result = await call("workspaces.contentMemory.forget", { workspaceId: memory.workspaceId, memoryId: item?.memoryId });
      if (!current()) return result;
      if (result.forgotten) { setNeedsFreshBackup(true); setPossiblyRemoved(false); }
      setSearchState({ scope: queryScope, items: visibleMatches.filter(row => !!item && row.memoryId !== item.memoryId), complete: true }); setDocument(null); setConfirmClear(false); return result;
    }
    finally { finish(operation); }
    })(), current);
  }
  const [sitesOpen, setSitesOpen] = useState(false);
  return <section className="browsing-memory" aria-label="Page-content recall">
    <h4>Page-content recall</h4>
    <p className="hint">Use a tab’s “Remember article” action to save readable text in this Space. Aux only captures an active HTTPS article after you confirm its site. Saved content stays protected on this device and expires automatically.</p>
    {needsFreshBackup && <MemoryRecoveryNotice possible={possiblyRemoved} />}
    {policy && <>
      <label className="memory-use-toggle" htmlFor={enabledId}><ContentControl command="toggle-content-memory" scopeId={memory.workspaceId} kind="checkbox" inputId={enabledId} checked={policy.enabled} disabled={busy} onError={report} action={() => change({ ...policy, enabled: !policy.enabled })}/><span>Use remembered article content<small>{policy.enabled ? "Search and capture are available for allowed sites." : "Paused. Saved articles remain until they expire or you forget them."}</small></span></label>
      {memory.enabled === false && <p className="hint">Space memory is paused above. Article capture and search are unavailable.</p>}
      <label className="browsing-retention" htmlFor={retentionId}>Keep remembered articles for<ContentControl command="set-content-memory-retention" inputId={retentionId} scopeId={memory.workspaceId} kind="select" disabled={busy} value={policy.retentionDays} onError={report} action={value => { if (value !== "30" && value !== "90") throw new Error("Choose the current article retention."); return change({ ...policy, retentionDays: value === "30" ? 30 : 90 }); }}><option value={30}>30 days</option><option value={90}>90 days</option></ContentControl></label>
      <details open={sitesOpen}><ContentControl command="toggle-content-memory-sites" scopeId={memory.workspaceId} kind="summary" onError={report} action={() => { assertCurrent(); setSitesOpen(value => !value); }}>Allowed sites · {policy.allowedOrigins.length}</ContentControl>
        <p className="hint">Only articles from these exact sites can be saved. Removing a site deletes its saved content from this Space.</p>
        <div className="browsing-memory-list">{policy.allowedOrigins.map(origin => <article key={origin}><span>{origin}</span><ContentControl command="remove-content-memory-site" scopeId={`${memory.workspaceId}:${origin}`} className="btn sm ghost" disabled={busy} onError={report} action={() => change({ ...policy, allowedOrigins: policy.allowedOrigins.filter(item => item !== origin) })}>Remove site</ContentControl></article>)}</div>
        {!policy.allowedOrigins.length && <p className="hint">No sites allowed yet. Confirm “Remember article” on an active tab to add one.</p>}
      </details>
      <TextField type="search" aria-label="Search remembered articles" placeholder="Search remembered articles…" value={query} onChange={event => setQuery(event.target.value)} disabled={!policy.enabled || memory.enabled === false}/>
      {query.trim() && policy.enabled && !visibleMatches.length && <p className="hint">{searching ? "Searching remembered articles…" : "No matching remembered articles."}</p>}
      <div className="browsing-memory-list">{visibleMatches.map(item => <ContentRow key={item.memoryId} item={item} workspaceId={memory.workspaceId} selected={document?.memoryId === item.memoryId} disabled={busy}
        current={() => checkItem(item)} read={() => read(item)} forget={() => forget(item)} onError={report}
        open={() => { checkItem(item); return useStore.getState().newTab(item.url); }} />)}</div>
      {document && <ContentDetail document={document} workspaceId={memory.workspaceId} question={question} busy={busy} setQuestion={setQuestion} ask={ask} onError={report}
        close={() => { assertCurrent(); ++readSequence.current; setDocument(null); requestAnimationFrame(() => { if (current() && detailOpener.current?.isConnected) detailOpener.current.focus(); }); }} />}
      <div className="row">{confirmClear ? <><span className="hint">Forget all saved articles in this Space?</span><ContentControl command="clear-content-memory" scopeId={memory.workspaceId} disabled={busy} onError={report} action={() => forget()}>Forget all</ContentControl><ContentControl command="cancel-clear-content-memory" scopeId={memory.workspaceId} disabled={busy} className="btn sm ghost" onError={report} action={() => { assertCurrent(); setConfirmClear(false); }}>Cancel</ContentControl></> : <ContentControl command="confirm-clear-content-memory" scopeId={memory.workspaceId} disabled={busy} className="btn sm ghost" onError={report} action={() => { assertCurrent(); setConfirmClear(true); }}>Forget all remembered articles…</ContentControl>}</div>
    </>}
    {error && (errorScope === scope || errorScope === loadScope) && <p className="field-error" role="alert">{error}</p>}
  </section>;
}
