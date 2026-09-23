import { RunImages } from "./RunImages";
import { Dictation } from "./Dictation";
import { ImageSnapshot } from "./ImageSnapshot";
import { SavedResultPreview } from "./SavedResultPreview";
import { ConversationImages } from "./ConversationImages";
import { DocumentSnapshot } from "./DocumentSnapshot";
import { AuxMark } from "./AuxMark";
import { ConversationTask } from "./ConversationTask";
import { useConversationScroll } from "../use-conversation-scroll";
import { conversationPage } from "../conversation-page";
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CompactObservation, ConversationArtifact, ConversationImage, ConversationAttachment, ConversationSummary, ConversationSource, Run, StepRecord, Workspace, WorkspaceMemory } from "@aux/contracts";
import { draftKey, PENDING_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { conversationMarkdown } from "../conversation-export";
import { bridge } from "../bridge";
import { hostOf, previewSplit } from "../workspace";
import { useStore, call, decodeBase64Json, errToast, isLive, toast } from "../store";
import { ConversationHistory, cursor, mergeHistory } from "./ConversationHistory";
import { browserLinkUrl as answerUrl } from "../browser-links";
import { RunPanel } from "./RunPanel";
import { I } from "./icons";

type DraftState = ReturnType<typeof useStore.getState>;
/** The text a conversation's composer edits: the pending question's answer, the chat draft, or the new-chat draft. */
const draftText = (s: DraftState, id: string | null | undefined, answerRunId?: string, answerQuestion?: string) => {
  if (answerRunId) { const draft = s.runAnswerDrafts[answerRunId]; return draft?.question === answerQuestion ? draft?.text ?? "" : ""; }
  return id ? s.conversationDrafts[draftKey(id)] ?? "" : s.agentDraft;
};

/** Owns the draft subscription so typing re-renders the input, never the thread. */
const ComposerInput = memo(function ComposerInput({ id, answerRunId, answerQuestion, disabled, sendDisabled, placeholder, maxLength, inputProps, onChange, onSend, children }: {
  id: string | null | undefined; answerRunId?: string; answerQuestion?: string; disabled: boolean; sendDisabled: boolean; placeholder: string; maxLength?: number;
  inputProps: Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onPaste" | "onDragOver" | "onDrop">; onChange(value: string): void; onSend(): void; children?: ReactNode;
}) {
  const text = useStore(s => draftText(s, id, answerRunId, answerQuestion));
  return <div className="conversation-input"><textarea {...inputProps} maxLength={maxLength} disabled={disabled} aria-label="Reply to conversation" placeholder={placeholder} value={text} onChange={e => onChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onSend(); } }}/>{children}<button className="icon-btn" aria-label="Send message" disabled={sendDisabled || !text.trim()} onClick={onSend}>{I.send}</button></div>;
});

type ConversationSpaceContext = { workspace: Workspace | null; memory: WorkspaceMemory | null; assigned?: boolean; taskId?: string; memoryPreview?: string; browsingPreview?: string };

function LivePage({ pageId }: { pageId: string }) {
  const img = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let gone = false;
    let objectUrl = "";
    const show = (image: string) => {
      if (gone || !img.current) return;
      img.current.src = image;
      setReady(current => current || true);
    };
    let timer = 0;
    const stopFrames = bridge.onPreviewFrame(frame => {
      if (frame.pageId !== pageId || !frame.image?.byteLength || gone) return;
      const previous = objectUrl;
      objectUrl = URL.createObjectURL(new Blob([frame.image as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }));
      show(objectUrl);
      if (previous) URL.revokeObjectURL(previous);
    });
    void bridge.watchPreview(pageId).catch(() => {
      const pull = () => {
        if (gone) return;
        void bridge.preview(pageId).then(url => { if (url) show(url); }).catch(() => {}).finally(() => {
          if (!gone) timer = window.setTimeout(pull, 700);
        });
      };
      pull();
    });
    return () => {
      gone = true;
      window.clearTimeout(timer);
      stopFrames();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      void bridge.unwatchPreview(pageId).catch(() => {});
    };
  }, [pageId]);
  return <>
    <img ref={img} alt="" hidden={!ready} />
    {!ready && <p>Watching this page…</p>}
  </>;
}

function RunSources({ sources, onOpen }: { sources: ConversationSource[]; onOpen: (source: ConversationSource) => void }) {
  if (!sources.length) return null;
  return <details className="conversation-sources"><summary>{I.globe}<span>Sources</span><span className="count nums">{sources.length}</span></summary><div>
    {sources.map(source => <button key={source.sourceId} onClick={() => onOpen(source)} title={source.url}>
      <span><b>{source.title}</b><small>{hostOf(source.url)} · observed {new Date(source.observedAt).toLocaleString()}</small></span>{I.open}
    </button>)}
    <p>Observed browser pages provide provenance, not independent proof of an external outcome.</p>
  </div></details>;
}

export function Conversation({ chatId, embedded = false, onChatCreated }: { chatId?: string | null; embedded?: boolean; onChatCreated?: (chatId: string) => void } = {}) {
  const fullPageId = useStore(s => s.conversationId);
  const id = chatId === undefined ? fullPageId : chatId;
  const scrolling = useConversationScroll(id);
  useEffect(() => {
    if (id || embedded) return;
    const pending = readPendingConversation(typeof localStorage === "undefined" ? null : localStorage);
    if (pending) useStore.setState({ conversationId: pending });
  }, [id, embedded]);
  const runs = useStore(s => s.runs);
  // Digest re-renders on structure/navigation change only — loading/favicon churn doesn't.
  useStore(useShallow(s => s.pages.map(p => `${p.pageId}${p.url}${p.title}${p.ownedByRuntime ? 1 : 0}${p.viewStatus}${p.backend}${p.navigationError ? 1 : 0}${p.showBlankDocument ? 1 : 0}`)));
  const pages = useStore.getState().pages;
  const activePageId = useStore(s => s.activePageId);
  const layout = useStore(s => s.layout);
  const connected = useStore(s => s.connected);
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
      if (before) scrolling.preservePosition();
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
  const sendPending = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [images, setImages] = useState<ConversationImage[]>([]);
  const [attachments, setAttachments] = useState<ConversationAttachment[]>([]);
  const [conversationSources, setConversationSources] = useState<ConversationSource[]>([]);
  const [workspaceContext, setWorkspaceContext] = useState<ConversationSpaceContext>({ workspace: null, memory: null });

  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewMenu, setPreviewMenu] = useState(false);
  const previewRoot = useRef<HTMLDivElement>(null);
  const createdChat = useRef<string | null>(null);
  useEffect(() => {
    setPreviewOpen(true);
    setPreviewMenu(false);

    createdChat.current = null;
  }, [id]);
  const [contextLoading, setContextLoading] = useState(false);
  const loadedContextChat = useRef<string | null>(null);
  const [contextError, setContextError] = useState("");
  const [contextRefresh, setContextRefresh] = useState(0);
  const [documentSaving, setAttachmentSaving] = useState(false);
  const [imageOperations, setImageOperations] = useState(0);
  const [incomingImage, setIncomingImage] = useState<File | null>(null);
  const attachmentSaving = documentSaving || imageOperations > 0;
  const resultPreview = useStore(state => state.resultPreview);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const activeChat = useRef(id);
  activeChat.current = id;
  const documentBusy = useRef(false);
  const conversationRoot = useRef<HTMLElement>(null);
  useEffect(() => { setIncomingImage(null); setImagePreview(null); setDocumentPreview(null); setImages([]); setAttachments([]); setConversationSources([]); setWorkspaceContext({ workspace: null, memory: null }); }, [id]);
  const [taskTitle, setTaskTitle] = useState("");
  const [archived, setArchived] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const metadataRequest=useRef(0);
  const [savedTitle, setSavedTitle] = useState("");
  useEffect(() => {
    let live = true;
    const version=++metadataRequest.current;
    setSavedTitle(""); setArchived(false);
    if (id && id !== "history") void call<ConversationSummary | null>("conversations.get", {chatId:id})
      .then(value => { if (live && version===metadataRequest.current) {setSavedTitle(value?.title ?? "");setArchived(value?.archived??false);} }).catch(() => {});
    return () => { live = false; };
  }, [id]);
  useEffect(()=>bridge.onEvent(event=>{
    if(event.type!=="conversation.changed"||event.payload.chatId!==id)return;
    ++metadataRequest.current;
    if(typeof event.payload.title==="string")setSavedTitle(event.payload.title);
    if(typeof event.payload.archived==="boolean")setArchived(event.payload.archived);
  }),[id]);
  const restoreConversation=async()=>{
    if(!id||restoring)return;setRestoring(true);
    try{const value=await call<ConversationSummary>("conversations.archive",{chatId:id,archived:false});if(activeChat.current===id)setArchived(value.archived);}
    catch(error){errToast(error);}finally{setRestoring(false);}
  };
  const contexts = useStore(s => s.conversationContexts);
  const contextPage = contexts[id ? draftKey(id) : "new"] ?? (id ? "linked" : "active");
  const setContextPage = (pageId: string) => useStore.getState().setConversationContext(id,pageId);
  const [reopening, setReopening] = useState(false);
  const turns = useMemo(() => runs.filter(r => (r.config?.chatId ?? r.runId) === id).sort((a,b) => a.createdAt - b.createdAt), [runs, id]);
  const last = turns.at(-1);
  const answering = last?.status === "needs_input";
  const answerRunId = answering ? last?.runId : undefined, answerQuestion = last?.statusMessage;
  const [sendingChat, setSendingChat] = useState<string | null>(null);
  const pendingTurns = useStore(useShallow(s => s.pendingTurns.filter(turn => turn.chatId === (id ?? sendingChat))));
  const answerPending = useStore(s=>!!last && !!s.runAnswerPending[last.runId]);
  const [sendError,setSendError]=useState("");
  useEffect(()=>setSendError(""),[id,last?.runId,last?.statusMessage]);
  const readText = () => draftText(useStore.getState(), id, answerRunId, answerQuestion);
  const setText = (value:string) => {
    setSendError("");
    if(answering && last)useStore.getState().setRunAnswerDraft(last.runId,last.statusMessage ?? "",value);
    else if(id)useStore.getState().setConversationDraft(id,value);
    else useStore.getState().setAgentDraft(value);
  };
  const openSource = async (source: ConversationSource) => {
    try {
      const existing = pages.find(page => (page.pageId === source.pageId || page.url === source.url) && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
      if (existing) await useStore.getState().activate(existing.pageId);
      else await useStore.getState().newTab(source.url);
    } catch (error) { errToast(error); }
  };
  const linked = pages.find(p => p.pageId === last?.pageIds[0] && !["crashed", "detached"].includes(p.viewStatus ?? ""));
  const selectedContext = conversationPage(pages, contextPage, activePageId, linked?.pageId);
  const missingContext = !["active", "linked", "none"].includes(contextPage) && !selectedContext;
  const observations = useStore(s => s.observations);
  const lastObservation = [...turns].reverse().map(run => observations[run.runId]).find(observation => observation && answerUrl(observation.url));
  const recoverUrl = lastObservation ? answerUrl(lastObservation.url) : "";
  // Reopening a closed page needs the run's last observation, which only lands
  // in the store via live events — hydrate it from the run's step ledger when
  // the conversation is revisited in a later session.
  useEffect(() => {
    const runId = last?.runId;
    if (!runId || observations[runId]) return;
    let live = true;
    void (async () => {
      const d = await call<{ steps: StepRecord[] }>("runs.get", { runId });
      const artifactId = [...(d.steps ?? [])].reverse().map(step => (step.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId).find(Boolean);
      if (!artifactId) return;
      const res = await call<{ dataBase64: string }>("artifacts.read", { artifactId });
      const observation = decodeBase64Json<CompactObservation>(res.dataBase64);
      if (live && observation && typeof observation.url === "string") {
        useStore.setState(s => s.observations[runId] ? {} : { observations: { ...s.observations, [runId]: observation } });
      }
    })().catch(() => {});
    return () => { live = false; };
  }, [last?.runId, observations]);
  useEffect(() => {
    if (!previewMenu) return;
    const close = (event: PointerEvent) => {
      if (!previewRoot.current?.contains(event.target as Node)) setPreviewMenu(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPreviewMenu(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [previewMenu]);
  const live = !!last && isLive(last);
  const boundTaskId = last?.config?.taskId ?? workspaceContext.taskId;
  const taskBound = !!boundTaskId;
  useEffect(() => {
    let cancelled = false;
    const taskId = boundTaskId;
    if (!taskId) { setTaskTitle(""); return; }
    void call<{ task: { title: string } }>("tasks.get", { taskId }).then(value => { if (!cancelled) setTaskTitle(value.task.title); }).catch(() => { if (!cancelled) setTaskTitle(""); });
    return () => { cancelled = true; };
  }, [boundTaskId]);

  useEffect(() => {
    let cancelled = false;
    if (!connected || attachmentSaving) { setContextLoading(false); return; }
    setContextError(""); setContextLoading(!!id);
    if (!id) { setImages([]); setAttachments([]); setConversationSources([]); setWorkspaceContext({ workspace: null, memory: null }); return; }
    void Promise.all([
      call<{ images: ConversationImage[] }>("conversations.images.get", { chatId: id }),
      call<{ attachments: ConversationAttachment[] }>("conversations.attachments.get", { chatId: id }),
      call<ConversationSpaceContext>("conversations.workspace.get", { chatId: id }),
      call<{ sources: ConversationSource[] }>("conversations.sources.get", { chatId: id }),
    ]).then(([imageReferences, documents, workspace, sourceList]) => { if (!cancelled) { loadedContextChat.current = id; setImages(imageReferences.images); setAttachments(documents.attachments); setWorkspaceContext(workspace); setConversationSources(sourceList.sources); } })
      .catch(error => { if (!cancelled) setContextError(error instanceof Error ? error.message : String(error)); })
      .finally(() => { if (!cancelled) setContextLoading(false); });
    return () => { cancelled = true; };
  }, [id, turns.length, last?.status, connected, contextRefresh, attachmentSaving]);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "conversation.context.changed" && event.payload.chatId === id) setContextRefresh(value => value + 1);
    if (["workspace.memory.updated", "workspace.browsingMemory.updated"].includes(event.type) && event.payload.workspaceId === workspaceContext.workspace?.workspaceId) setContextRefresh(value => value + 1);
  }), [id, workspaceContext.workspace?.workspaceId]);
  const ensureChatId = () => {
    if (id) return id;
    const chatId = crypto.randomUUID();
    createdChat.current = chatId;
    const text = readText();
    if (text) useStore.getState().setConversationDraft(chatId, text);
    useStore.getState().setConversationContext(chatId, contextPage);
    useStore.getState().setAgentDraft("");
    try { localStorage.setItem(PENDING_CHAT_KEY, chatId); } catch { /* in-window state still works */ }
    if (onChatCreated) onChatCreated(chatId);
    else useStore.setState({ conversationId: chatId });
    return chatId;
  };
  const removeImage = async (imageId: string) => {
    if (!id || documentBusy.current || attachmentSaving) return;
    const chatId = id;
    documentBusy.current = true; setImageOperations(count => count + 1);
    try {
      const result = await call<{images:ConversationImage[]}>("conversations.images.remove", {chatId,imageId});
      if (activeChat.current === chatId) { setImages(result.images); setImagePreview(null); setContextRefresh(value => value + 1); }
    } catch (error) { errToast(error); }
    finally { documentBusy.current = false; setImageOperations(count => Math.max(0,count - 1)); }
  };
  const changeDocument = async (attachmentId: string, included?: boolean) => {
    if (!id || documentBusy.current) return;
    documentBusy.current = true;
    setAttachmentSaving(true);
    try {
      const value = await call<{ attachments: ConversationAttachment[] }>(included === undefined ? "conversations.attachments.remove" : "conversations.attachments.toggle", { chatId: id, attachmentId, ...(included === undefined ? {} : { included }) });
      if (activeChat.current === id) { setAttachments(value.attachments); setDocumentPreview(null); }
    } catch (error) { errToast(error); }
    finally { documentBusy.current = false; setAttachmentSaving(false); }
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
        call<ConversationSpaceContext>("conversations.workspace.get", { chatId: id }),
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
    const text = readText();
    if (archived || !connected || !text.trim() || sendPending.current || answerPending) return;
    if (!answering && (attachmentSaving || missingContext || historyLoading || historyError || contextLoading || contextError || (live && last?.status !== "needs_input") || (taskBound && last?.status !== "needs_input"))) return;
    sendPending.current = true;
    setSending(true); setSendError("");
    try {
      if (last?.status === "needs_input") {
        await useStore.getState().answerRun(last.runId,text.trim());
        scrolling.jumpToLatest();
      } else {
        // Optimistic: the message leaves the composer and joins the thread now;
        // a failed start puts it back unless something new was typed meanwhile.
        const chatId = id ?? crypto.randomUUID();
        setSendingChat(chatId);
        setText("");
        if (activeChat.current === id) scrolling.jumpToLatest();
        const run = await useStore.getState().startRun(text, { chatId, pageId: selectedContext?.pageId ?? null, scope: selectedContext ? "page" : "new", presentation: embedded ? "rail" : "conversation", ownsDraft: true });
        if (run) { try { localStorage.removeItem(PENDING_CHAT_KEY); } catch { /* storage is optional */ } if (activeChat.current === id) scrolling.jumpToLatest(); }
        else if (!readText()) setText(text);
      }
    } catch (error) { setSendError(error instanceof Error ? error.message : String(error)); }
    finally { sendPending.current = false; setSending(false); setSendingChat(null); }
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
  const contextLocked = !connected || archived || live || contextLoading || !!contextError;
  const receiveImage = (files: File[]) => {
    if (contextLocked || attachmentSaving || incomingImage) { errToast(new Error("Wait for the current operation before adding an image.")); return; }
    if (files.length !== 1 || !["image/png", "image/jpeg", "image/webp"].includes(files[0]!.type)) { errToast(new Error("Paste or drop one PNG, JPEG or WebP image. Use Attach for documents.")); return; }
    if (images.length >= 4) { errToast(new Error("Four images are attached. Remove one before adding another.")); return; }
    setIncomingImage(files[0]!);
  };
  const imageInput = {
    onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = [...event.clipboardData.files];
      if (!files.length) return;
      event.preventDefault(); receiveImage(files);
    },
    onDragOver: (event: React.DragEvent<HTMLTextAreaElement>) => { if (event.dataTransfer.types.includes("Files")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } },
    onDrop: (event: React.DragEvent<HTMLTextAreaElement>) => {
      const files = [...event.dataTransfer.files];
      if (!files.length) return;
      event.preventDefault(); receiveImage(files);
    },
  };
  const imageTray = <ConversationImages incomingFile={incomingImage} onFileConsumed={file => setIncomingImage(current => current === file ? null : current)} chatId={id} page={selectedContext} images={images} disabled={contextLocked || attachmentSaving} ensureChatId={ensureChatId} onBusy={busy => setImageOperations(count => Math.max(0, count + (busy ? 1 : -1)))} onChange={(chatId, value) => { if (activeChat.current === chatId) { setImages(value); setContextRefresh(current => current + 1); } }} />;
  if (id === "history") return <ConversationHistory/>;
  const dictation = <Dictation draftKey={id ? draftKey(id) : "new"} key={`dictation-${id ?? "new"}`} disabled={archived || sending || answerPending || (live && last?.status !== "needs_input")} onInsert={words => {
        const state = useStore.getState();
        const current = answering && last ? state.runAnswerDrafts[last.runId]?.text ?? "" : id ? state.conversationDrafts[draftKey(id)] ?? "" : state.agentDraft;
        setText(current ? `${current}\n${words}` : words);
      }}/>;
  const closedPage = !linked && !!last?.pageIds.length;
  const splitPlan = selectedContext ? previewSplit(layout, pages, selectedContext.pageId, activePageId) : null;
  const openPreview = (where: "tab" | "split") => {
    if (!selectedContext) return;
    const pageId = selectedContext.pageId;
    setPreviewMenu(false);
    if (where === "tab") {
      void useStore.getState().activate(pageId).catch(errToast);
      return;
    }
    const state = useStore.getState();
    const plan = previewSplit(state.layout, state.pages, pageId, state.activePageId);
    if (!plan) {
      toast("Open another tab in this Space to use split view.");
      return;
    }
    void state.activate(plan.primary).then(() => {
      if (useStore.getState().activePageId === plan.primary) useStore.getState().setSplitPage(plan.companion);
    }).catch(errToast);
  };
  const browserPreview = !embedded && previewOpen && selectedContext && selectedContext.url !== "about:blank" ? <div className="conversation-preview" ref={previewRoot}>
    <div className="conversation-preview-title">{I.globe}<b>{selectedContext.title || "Browser tab"}</b><button type="button" className="conversation-preview-open" aria-label="Choose where to open this page" aria-haspopup="menu" aria-expanded={previewMenu} onClick={() => setPreviewMenu(value => !value)}>{I.open}</button></div>
    <button type="button" className="conversation-preview-live" aria-label={`Open ${selectedContext.title || "this page"}`} aria-expanded={previewMenu} onClick={() => setPreviewMenu(true)}>
      <LivePage pageId={selectedContext.pageId} />
    </button>
    {previewMenu && <div className="menu conversation-preview-menu" role="menu">
      <button type="button" className="menu-item" role="menuitem" onClick={() => openPreview("tab")}>{I.open}<span>Open in tab</span></button>
      {splitPlan && <button type="button" className="menu-item" role="menuitem" onClick={() => openPreview("split")}>{I.split}<span>Split view</span></button>}
    </div>}
  </div> : null;
  return <section ref={conversationRoot} className={`conversation${embedded ? " conversation-embedded" : ""}`} aria-label={embedded ? "Conversation" : undefined} aria-labelledby={embedded ? undefined : "conversation-title"}>
    {!embedded && <header className="conversation-head"><h1 id="conversation-title">{taskTitle || savedTitle || turns[0]?.goal || "New chat"}</h1><div className="sp"/>{selectedContext && selectedContext.url !== "about:blank" && <button className="icon-btn" aria-label={previewOpen ? "Hide browser preview" : "Show browser preview"} title="Browser preview" aria-pressed={previewOpen} onClick={() => setPreviewOpen(value => !value)}>{I.globe}</button>}{turns.length > 0 && <button className="icon-btn" disabled={exporting} title="Export conversation as Markdown" aria-label="Export conversation as Markdown" onClick={() => void exportConversation()}>{I.downloadSm}</button>}<button className="icon-btn" title="Continue in side panel" aria-label="Continue in side panel" onClick={() => useStore.getState().showConversationInRail(id)}>{I.rail}</button></header>}
    <div className="conversation-body"><div className="conversation-main">
    <div className="conversation-scroll" tabIndex={-1} ref={scrolling.scrollRef}><div className="conversation-thread" data-find-surface="conversation" ref={scrolling.threadRef}>
      {historyLoading && <p role="status" className="hint">Loading conversation…</p>}
      {historyError && <p role="alert">{historyError} <button className="btn sm" onClick={() => void loadTurns(earlier ?? undefined)}>Try again</button></p>}
      {earlier && !historyError && <button className="btn sm" disabled={historyLoading} onClick={() => void loadTurns(earlier)}>Load earlier messages</button>}
      {!turns.length && !historyLoading && !historyError && <div className="conversation-empty"><AuxMark /><h1>What would you like to work on?</h1><p>Ask a question or give Aux a task in the browser.</p></div>}
      {turns.map(run => <article className="conversation-turn" data-turn-id={run.runId} key={run.runId}><time dateTime={new Date(run.createdAt).toISOString()} title={new Date(run.createdAt).toLocaleString()}>{new Date(run.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time><div className="user-message">{run.goal}</div><RunPanel runId={run.runId} conversation readOnly={archived} retryPageId={selectedContext?.pageId} latest={run === last}/><RunSources sources={conversationSources.filter(source => source.runId === run.runId)} onOpen={source => void openSource(source)}/><RunImages runId={run.runId}/></article>)}
      {pendingTurns.map(turn => <article className="conversation-turn pending" key={turn.id} aria-busy="true"><time dateTime={new Date(turn.createdAt).toISOString()}>{new Date(turn.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time><div className="user-message">{turn.goal}</div><output className="hint">Starting…</output></article>)}
    </div></div>
    <div className="conversation-compose"><div className="conversation-compose-content">
      {scrolling.awayFromLatest && <div className="conversation-jump"><button className="btn sm" onClick={scrolling.jumpToLatest}>{I.down} Jump to latest</button></div>}
      {closedPage ? <div className="conversation-context-note"><span>{selectedContext ? selectedContext.title || selectedContext.url : "This chat’s page is closed."}</span>{recoverUrl && <button className="btn sm" disabled={reopening || live || taskBound} title={recoverUrl} onClick={() => void reopen()}>{reopening ? "Opening…" : "Reopen"}</button>}</div> : null}
      {archived && <div className="conversation-archive-notice" role="status"><span>This conversation is archived. Your draft is kept.</span>{!taskBound && <button className="btn sm" disabled={restoring} onClick={()=>void restoreConversation()}>{restoring?"Restoring…":"Restore to reply"}</button>}</div>}
      {id && resultPreview && <SavedResultPreview key={resultPreview} chatId={id} artifactId={resultPreview} contextDisabled={contextLocked} onClose={() => useStore.setState({resultPreview:null})}/> }
      {id && imagePreview && images.some(image => image.imageId === imagePreview) && <ImageSnapshot key={`${id}:${imagePreview}`} chatId={id} imageId={imagePreview} onClose={() => setImagePreview(null)} />}
      {id && documentPreview && <DocumentSnapshot key={`${id}:${documentPreview}`} chatId={id} attachmentId={documentPreview} onClose={() => setDocumentPreview(null)} />}
      {attachments.length > 0 && <div className="composer-documents" aria-label="Attached documents">{attachments.map(item => <div key={item.attachmentId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setImagePreview(null); setDocumentPreview(item.attachmentId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button></div>)}</div>}
      {images.length > 0 && <div className="composer-documents" aria-label="Attached images">{images.map(item => <div key={item.imageId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setDocumentPreview(null); setImagePreview(item.imageId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void removeImage(item.imageId)}>{I.close}</button></div>)}</div>}
      {imageTray}
      {!connected && <p className="hint" role="status">Connecting to Aux… You can keep writing.</p>}
      {sendError && <p className="field-error" role="alert">{sendError} Your reply is kept.</p>}
      {taskBound ? <>
      <ConversationTask key={boundTaskId} taskId={boundTaskId!} live={live} disabled={attachmentSaving || contextLocked || historyLoading || !!historyError} page={selectedContext} context={contextPage} linkedPageId={linked?.pageId} onContext={setContextPage} onStarted={() => { if (activeChat.current === id) scrolling.jumpToLatest(); }} />

      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {last?.status === "needs_input" && <ComposerInput id={id} answerRunId={answerRunId} answerQuestion={answerQuestion} inputProps={imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} placeholder="Answer Aux’s question…" sendDisabled={archived || !connected || sending || answerPending} onChange={setText} onSend={() => void send()} />}
      </> : <>
      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {missingContext && !closedPage && <p className="field-error" role="status">The selected tab is unavailable. Choose another browser context before sending.</p>}
      <ComposerInput id={id} answerRunId={answerRunId} answerQuestion={answerQuestion} inputProps={imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} placeholder={last?.status === "needs_input" ? "Answer Aux’s question…" : turns.length ? "Reply, or give Aux a task…" : selectedContext && selectedContext.url !== "about:blank" ? "Ask about this page…" : "Ask Aux a task…"} sendDisabled={archived || !connected || sending || answerPending || (!answering && (attachmentSaving || missingContext || historyLoading || !!historyError || contextLoading || !!contextError || live))} onChange={setText} onSend={() => void send()}>{dictation}</ComposerInput>
      </>}
    </div></div>
    </div>{browserPreview}</div>
  </section>;
}
