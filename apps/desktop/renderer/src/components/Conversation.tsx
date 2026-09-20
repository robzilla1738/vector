import { openSavedTask } from "../task-navigation";
import { useEffect, useRef, useState } from "react";
import type { Artifact, ConversationArtifact, ConversationAttachment, ConversationContext as ConversationContextState, ConversationSource, PageTarget, Run, Workspace, WorkspaceMemory } from "@vector/contracts";
import { draftKey, PENDING_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { conversationMarkdown } from "../conversation-export";
import { bridge } from "../bridge";
import { useStore, call, errToast, isLive } from "../store";
import { ConversationHistory, cursor, mergeHistory } from "./ConversationHistory";
import { answerUrl } from "./AnswerMarkdown";
import { RunPanel } from "./RunPanel";
import { I } from "./icons";

export function RunImages({ runId, compact = false }: { runId: string; compact?: boolean }) {
  const [images, setImages] = useState<{ id: string; url: string; at: number }[]>([]);
  const status = useStore(s => s.runs.find(r => r.runId === runId)?.status);
  useEffect(() => {
    let cancelled = false;
    void call<Artifact[]>("artifacts.list", { runId }).then(async artifacts => {
      const loaded = await Promise.all(artifacts.filter(a => a.status === "complete" && /^image\/(png|jpeg|webp)$/.test(a.mediaType) && a.size < 8_000_000).slice(-3).map(async a => {
        const data = await call<{ dataBase64: string }>("artifacts.read", { artifactId: a.artifactId });
        return { id: a.artifactId, url: `data:${a.mediaType};base64,${data.dataBase64}`, at: a.createdAt };
      }));
      if (!cancelled) setImages(loaded);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [runId, status]);
  return <>{images.map(image => <figure className="conversation-image" key={image.id} aria-hidden={compact || undefined}><img src={image.url} alt={compact ? "" : "Browser screenshot captured during this turn"}/><figcaption>Captured {new Date(image.at).toLocaleString()}</figcaption></figure>)}</>;
}

function RunSources({ sources, onOpen }: { sources: ConversationSource[]; onOpen: (source: ConversationSource) => void }) {
  if (!sources.length) return null;
  return <details className="conversation-sources"><summary>{I.globe}<span>Sources</span><span className="count nums">{sources.length}</span></summary><div>
    {sources.map(source => <button key={source.sourceId} onClick={() => onOpen(source)} title={source.url}>
      <span><b>{source.title}</b><small>{new URL(source.url).hostname} · observed {new Date(source.observedAt).toLocaleString()}</small></span>{I.open}
    </button>)}
    <p>Observed browser pages provide provenance, not independent proof of an external outcome.</p>
  </div></details>;
}

export function Conversation() {
  const id = useStore(s => s.conversationId);
  useEffect(() => {
    if (id) return;
    const pending = readPendingConversation(typeof localStorage === "undefined" ? null : localStorage);
    if (pending) useStore.setState({ conversationId: pending });
  }, [id]);
  const runs = useStore(s => s.runs);
  const pages = useStore(s => s.pages);
  const settings = useStore(s => s.settings);
  const text = useStore(s => id ? s.conversationDrafts[draftKey(id)] ?? "" : s.agentDraft);
  const setText = (value: string) => id ? useStore.getState().setConversationDraft(id, value) : useStore.getState().setAgentDraft(value);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [earlier, setEarlier] = useState<ReturnType<typeof cursor> | null>(null);
  const historyRequest = useRef(0);
  const loadTurns = async (before?: ReturnType<typeof cursor>) => {
    if (!id || id === "history") return;
    const version = ++historyRequest.current;
    setHistoryLoading(true); setHistoryError("");
    try {
      const found = await call<Run[]>("runs.list", { chatId: id, limit: 50, ...(before ? { before } : {}) });
      if (version !== historyRequest.current) return;
      mergeHistory(found);
      setEarlier(found.length === 50 ? cursor(found[found.length - 1]!) : null);
    } catch (error) { if (version === historyRequest.current) setHistoryError(String(error)); }
    finally { if (version === historyRequest.current) setHistoryLoading(false); }
  };
  useEffect(() => {
    setEarlier(null); setHistoryError(""); setHistoryLoading(false);
    void loadTurns();
    return () => { ++historyRequest.current; };
  }, [id]);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [contextState, setContextState] = useState<ConversationContextState | null>(null);
  const [attachments, setAttachments] = useState<ConversationAttachment[]>([]);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<ConversationArtifact[]>([]);
  const [sources, setSources] = useState<ConversationSource[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceContext, setWorkspaceContext] = useState<{ workspace: Workspace | null; memory: WorkspaceMemory | null }>({ workspace: null, memory: null });
  const [workspaceMemoryDraft, setWorkspaceMemoryDraft] = useState("");
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextSaving, setContextSaving] = useState(false);
  const [attachmentSaving, setAttachmentSaving] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const contexts = useStore(s => s.conversationContexts);
  const contextPage = contexts[id ? draftKey(id) : "new"] ?? "linked";
  const setContextPage = (pageId: string) => useStore.getState().setConversationContext(id,pageId);
  const [reopening, setReopening] = useState(false);
  const turns = runs.filter(r => (r.config?.chatId ?? r.runId) === id).sort((a,b) => a.createdAt - b.createdAt);
  const last = turns.at(-1);
  const linked = pages.find(p => p.pageId === last?.pageIds[0] && !["crashed", "detached"].includes(p.viewStatus ?? ""));
  const selectedContext = contextPage === "linked" ? linked : pages.find(p => p.pageId === contextPage && !p.ownedByRuntime && !["crashed", "detached"].includes(p.viewStatus ?? ""));
  const observations = useStore(s => s.observations);
  const lastObservation = [...turns].reverse().map(run => observations[run.runId]).find(observation => observation && answerUrl(observation.url));
  const recoverUrl = lastObservation ? answerUrl(lastObservation.url) : "";
  const preview = useStore(s => selectedContext ? s.previews[selectedContext.pageId] : undefined);
  useEffect(() => {
    if (!selectedContext) return;
    let gone = false;
    void bridge.preview(selectedContext.pageId).then(url => { if (url && !gone) useStore.setState(s => ({ previews: { ...s.previews, [selectedContext.pageId]: url } })); }).catch(() => {});
    return () => { gone = true; };
  }, [selectedContext?.pageId, last?.status]);
  const live = !!last && isLive(last);
  const taskBound = !!last?.config?.taskId;
  useEffect(() => {
    let cancelled = false;
    const taskId = last?.config?.taskId;
    if (!taskId) { setTaskTitle(""); return; }
    void call<{ task: { title: string } }>("tasks.get", { taskId }).then(value => { if (!cancelled) setTaskTitle(value.task.title); }).catch(() => { if (!cancelled) setTaskTitle(""); });
    return () => { cancelled = true; };
  }, [last?.config?.taskId]);
  useEffect(() => { void call<Workspace[]>("workspaces.list", {}).then(setWorkspaces).catch(() => setWorkspaces([])); }, []);
  useEffect(() => {
    let cancelled = false;
    setContextOpen(false);
    if (!id) { setContextState(null); setAttachments([]); setGeneratedArtifacts([]); setWorkspaceContext({ workspace: null, memory: null }); setWorkspaceMemoryDraft(""); return; }
    void Promise.all([
      call<ConversationContextState>("runs.context.get", { chatId: id }),
      call<{ attachments: ConversationAttachment[] }>("conversations.attachments.get", { chatId: id }),
      call<{ artifacts: ConversationArtifact[] }>("conversations.artifacts.get", { chatId: id }),
      call<{ workspace: Workspace | null; memory: WorkspaceMemory | null }>("conversations.workspace.get", { chatId: id }),
    ]).then(([context, documents, generated, workspace]) => { if (!cancelled) { setContextState(context); setAttachments(documents.attachments); setGeneratedArtifacts(generated.artifacts); setWorkspaceContext(workspace); setWorkspaceMemoryDraft(workspace.memory?.content ?? ""); } })
      .catch(() => { if (!cancelled) { setContextState(null); setAttachments([]); setGeneratedArtifacts([]); setWorkspaceContext({ workspace: null, memory: null }); setWorkspaceMemoryDraft(""); } });
    return () => { cancelled = true; };
  }, [id, turns.length]);
  useEffect(() => {
    let cancelled = false;
    if (!id) { setSources([]); return; }
    void call<{ sources: ConversationSource[] }>("conversations.sources.get", { chatId: id })
      .then(value => { if (!cancelled) setSources(value.sources); })
      .catch(() => { if (!cancelled) setSources([]); });
    return () => { cancelled = true; };
  }, [id, turns.length, last?.status]);
  const updateContext = async (change: { historyEnabled?: boolean; runId?: string; included?: boolean }) => {
    if (!id || contextSaving) return;
    setContextSaving(true);
    try { setContextState(await call<ConversationContextState>("runs.context.set", { chatId: id, ...change })); }
    catch (error) { errToast(error); }
    finally { setContextSaving(false); }
  };
  const ensureChatId = () => {
    if (id) return id;
    const chatId = crypto.randomUUID();
    if (text) useStore.getState().setConversationDraft(chatId, text);
    useStore.getState().setAgentDraft("");
    try { localStorage.setItem(PENDING_CHAT_KEY, chatId); } catch { /* in-window state still works */ }
    useStore.setState({ conversationId: chatId });
    return chatId;
  };
  const addDocument = async () => {
    if (attachmentSaving) return;
    setAttachmentSaving(true);
    try {
      const picked = await bridge.pickEvidenceDocument();
      if (!picked) return;
      const chatId = ensureChatId();
      const value = await call<{ attachments: ConversationAttachment[] }>("conversations.attachments.add", { chatId, ...picked });
      setAttachments(value.attachments);
      setContextOpen(true);
    } catch (error) { errToast(error); }
    finally { setAttachmentSaving(false); }
  };
  const changeDocument = async (attachmentId: string, included?: boolean) => {
    if (!id || attachmentSaving) return;
    setAttachmentSaving(true);
    try {
      const value = await call<{ attachments: ConversationAttachment[] }>(included === undefined ? "conversations.attachments.remove" : "conversations.attachments.toggle", { chatId: id, attachmentId, ...(included === undefined ? {} : { included }) });
      setAttachments(value.attachments);
    } catch (error) { errToast(error); }
    finally { setAttachmentSaving(false); }
  };
  const toggleGeneratedArtifact = async (artifactId: string, included: boolean) => {
    if (!id || contextSaving) return;
    setContextSaving(true);
    try {
      const value = await call<{ artifacts: ConversationArtifact[] }>("conversations.artifacts.toggle", { chatId: id, artifactId, included });
      setGeneratedArtifacts(value.artifacts);
    } catch (error) { errToast(error); }
    finally { setContextSaving(false); }
  };
  const selectWorkspace = async (workspaceId: string) => {
    if (workspaceSaving) return;
    setWorkspaceSaving(true);
    try {
      const chatId = workspaceId ? ensureChatId() : id;
      if (!chatId) return;
      const value = await call<{ workspace: Workspace | null; memory: WorkspaceMemory | null }>("conversations.workspace.set", { chatId, workspaceId: workspaceId || null });
      setWorkspaceContext(value); setWorkspaceMemoryDraft(value.memory?.content ?? "");
    } catch (error) { errToast(error); }
    finally { setWorkspaceSaving(false); }
  };
  const saveWorkspaceMemory = async () => {
    if (!workspaceContext.workspace || !workspaceContext.memory || workspaceSaving) return;
    setWorkspaceSaving(true);
    try {
      const memory = await call<WorkspaceMemory>("workspaces.memory.set", { workspaceId: workspaceContext.workspace.workspaceId, expectedRevision: workspaceContext.memory.revision, content: workspaceMemoryDraft });
      setWorkspaceContext(current => ({ ...current, memory }));
    } catch (error) { errToast(error); }
    finally { setWorkspaceSaving(false); }
  };
  const exportConversation = async () => {
    if (!id || !turns.length || exporting) return;
    setExporting(true);
    try {
      const all: Run[] = [];
      let before: ReturnType<typeof cursor> | undefined;
      for (;;) {
        const page = await call<Run[]>("runs.list", { chatId: id, limit: 500, ...(before ? { before } : {}) });
        all.push(...page);
        if (page.length < 500) break;
        before = cursor(page[page.length - 1]!);
      }
      const [documents, generated, workspace, sourceList] = await Promise.all([
        call<{ attachments: ConversationAttachment[] }>("conversations.attachments.get", { chatId: id }),
        call<{ artifacts: ConversationArtifact[] }>("conversations.artifacts.get", { chatId: id }),
        call<{ workspace: Workspace | null; memory: WorkspaceMemory | null }>("conversations.workspace.get", { chatId: id }),
        call<{ sources: ConversationSource[] }>("conversations.sources.get", { chatId: id }),
      ]);
      const title = all.at(-1)?.goal || turns[0]!.goal;
      const name = `aux-conversation-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || id.slice(0, 12)}.md`;
      const destination = await bridge.saveFile(name, conversationMarkdown({ chatId: id, title, runs: all, attachments: documents.attachments, artifacts: generated.artifacts, sources: sourceList.sources, workspace: workspace.workspace, memory: workspace.memory }));
      if (destination) useStore.getState().toast("Conversation exported");
    } catch (error) { errToast(error); }
    finally { setExporting(false); }
  };
  const send = async () => {
    if (!text.trim() || sending || historyLoading || historyError || (live && last?.status !== "needs_input") || (taskBound && last?.status !== "needs_input")) return;
    setSending(true);
    try {
      if (last?.status === "needs_input") {
        await call("runs.answer", { runId: last.runId, answer: text.trim() });
        setText("");
      } else {
        const run = await useStore.getState().startRun(text, { chatId: id ?? crypto.randomUUID(), pageId: selectedContext?.pageId ?? null, scope: selectedContext ? "page" : "new" });
        if (run) { try { localStorage.removeItem(PENDING_CHAT_KEY); } catch { /* storage is optional */ } setText(""); useStore.getState().openConversation(run.runId); }
      }
    } catch (error) { errToast(error); }
    finally { setSending(false); }
  };
  const reopen = async () => {
    if (!recoverUrl || reopening || !last) return;
    setReopening(true);
    try {
      const existing = pages.find(p => p.url === recoverUrl && !p.ownedByRuntime && !["crashed", "detached"].includes(p.viewStatus ?? ""));
      const page = existing ?? await useStore.getState().newTab(recoverUrl);
      if (page) { setContextPage(page.pageId); useStore.getState().openConversation(last.runId); }
    } catch (error) { errToast(error); }
    finally { setReopening(false); }
  };
  const openSource = async (source: ConversationSource) => {
    try {
      const livePages = await call<PageTarget[]>("pages.list", {});
      const existing = livePages.find(page => (page.pageId === source.pageId || page.url === source.url) && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
      if (existing) await useStore.getState().activate(existing.pageId);
      else await useStore.getState().newTab(source.url);
    } catch (error) { errToast(error); }
  };
  const contextCount = (contextState?.entries.filter(entry => entry.included).length ?? 0) + attachments.filter(item => item.included).length + generatedArtifacts.filter(item => item.included).length + (workspaceContext.memory?.content ? 1 : 0);
  const contextLocked = live;
  const contextPanel = contextOpen ? <section className="conversation-memory" aria-label="Conversation context">
    <div className="conversation-memory-head"><div><strong>Conversation context</strong><p>Choose the saved turns, document snapshots and generated outputs Aux may use on the next task revision. Browser-tab context stays with the task.</p></div><button className="icon-btn xs" aria-label="Close conversation context" onClick={() => setContextOpen(false)}>{I.close}</button></div>
    {contextState && <><label className="conversation-memory-master"><input type="checkbox" checked={contextState.historyEnabled} disabled={contextSaving || contextLocked} onChange={event => void updateContext({ historyEnabled: event.target.checked })}/><span><b>Use previous turns</b><small>{contextState.historyEnabled ? "Included turns are sent with the next reply or task revision." : "History stays visible but is not sent."}</small></span></label>
    {contextState.entries.length > 0 ? <div className="conversation-memory-list">{contextState.entries.map(entry => <label key={entry.runId}>
      <input type="checkbox" checked={entry.included} disabled={contextSaving || contextLocked || !contextState.historyEnabled} onChange={event => void updateContext({ runId: entry.runId, included: event.target.checked })}/>
      <span><b>{entry.goal}</b><small>{new Date(entry.createdAt).toLocaleString()} · {entry.summary}</small></span>
    </label>)}</div> : <p className="hint">No completed earlier turns yet.</p>}</>}
    <div className="conversation-workspace-memory"><div className="conversation-documents-head"><div><b>Workspace memory</b><small>{taskBound ? "Task workspace · shared user-authored context" : "Shared user-authored context · never expands permissions"}</small></div><select aria-label="Conversation workspace" disabled={workspaceSaving || contextLocked || taskBound} value={workspaceContext.workspace?.workspaceId ?? ""} onChange={event => void selectWorkspace(event.target.value)}><option value="">No workspace</option>{workspaces.map(item => <option key={item.workspaceId} value={item.workspaceId}>{item.name}</option>)}</select></div>
    {workspaceContext.memory ? <><textarea aria-label="Workspace memory" disabled={workspaceSaving || contextLocked} maxLength={16_000} placeholder="Stable notes, conventions and preferences for this workspace" value={workspaceMemoryDraft} onChange={event => setWorkspaceMemoryDraft(event.target.value)}/><div className="conversation-workspace-memory-actions"><small>Revision {workspaceContext.memory.revision}{workspaceContext.memory.updatedAt ? ` · ${new Date(workspaceContext.memory.updatedAt).toLocaleString()}` : ""}</small><button className="btn sm" disabled={workspaceSaving || contextLocked || workspaceMemoryDraft === workspaceContext.memory.content} onClick={() => void saveWorkspaceMemory()}>{workspaceSaving ? "Saving…" : "Save memory"}</button></div></> : <p className="hint">Choose a workspace to share deliberate context across its conversations and saved tasks.</p>}</div>
    <div className="conversation-documents-head"><div><b>Local documents</b><small>UTF-8 text, Markdown, CSV or JSON · snapshot only</small></div><button className="btn sm" disabled={attachmentSaving || contextLocked || attachments.length >= 5} onClick={() => void addDocument()}>{I.plusSm}{attachmentSaving ? "Adding…" : "Attach document"}</button></div>
    {attachments.length > 0 ? <div className="conversation-document-list">{attachments.map(item => <div className="conversation-document" key={item.attachmentId}>
      <label><input type="checkbox" checked={item.included} disabled={attachmentSaving || contextLocked} onChange={event => void changeDocument(item.attachmentId, event.target.checked)}/><span><b>{item.filename}</b><small>{Math.max(1, Math.ceil(item.byteLength / 1024))} KB · {item.excerpt || "Empty document"}</small></span></label>
      <button className="icon-btn xs" aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button>
    </div>)}</div> : <p className="hint">No local documents attached. Aux stores the selected text snapshot, never its source path.</p>}
    {generatedArtifacts.length > 0 && <><div className="conversation-documents-head"><div><b>Generated artifacts</b><small>Text outputs from earlier turns · select to reuse</small></div></div>
    <div className="conversation-document-list">{generatedArtifacts.map(item => <div className="conversation-document" key={item.artifactId}>
      <label><input type="checkbox" checked={item.included} disabled={contextSaving || contextLocked} onChange={event => void toggleGeneratedArtifact(item.artifactId, event.target.checked)}/><span><b>{item.filename}</b><small>{Math.max(1, Math.ceil(item.byteLength / 1024))} KB · {item.turnGoal} · {item.excerpt || "Empty artifact"}</small></span></label>
    </div>)}</div></>}
  </section> : null;
  if (id === "history") return <ConversationHistory/>;
  return <section className="conversation" aria-labelledby="conversation-title">
    <header className="conversation-head"><h1 id="conversation-title">{taskTitle || turns[0]?.goal || "New chat"}</h1><div className="sp"/>{turns.length > 0 && <button className="icon-btn" disabled={exporting} title="Export conversation as Markdown" aria-label="Export conversation as Markdown" onClick={() => void exportConversation()}>{I.downloadSm}</button>}{last && <button className="icon-btn" title="Open agent side panel" aria-label="Open agent side panel" onClick={() => { useStore.getState().setMode("focus"); useStore.getState().openRail({ kind: "run", runId: last.runId }); }}>{I.rail}</button>}</header>
    <div className="conversation-scroll"><div className="conversation-thread">
      {historyLoading && <p role="status" className="hint">Loading conversation…</p>}
      {historyError && <p role="alert">{historyError} <button className="btn sm" onClick={() => void loadTurns(earlier ?? undefined)}>Try again</button></p>}
      {earlier && !historyError && <button className="btn sm" disabled={historyLoading} onClick={() => void loadTurns(earlier)}>Load earlier messages</button>}
      {!turns.length && <div className="conversation-empty"><img className="aux-mark" src="./aux-icon.svg" alt="Aux" width="64" height="64" draggable={false} /><h1>What would you like to work on?</h1><p>Ask a question or give Aux a task in the browser.</p></div>}
      {turns.map(run => <article className="conversation-turn" key={run.runId}><time dateTime={new Date(run.createdAt).toISOString()} title={new Date(run.createdAt).toLocaleString()}>{new Date(run.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time><div className="user-message">{run.goal}</div><RunPanel runId={run.runId} conversation/><RunSources sources={sources.filter(source => source.runId === run.runId)} onOpen={source => void openSource(source)}/><RunImages runId={run.runId}/></article>)}
    </div>{selectedContext && <button className="conversation-preview" onClick={() => void useStore.getState().activate(selectedContext.pageId).catch(errToast)} title="Open the actual browser tab"><span>{I.globe}{selectedContext.title || "Task browser tab"}{I.open}</span>{preview ? <img src={preview} alt="Latest task browser preview" onError={() => useStore.setState(state => ({ previews: { ...state.previews, [selectedContext.pageId]: "" } }))}/> : <p>{selectedContext.url === "about:blank" ? "Task browser tab" : selectedContext.url}<small>Open browser tab</small></p>}</button>}</div>
    <div className="conversation-compose">
      {!linked && last?.pageIds.length ? <div className="conversation-context-note">The original browser tab is unavailable.{recoverUrl && <button className="btn sm" disabled={reopening || live || taskBound} title={recoverUrl} onClick={() => void reopen()}>{reopening ? "Opening…" : "Reopen last page"}</button>}<span>{selectedContext ? `Reply context: ${selectedContext.title || selectedContext.url}` : "Choose an open tab or continue in a new one."}</span></div> : null}
      {taskBound ? <>
      <div className="conversation-task-note">{live ? "This saved task is working. Its context is locked until the run stops." : "Continue from the saved task to preserve its revision, scope and acceptance criteria."} <button className="btn" onClick={() => void openSavedTask(last!.config!.taskId!).catch(errToast)}>Open saved task</button></div>
      {contextPanel}
      {last?.status === "needs_input" && <div className="conversation-input"><textarea disabled={sending} aria-label="Reply to conversation" placeholder="Answer Aux’s question…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}/><button className="icon-btn" aria-label="Send message" disabled={sending || !text.trim()} onClick={() => void send()}>{I.send}</button></div>}
      <div className="composer-options"><button aria-expanded={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.chats} Context · {contextCount}</button><button onClick={() => void openSavedTask(last!.config!.taskId!).catch(errToast)}>{I.layersSm}{workspaceContext.workspace?.name ?? "Saved task"}</button><span className="sp"/></div>
      </> : <>
      {contextPanel}
      <div className="conversation-input"><textarea disabled={sending} aria-label="Reply to conversation" placeholder={last?.status === "needs_input" ? "Answer Aux’s question…" : "Reply, or give Aux a task…"} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}/><button className="icon-btn" aria-label="Send message" disabled={sending || historyLoading || !!historyError || !text.trim() || (live && last?.status !== "needs_input")} onClick={() => void send()}>{I.send}</button></div>
      <div className="composer-options">
        <select aria-label="Attach browser context" disabled={live || taskBound || sending} value={selectedContext ? contextPage : ""} onChange={e => setContextPage(e.target.value)}><option value="">New browser tab</option>{linked && <option value="linked">Task tab: {linked.title || linked.url}</option>}{pages.filter(p => !p.ownedByRuntime && p.pageId !== linked?.pageId && !["crashed", "detached"].includes(p.viewStatus ?? "")).map(p => <option key={p.pageId} value={p.pageId}>{p.title || p.url}</option>)}</select>
        <button aria-expanded={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.chats} Context · {contextCount}</button>
        <button onClick={() => useStore.getState().setOverlay("tasks")}>{I.layersSm}{workspaceContext.workspace?.name ?? "Workspaces & tasks"}</button>
        <button onClick={() => { useStore.setState({ settingsCategory: "Agent permissions" }); useStore.getState().setOverlay("settings"); }}>{I.lock}{(settings.effectGrants as string[] | undefined)?.includes("effect:write") ? "Read & write" : "Read only"}</button><span className="sp"/>
        <button onClick={() => { useStore.setState({ settingsCategory: "Models" }); useStore.getState().setOverlay("settings"); }}>{settings.modelConfigured ? String(settings.plannerModel) : "Set up model"}{I.down}</button>
      </div></>}
    </div>
  </section>;
}
