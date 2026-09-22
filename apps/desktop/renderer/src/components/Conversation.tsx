import { RunImages } from "./RunImages";
import { Dictation } from "./Dictation";
import { ImageSnapshot } from "./ImageSnapshot";
import { SavedResultPreview } from "./SavedResultPreview";
import { AttachPage, type PageAttachmentResult } from "./AttachPage";
import { ConversationImages } from "./ConversationImages";
import { DocumentSnapshot } from "./DocumentSnapshot";
import { AuxMark } from "./AuxMark";
import { ConversationTask } from "./ConversationTask";
import { useConversationScroll } from "../use-conversation-scroll";
import { conversationPage } from "../conversation-page";
import { useEffect, useRef, useState } from "react";
import type { ConversationImage, ConversationArtifact, ConversationAttachment, ConversationSummary, ConversationSource, PageTarget, Run, Workspace, WorkspaceMemory } from "@vector/contracts";
import { draftKey, PENDING_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { conversationMarkdown } from "../conversation-export";
import { bridge } from "../bridge";
import { previewSplit } from "../workspace";
import { useStore, call, errToast, isLive, toast } from "../store";
import { ConversationHistory, cursor, mergeHistory } from "./ConversationHistory";
import { answerUrl } from "./AnswerMarkdown";
import { RunPanel } from "./RunPanel";
import { I } from "./icons";

type ConversationSpaceContext = { workspace: Workspace | null; memory: WorkspaceMemory | null; assigned?: boolean; taskId?: string; memoryPreview?: string; browsingPreview?: string };

function LivePage({ pageId }: { pageId: string }) {
  const img = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let gone = false;
    const show = (image: string) => {
      if (gone || !img.current) return;
      img.current.src = image;
      setReady(current => current || true);
    };
    let timer = 0;
    const stopFrames = bridge.onPreviewFrame(frame => {
      if (frame.pageId === pageId && frame.image) show(frame.image);
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
      void bridge.unwatchPreview(pageId).catch(() => {});
    };
  }, [pageId]);
  return <>
    <img ref={img} alt="" hidden={!ready} />
    {!ready && <p>Watching this page…</p>}
  </>;
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
  const pages = useStore(s => s.pages);
  const activePageId = useStore(s => s.activePageId);
  const layout = useStore(s => s.layout);
  const connected = useStore(s => s.connected);
  const conversationDraft = useStore(s => id ? s.conversationDrafts[draftKey(id)] ?? "" : s.agentDraft);
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
  const [workspaceContext, setWorkspaceContext] = useState<ConversationSpaceContext>({ workspace: null, memory: null });
  const [workspaceSaving] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewMenu, setPreviewMenu] = useState(false);
  const previewRoot = useRef<HTMLDivElement>(null);
  const createdChat = useRef<string | null>(null);
  useEffect(() => {
    setPreviewOpen(true);
    setPreviewMenu(false);
    if (createdChat.current !== id) setContextOpen(false);
    createdChat.current = null;
  }, [id]);
  const [contextLoading, setContextLoading] = useState(false);
  const loadedContextChat = useRef<string | null>(null);
  const [contextError, setContextError] = useState("");
  const [contextRefresh, setContextRefresh] = useState(0);
  const [contextSaving] = useState(false);
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
  useEffect(() => { setIncomingImage(null); setImagePreview(null); setDocumentPreview(null); setImages([]); setAttachments([]); setWorkspaceContext({ workspace: null, memory: null }); }, [id]);
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
  const turns = runs.filter(r => (r.config?.chatId ?? r.runId) === id).sort((a,b) => a.createdAt - b.createdAt);
  const last = turns.at(-1);
  const answering = last?.status === "needs_input";
  const answerDraft = useStore(s=>last ? s.runAnswerDrafts[last.runId] : undefined);
  const answerPending = useStore(s=>!!last && !!s.runAnswerPending[last.runId]);
  const [sendError,setSendError]=useState("");
  useEffect(()=>setSendError(""),[id,last?.runId,last?.statusMessage]);
  const text = answering ? (answerDraft?.question === last?.statusMessage ? answerDraft?.text ?? "" : "") : conversationDraft;
  const setText = (value:string) => {
    setSendError("");
    if(answering && last)useStore.getState().setRunAnswerDraft(last.runId,last.statusMessage ?? "",value);
    else if(id)useStore.getState().setConversationDraft(id,value);
    else useStore.getState().setAgentDraft(value);
  };
  const linked = pages.find(p => p.pageId === last?.pageIds[0] && !["crashed", "detached"].includes(p.viewStatus ?? ""));
  const selectedContext = conversationPage(pages, contextPage, activePageId, linked?.pageId);
  const missingContext = !["active", "linked", "none"].includes(contextPage) && !selectedContext;
  const observations = useStore(s => s.observations);
  const lastObservation = [...turns].reverse().map(run => observations[run.runId]).find(observation => observation && answerUrl(observation.url));
  const recoverUrl = lastObservation ? answerUrl(lastObservation.url) : "";
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
    if (!connected || attachmentSaving || contextSaving || workspaceSaving) { setContextLoading(false); return; }
    setContextError(""); setContextLoading(!!id);
    if (!id) { setImages([]); setAttachments([]); setWorkspaceContext({ workspace: null, memory: null }); return; }
    void Promise.all([
      call<{ images: ConversationImage[] }>("conversations.images.get", { chatId: id }),
      call<{ attachments: ConversationAttachment[] }>("conversations.attachments.get", { chatId: id }),
      call<ConversationSpaceContext>("conversations.workspace.get", { chatId: id }),
    ]).then(([imageReferences, documents, workspace]) => { if (!cancelled) { loadedContextChat.current = id; setImages(imageReferences.images); setAttachments(documents.attachments); setWorkspaceContext(workspace); } })
      .catch(error => { if (!cancelled) setContextError(error instanceof Error ? error.message : String(error)); })
      .finally(() => { if (!cancelled) setContextLoading(false); });
    return () => { cancelled = true; };
  }, [id, turns.length, last?.status, connected, contextRefresh, attachmentSaving, contextSaving, workspaceSaving]);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "conversation.context.changed" && event.payload.chatId === id) setContextRefresh(value => value + 1);
    if (["workspace.memory.updated", "workspace.browsingMemory.updated"].includes(event.type) && event.payload.workspaceId === workspaceContext.workspace?.workspaceId) setContextRefresh(value => value + 1);
  }), [id, workspaceContext.workspace?.workspaceId]);
  useEffect(() => {
    if (!id) return;
    const refresh = () => { if (document.visibilityState !== "hidden") setContextRefresh(value => value + 1); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [id]);
  const ensureChatId = () => {
    if (id) return id;
    const chatId = crypto.randomUUID();
    createdChat.current = chatId;
    if (text) useStore.getState().setConversationDraft(chatId, text);
    useStore.getState().setConversationContext(chatId, contextPage);
    useStore.getState().setAgentDraft("");
    try { localStorage.setItem(PENDING_CHAT_KEY, chatId); } catch { /* in-window state still works */ }
    if (onChatCreated) onChatCreated(chatId);
    else useStore.setState({ conversationId: chatId });
    return chatId;
  };
  const addDocument = async () => {
    if (documentBusy.current) return;
    documentBusy.current = true;
    const originChat = id;
    setAttachmentSaving(true);
    try {
      const picked = await bridge.pickEvidenceDocument();
      if (!picked || activeChat.current !== originChat) return;
      const chatId = ensureChatId();
      activeChat.current = chatId;
      const value = await call<{ attachments: ConversationAttachment[] }>("conversations.attachments.add", { chatId, ...picked });
      if (activeChat.current === chatId) { setAttachments(value.attachments); setContextRefresh(value => value + 1); }
    } catch (error) { errToast(error); }
    finally { documentBusy.current = false; setAttachmentSaving(false); }
  };
  const attachPages = async (selected: PageTarget[]): Promise<PageAttachmentResult> => {
    if (documentBusy.current || attachmentSaving) throw new Error("Wait for the current attachment to finish.");
    if (!selected.length || selected.length > 5 - attachments.length) throw new Error("Choose tabs within the remaining snapshot limit.");
    documentBusy.current = true; setAttachmentSaving(true);
    const chatId = ensureChatId(); activeChat.current = chatId;
    const result: PageAttachmentResult = {attached:[], errors:[]};
    try {
      for (const page of selected) {
        if (activeChat.current !== chatId) break;
        try {
          const value = await call<{ attachments: ConversationAttachment[] }>("conversations.attachments.page", { chatId, pageId: page.pageId, expectedDocumentEpoch: page.documentEpoch });
          result.attached.push(page.pageId);
          if (activeChat.current === chatId) setAttachments(value.attachments);
        } catch (error) { result.errors.push(`${page.title || page.url}: ${error instanceof Error ? error.message : String(error)}`); }
      }
      if (activeChat.current === chatId) setContextRefresh(current => current + 1);
      if (result.attached.length) useStore.getState().toast(`Attached ${result.attached.length} ${result.attached.length === 1 ? "tab" : "tabs"}.${result.errors.length ? ` ${result.errors.length} could not be attached.` : ""}`);
      // A newly assigned chat ID remounts the picker, so errors also reach the shell.
      if (result.errors.length) errToast(result.errors.join("\n"));
      return result;
    } finally {
      documentBusy.current = false; setAttachmentSaving(false);
      requestAnimationFrame(() => {
        if (activeChat.current === chatId && document.activeElement === document.body)
          conversationRoot.current?.querySelector<HTMLButtonElement>(".attach-page > button")?.focus();
      });
    }
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
    if (archived || !connected || !text.trim() || sendPending.current || answerPending) return;
    if (!answering && (attachmentSaving || contextSaving || workspaceSaving || missingContext || historyLoading || historyError || contextLoading || contextError || (live && last?.status !== "needs_input") || (taskBound && last?.status !== "needs_input"))) return;
    sendPending.current = true;
    setSending(true); setSendError("");
    try {
      if (last?.status === "needs_input") {
        await useStore.getState().answerRun(last.runId,text.trim());
        scrolling.jumpToLatest();
      } else {
        const run = await useStore.getState().startRun(text, { chatId: id ?? crypto.randomUUID(), pageId: selectedContext?.pageId ?? null, scope: selectedContext ? "page" : "new", presentation: embedded ? "rail" : "conversation" });
        if (run) { try { localStorage.removeItem(PENDING_CHAT_KEY); } catch { /* storage is optional */ } if ((id ? useStore.getState().conversationDrafts[draftKey(id)] : useStore.getState().agentDraft) === text) setText(""); if (activeChat.current === id) scrolling.jumpToLatest(); }
      }
    } catch (error) { setSendError(error instanceof Error ? error.message : String(error)); }
    finally { sendPending.current = false; setSending(false); }
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
    setIncomingImage(files[0]!); setContextOpen(true);
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
  const attachmentPanel = contextOpen && (!contextLoading || loadedContextChat.current === id) && !contextError ? <div className="context-body" aria-label="Add to this reply"><div className="context-attach"><button className="btn sm" disabled={attachmentSaving || contextLocked || attachments.length >= 5} onClick={() => void addDocument()}>{attachmentSaving ? "Adding…" : "Document"}</button>
    <AttachPage key={id ?? "new"} pages={pages} disabled={attachmentSaving || contextLocked || attachments.length >= 5} remaining={Math.max(0, 5 - attachments.length)} onAttach={attachPages}/></div>
    <ConversationImages incomingFile={incomingImage} onFileConsumed={file => setIncomingImage(current => current === file ? null : current)} chatId={id} page={selectedContext} images={images} disabled={contextLocked || attachmentSaving} ensureChatId={ensureChatId} onBusy={busy => setImageOperations(count => Math.max(0, count + (busy ? 1 : -1)))} onChange={(chatId, value) => { if (activeChat.current === chatId) { setImages(value); setContextRefresh(current => current + 1); } }} />
    {attachments.length > 0 ? <div className="conversation-document-list">{attachments.map(item => <div className="conversation-document" key={item.attachmentId}>
      <label><input type="checkbox" checked={item.included} disabled={attachmentSaving || contextLocked} onChange={event => void changeDocument(item.attachmentId, event.target.checked)}/><span><b>{item.filename}</b><small>{item.sourceUrl ? `${new URL(item.sourceUrl).hostname} · ${item.sourceTruncated ? "Partial page" : "Page snapshot"}` : `${Math.max(1, Math.ceil(item.byteLength / 1024))} KB · ${item.excerpt || "Empty document"}`}</small></span></label>
      <button className="btn sm ghost" onClick={() => { setContextOpen(false); setImagePreview(null); setDocumentPreview(item.attachmentId); }}>Preview</button>
      <button className="icon-btn xs" aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button>
    </div>)}</div> : !images.length ? <p className="hint">Nothing attached. Add a document, a page, or an image.</p> : null}
  </div> : null;
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
      {turns.map(run => <article className="conversation-turn" data-turn-id={run.runId} key={run.runId}><time dateTime={new Date(run.createdAt).toISOString()} title={new Date(run.createdAt).toLocaleString()}>{new Date(run.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time><div className="user-message">{run.goal}</div><RunPanel runId={run.runId} conversation readOnly={archived} retryPageId={selectedContext?.pageId}/><RunImages runId={run.runId}/></article>)}
    </div></div>
    <div className="conversation-compose"><div className="conversation-compose-content">
      {scrolling.awayFromLatest && <div className="conversation-jump"><button className="btn sm" onClick={scrolling.jumpToLatest}>{I.down} Jump to latest</button></div>}
      {closedPage ? <div className="conversation-context-note"><span>{selectedContext ? selectedContext.title || selectedContext.url : "This chat’s page is closed."}</span>{recoverUrl && <button className="btn sm" disabled={reopening || live || taskBound} title={recoverUrl} onClick={() => void reopen()}>{reopening ? "Opening…" : "Reopen"}</button>}</div> : null}
      {archived && <div className="conversation-archive-notice" role="status"><span>This conversation is archived. Your draft is kept.</span>{!taskBound && <button className="btn sm" disabled={restoring} onClick={()=>void restoreConversation()}>{restoring?"Restoring…":"Restore to reply"}</button>}</div>}
      {id && resultPreview && <SavedResultPreview key={resultPreview} chatId={id} artifactId={resultPreview} contextDisabled={contextLocked} onClose={() => useStore.setState({resultPreview:null})}/> }
      {id && imagePreview && images.some(image => image.imageId === imagePreview) && !contextOpen && <ImageSnapshot key={`${id}:${imagePreview}`} chatId={id} imageId={imagePreview} onClose={() => setImagePreview(null)} />}
      {id && documentPreview && <DocumentSnapshot key={`${id}:${documentPreview}`} chatId={id} attachmentId={documentPreview} onClose={() => setDocumentPreview(null)} />}
      {!contextOpen && attachments.length > 0 && <div className="composer-documents" aria-label="Attached documents">{attachments.map(item => <div key={item.attachmentId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setContextOpen(false); setImagePreview(null); setDocumentPreview(item.attachmentId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button></div>)}</div>}
      {!contextOpen && images.length > 0 && <div className="composer-documents" aria-label="Attached images">{images.map(item => <div key={item.imageId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setDocumentPreview(null); setImagePreview(item.imageId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void removeImage(item.imageId)}>{I.close}</button></div>)}</div>}
      {!connected && <p className="hint" role="status">Connecting to Aux… You can keep writing.</p>}
      {sendError && <p className="field-error" role="alert">{sendError} Your reply is kept.</p>}
      {taskBound ? <>
      <ConversationTask key={boundTaskId} taskId={boundTaskId!} live={live} disabled={attachmentSaving || contextSaving || workspaceSaving || contextLocked || historyLoading || !!historyError} page={selectedContext} context={contextPage} linkedPageId={linked?.pageId} onContext={setContextPage} onStarted={() => { if (activeChat.current === id) scrolling.jumpToLatest(); }} />
      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {attachmentPanel}
      {last?.status === "needs_input" && <div className="conversation-input"><button type="button" className="icon-btn context-toggle" aria-label={contextOpen ? "Close attachments" : "Add to this reply"} aria-pressed={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.plus}</button><textarea {...imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} aria-label="Reply to conversation" placeholder="Answer Aux’s question…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send(); } }}/><button className="icon-btn" aria-label="Send message" disabled={archived || !connected || sending || answerPending || !text.trim()} onClick={() => void send()}>{I.send}</button></div>}
      </> : <>
      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {attachmentPanel}
      {missingContext && !closedPage && <p className="field-error" role="status">The selected tab is unavailable. Choose another browser context before sending.</p>}
      <div className="conversation-input"><button type="button" className="icon-btn context-toggle" aria-label={contextOpen ? "Close attachments" : "Add to this reply"} aria-pressed={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.plus}</button><textarea {...imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} aria-label="Reply to conversation" placeholder={last?.status === "needs_input" ? "Answer Aux’s question…" : turns.length ? "Reply, or give Aux a task…" : selectedContext && selectedContext.url !== "about:blank" ? "Ask about this page…" : "Ask Aux a task…"} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send(); } }}/>{dictation}<button className="icon-btn" aria-label="Send message" disabled={archived || !connected || sending || answerPending || !text.trim() || (!answering && (attachmentSaving || contextSaving || workspaceSaving || missingContext || historyLoading || !!historyError || contextLoading || !!contextError || live))} onClick={() => void send()}>{I.send}</button></div>
      </>}
    </div></div>
    </div>{browserPreview}</div>
  </section>;
}
