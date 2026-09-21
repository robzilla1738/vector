import { RunImages } from "./RunImages";
import { Dictation } from "./Dictation";
import { backgroundLink, browserLinkUrl, openBrowserLink } from "../browser-links";
import { ImageSnapshot } from "./ImageSnapshot";
import { SavedResultPreview } from "./SavedResultPreview";
import { memorySourceExcluded } from "@vector/contracts/memory-context";
import { AttachPage, type PageAttachmentResult } from "./AttachPage";
import { ConversationImages } from "./ConversationImages";
import { DocumentSnapshot } from "./DocumentSnapshot";
import { AuxMark } from "./AuxMark";
import { SaveConversationTask } from "./SaveConversationTask";
import { ConversationTask } from "./ConversationTask";
import { SpaceMemoryEditor } from "./SpaceMemoryEditor";
import { useConversationScroll } from "../use-conversation-scroll";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { conversationPage } from "../conversation-page";
import { openSavedTask } from "../task-navigation";
import { useEffect, useRef, useState } from "react";
import type { ConversationImage, ConversationArtifact, ConversationAttachment, ConversationSummary, ConversationContext as ConversationContextState, ConversationSource, PageTarget, Run, Workspace, WorkspaceMemory } from "@vector/contracts";
import { sourcedWorkbookSnapshot } from "@vector/contracts";
import { draftKey, PENDING_CHAT_KEY, readPendingConversation } from "../conversation-drafts";
import { conversationMarkdown } from "../conversation-export";
import { bridge } from "../bridge";
import { useStore, call, errToast, isLive, toast } from "../store";
import { ConversationHistory, cursor, mergeHistory } from "./ConversationHistory";
import { answerUrl } from "./AnswerMarkdown";
import { RunPanel } from "./RunPanel";
import { I } from "./icons";

type ConversationSpaceContext = { workspace: Workspace | null; memory: WorkspaceMemory | null; assigned?: boolean; taskId?: string; memoryPreview?: string; browsingPreview?: string };

function RunSources({ sources, onOpen }: { sources: ConversationSource[]; onOpen: (source: ConversationSource, background: boolean) => void }) {
  const links = sources.filter(source => browserLinkUrl(source.url));
  if (!links.length) return null;
  return <details className="conversation-sources"><summary>{I.globe}<span>Sources</span><span className="count nums">{links.length}</span></summary><div>
    {links.map(source => <a key={source.sourceId} href={source.url} onClick={event => { event.preventDefault(); onOpen(source, backgroundLink(event)); }} onAuxClick={event => { if (event.button === 1) { event.preventDefault(); onOpen(source, true); } }} title={source.url}>
      <span><b>{source.title}</b><small>{new URL(source.url).hostname} · observed {new Date(source.observedAt).toLocaleString()}</small></span>{I.open}
    </a>)}
    <p>Observed browser pages provide provenance, not independent proof of an external outcome.</p>
    <button className="btn sm ghost" onClick={() => void (async () => {
      const rows = [["Title", "Host"], ...links.map(source => [source.title, new URL(source.url).hostname])];
      const snapshot = sourcedWorkbookSnapshot("Sources", rows, links.map(source => source.url));
      if (await bridge.saveWorkbook(JSON.stringify(snapshot))) toast("Sourced workbook exported");
    })().catch(errToast)}>Export sourced workbook…</button>
    <p>Excel export stores cell values plus http(s) source hyperlinks. Formatting, formulas and images are not created.</p>
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
  const pages = useStore(s => s.pages);
  const activePageId = useStore(s => s.activePageId);
  const settings = useStore(s => s.settings);
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
  const [contextState, setContextState] = useState<ConversationContextState | null>(null);
  const [images, setImages] = useState<ConversationImage[]>([]);
  const [attachments, setAttachments] = useState<ConversationAttachment[]>([]);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<ConversationArtifact[]>([]);
  const [sources, setSources] = useState<ConversationSource[]>([]);
  const [sourceError,setSourceError]=useState("");
  const [sourceLoading,setSourceLoading]=useState(false);
  const [sourceRefresh,setSourceRefresh]=useState(0);
  const sourceChat=useRef(id);
  const spaces = useStore(state => state.layout.spaces);
  const activeSpaceId = useStore(state => state.layout.activeSpaceId);
  const [workspaceContext, setWorkspaceContext] = useState<ConversationSpaceContext>({ workspace: null, memory: null });
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextSection, setContextSection] = useState<"history" | "documents" | "memory" | "results">("documents");
  const contextBusy = useRef(false);
  const workspaceBusy = useRef(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const createdChat = useRef<string | null>(null);
  useEffect(() => {
    setOptionsOpen(false); setPreviewOpen(false);
    if (createdChat.current !== id) setContextOpen(false);
    createdChat.current = null;
  }, [id]);
  const [contextLoading, setContextLoading] = useState(false);
  const loadedContextChat = useRef<string | null>(null);
  const [contextError, setContextError] = useState("");
  const [contextRefresh, setContextRefresh] = useState(0);
  const [contextSaving, setContextSaving] = useState(false);
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
  useEffect(() => { setIncomingImage(null); setImagePreview(null); setDocumentPreview(null); setImages([]); setAttachments([]); setGeneratedArtifacts([]); setContextState(null); setWorkspaceContext({ workspace: null, memory: null }); }, [id]);
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
  const preview = useStore(s => selectedContext ? s.previews[selectedContext.pageId] : undefined);
  useEffect(() => {
    if (!selectedContext) return;
    let gone = false;
    void bridge.preview(selectedContext.pageId).then(url => { if (url && !gone) useStore.setState(s => ({ previews: { ...s.previews, [selectedContext.pageId]: url } })); }).catch(() => {});
    return () => { gone = true; };
  }, [selectedContext?.pageId, last?.status]);
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
    if (!id) { setContextState(null); setImages([]); setAttachments([]); setGeneratedArtifacts([]); setWorkspaceContext({ workspace: null, memory: null }); return; }
    void Promise.all([
      call<ConversationContextState>("runs.context.get", { chatId: id }),
      call<{ images: ConversationImage[] }>("conversations.images.get", { chatId: id }),
      call<{ attachments: ConversationAttachment[] }>("conversations.attachments.get", { chatId: id }),
      call<{ artifacts: ConversationArtifact[] }>("conversations.artifacts.get", { chatId: id }),
      call<ConversationSpaceContext>("conversations.workspace.get", { chatId: id }),
    ]).then(([context, imageReferences, documents, generated, workspace]) => { if (!cancelled) { loadedContextChat.current = id; setContextState(context); setImages(imageReferences.images); setAttachments(documents.attachments); setGeneratedArtifacts(generated.artifacts); setWorkspaceContext(workspace); } })
      .catch(error => { if (!cancelled) setContextError(error instanceof Error ? error.message : String(error)); })
      .finally(() => { if (!cancelled) setContextLoading(false); });
    return () => { cancelled = true; };
  }, [id, turns.length, last?.status, connected, contextRefresh, attachmentSaving, contextSaving, workspaceSaving]);
  useEffect(() => {
    let cancelled = false;
    if(sourceChat.current!==id){setSources([]);sourceChat.current=id;}
    setSourceError("");
    if (!id) { setSources([]); setSourceLoading(false); return; }
    setSourceLoading(true);
    void call<{ sources: ConversationSource[] }>("conversations.sources.get", { chatId: id })
      .then(value => { if (!cancelled) setSources(value.sources); })
      .catch(reason => { if (!cancelled) setSourceError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(()=>{if(!cancelled)setSourceLoading(false);});
    return () => { cancelled = true; };
  }, [id, turns.length, last?.status, sourceRefresh]);
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
  const updateContext = async (change: { historyEnabled?: boolean; runId?: string; included?: boolean }) => {
    if (!id || contextBusy.current) return;
    contextBusy.current = true;
    setContextSaving(true);
    try { const value = await call<ConversationContextState>("runs.context.set", { chatId: id, ...change }); if (activeChat.current === id) setContextState(value); }
    catch (error) { errToast(error); }
    finally { contextBusy.current = false; setContextSaving(false); }
  };
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
  const toggleGeneratedArtifact = async (artifactId: string, included: boolean) => {
    if (!id || contextBusy.current) return;
    contextBusy.current = true;
    setContextSaving(true);
    try {
      const value = await call<{ artifacts: ConversationArtifact[] }>("conversations.artifacts.toggle", { chatId: id, artifactId, included });
      if (activeChat.current === id) setGeneratedArtifacts(value.artifacts);
    } catch (error) { errToast(error); }
    finally { contextBusy.current = false; setContextSaving(false); }
  };
  const selectWorkspace = async (workspaceId: string) => {
    if (workspaceBusy.current) return;
    workspaceBusy.current = true;
    setWorkspaceSaving(true);
    try {
      const chatId = ensureChatId();
      activeChat.current = chatId;
      const value = await call<ConversationSpaceContext>("conversations.workspace.set", { chatId, workspaceId: workspaceId || null });
      if (activeChat.current === chatId) { setWorkspaceContext(value); setContextRefresh(value => value + 1); }
    } catch (error) { errToast(error); }
    finally { workspaceBusy.current = false; setWorkspaceSaving(false); }
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
  const openSource = async (source: ConversationSource, background: boolean) => {
    try {
      if (background) { await openBrowserLink(source.url, true); return; }
      const livePages = await call<PageTarget[]>("pages.list", {});
      const existing = livePages.find(page => page.url === source.url && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
      if (existing) await useStore.getState().activate(existing.pageId);
      else await openBrowserLink(source.url);
    } catch (error) { errToast(error); }
  };
  const contextCount = (workspaceContext.browsingPreview ? 1 : 0) + images.filter(item => item.included).length + (contextState?.entries.filter(entry => entry.included).length ?? 0) + attachments.filter(item => item.included).length + generatedArtifacts.filter(item => item.included).length + (workspaceContext.memory?.enabled!==false ? (workspaceContext.memory?.content ? 1 : 0) + (workspaceContext.memory?.items ?? []).filter(item => item.enabled && !memorySourceExcluded(workspaceContext.memory!, item.sourceUrl) && (item.expiresAt === undefined || item.expiresAt > Date.now())).length : 0);
  const contextLocked = !connected || archived || live || contextLoading || !!contextError;
  const receiveImage = (files: File[]) => {
    if (contextLocked || attachmentSaving || incomingImage) { errToast(new Error("Wait for the current operation before adding an image.")); return; }
    if (files.length !== 1 || !["image/png", "image/jpeg", "image/webp"].includes(files[0]!.type)) { errToast(new Error("Paste or drop one PNG, JPEG or WebP image. Use Attach for documents.")); return; }
    if (images.length >= 4) { errToast(new Error("Four images are attached. Remove one before adding another.")); return; }
    setIncomingImage(files[0]!); setContextSection("documents"); setContextOpen(true);
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
  const preparedSpace = useRef<string | null>(null);
  const defaultSpace = !turns.length && !workspaceContext.assigned && !workspaceContext.workspace ? spaces.find(space => space.id === activeSpaceId) : undefined;
  useEffect(() => {
    if (!contextOpen || contextSection !== "memory" || !defaultSpace?.workspaceId || contextLocked || workspaceSaving) return;
    const key = `${id ?? "new"}:${defaultSpace.workspaceId}`;
    if (preparedSpace.current === key) return;
    preparedSpace.current = key;
    void selectWorkspace(defaultSpace.workspaceId);
  }, [id, contextOpen, contextSection, defaultSpace?.workspaceId, contextLocked, workspaceSaving]);
  const contextPanel = contextOpen && (!contextLoading || loadedContextChat.current === id) && !contextError ? <section className="conversation-memory" aria-label="Conversation context">
    <div className="conversation-memory-head"><div><strong>Conversation context</strong><p>{taskBound ? "Choose what Aux may use on the next task revision." : "Choose what Aux may use in your next reply."} Changes leave earlier replies intact.</p></div><button className="icon-btn xs" aria-label="Close conversation context" onClick={() => setContextOpen(false)}>{I.close}</button></div>
    <div className="context-sections" role="group" aria-label="Context sections">{([ ["documents", "Attachments", attachments.length + images.length], ["history", "History", contextState?.entries.length ?? 0], ["memory", "Memory", (workspaceContext.browsingPreview ? 1 : 0) + (workspaceContext.memory?.content ? 1 : 0) + (workspaceContext.memory?.items?.length ?? 0)], ["results", "Results", generatedArtifacts.length] ] as const).map(([section, label, count]) => <button key={section} aria-pressed={contextSection === section} onClick={() => setContextSection(section)}>{label}{count > 0 && <span>{count}</span>}</button>)}</div>
    {contextSection === "history" && (contextState ? <><label className="conversation-memory-master"><input type="checkbox" checked={contextState.historyEnabled} disabled={contextSaving || contextLocked} onChange={event => void updateContext({ historyEnabled: event.target.checked })}/><span><b>Use previous turns</b><small>{contextState.historyEnabled ? "Included turns are sent with the next reply or task revision." : "History stays visible but is not sent."}</small></span></label>
    {contextState.entries.length > 0 ? <div className="conversation-memory-list">{contextState.entries.map(entry => <label key={entry.runId}>
      <input type="checkbox" checked={entry.included} disabled={contextSaving || contextLocked || !contextState.historyEnabled} onChange={event => void updateContext({ runId: entry.runId, included: event.target.checked })}/>
      <span><b>{entry.goal}</b><small>{new Date(entry.createdAt).toLocaleString()} · {entry.summary}</small></span>
    </label>)}</div> : <p className="hint">No completed earlier turns yet.</p>}</> : <p className="hint">Your completed replies will appear here.</p>)}
    {contextSection === "memory" && <div className="conversation-workspace-memory"><div className="conversation-documents-head"><div><b>Space memory</b><small>{taskBound ? "Task Space · shared memory" : "Shared memory for conversations in this Space"}</small></div><select aria-label="Conversation Space" disabled={workspaceSaving || contextLocked || taskBound} value={workspaceContext.workspace?.workspaceId ?? defaultSpace?.workspaceId ?? ""} onChange={event => void selectWorkspace(event.target.value)}><option value="">No Space</option>{workspaceContext.workspace && !spaces.some(space => space.workspaceId === workspaceContext.workspace?.workspaceId) && <option value={workspaceContext.workspace.workspaceId}>{workspaceContext.workspace.name} · Archived</option>}{spaces.filter(space => space.workspaceId).map(space => <option key={space.id} value={space.workspaceId}>{space.name}</option>)}</select></div>
    {workspaceContext.memory && <details className="memory-context-preview"><summary>Memory prepared for the next reply</summary><p className="hint">Current notes and up to six recent page references, after exclusions and length limits. Changes before sending update this context. Page references do not include page contents.</p>{workspaceContext.memoryPreview || workspaceContext.browsingPreview ? <pre>{[workspaceContext.memoryPreview, workspaceContext.browsingPreview].filter(Boolean).join("\n\n")}</pre> : <p className="hint">No Space memory is currently included.</p>}</details>}
    {workspaceContext.memory ? <SpaceMemoryEditor key={workspaceContext.memory.workspaceId} memory={workspaceContext.memory} disabled={workspaceSaving || contextLocked} onSaved={memory => { if (activeChat.current === id) setWorkspaceContext(current => current.workspace?.workspaceId === memory.workspaceId ? { ...current, memory } : current); }} /> : <p className="hint">{defaultSpace ? `New conversations use shared notes from ${defaultSpace.name}. Choose No Space to keep this conversation separate.` : "Choose a Space to share notes across its conversations and saved tasks."}</p>}</div>}
    {contextSection === "documents" && <><div className="conversation-documents-head"><div><b>Documents & pages</b><small>Saved text snapshots · preview before sending</small></div><button className="btn sm" disabled={attachmentSaving || contextLocked || attachments.length >= 5} onClick={() => void addDocument()}>{I.plusSm}{attachmentSaving ? "Adding…" : "Attach document"}</button></div>
    <AttachPage key={id ?? "new"} pages={pages} disabled={attachmentSaving || contextLocked || attachments.length >= 5} remaining={Math.max(0, 5 - attachments.length)} onAttach={attachPages}/>
    {attachments.length > 0 ? <div className="conversation-document-list">{attachments.map(item => <div className="conversation-document" key={item.attachmentId}>
      <label><input type="checkbox" checked={item.included} disabled={attachmentSaving || contextLocked} onChange={event => void changeDocument(item.attachmentId, event.target.checked)}/><span><b>{item.filename}</b><small>{item.sourceUrl ? `${new URL(item.sourceUrl).hostname} · ${item.sourceTruncated ? "Partial page" : "Page snapshot"}` : `${Math.max(1, Math.ceil(item.byteLength / 1024))} KB · ${item.excerpt || "Empty document"}`}</small></span></label>
      <button className="btn sm ghost" onClick={() => { setContextOpen(false); setImagePreview(null); setDocumentPreview(item.attachmentId); }}>Preview</button>
      <button className="icon-btn xs" aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button>
    </div>)}</div> : <p className="hint">No documents or pages attached. Add only what this conversation needs.</p>}
    <ConversationImages incomingFile={incomingImage} onFileConsumed={file => setIncomingImage(current => current === file ? null : current)} chatId={id} page={selectedContext} images={images} disabled={contextLocked || attachmentSaving} ensureChatId={ensureChatId} onBusy={busy => setImageOperations(count => Math.max(0, count + (busy ? 1 : -1)))} onChange={(chatId, value) => { if (activeChat.current === chatId) { setImages(value); setContextRefresh(current => current + 1); } }}/></>}
    {contextSection === "results" && (generatedArtifacts.length > 0 ? <><div className="conversation-documents-head"><div><b>Generated artifacts</b><small>Text outputs from earlier turns · select to reuse</small></div></div>
    <div className="conversation-document-list">{generatedArtifacts.map(item => <div className="conversation-document" key={item.artifactId}>
      <label><input type="checkbox" checked={item.included} disabled={contextSaving || contextLocked} onChange={event => void toggleGeneratedArtifact(item.artifactId, event.target.checked)}/><span><b>{item.filename}</b><small>{Math.max(1, Math.ceil(item.byteLength / 1024))} KB · {item.turnGoal} · {item.excerpt || "Empty artifact"}</small></span></label>
      {["text/plain","text/markdown","text/csv","application/json"].includes(item.mediaType) && <button className="btn sm ghost" onClick={()=>{setContextOpen(false);useStore.setState({resultPreview:item.artifactId});}}>Preview</button>}
    </div>)}</div></> : <p className="hint">Text outputs from earlier replies appear here when available.</p>)}
  </section> : null;
  if (id === "history") return <ConversationHistory/>;
  const dictation = <Dictation draftKey={id ? draftKey(id) : "new"} key={`dictation-${id ?? "new"}`} disabled={archived || sending || answerPending || (live && last?.status !== "needs_input")} onInsert={words => {
        const state = useStore.getState();
        const current = answering && last ? state.runAnswerDrafts[last.runId]?.text ?? "" : id ? state.conversationDrafts[draftKey(id)] ?? "" : state.agentDraft;
        setText(current ? `${current}\n${words}` : words);
      }}/>;
  return <section ref={conversationRoot} className={`conversation${embedded ? " conversation-embedded" : ""}`} aria-label={embedded ? "Conversation" : undefined} aria-labelledby={embedded ? undefined : "conversation-title"}>
    {!embedded && <header className="conversation-head"><h1 id="conversation-title">{taskTitle || savedTitle || turns[0]?.goal || "New chat"}</h1><div className="sp"/>{selectedContext && selectedContext.url !== "about:blank" && <button className="icon-btn" aria-label="Show browser preview" title="Browser preview" aria-pressed={previewOpen} onClick={() => setPreviewOpen(value => !value)}>{I.globe}</button>}{turns.length > 0 && <button className="icon-btn" disabled={exporting} title="Export conversation as Markdown" aria-label="Export conversation as Markdown" onClick={() => void exportConversation()}>{I.downloadSm}</button>}<button className="icon-btn" title="Continue in side panel" aria-label="Continue in side panel" onClick={() => useStore.getState().showConversationInRail(id)}>{I.rail}</button></header>}
    <div className="conversation-scroll" tabIndex={-1} ref={scrolling.scrollRef}><div className="conversation-thread" data-find-surface="conversation" ref={scrolling.threadRef}>
      {historyLoading && <p role="status" className="hint">Loading conversation…</p>}
      {historyError && <p role="alert">{historyError} <button className="btn sm" onClick={() => void loadTurns(earlier ?? undefined)}>Try again</button></p>}
      {earlier && !historyError && <button className="btn sm" disabled={historyLoading} onClick={() => void loadTurns(earlier)}>Load earlier messages</button>}
      {!turns.length && !historyLoading && !historyError && <div className="conversation-empty"><AuxMark /><h1>What would you like to work on?</h1><p>Ask a question or give Aux a task in the browser.</p></div>}
      {turns.map(run => <article className="conversation-turn" data-turn-id={run.runId} key={run.runId}><time dateTime={new Date(run.createdAt).toISOString()} title={new Date(run.createdAt).toLocaleString()}>{new Date(run.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time><div className="user-message">{run.goal}</div><RunPanel runId={run.runId} conversation readOnly={archived} retryPageId={selectedContext?.pageId}/><RunSources sources={sources.filter(source => source.runId === run.runId)} onOpen={(source, background) => void openSource(source, background)}/><RunImages runId={run.runId}/></article>)}
    </div>{!embedded && previewOpen && selectedContext && selectedContext.url !== "about:blank" && <button className="conversation-preview" onClick={() => void useStore.getState().activate(selectedContext.pageId).catch(errToast)} title="Open the actual browser tab"><span>{I.globe}{selectedContext.title || "Task browser tab"}{I.open}</span>{preview ? <img src={preview} alt="Latest task browser preview" onError={() => useStore.setState(state => ({ previews: { ...state.previews, [selectedContext.pageId]: "" } }))}/> : <p>{selectedContext.url === "about:blank" ? "Task browser tab" : selectedContext.url}<small>Open browser tab</small></p>}</button>}</div>
    <div className="conversation-compose"><div className="conversation-compose-content">
      {sourceError && <p className="field-error" role="alert">Sources couldn’t be refreshed. {sourceError} <button className="btn sm ghost" disabled={sourceLoading} onClick={()=>setSourceRefresh(value=>value+1)}>{sourceLoading ? "Refreshing…" : "Retry sources"}</button></p>}
      {scrolling.awayFromLatest && <div className="conversation-jump"><button className="btn sm" onClick={scrolling.jumpToLatest}>{I.down} Jump to latest</button></div>}
      {!linked && last?.pageIds.length ? <div className="conversation-context-note">The original browser tab is unavailable.{recoverUrl && <button className="btn sm" disabled={reopening || live || taskBound} title={recoverUrl} onClick={() => void reopen()}>{reopening ? "Opening…" : "Reopen last page"}</button>}<span>{selectedContext ? `Reply context: ${selectedContext.title || selectedContext.url}` : "Choose an open tab or continue in a new one."}</span></div> : null}
      {archived && <div className="conversation-archive-notice" role="status"><span>This conversation is archived. Your draft is kept.</span>{!taskBound && <button className="btn sm" disabled={restoring} onClick={()=>void restoreConversation()}>{restoring?"Restoring…":"Restore to reply"}</button>}</div>}
      {id && resultPreview && <SavedResultPreview key={resultPreview} chatId={id} artifactId={resultPreview} contextDisabled={contextLocked} onClose={() => useStore.setState({resultPreview:null})}/> }
      {id && imagePreview && images.some(image => image.imageId === imagePreview) && !contextOpen && <ImageSnapshot key={`${id}:${imagePreview}`} chatId={id} imageId={imagePreview} onClose={() => setImagePreview(null)} />}
      {id && documentPreview && <DocumentSnapshot key={`${id}:${documentPreview}`} chatId={id} attachmentId={documentPreview} onClose={() => setDocumentPreview(null)} />}
      {!contextOpen && attachments.length > 0 && <div className="composer-documents" aria-label="Attached documents">{attachments.map(item => <div key={item.attachmentId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setContextOpen(false); setImagePreview(null); setDocumentPreview(item.attachmentId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void changeDocument(item.attachmentId)}>{I.close}</button></div>)}</div>}
      {!contextOpen && images.length > 0 && <div className="composer-documents" aria-label="Attached images">{images.map(item => <div key={item.imageId} className={item.included ? "" : "excluded"}><button title={`${item.filename}${item.included ? "" : " · Excluded"}`} onClick={() => { setDocumentPreview(null); setImagePreview(item.imageId); }}>{I.result}<span>{item.filename}</span>{!item.included && <small>Excluded</small>}</button><button aria-label={`Remove ${item.filename}`} disabled={attachmentSaving || contextLocked} onClick={() => void removeImage(item.imageId)}>{I.close}</button></div>)}</div>}
      {!connected && <p className="hint" role="status">Connecting to Aux… You can keep writing.</p>}
      {sendError && <p className="field-error" role="alert">{sendError} Your reply is kept.</p>}
      {taskBound ? <>
      <ConversationTask key={boundTaskId} taskId={boundTaskId!} live={live} disabled={attachmentSaving || contextSaving || workspaceSaving || contextLocked || historyLoading || !!historyError} page={selectedContext} context={contextPage} linkedPageId={linked?.pageId} onContext={setContextPage} onStarted={run => { if (activeChat.current === id) scrolling.jumpToLatest(); }} />
      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {contextPanel}
      {last?.status === "needs_input" && <div className="conversation-input"><textarea {...imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} aria-label="Reply to conversation" placeholder="Answer Aux’s question…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send(); } }}/><button className="icon-btn" aria-label="Send message" disabled={archived || !connected || sending || answerPending || !text.trim()} onClick={() => void send()}>{I.send}</button></div>}
      <div className="composer-options">{last?.status === "needs_input" && dictation}<button aria-expanded={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.chats} Context · {contextCount}</button><button onClick={() => void openSavedTask(boundTaskId!).catch(errToast)}>{I.layersSm}{workspaceContext.workspace?.name ?? "Saved task"}</button><span className="sp"/></div>
      </> : <>
      {contextLoading && <p className="hint" role="status">Loading saved context…</p>}
      {contextError && <p className="field-error" role="alert">Saved context could not be loaded. {contextError} <button className="btn sm" onClick={() => setContextRefresh(value => value + 1)}>Retry</button></p>}
      {contextPanel}
      {missingContext && <p className="field-error" role="status">The selected tab is unavailable. Choose another browser context before sending.</p>}
      <div className="conversation-input"><button className="icon-btn composer-attach" aria-label="Attach a document or page image" disabled={attachmentSaving || contextLocked} onClick={() => { setContextSection("documents"); setContextOpen(value => contextSection !== "documents" || !value); }}>{I.plusSm}</button><textarea {...imageInput} maxLength={answering ? 20000 : undefined} disabled={archived || sending || answerPending} aria-label="Reply to conversation" placeholder={last?.status === "needs_input" ? "Answer Aux’s question…" : turns.length ? "Reply, or give Aux a task…" : selectedContext && selectedContext.url !== "about:blank" ? "Ask about this page…" : "Ask Aux a task…"} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send(); } }}/>{dictation}<button className="icon-btn" aria-label="Send message" disabled={archived || !connected || sending || answerPending || !text.trim() || (!answering && (attachmentSaving || contextSaving || workspaceSaving || missingContext || historyLoading || !!historyError || contextLoading || !!contextError || live))} onClick={() => void send()}>{I.send}</button></div>
      <div className="composer-options">
        <button onClick={() => { useStore.setState({ settingsCategory: "Agent permissions" }); useStore.getState().setOverlay("settings"); }}>{I.lock}{(settings.effectGrants as string[] | undefined)?.includes("effect:write") ? "Read & write" : "Read only"}{I.down}</button>
        <button onClick={() => { useStore.setState({ settingsCategory: "Models" }); useStore.getState().setOverlay("settings"); }}>{I.agentSm}{settings.modelConfigured === false ? "Set up model" : String(settings.plannerModel ?? "Choose model").split("/").at(-1)}{I.down}</button>
        <button aria-expanded={contextOpen} onClick={() => setContextOpen(value => !value)}>{I.chats} Context{contextCount > 0 ? ` · ${contextCount}` : ""}</button>
        {selectedContext && selectedContext.url !== "about:blank" && <button className="composer-page" title={selectedContext.url} onClick={() => void useStore.getState().activate(selectedContext.pageId).catch(errToast)}>{I.globe}{selectedContext.title || selectedContext.url}</button>}
        <span className="sp"/>
        <button aria-expanded={optionsOpen} onClick={() => setOptionsOpen(value => !value)}>{I.gearSm} Options</button>
      </div>
      {optionsOpen && <div className="conversation-options-panel" aria-label="Conversation options">
        {id && last && !live && !contextLocked && <SaveConversationTask key={id} chatId={id} runId={last.runId} goal={turns[0]?.goal || last.goal} workspaceId={workspaceContext.workspace?.workspaceId} page={selectedContext} onSaved={task => { setWorkspaceContext(current => ({ ...current, taskId: task.taskId })); setContextRefresh(value => value + 1); setOptionsOpen(false); }} />}
        <label>Browser context <BrowserContextPicker value={contextPage} disabled={live || sending} linkedPageId={linked?.pageId} onChange={setContextPage} /></label>
      </div>}
      </>}
    </div></div>
  </section>;
}
