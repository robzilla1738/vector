import { errorMessage } from "../error-message";
import {
  ConversationSourceAction,
  ConversationSourceRow,
  ConversationSourcesSummary,
  useConversationSourcesOwner,
} from "./ConversationSourceControls";
import {
  ConversationPreviewAction,
  previewPageIdentity,
  useConversationPreviewOwner,
} from "./ConversationPreviewControls";
import { useConversationContextControls } from "./ConversationContextControls";
import { ConversationViewAction } from "./ConversationViewControls";
import { ConversationRecoveryAction } from "./ConversationRecoveryControls";
import { ConversationQueuedControls } from "./ConversationQueuedControls";
import { ConversationLiveAction, useConversationLiveOwner } from "./ConversationLiveControls";
import { HomeEntryAction } from "./HomeEntryControls";
import { useInteractiveComposer } from "../use-interactive-composer";
import { availableForFocus } from "../ui/focus";
import { NightRunOverflow } from "../features/morning-review/NightRunOverflow";
import { runCommand } from "../commands";
import type { MentionRef } from "@aux/contracts";
import { submittedMentions, mentionComposerId, clearMentionDraft } from "../mentions/drafts";
import { FeatureComposer } from "../features/registry";
import { Popover } from "../ui/popover";
import { RunControls } from "./RunControls";
import { CalendarSourceChoiceDialog } from "./CalendarSourceChoiceDialog";
import {
  ConversationAttachmentAction,
  ConversationAttachmentChoice,
  useConversationAttachmentOwner,
} from "./ConversationAttachmentControls";
import { AttachmentTray, type AttachmentItem } from "./AttachmentTray";
import { SupportingContent } from "./SupportingContent";
import { ComposerFrame } from "../ui";
import { Tooltip } from "../ui/tooltip";
import { Menu } from "../ui/dialog";
import { ConversationContext } from "./ConversationContext";
import { BrowserContextTray } from "./BrowserContextTray";
import { ResultCard } from "./ResultCard";
import { RunImages } from "./RunImages";
import { Dictation } from "./Dictation";
import { ImageSnapshot } from "./ImageSnapshot";
import { SavedResultPreview } from "./SavedResultPreview";
import { GeneratedResultPreview } from "./GeneratedResultPreview";
import { guardCommandCompletion } from "../command-completion";
import { ConversationImageAction } from "./ConversationImageControl";
import { ConversationImages } from "./ConversationImages";
import { DocumentSnapshot } from "./DocumentSnapshot";
import { AuxMark } from "./AuxMark";
import { ConversationTask } from "./ConversationTask";
import { useConversationScroll } from "../use-conversation-scroll";
import { conversationPage } from "../conversation-page";
import { browserSourcesKey, sourceRef, sourceStatus } from "../browser-context-sources";
import { isScrimOverlay } from "../chrome";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useShallow } from "zustand/react/shallow";
import type {
  CompactObservation,
  ConversationImage,
  ConversationAttachment,
  ConversationArtifact,
  ConversationSource,
  Run,
  RunMessage,
  Suspension,
  Workspace,
  WorkspaceMemory,
} from "@aux/contracts";
import {
  draftKey,
  HOME_DRAFT_CHAT_KEY,
  PENDING_CHAT_KEY,
  readPendingConversation,
} from "../conversation-drafts";
import { conversationMarkdown } from "../conversation-export";
import { bridge, type BrowserProfile } from "../bridge";
import { previewSplit } from "../workspace";
import { useStore, call, decodeBase64Json, errToast, isLive, toast } from "../store";
import { ConversationAction, ConversationDetails, useConversationOwner } from "./ConversationControls";
import { ConversationHistory, cursor, mergeHistory } from "./ConversationHistory";
import { browserLinkUrl as answerUrl } from "../browser-links";
import { RunPanel } from "./RunPanel";
import {
  shellIconArrowDown,
  shellIconClose,
  shellIconDownloadSm,
  shellIconGlobe,
  shellIconOpen,
  shellIconPlusSm,
  shellIconRail,
  shellIconSend,
  shellIconSplit,
} from "./icons";
import "./Conversation.css";
import "./ConversationContextMenu.css";
import {
  staticIconButtonProps as auxReuseStaticIconButtonProps,
  staticNumericCountProps as auxReuseStaticNumericCountProps,
  staticMenuItemProps as auxReuseStaticMenuItemProps,
  staticExtraSmallIconButtonProps as auxReuseStaticExtraSmallIconButtonProps,
  staticButtonProps as auxReuseStaticButtonProps,
  staticSpacerProps as auxReuseStaticSpacerProps,
  staticHintProps as auxReuseStaticHintProps,
  staticFieldErrorProps as auxReuseStaticFieldErrorProps,
} from "../ui/class-props";
import {
  nativeAriaHiddenProps as auxReuseNativeAriaHiddenProps,
  nativeButtonTypeProps as auxReuseNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import { smallButtonProps as auxReuseSmallButtonProps } from "../ui/button-props";

const NO_SOURCES: ConversationSource[] = [];

type DraftState = ReturnType<typeof useStore.getState>;
const QUEUE_ATTEMPT_PREFIX = "aux.pending-queue-message.v1:";
type QueueAttempt = {
  mentions: MentionRef[];
  messageId: string;
  runId: string;
  text: string;
  mode: "queue" | "steer";
};
function queueAttempt(
  chatId: string,
  runId: string,
  text: string,
  mode: QueueAttempt["mode"],
  mentions: MentionRef[],
  inWindow: QueueAttempt | null,
): QueueAttempt {
  if (
    inWindow?.runId === runId &&
    inWindow.text === text &&
    inWindow.mode === mode &&
    JSON.stringify(inWindow.mentions) === JSON.stringify(mentions)
  )
    return inWindow;
  try {
    const saved = JSON.parse(
      localStorage.getItem(`${QUEUE_ATTEMPT_PREFIX}${chatId}`) ?? "null",
    ) as QueueAttempt | null;
    if (
      saved?.runId === runId &&
      saved.text === text &&
      (saved.mode ?? "queue") === mode &&
      JSON.stringify(saved.mentions ?? []) === JSON.stringify(mentions) &&
      /^[\da-f-]{36}$/i.test(saved.messageId)
    )
      return { ...saved, mode, mentions };
  } catch {
    /* The composer still keeps its in-window attempt. */
  }
  const attempt = { messageId: crypto.randomUUID(), runId, text, mode, mentions };
  try {
    localStorage.setItem(`${QUEUE_ATTEMPT_PREFIX}${chatId}`, JSON.stringify(attempt));
  } catch {
    /* Optional persistence. */
  }
  return attempt;
}
/** The text a conversation's composer edits: the pending question's answer, the chat draft, or the new-chat draft. */
const draftText = (
  s: DraftState,
  id: string | null | undefined,
  answerRunId?: string,
  answerQuestion?: string,
) => {
  if (answerRunId) {
    const draft = s.runAnswerDrafts[answerRunId];
    return draft?.question === answerQuestion ? (draft?.text ?? "") : "";
  }
  return id ? (s.conversationDrafts[draftKey(id)] ?? "") : s.agentDraft;
};

/** Owns the draft subscription so typing re-renders the input, never the thread. */
const ComposerInput = memo(function ComposerInput({
  id,
  answerRunId,
  answerQuestion,
  disabled,
  sendDisabled,
  placeholder,
  maxLength,
  inputProps,
  onChange,
  onSend,
  children,
  footer,
  modes,
  textareaRef,
  workspaceId,
}: {
  workspaceId?: string;
  id: string | null | undefined;
  answerRunId?: string;
  answerQuestion?: string;
  disabled: boolean;
  sendDisabled: boolean;
  placeholder: string;
  maxLength?: number;
  inputProps: Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onPaste" | "onDragOver" | "onDrop">;
  onChange(value: string): void;
  onSend(): void;
  children?: ReactNode;
  footer?: ReactNode;
  modes?: ReactNode;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const text = useStore((s) => draftText(s, id, answerRunId, answerQuestion));
  const ownInput = useRef<HTMLTextAreaElement>(null);
  const inputRef = textareaRef ?? ownInput;
  return (
    <div className="conversation-input">
      <FeatureComposer
        composerId={mentionComposerId(id, answerRunId)}
        workspaceId={workspaceId}
        textareaRef={inputRef}
        value={text}
        onChange={onChange}
        disabled={disabled}
      />
      <textarea
        ref={inputRef}
        {...inputProps}
        maxLength={maxLength}
        disabled={disabled}
        aria-label="Reply to conversation"
        placeholder={placeholder}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <div className="composer-footer">
        <div className="composer-footer-context">
          {footer}
          {modes}
          <FeatureComposer
            slot="composerActions"
            composerId={mentionComposerId(id, answerRunId)}
            workspaceId={workspaceId}
            textareaRef={inputRef}
            value={text}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
        <div className="composer-send-actions">
          {children}
          <button
            {...auxReuseStaticIconButtonProps}
            aria-label="Send message"
            disabled={sendDisabled || !text.trim()}
            onClick={onSend}
          >
            {shellIconSend}
          </button>
        </div>
      </div>
    </div>
  );
});

type ConversationSpaceContext = {
  workspace: Workspace | null;
  memory: WorkspaceMemory | null;
  assigned?: boolean;
  taskId?: string;
  memoryPreview?: string;
  browsingPreview?: string;
};

function LivePage({ pageId }: { pageId: string }) {
  const img = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let gone = false;
    const show = (image: string) => {
      if (gone || !img.current) return;
      img.current.src = image;
      setReady((current) => current || true);
    };
    let timer = 0;
    const pull = () => {
      if (gone) return;
      void bridge
        .preview(pageId)
        .then((url) => {
          if (url) show(url);
        })
        .catch(() => {})
        .finally(() => {
          if (!gone) timer = window.setTimeout(pull, 700);
        });
    };
    pull();
    return () => {
      gone = true;
      window.clearTimeout(timer);
    };
  }, [pageId]);
  return (
    <>
      <img ref={img} alt="" hidden={!ready} />
      {!ready && <p>Watching this page…</p>}
    </>
  );
}

function RunSources({
  sources,
  profileNames,
  onOpen,
  current,
}: {
  sources: ConversationSource[];
  profileNames: Record<string, string>;
  onOpen: (source: ConversationSource) => void;
  current(source?: ConversationSource): boolean;
}) {
  if (!sources.length) return null;
  return (
    <details className="conversation-sources">
      <ConversationSourcesSummary current={() => current()}>
        {shellIconGlobe}
        <span>Sources</span>
        <span {...auxReuseStaticNumericCountProps}>{sources.length}</span>
      </ConversationSourcesSummary>
      <div>
        {sources.map((source) => (
          <ConversationSourceRow
            key={source.sourceId}
            command="select-conversation-source"
            current={() => current(source)}
            source={source}
            profileNames={profileNames}
            invoke={() => onOpen(source)}
          />
        ))}
        <p>Sources record what Aux read; verify external outcomes in the source account.</p>
      </div>
    </details>
  );
}

function isCalendarCitation(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "calendar.google.com" ||
        (parsed.hostname === "www.google.com" && parsed.pathname.startsWith("/calendar/")))
    );
  } catch {
    return false;
  }
}

export function Conversation({
  chatId,
  embedded = false,
  home = false,
  entryControls,
  onChatCreated,
  composerRef,
  findReturnRef,
}: {
  chatId?: string | null;
  embedded?: boolean;
  home?: boolean;
  entryControls?: ReactNode;
  onChatCreated?: (chatId: string) => void;
  composerRef?: RefObject<HTMLTextAreaElement | null>;
  findReturnRef?: RefObject<HTMLDivElement | null>;
} = {}) {
  const ownComposerRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = composerRef ?? ownComposerRef;
  useInteractiveComposer(home, textareaRef);
  const fullPageId = useStore((s) => s.conversationId);
  const id = chatId === undefined ? fullPageId : chatId;
  const scrolling = useConversationScroll(id);
  useEffect(() => {
    if (id || embedded) return;
    const pending = readPendingConversation(typeof localStorage === "undefined" ? null : localStorage);
    if (pending) useStore.setState({ conversationId: pending });
  }, [id, embedded]);
  const turns = useStore(
    useShallow((s) =>
      s.runs
        .filter((run) => (run.config?.chatId ?? run.runId) === id)
        .sort((a, b) => a.createdAt - b.createdAt),
    ),
  );
  // Digest re-renders on structure/navigation change only — loading/favicon churn doesn't.
  useStore(
    useShallow((s) =>
      s.pages.map(
        (p) =>
          `${p.pageId}${p.documentEpoch}${p.url}${p.title}${p.ownedByRuntime ? 1 : 0}${p.viewStatus}${p.backend}${p.navigationError ? 1 : 0}${p.showBlankDocument ? 1 : 0}`,
      ),
    ),
  );
  const pages = useStore.getState().pages;
  const activePageId = useStore((s) => s.activePageId);
  const layout = useStore((s) => s.layout);
  const connected = useStore((s) => s.connected);
  const focusRequest = useStore((s) => s.focusRequest);
  const seenFocusRequest = useRef(focusRequest);
  const conversationCurrent = useConversationOwner(id, connected);
  const contextControls = useConversationContextControls(conversationCurrent);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [earlier, setEarlier] = useState<ReturnType<typeof cursor> | null>(null);
  const historyRequest = useRef(0);
  const historyPending = useRef(false);
  useLayoutEffect(() => {
    ++historyRequest.current;
    historyPending.current = false;
  }, [id, connected, conversationCurrent]);
  const loadTurns = async (before?: ReturnType<typeof cursor>) => {
    if (!id || id === "history" || !conversationCurrent() || historyPending.current) return;
    historyPending.current = true;
    const version = ++historyRequest.current;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const found = await call("runs.list", { chatId: id, limit: 50, ...(before ? { before } : {}) });
      if (version !== historyRequest.current || !conversationCurrent()) return;
      if (before) scrolling.preservePosition();
      mergeHistory(found);
      setEarlier(found.length === 50 ? cursor(found[found.length - 1]!) : null);
    } catch (error) {
      if (version === historyRequest.current && conversationCurrent()) setHistoryError(String(error));
    } finally {
      if (version === historyRequest.current && conversationCurrent()) {
        historyPending.current = false;
        setHistoryLoading(false);
      }
    }
  };
  useEffect(() => {
    setEarlier(null);
    setHistoryError("");
    setHistoryLoading(false);
    void loadTurns();
    return () => {
      ++historyRequest.current;
    };
  }, [id, connected, conversationCurrent]);
  const [sending, setSending] = useState(false);
  const sendPending = useRef(false);
  const exportPending = useRef<{ owner: typeof conversationCurrent } | null>(null);
  const [exporting, setExporting] = useState<{ owner: typeof conversationCurrent } | null>(null);
  const [images, setImages] = useState<ConversationImage[]>([]);
  const [attachments, setAttachments] = useState<ConversationAttachment[]>([]);
  const [generated, setGenerated] = useState<ConversationArtifact[]>([]);
  const artifactVersions = useMemo(() => {
    const byId = new Map(generated.map((item) => [item.artifactId, item]));
    const version = (item: ConversationArtifact, visited: Set<string>): number => {
      if (visited.has(item.artifactId)) return 1;
      const next = new Set(visited);
      next.add(item.artifactId);
      const parents = (item.sourceArtifactIds ?? [])
        .map((id) => byId.get(id))
        .filter((parent): parent is ConversationArtifact => !!parent && parent.filename === item.filename);
      return parents.length ? 1 + Math.max(...parents.map((parent) => version(parent, next))) : 1;
    };
    return Object.fromEntries(generated.map((item) => [item.artifactId, version(item, new Set())]));
  }, [generated]);
  const [conversationSources, setConversationSources] = useState<ConversationSource[]>([]);
  const sourceCurrent = useConversationSourcesOwner(conversationCurrent, conversationSources);
  const sourcesByRun = useMemo(() => {
    const grouped = new Map<string, ConversationSource[]>();
    for (const source of conversationSources) {
      const rows = grouped.get(source.runId) ?? [];
      rows.push(source);
      grouped.set(source.runId, rows);
    }
    return grouped;
  }, [conversationSources]);
  const [calendarSourceChoice, setCalendarSourceChoice] = useState<{
    source: Extract<ConversationSource, { kind: "calendar" }>;
    profiles: BrowserProfile[];
    background: boolean;
    owner(): boolean;
  } | null>(null);
  const calendarChoiceOpen = !!calendarSourceChoice;
  const calendarChoiceOpener = useRef<HTMLElement | null>(null);
  const calendarChoiceCancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!calendarChoiceOpen || !calendarSourceChoice) return;
    const choice = calendarSourceChoice;
    let live = true;
    void bridge
      .overlay(true)
      .then(() => (live && choice.owner() ? bridge.focusShell() : undefined))
      .then(() => {
        if (live && choice.owner()) calendarChoiceCancel.current?.focus();
      })
      .catch(() => {});
    return () => {
      live = false;
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
    };
  }, [calendarChoiceOpen, calendarSourceChoice]);
  const [sourceProfileNames, setSourceProfileNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!conversationSources.some((source) => source.profileId)) return;
    let active = true;
    void bridge
      .browserProfiles()
      .then((profiles) => {
        if (active)
          setSourceProfileNames(Object.fromEntries(profiles.map((profile) => [profile.id, profile.name])));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [conversationSources]);
  const [workspaceContext, setWorkspaceContext] = useState<ConversationSpaceContext>({
    workspace: null,
    memory: null,
  });

  const [previewOpen, setPreviewOpen] = useState(true);
  const [sourceDetail, setSourceDetail] = useState<ConversationSource | null>(null);
  useEffect(() => setSourceDetail(null), [id]);
  const [previewMenu, setPreviewMenu] = useState(false);
  const previewTrigger = useRef<HTMLButtonElement>(null);
  const createdChat = useRef<string | null>(null);
  useEffect(() => {
    setPreviewOpen(true);
    setPreviewMenu(false);

    createdChat.current = null;
  }, [id]);
  const [historySaving, setHistorySaving] = useState(false);
  useEffect(() => {
    setHistorySaving(false);
  }, [id]);
  const [contextLoading, setContextLoading] = useState(false);
  const loadedContextChat = useRef<string | null>(null);
  const [contextError, setContextError] = useState("");
  const [contextRefresh, setContextRefresh] = useState(0);
  const [documentSaving, setAttachmentSaving] = useState(false);
  const [imageOperations, setImageOperations] = useState(0);
  const [incomingImage, setIncomingImage] = useState<File | null>(null);
  const attachmentSaving = documentSaving || imageOperations > 0;
  const resultPreview = useStore((state) => state.resultPreview);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewGeneration, setImagePreviewGeneration] = useState(0);
  const activeChat = useRef(id);
  activeChat.current = id;
  const documentBusy = useRef(false);
  const conversationRoot = useRef<HTMLElement>(null);
  useEffect(() => {
    setIncomingImage(null);
    setImagePreview(null);
    setDocumentPreview(null);
    setImages([]);
    setAttachments([]);
    setConversationSources([]);
    setWorkspaceContext({ workspace: null, memory: null });
  }, [id]);
  const [taskTitle, setTaskTitle] = useState("");
  const [archived, setArchived] = useState(false);
  type RecoveryOperation = { owner: typeof conversationCurrent };
  const restorePending = useRef<RecoveryOperation | null>(null);
  const [restoring, setRestoring] = useState<RecoveryOperation | null>(null);
  const metadataRequest = useRef(0);
  const [savedTitle, setSavedTitle] = useState("");
  useEffect(() => {
    let live = true;
    const version = ++metadataRequest.current;
    setSavedTitle("");
    setArchived(false);
    if (id && id !== "history")
      void call("conversations.get", { chatId: id })
        .then((value) => {
          if (live && version === metadataRequest.current) {
            setSavedTitle(value?.title ?? "");
            setArchived(value?.archived ?? false);
          }
        })
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [id]);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type !== "conversation.changed" || event.payload.chatId !== id) return;
        ++metadataRequest.current;
        if (typeof event.payload.title === "string") setSavedTitle(event.payload.title);
        if (typeof event.payload.archived === "boolean") setArchived(event.payload.archived);
      }),
    [id],
  );
  const restoreConversation = () => {
    if (!id || !conversationCurrent() || restorePending.current?.owner === conversationCurrent) return;
    const original = { owner: conversationCurrent },
      chatId = id;
    restorePending.current = original;
    setRestoring(original);
    const completion = (async () => {
      try {
        const value = await call("conversations.archive", { chatId, archived: false });
        if (original.owner() && restorePending.current === original) {
          if (value.chatId !== chatId || value.archived)
            throw new Error("The restore acknowledgment does not match this conversation.");
          setArchived(value.archived);
        }
        return value;
      } finally {
        if (restorePending.current === original) {
          restorePending.current = null;
          if (original.owner()) setRestoring((value) => (value === original ? null : value));
        }
      }
    })();
    return guardCommandCompletion(completion, original.owner);
  };
  const contexts = useStore((s) => s.conversationContexts);
  const contextPage = contexts[id ? draftKey(id) : "new"] ?? (id ? "linked" : "none");
  const setContextPage = (pageId: string) => useStore.getState().setConversationContext(id, pageId);
  const selectedBrowserSources = useStore((s) => s.conversationBrowserSources[browserSourcesKey(id)]);
  const browserSources = selectedBrowserSources ?? [];
  const setBrowserSources = (sources: typeof browserSources) =>
    useStore.getState().setConversationBrowserSources(id, sources);
  const reopenPending = useRef<RecoveryOperation | null>(null);
  const [reopening, setReopening] = useState<RecoveryOperation | null>(null);
  const last = turns.at(-1);
  useEffect(() => {
    setGenerated([]);
    if (!id || id === "history") return;
    let active = true;
    void call("conversations.artifacts.get", { chatId: id })
      .then((value) => {
        if (active) setGenerated(value.artifacts);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, last?.status, last?.runId]);
  const [currentSuspension, setCurrentSuspension] = useState<{
    runId: string;
    statusMessage?: string;
    value: Suspension | null;
  } | null>(null);
  const [suspensionRefresh, setSuspensionRefresh] = useState(0);
  useEffect(() => {
    if (!last || last.status !== "needs_input") {
      setCurrentSuspension(null);
      return;
    }
    const runId = last.runId,
      statusMessage = last.statusMessage;
    let active = true;
    setCurrentSuspension(null);
    void call("runs.get", { runId })
      .then((detail) => {
        if (!active || !conversationCurrent()) return;
        const value =
          detail.run.runId === runId &&
          detail.run.status === "needs_input" &&
          detail.run.statusMessage === statusMessage &&
          detail.suspension?.state === "pending" &&
          detail.suspension.runId === runId &&
          detail.suspension.turnId === runId
            ? detail.suspension
            : null;
        setCurrentSuspension({ runId, statusMessage, value });
      })
      .catch(() => {
        if (active && conversationCurrent()) setCurrentSuspension({ runId, statusMessage, value: null });
      });
    return () => {
      active = false;
    };
  }, [last?.runId, last?.status, last?.statusMessage, suspensionRefresh, conversationCurrent]);
  const suspensionLoaded =
    currentSuspension?.runId === last?.runId && currentSuspension?.statusMessage === last?.statusMessage;
  const suspension =
    currentSuspension?.runId === last?.runId && currentSuspension?.statusMessage === last?.statusMessage
      ? (currentSuspension?.value ?? null)
      : null;
  const answering = last?.status === "needs_input" && suspension?.kind === "ask-user-question";
  const liveControlCurrent = useConversationLiveOwner(conversationCurrent, id, last, suspension);
  const [sendingChat, setSendingChat] = useState<string | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<RunMessage[]>([]);
  const queueAttemptRef = useRef<QueueAttempt | null>(null);
  const [liveSendMode, setLiveSendMode] = useState<"answer" | "steer" | "queue">("answer");
  useEffect(() => setLiveSendMode("answer"), [last?.runId, answering]);
  const effectiveLiveMode = answering ? liveSendMode : liveSendMode === "answer" ? "steer" : liveSendMode;
  const answerRunId = answering && effectiveLiveMode === "answer" ? last?.runId : undefined,
    answerQuestion = last?.statusMessage;
  useEffect(() => {
    setQueuedMessages([]);
    queueAttemptRef.current = null;
    if (!id || id === "history") return;
    let current = true;
    const refresh = () =>
      void call("runs.messages.list", { chatId: id })
        .then((messages) => {
          if (current) setQueuedMessages(messages);
        })
        .catch(() => {});
    refresh();
    const unsubscribe = bridge.onEvent((event) => {
      if (event.type === "conversation.messages.changed" && event.payload.chatId === id) refresh();
    });
    return () => {
      current = false;
      unsubscribe();
    };
  }, [id]);
  const pendingTurns = useStore(
    useShallow((s) => s.pendingTurns.filter((turn) => turn.chatId === (id ?? sendingChat))),
  );
  const answerPending = useStore((s) => !!last && !!s.runAnswerPending[last.runId]);
  const [sendError, setSendError] = useState("");
  const [sendErrorDetails, setSendErrorDetails] = useState("");
  useEffect(() => {
    setSendError("");
    setSendErrorDetails("");
  }, [id, last?.runId, last?.statusMessage]);
  const readText = () => draftText(useStore.getState(), id, answerRunId, answerQuestion);
  const setText = (value: string) => {
    setSendError("");
    setSendErrorDetails("");
    if (answerRunId && last)
      useStore.getState().setRunAnswerDraft(last.runId, last.statusMessage ?? "", value);
    else if (id) useStore.getState().setConversationDraft(id, value);
    else useStore.getState().setAgentDraft(value);
  };
  const sourceOpening = useRef<{ owner: typeof sourceCurrent } | null>(null);
  const openSource = useCallback(
    (source: ConversationSource, background = false) => {
      if (!sourceCurrent(source))
        return guardCommandCompletion(
          Promise.reject(new Error("Choose the original recorded conversation source.")),
          () => sourceCurrent(source),
        );
      if (sourceOpening.current?.owner === sourceCurrent)
        return guardCommandCompletion(
          Promise.reject(new Error("Wait for the original source to open.")),
          () => sourceCurrent(source),
        );
      const original = { owner: sourceCurrent, source: structuredClone(source) };
      sourceOpening.current = original;
      let active = true;
      const current = () => {
        if (active && sourceOpening.current === original && original.owner(original.source)) return true;
        active = false;
        return false;
      };
      const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const completion = (async () => {
        try {
          if (source.kind === "calendar") {
            const profiles = (await bridge.browserProfiles()).filter((profile) => !profile.archived);
            if (!current()) return;
            if (!profiles.length)
              throw new Error("No browser Profile is available to open this Calendar event.");
            if (source.profileId) {
              const owner = profiles.find((profile) => profile.id === source.profileId);
              if (!owner)
                throw new Error(
                  "The Profile that read this Calendar event is unavailable. Restore it before opening the source.",
                );
              if (owner.current) {
                if (background)
                  return await useStore
                    .getState()
                    .openBackgroundTab(source.url, useStore.getState().layout.activeSpaceId, false);
                return await useStore.getState().newTab(source.url);
              }
              const ack = await bridge.openBrowserProfileUrl(owner.id, source.url);
              if (!ack) throw new Error("The source Profile could not open this Calendar event.");
              return ack;
            }
            calendarChoiceOpener.current = opener;
            setCalendarSourceChoice({
              source: structuredClone(source),
              profiles: structuredClone(profiles),
              background,
              owner: () => original.owner(original.source),
            });
            return;
          }
          if (source.profileId) {
            const profiles = await bridge.browserProfiles();
            if (!current()) return;
            if (!profiles.some((profile) => profile.id === source.profileId && profile.current)) {
              if (!profiles.some((profile) => profile.id === source.profileId))
                throw new Error("The source browser Profile is unavailable on this device.");
              const ack = await bridge.openBrowserProfileUrl(source.profileId, source.url);
              if (!ack) throw new Error("The source Profile could not open this page.");
              return ack;
            }
          }
          if (!current()) return;
          const existing = useStore
            .getState()
            .pages.find(
              (page) =>
                page.pageId === source.pageId &&
                page.url === source.url &&
                page.documentEpoch === source.documentEpoch &&
                !page.ownedByRuntime &&
                !["crashed", "detached"].includes(page.viewStatus ?? ""),
            );
          if (existing) {
            if (!background) return await useStore.getState().activate(existing.pageId);
          } else if (background)
            return await useStore
              .getState()
              .openBackgroundTab(source.url, useStore.getState().layout.activeSpaceId, false);
          else return await useStore.getState().newTab(source.url);
        } finally {
          if (sourceOpening.current === original) sourceOpening.current = null;
        }
      })();
      return guardCommandCompletion(completion, () => original.owner(original.source));
    },
    [sourceCurrent, setCalendarSourceChoice],
  );
  const openCitation = useCallback(
    (url: string, background: boolean, runId?: string): boolean => {
      const matching = conversationSources.filter(
        (source) => answerUrl(source.url) === url && (!runId || source.runId === runId),
      );
      if (!matching.length) {
        if (isCalendarCitation(url)) {
          toast(
            "This Calendar source is still loading or unavailable. Open it from Sources after it appears.",
          );
          return true;
        }
        return false;
      }
      const distinct = new Map(
        matching.map((source) => [
          source.kind === "calendar"
            ? `calendar\0${source.connectionId}\0${source.url}`
            : source.kind === "memory"
              ? `memory\0${source.memoryId}`
              : `browser\0${source.profileId ?? ""}\0${source.pageId}\0${source.documentEpoch}\0${source.url}`,
          source,
        ]),
      );
      if (distinct.size !== 1) {
        toast("This link has multiple sources. Choose the exact account or tab from Sources.");
        return true;
      }
      const source = [...distinct.values()][0]!;
      const completion = openSource(source, background);
      void completion.catch((reason) => {
        if (sourceCurrent(source)) errToast(reason);
      });
      return true;
    },
    [conversationSources, openSource, sourceCurrent],
  );
  const calendarOpening = useRef<{ choice: NonNullable<typeof calendarSourceChoice> } | null>(null);
  const currentCalendarChoice = () => !!calendarSourceChoice && calendarSourceChoice.owner();
  const openCalendarSourceInProfile = (profile: BrowserProfile) => {
    const choice = calendarSourceChoice;
    if (
      !choice ||
      !choice.owner() ||
      !choice.profiles.some((value) => JSON.stringify(value) === JSON.stringify(profile))
    )
      return guardCommandCompletion(
        Promise.reject(new Error("Choose the original Calendar source Profile.")),
        () => !!choice?.owner(),
      );
    if (calendarOpening.current?.choice === choice)
      return guardCommandCompletion(
        Promise.reject(new Error("Wait for the original Calendar source to open.")),
        choice.owner,
      );
    const original = { choice };
    calendarOpening.current = original;
    setCalendarSourceChoice(null);
    const current = () => choice.owner() && calendarOpening.current === original;
    const completion = (async () => {
      try {
        const profiles = await bridge.browserProfiles();
        if (!current()) return;
        const actual = profiles.find((value) => value.id === profile.id && !value.archived);
        if (!actual || JSON.stringify(actual) !== JSON.stringify(profile))
          throw new Error("The chosen Calendar source Profile changed. Choose it again.");
        if (profile.current) {
          if (choice.background)
            return await useStore
              .getState()
              .openBackgroundTab(choice.source.url, useStore.getState().layout.activeSpaceId, false);
          return await useStore.getState().newTab(choice.source.url);
        }
        const ack = await bridge.openBrowserProfileUrl(profile.id, choice.source.url);
        if (!ack) throw new Error("The selected Profile could not open this Calendar event.");
        return ack;
      } finally {
        if (calendarOpening.current === original) calendarOpening.current = null;
      }
    })();
    return guardCommandCompletion(completion, choice.owner);
  };
  const linked = pages.find(
    (p) => p.pageId === last?.pageIds[0] && !["crashed", "detached"].includes(p.viewStatus ?? ""),
  );
  const selectedContext = conversationPage(pages, contextPage, activePageId, linked?.pageId);
  const splitPlan = selectedContext
    ? previewSplit(layout, pages, selectedContext.pageId, activePageId)
    : null;
  const previewLayoutIdentity = JSON.stringify([
    selectedContext && layout.tabSpace[selectedContext.pageId],
    layout.tabSpace,
  ]);
  const readPreviewPage = useCallback(() => {
    const state = useStore.getState();
    const selection = state.conversationContexts[id ? draftKey(id) : "new"] ?? (id ? "linked" : "none");
    if (selection !== contextPage) return undefined;
    const latest = state.runs
      .filter((run) => (run.config?.chatId ?? run.runId) === id)
      .sort((a, b) => a.createdAt - b.createdAt)
      .at(-1);
    const selected = conversationPage(state.pages, selection, state.activePageId, latest?.pageIds[0]);
    if (
      JSON.stringify([selected && state.layout.tabSpace[selected.pageId], state.layout.tabSpace]) !==
      previewLayoutIdentity
    )
      return undefined;
    return selected;
  }, [id, contextPage, previewLayoutIdentity]);
  const previewCurrent = useConversationPreviewOwner(
    conversationCurrent,
    selectedContext,
    contextPage,
    previewLayoutIdentity,
    readPreviewPage,
  );
  const missingContext = !["active", "linked", "none"].includes(contextPage) && !selectedContext;
  const changedBrowserSources = browserSources.filter((source) => sourceStatus(source, pages) !== "current");
  const observations = useStore((s) => s.observations);
  const lastObservation = [...turns]
    .reverse()
    .map((run) => observations[run.runId])
    .find((observation) => observation && answerUrl(observation.url));
  const recoverUrl = lastObservation ? answerUrl(lastObservation.url) : "";
  // Reopening a closed page needs the run's last observation, which only lands
  // in the store via live events — hydrate it from the run's step ledger when
  // the conversation is revisited in a later session.
  useEffect(() => {
    const runId = last?.runId;
    if (!runId || observations[runId]) return;
    let live = true;
    void (async () => {
      const d = await call("runs.get", { runId });
      const artifactId = [...(d.steps ?? [])]
        .reverse()
        .map((step) => (step.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId)
        .find(Boolean);
      if (!artifactId) return;
      const res = await call("artifacts.read", { artifactId });
      const observation = decodeBase64Json<CompactObservation>(res.dataBase64);
      if (live && observation && typeof observation.url === "string") {
        useStore.setState((s) =>
          s.observations[runId] ? {} : { observations: { ...s.observations, [runId]: observation } },
        );
      }
    })().catch(() => {});
    return () => {
      live = false;
    };
  }, [last?.runId, observations]);
  const live = !!last && isLive(last);
  const boundTaskId = last?.config?.taskId ?? workspaceContext.taskId;
  const taskBound = !!boundTaskId;
  useEffect(() => {
    let cancelled = false;
    const taskId = boundTaskId;
    if (!taskId) {
      setTaskTitle("");
      return;
    }
    void call("tasks.get", { taskId })
      .then((value) => {
        if (!cancelled) setTaskTitle(value.task.title);
      })
      .catch(() => {
        if (!cancelled) setTaskTitle("");
      });
    return () => {
      cancelled = true;
    };
  }, [boundTaskId]);

  const contextRequest = useRef(0);
  const contextRetryPending = useRef(false);
  useLayoutEffect(() => {
    ++contextRequest.current;
    contextRetryPending.current = false;
  }, [id, turns.length, last?.status, connected, contextRefresh, attachmentSaving, conversationCurrent]);
  useEffect(() => {
    let cancelled = false;
    const version = contextRequest.current;
    const current = () => !cancelled && version === contextRequest.current && conversationCurrent();
    if (!connected || attachmentSaving) {
      setContextLoading(false);
      return;
    }
    setContextError("");
    setContextLoading(!!id);
    if (!id) {
      setImages([]);
      setAttachments([]);
      setConversationSources([]);
      setWorkspaceContext({ workspace: null, memory: null });
      return;
    }
    void Promise.all([
      call("conversations.images.get", { chatId: id }),
      call("conversations.attachments.get", { chatId: id }),
      call("conversations.workspace.get", { chatId: id }),
      call("conversations.sources.get", { chatId: id }),
    ])
      .then(([imageReferences, documents, workspace, sourceList]) => {
        if (current()) {
          loadedContextChat.current = id;
          setImages(imageReferences.images);
          setAttachments(documents.attachments);
          setWorkspaceContext(workspace);
          setConversationSources(sourceList.sources);
        }
      })
      .catch((error) => {
        if (current()) setContextError(errorMessage(error));
      })
      .finally(() => {
        if (current()) setContextLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, turns.length, last?.status, connected, contextRefresh, attachmentSaving, conversationCurrent]);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type === "conversation.context.changed" && event.payload.chatId === id) {
          setConversationSources([]);
          setContextRefresh((value) => value + 1);
          void call("conversations.artifacts.get", { chatId: id! })
            .then((value) => setGenerated(value.artifacts))
            .catch(() => {});
        }
        if (
          ["workspace.memory.updated", "workspace.browsingMemory.updated"].includes(event.type) &&
          event.payload.workspaceId === workspaceContext.workspace?.workspaceId
        )
          setContextRefresh((value) => value + 1);
      }),
    [id, workspaceContext.workspace?.workspaceId],
  );
  const ensureChatId = () => {
    if (id) return id;
    const chatId = crypto.randomUUID();
    createdChat.current = chatId;
    const text = readText();
    if (text) useStore.getState().setConversationDraft(chatId, text);
    useStore.getState().setConversationContext(chatId, contextPage);
    useStore.getState().setConversationBrowserSources(chatId, browserSources);
    useStore.getState().setAgentDraft("");
    try {
      localStorage.setItem(PENDING_CHAT_KEY, chatId);
    } catch {
      /* in-window state still works */
    }
    if (onChatCreated) onChatCreated(chatId);
    else useStore.setState({ conversationId: chatId });
    return chatId;
  };
  const imageSnapshot = JSON.stringify(images);
  const committedImages = useRef(imageSnapshot);
  const imageMutation = useRef<{ release(): void } | null>(null);
  useLayoutEffect(() => {
    committedImages.current = imageSnapshot;
  }, [imageSnapshot]);
  useLayoutEffect(
    () => () => {
      imageMutation.current?.release();
    },
    [conversationCurrent],
  );
  const currentImage = (item: ConversationImage) =>
    conversationCurrent() && committedImages.current === imageSnapshot && images.includes(item);
  const currentImagePreview = useCallback(
    () => conversationCurrent() && committedImages.current === imageSnapshot && imagePreview !== null,
    [conversationCurrent, imageSnapshot, imagePreview],
  );
  const changeImage = (item: ConversationImage, included?: boolean) => {
    const imageId = item.imageId;
    if (!id || !currentImage(item) || contextLocked || documentBusy.current || attachmentSaving)
      throw new Error("Choose the current image control.");
    const chatId = id;
    const current = () => currentImage(item);
    const operation = {
      release() {
        if (imageMutation.current !== operation) return;
        imageMutation.current = null;
        documentBusy.current = false;
        setImageOperations((count) => Math.max(0, count - 1));
      },
    };
    imageMutation.current = operation;
    documentBusy.current = true;
    setImageOperations((count) => count + 1);
    const completion = (async () => {
      try {
        const result = await call(
          included === undefined ? "conversations.images.remove" : "conversations.images.toggle",
          { chatId, imageId, ...(included === undefined ? {} : { included }) },
        );
        if (current() && imageMutation.current === operation) {
          setImages(result.images);
          setImagePreview(null);
          setContextRefresh((value) => value + 1);
        }
        return result;
      } catch (error) {
        if (current() && imageMutation.current === operation) errToast(error);
        throw error;
      } finally {
        operation.release();
      }
    })();
    return guardCommandCompletion(completion, current);
  };
  const attachmentCurrent = useConversationAttachmentOwner(conversationCurrent, [
    ...attachments,
    ...generated,
  ]);
  const attachmentMutation = useRef<{ release(): void } | null>(null);
  useLayoutEffect(
    () => () => {
      attachmentMutation.current?.release();
    },
    [attachmentCurrent],
  );
  const changeAttachment = (item: ConversationAttachment | ConversationArtifact, included?: boolean) => {
    const current = () => attachmentCurrent(item);
    if (!id || !current() || documentBusy.current || attachmentSaving || contextLocked)
      throw new Error("Choose the current conversation attachment.");
    const chatId = id,
      document = "attachmentId" in item;
    const operation = {
      release() {
        if (attachmentMutation.current !== operation) return;
        attachmentMutation.current = null;
        documentBusy.current = false;
        setAttachmentSaving(false);
      },
    };
    attachmentMutation.current = operation;
    documentBusy.current = true;
    setAttachmentSaving(true);
    const completion = (async () => {
      try {
        const value = document
          ? await call(
              included === undefined
                ? "conversations.attachments.remove"
                : "conversations.attachments.toggle",
              { chatId, attachmentId: item.attachmentId, ...(included === undefined ? {} : { included }) },
            )
          : await call("conversations.artifacts.toggle", {
              chatId,
              artifactId: item.artifactId,
              included: included!,
            });
        if (current() && attachmentMutation.current === operation) {
          if ("attachments" in value) {
            setAttachments(value.attachments);
            setDocumentPreview(null);
          } else setGenerated(value.artifacts);
        }
        return value;
      } finally {
        operation.release();
      }
    })();
    return guardCommandCompletion(completion, current);
  };
  const exportConversation = () => {
    if (
      !id ||
      !turns.length ||
      !conversationCurrent() ||
      exportPending.current?.owner === conversationCurrent
    )
      return;
    const original = { owner: conversationCurrent },
      chatId = id;
    const current = () => original.owner() && exportPending.current === original;
    exportPending.current = original;
    setExporting(original);
    const completion = (async () => {
      try {
        const all: Run[] = [];
        let before: ReturnType<typeof cursor> | undefined;
        for (;;) {
          if (!current()) return;
          const page = await call("runs.list", { chatId, limit: 500, ...(before ? { before } : {}) });
          all.push(...page);
          if (page.length < 500) break;
          before = cursor(page[page.length - 1]!);
        }
        const [documents, generated, workspace, sourceList] = await Promise.all([
          current() ? call("conversations.attachments.get", { chatId }) : null,
          current() ? call("conversations.artifacts.get", { chatId }) : null,
          current() ? call("conversations.workspace.get", { chatId }) : null,
          current() ? call("conversations.sources.get", { chatId }) : null,
        ]);
        if (!current() || !documents || !generated || !workspace || !sourceList) return;
        const title = all.at(-1)?.goal || turns[0]!.goal;
        const name = `aux-conversation-${
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 60) || chatId.slice(0, 12)
        }.md`;
        const markdown = conversationMarkdown({
          chatId,
          title,
          runs: all,
          attachments: documents.attachments,
          artifacts: generated.artifacts,
          sources: sourceList.sources,
          workspace: workspace.workspace,
          memory: workspace.memory,
        });
        if (!current()) return;
        const destination = await bridge.saveFile(name, markdown);
        if (destination && current()) useStore.getState().toast("Conversation exported");
        return destination;
      } finally {
        if (exportPending.current === original) {
          exportPending.current = null;
          if (original.owner()) setExporting((value) => (value === original ? null : value));
        }
      }
    })();
    return guardCommandCompletion(completion, original.owner);
  };
  const send = async () => {
    const text = readText();
    const composerId = mentionComposerId(id, answerRunId);
    if (archived || !connected || !text.trim() || sendPending.current || answerPending) return;
    if (
      !answering &&
      (attachmentSaving ||
        historySaving ||
        (!live && (missingContext || changedBrowserSources.length)) ||
        historyLoading ||
        historyError ||
        contextLoading ||
        contextError ||
        (taskBound && last?.status !== "needs_input"))
    )
      return;
    sendPending.current = true;
    setSending(true);
    setSendError("");
    setSendErrorDetails("");
    let draftCleared = false;
    const restoreDraft = () => {
      if (!draftCleared || readText()) return;
      if (id) useStore.getState().setConversationDraft(id, text);
      else useStore.getState().setAgentDraft(text);
    };
    try {
      const mentions = await submittedMentions(composerId, text);
      if (answering && last && suspension && effectiveLiveMode === "answer") {
        await useStore
          .getState()
          .answerRun(last.runId, text.trim(), last.statusMessage ?? "", suspension.suspensionId, mentions);
        scrolling.jumpToLatest();
      } else if (live && last && id) {
        const mode = effectiveLiveMode === "answer" ? "steer" : effectiveLiveMode;
        const attempt = queueAttempt(id, last.runId, text.trim(), mode, mentions, queueAttemptRef.current);
        queueAttemptRef.current = attempt;
        const resends = resendOf.current;
        const message = await call(mode === "steer" ? "runs.steer" : "runs.queue", {
          messageId: attempt.messageId,
          runId: last.runId,
          chatId: id,
          text: attempt.text,
          mentions: attempt.mentions,
          pageIds: last.pageIds,
          contextPageRefs: last.config?.contextPageRefs ?? [],
          expectedRevision: last.config?.messageRevision ?? 0,
          expectedTurnId: last.runId,
          ...(mode === "steer" ? { clientUserMessageId: attempt.messageId } : {}),
          ...(resends ? { resendsMessageId: resends } : {}),
        });
        setQueuedMessages((items) =>
          items.some((item) => item.messageId === message.messageId) ? items : [...items, message],
        );
        if (readText() === text) {
          setText("");
          clearMentionDraft(composerId);
        }
        queueAttemptRef.current = null;
        resendOf.current = null;
        try {
          localStorage.removeItem(`${QUEUE_ATTEMPT_PREFIX}${id}`);
        } catch {
          /* Already acknowledged in runtime. */
        }
        scrolling.jumpToLatest();
      } else {
        const mentionedPageIds = mentions.flatMap((ref) =>
          ref.kind === "tab"
            ? [ref.pageId]
            : ref.kind === "group"
              ? ref.members.map((member) => member.pageId)
              : [],
        );
        const selectedPageIds = [
          ...new Set(
            mentionedPageIds.length
              ? mentionedPageIds
              : [
                  ...(selectedContext ? [selectedContext.pageId] : []),
                  ...browserSources.map((source) => source.pageId),
                ],
          ),
        ];
        let primaryForRun = mentionedPageIds.length
          ? useStore.getState().pages.find((page) => page.pageId === mentionedPageIds[0])
          : selectedContext;
        if (selectedPageIds.length) {
          const pending = (await call("browser.recovery.list", {})).filter((tab) =>
            selectedPageIds.includes(tab.pageId),
          );
          for (const tab of pending) await call("browser.recovery.retry", { pageId: tab.pageId });
          if (pending.length) {
            const restored = await call("pages.list", {});
            if (browserSources.some((source) => sourceStatus(source, restored) !== "current")) {
              setSendError(
                "A selected tab was restored and its page changed. Update or remove it before sending.",
              );
              return;
            }
            if (selectedContext)
              primaryForRun = restored.find((page) => page.pageId === selectedContext.pageId);
          }
        }
        if (selectedPageIds.length && !primaryForRun) {
          setSendError("The selected tab is unavailable. Open it or choose another tab.");
          return;
        }
        // Optimistic: the message leaves the composer and joins the thread now;
        // a failed start puts it back unless something new was typed meanwhile.
        const chatId = id ?? crypto.randomUUID();
        if (!id) {
          useStore.getState().setConversationContext(chatId, contextPage);
          useStore.getState().setConversationBrowserSources(chatId, browserSources);
        }
        const pageIds = selectedPageIds;
        const contextPageRefs = [
          ...(primaryForRun
            ? [
                browserSources.find((source) => source.pageId === primaryForRun.pageId) ??
                  sourceRef(primaryForRun),
              ]
            : []),
          ...browserSources.filter((source) => source.pageId !== primaryForRun?.pageId),
        ].filter((source) => pageIds.includes(source.pageId));
        setSendingChat(chatId);
        setText("");
        draftCleared = true;
        if (activeChat.current === id) scrolling.jumpToLatest();
        const run = await useStore
          .getState()
          .startRun(text, {
            chatId,
            pageId: primaryForRun?.pageId ?? null,
            pageIds,
            contextPageRefs,
            mentions,
            scope: primaryForRun ? "page" : "new",
            presentation: embedded && !home ? "rail" : "conversation",
            ownsDraft: true,
          });
        if (run) {
          clearMentionDraft(composerId);
          try {
            localStorage.removeItem(PENDING_CHAT_KEY);
            if (localStorage.getItem(HOME_DRAFT_CHAT_KEY) === chatId)
              localStorage.removeItem(HOME_DRAFT_CHAT_KEY);
          } catch {
            /* storage is optional */
          }
          if (!id) {
            useStore.getState().setConversationContext(null, "");
            useStore.getState().setConversationBrowserSources(null, []);
          }
          if (activeChat.current === id) scrolling.jumpToLatest();
        } else restoreDraft();
      }
    } catch (error) {
      restoreDraft();
      if (activeChat.current === id) {
        setSendError("Your message couldn’t be sent. Try sending it again.");
        setSendErrorDetails(errorMessage(error));
      }
    } finally {
      sendPending.current = false;
      setSending(false);
      setSendingChat(null);
    }
  };
  const reopen = () => {
    if (
      !recoverUrl ||
      !last ||
      !conversationCurrent() ||
      reopenPending.current?.owner === conversationCurrent
    )
      return;
    const original = {
      owner: conversationCurrent,
      runId: last.runId,
      url: recoverUrl,
      observation: lastObservation,
    };
    const current = () => {
      if (!original.owner()) return false;
      const state = useStore.getState();
      const currentTurns = state.runs
        .filter((run) => (run.config?.chatId ?? run.runId) === id)
        .sort((a, b) => a.createdAt - b.createdAt);
      const observation = [...currentTurns]
        .reverse()
        .map((run) => state.observations[run.runId])
        .find((value) => value && answerUrl(value.url));
      return (
        currentTurns.at(-1)?.runId === original.runId &&
        observation === original.observation &&
        answerUrl(observation?.url ?? "") === original.url
      );
    };
    if (!current()) throw new Error("Choose the current conversation page to reopen.");
    reopenPending.current = original;
    setReopening(original);
    const completion = (async () => {
      try {
        const existing = pages.find(
          (p) =>
            p.url === original.url &&
            !p.ownedByRuntime &&
            !["crashed", "detached"].includes(p.viewStatus ?? ""),
        );
        const page = existing ?? (await useStore.getState().newTab(original.url));
        if (page && current() && reopenPending.current === original) {
          setContextPage(page.pageId);
          useStore.getState().openConversation(original.runId);
        }
        return page;
      } finally {
        if (reopenPending.current === original) {
          reopenPending.current = null;
          if (original.owner()) setReopening((value) => (value === original ? null : value));
        }
      }
    })();
    return guardCommandCompletion(completion, current);
  };
  type QueueOperation = { owner: typeof conversationCurrent; messageId: string };
  const queueChange = useRef<QueueOperation | null>(null);
  const resendOf = useRef<string | null>(null);
  const [queueBusy, setQueueBusy] = useState<QueueOperation | null>(null);
  const cancelQueued = (message: RunMessage, edit: boolean, current: () => boolean) => {
    if (!current() || queueChange.current?.owner === conversationCurrent || archived) return;
    const original = {
      owner: conversationCurrent,
      message: structuredClone(message),
      messageId: message.messageId,
    };
    const delivering = () => original.owner() && queueChange.current === original;
    queueChange.current = original;
    setQueueBusy(original);
    const chatId = id;
    const completion = (async () => {
      try {
        const cancelled = await call("runs.message.cancel", { messageId: message.messageId });
        if (!delivering()) return cancelled;
        if (
          cancelled.messageId !== original.message.messageId ||
          cancelled.chatId !== chatId ||
          cancelled.targetRunId !== original.message.targetRunId ||
          cancelled.deliveryRunId !== original.message.deliveryRunId ||
          cancelled.text !== original.message.text ||
          cancelled.expectedRevision !== original.message.expectedRevision
        )
          throw new Error("The queued message acknowledgment does not match this conversation.");
        setQueuedMessages((items) =>
          items.map((item) => (item.messageId === cancelled.messageId ? cancelled : item)),
        );
        if (edit && cancelled.status === "cancelled") {
          const state = useStore.getState();
          const prior = chatId ? (state.conversationDrafts[draftKey(chatId)] ?? "") : state.agentDraft;
          const next = prior.trim() ? `${prior}\n\n${original.message.text}` : original.message.text;
          resendOf.current = cancelled.messageId;
          if (chatId) state.setConversationDraft(chatId, next);
          else state.setAgentDraft(next);
          setLiveSendMode("queue");
          requestAnimationFrame(() => {
            if (original.owner()) textareaRef.current?.focus();
          });
        }
        return cancelled;
      } finally {
        if (queueChange.current === original) {
          queueChange.current = null;
          if (original.owner()) setQueueBusy((value) => (value === original ? null : value));
        }
      }
    })();
    return guardCommandCompletion(completion, original.owner);
  };
  const contextLocked = !connected || archived || live || contextLoading || !!contextError;
  const receiveImage = (files: File[]) => {
    if (contextLocked || attachmentSaving || incomingImage) {
      errToast(new Error("Wait for the current operation before adding an image."));
      return;
    }
    if (files.length !== 1 || !["image/png", "image/jpeg", "image/webp"].includes(files[0]!.type)) {
      errToast(new Error("Paste or drop one PNG, JPEG or WebP image. Use Attach for documents."));
      return;
    }
    if (images.length >= 4) {
      errToast(new Error("Four images are attached. Remove one before adding another."));
      return;
    }
    setIncomingImage(files[0]!);
  };
  const imageInput = {
    onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = [...event.clipboardData.files];
      if (!files.length) return;
      event.preventDefault();
      receiveImage(files);
    },
    onDragOver: (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (event.dataTransfer.types.includes("Files")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    },
    onDrop: (event: React.DragEvent<HTMLTextAreaElement>) => {
      const files = [...event.dataTransfer.files];
      if (!files.length) return;
      event.preventDefault();
      receiveImage(files);
    },
  };
  const [contextTools, setContextTools] = useState<HTMLDivElement | null>(null);
  const attachDocument = async () => {
    if (contextLocked || documentBusy.current || attachmentSaving) return;
    documentBusy.current = true;
    setAttachmentSaving(true);
    try {
      const picked = await bridge.pickEvidenceDocument();
      if (!picked) return;
      if (activeChat.current !== id) return;
      const target = ensureChatId();
      activeChat.current = target;
      const result = await call("conversations.attachments.add", {
        chatId: target,
        filename: picked.filename,
        content: picked.content,
      });
      if (activeChat.current === target) {
        setAttachments(result.attachments);
        setContextRefresh((value) => value + 1);
      }
    } catch (error) {
      errToast(error);
    } finally {
      documentBusy.current = false;
      setAttachmentSaving(false);
    }
  };
  const newChat =
    !embedded && !turns.length && !pendingTurns.length && !historyLoading && !historyError && !taskBound;
  useEffect(() => {
    if (newChat) textareaRef.current?.focus();
  }, [newChat, textareaRef]);
  // The composer remains mounted behind Settings; only an explicit new hero request transfers focus back.
  useEffect(() => {
    if (seenFocusRequest.current === focusRequest) return;
    seenFocusRequest.current = focusRequest;
    const state = useStore.getState(),
      input = textareaRef.current;
    if (
      !embedded &&
      !home &&
      state.focusRequest === focusRequest &&
      state.focusSlot === "hero" &&
      state.mode === "conversation" &&
      !state.overlay &&
      conversationCurrent() &&
      input &&
      availableForFocus(input)
    )
      input.focus();
  }, [focusRequest, embedded, home, conversationCurrent, textareaRef]);
  const imageTray = (
    <ConversationImages
      detachedTools
      toolsTarget={contextTools}
      showAttachedImages={false}
      incomingFile={incomingImage}
      onFileConsumed={(file) => setIncomingImage((current) => (current === file ? null : current))}
      chatId={id}
      page={selectedContext}
      images={images}
      disabled={contextLocked || attachmentSaving}
      ensureChatId={ensureChatId}
      onDocument={() => void attachDocument()}
      onBusy={(busy) => setImageOperations((count) => Math.max(0, count + (busy ? 1 : -1)))}
      onChange={(chatId, value) => {
        if (activeChat.current === chatId) {
          setImages(value);
          setContextRefresh((current) => current + 1);
        }
      }}
    />
  );
  if (id === "history") return <ConversationHistory />;
  const dictation = (
    <Dictation
      draftKey={id ? draftKey(id) : "new"}
      key={`dictation-${id ?? "new"}`}
      disabled={archived || sending || answerPending}
      composerRef={textareaRef}
      onInsert={(words) => {
        const state = useStore.getState();
        const current =
          answerRunId && last
            ? (state.runAnswerDrafts[last.runId]?.text ?? "")
            : id
              ? (state.conversationDrafts[draftKey(id)] ?? "")
              : state.agentDraft;
        setText(current ? `${current}\n${words}` : words);
      }}
    />
  );
  const composerModes = live && (
    <div className="conversation-live-actions" role="group" aria-label="Send while Aux is working">
      {(answering ? (["answer", "steer", "queue"] as const) : (["steer", "queue"] as const)).map((mode) => (
        <ConversationLiveAction
          key={mode}
          command={
            mode === "answer"
              ? "select-conversation-answer"
              : mode === "steer"
                ? "select-conversation-steer"
                : "select-conversation-queue"
          }
          current={liveControlCurrent}
          className={effectiveLiveMode === mode ? "selected" : ""}
          aria-pressed={effectiveLiveMode === mode}
          invoke={() => setLiveSendMode(mode)}
        >
          {mode === "answer" ? "Answer question" : mode === "steer" ? "Steer now" : "Queue next"}
        </ConversationLiveAction>
      ))}
    </div>
  );
  const browserContextControls = (
    <BrowserContextTray
      key={id ?? "new"}
      primary={contextPage}
      onPrimary={setContextPage}
      linkedPageId={linked?.pageId}
      sources={browserSources}
      onSources={setBrowserSources}
      disabled={contextLocked}
    />
  );
  const composerFooter = !taskBound && !answering && (
    <div className="new-chat-options">
      {entryControls}
      <span className="home-tools-trigger">
        <Popover
          label="Add context"
          triggerControl={contextControls.triggerControl}
          onTrigger={contextControls.onTrigger}
          trigger={
            <>
              {shellIconPlusSm}
              {!home && <span>Add context</span>}
            </>
          }
        >
          {(close) => (
            <div className="home-tools-menu">
              <header>Add to your question</header>
              <div
                ref={setContextTools}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) close();
                }}
              />
              <div className="home-tools-context">{browserContextControls}</div>
              {home && dictation}
              {home && (
                <HomeEntryAction
                  className="context-choice"
                  command="open-home-conversation"
                  current={conversationCurrent}
                  invoke={() => {
                    close();
                    useStore.getState().openConversationDraft(id ?? null);
                  }}
                >
                  {shellIconOpen}
                  <span>Open full conversation</span>
                </HomeEntryAction>
              )}
            </div>
          )}
        </Popover>
      </span>
    </div>
  );

  const attachmentItems: AttachmentItem[] = [
    ...attachments.map<AttachmentItem>((item) => ({
      key: `document:${item.attachmentId}`,
      name: item.filename,
      kind: "document" as const,
      included: item.included,
      onOpen: () => {
        setSourceDetail(null);
        useStore.setState({ resultPreview: null });
        setImagePreview(null);
        setDocumentPreview(item.attachmentId);
      },
      onToggle: (included: boolean) => changeAttachment(item, included),
      onRemove: () => changeAttachment(item),
      openControl: (props, children, invoke) => (
        <ConversationAttachmentAction
          {...props}
          command="preview-conversation-document"
          current={() => attachmentCurrent(item)}
          invoke={invoke}
        >
          {children}
        </ConversationAttachmentAction>
      ),
      choiceControl: (props, invoke) => (
        <ConversationAttachmentChoice
          {...props}
          command="toggle-conversation-document"
          current={() => attachmentCurrent(item)}
          invoke={invoke}
        />
      ),
      removeControl: (props, children, invoke) => (
        <ConversationAttachmentAction
          {...props}
          command="remove-conversation-document"
          current={() => attachmentCurrent(item)}
          invoke={invoke}
        >
          {children}
        </ConversationAttachmentAction>
      ),
    })),
    ...images.map((item) => ({
      imageCurrent: () => currentImage(item),
      key: `image:${item.imageId}`,
      name: item.filename,
      kind: "image" as const,
      included: item.included,
      detail: `${item.width} × ${item.height}`,
      onOpen: () => {
        if (!currentImage(item)) throw new Error("Choose the current image control.");
        setSourceDetail(null);
        useStore.setState({ resultPreview: null });
        setDocumentPreview(null);
        setImagePreview(item.imageId);
        setImagePreviewGeneration((value) => value + 1);
      },
      onToggle: (included: boolean) => changeImage(item, included),
      onRemove: () => changeImage(item),
    })),
    ...generated
      .filter((item) => !item.automaticReport || item.included)
      .map<AttachmentItem>((item) => ({
        key: `result:${item.artifactId}`,
        name: item.filename,
        kind: "result" as const,
        included: item.included,
        detail: `Saved result · v${item.revision ?? artifactVersions[item.artifactId] ?? 1}`,
        onOpen: () => {
          setSourceDetail(null);
          setImagePreview(null);
          setDocumentPreview(null);
          useStore.setState({ resultPreview: item.artifactId });
        },
        onToggle: (included: boolean) => changeAttachment(item, included),
        openControl: (props, children, invoke) => (
          <ConversationAttachmentAction
            {...props}
            command="preview-conversation-result"
            current={() => attachmentCurrent(item)}
            invoke={invoke}
          >
            {children}
          </ConversationAttachmentAction>
        ),
        choiceControl: (props, invoke) => (
          <ConversationAttachmentChoice
            {...props}
            command="toggle-conversation-result"
            current={() => attachmentCurrent(item)}
            invoke={invoke}
          />
        ),
      })),
  ];
  const queued = queuedMessages.filter(
    (message) => message.mode === "queue" && !["delivered", "cancelled"].includes(message.status),
  );
  const closedPage = !linked && !!last?.pageIds.length;
  const openPreview = (where: "tab" | "split") => {
    if (!previewCurrent() || !selectedContext)
      throw new Error("Choose the current conversation preview page.");
    const pageId = selectedContext.pageId;
    setPreviewMenu(false);
    if (where === "tab") return guardCommandCompletion(useStore.getState().activate(pageId), previewCurrent);
    const state = useStore.getState();
    const plan = previewSplit(state.layout, state.pages, pageId, state.activePageId);
    if (!plan) {
      toast("Open another tab in this Space to use split view.");
      return;
    }
    const primary = previewPageIdentity(state.pages.find((page) => page.pageId === plan.primary));
    const companion = previewPageIdentity(state.pages.find((page) => page.pageId === plan.companion));
    const spaceId = state.layout.tabSpace[plan.primary];
    const completion = state.activate(plan.primary).then((ack) => {
      const now = useStore.getState();
      if (
        previewCurrent() &&
        now.activePageId === plan.primary &&
        now.layout.tabSpace[plan.primary] === spaceId &&
        now.layout.tabSpace[plan.companion] === spaceId &&
        previewPageIdentity(now.pages.find((page) => page.pageId === plan.primary)) === primary &&
        previewPageIdentity(now.pages.find((page) => page.pageId === plan.companion)) === companion &&
        previewSplit(now.layout, now.pages, pageId, now.activePageId)?.companion === plan.companion
      )
        runCommand("split-add", { payload: { pageId: plan.companion } });
      return ack;
    });
    return guardCommandCompletion(completion, previewCurrent);
  };
  const browserPreview =
    !embedded && previewOpen && selectedContext && selectedContext.url !== "about:blank" ? (
      <div className="conversation-preview">
        <div className="conversation-preview-title">
          {shellIconGlobe}
          <b>{selectedContext.title || "Browser tab"}</b>
          <ConversationPreviewAction
            controlRef={previewTrigger}
            command="toggle-conversation-preview-menu"
            current={previewCurrent}
            className="conversation-preview-open"
            aria-label="Choose where to open this page"
            aria-haspopup="menu"
            aria-expanded={previewMenu}
            invoke={() => setPreviewMenu((value) => !value)}
          >
            {shellIconOpen}
          </ConversationPreviewAction>
        </div>
        <ConversationPreviewAction
          command="toggle-conversation-preview-menu"
          current={previewCurrent}
          className="conversation-preview-live"
          aria-label={`Open ${selectedContext.title || "this page"}`}
          aria-expanded={previewMenu}
          invoke={() => setPreviewMenu(true)}
        >
          <LivePage
            key={`${selectedContext.pageId}:${selectedContext.documentEpoch}`}
            pageId={selectedContext.pageId}
          />
        </ConversationPreviewAction>
        {previewMenu && (
          <Menu
            className="menu conversation-preview-menu"
            label="Open browser preview"
            anchor={previewTrigger}
            returnFocus={previewTrigger}
            onClose={() => setPreviewMenu(false)}
          >
            <ConversationPreviewAction
              command="activate-conversation-preview-page"
              current={previewCurrent}
              {...auxReuseStaticMenuItemProps}
              role="menuitem"
              invoke={() => openPreview("tab")}
            >
              {shellIconOpen}
              <span>Open in tab</span>
            </ConversationPreviewAction>
            {splitPlan && (
              <ConversationPreviewAction
                command="split-conversation-preview-page"
                current={previewCurrent}
                {...auxReuseStaticMenuItemProps}
                role="menuitem"
                invoke={() => openPreview("split")}
              >
                {shellIconSplit}
                <span>Split view</span>
              </ConversationPreviewAction>
            )}
          </Menu>
        )}
      </div>
    ) : null;
  const supporting =
    id && resultPreview ? (
      generated.find((item) => item.artifactId === resultPreview && item.generatedKind) ? (
        <GeneratedResultPreview
          key={resultPreview}
          chatId={id}
          artifactId={resultPreview}
          contextDisabled={contextLocked}
          onClose={() => useStore.setState({ resultPreview: null })}
          onVersionSaved={(artifactId) => useStore.setState({ resultPreview: artifactId })}
        />
      ) : (
        <SavedResultPreview
          key={resultPreview}
          chatId={id}
          artifactId={resultPreview}
          contextDisabled={contextLocked}
          onCitationOpen={openCitation}
          onClose={() => useStore.setState({ resultPreview: null })}
          onVersionSaved={(artifactId) => useStore.setState({ resultPreview: artifactId })}
        />
      )
    ) : id && imagePreview && images.some((image) => image.imageId === imagePreview) ? (
      <ImageSnapshot
        key={`${id}:${imagePreview}`}
        chatId={id}
        imageId={imagePreview}
        current={currentImagePreview}
        onClose={() => setImagePreview(null)}
        closeControl={
          <ConversationImageAction
            command="cancel-conversation-image"
            current={currentImagePreview}
            invoke={() => setImagePreview(null)}
            type="button"
            {...auxReuseStaticExtraSmallIconButtonProps}
            aria-label="Close image preview"
          >
            {shellIconClose}
          </ConversationImageAction>
        }
      />
    ) : id && documentPreview ? (
      <DocumentSnapshot
        key={`${id}:${documentPreview}`}
        chatId={id}
        attachmentId={documentPreview}
        onClose={() => setDocumentPreview(null)}
      />
    ) : sourceDetail ? (
      <>
        <ConversationSourceRow
          command="open-conversation-recorded-source"
          current={() => sourceCurrent(sourceDetail)}
          source={sourceDetail}
          profileNames={sourceProfileNames}
          invoke={() => openSource(sourceDetail)}
        />
        <p className="hint selectable">{sourceDetail.url}</p>
        <ConversationSourceAction
          command="open-conversation-recorded-source"
          current={() => sourceCurrent(sourceDetail)}
          {...auxReuseStaticButtonProps}
          invoke={() => openSource(sourceDetail)}
        >
          Open recorded source {shellIconOpen}
        </ConversationSourceAction>
      </>
    ) : (
      browserPreview
    );
  const supportingKey =
    resultPreview || imagePreview || documentPreview || sourceDetail?.sourceId || "browser";
  const supportingCurrent = useCallback(() => conversationCurrent(), [conversationCurrent, supportingKey]);
  const closeSupporting = () => {
    useStore.setState({ resultPreview: null });
    setImagePreview(null);
    setDocumentPreview(null);
    setSourceDetail(null);
    setPreviewOpen(false);
  };
  return (
    <section
      ref={conversationRoot}
      className={`conversation${embedded ? " conversation-embedded" : ""}${home ? " conversation-home" : ""}${newChat ? " conversation-new" : ""}`}
      aria-label={embedded ? "Conversation" : undefined}
      aria-labelledby={embedded ? undefined : "conversation-title"}
    >
      {!embedded && (
        <header className="conversation-head">
          {newChat && (
            <span className="new-chat-brand">
              <AuxMark />
              Aux<span {...auxReuseNativeAriaHiddenProps}>/</span>
            </span>
          )}
          <h1 id="conversation-title">{taskTitle || savedTitle || turns[0]?.goal || "New chat"}</h1>
          <div {...auxReuseStaticSpacerProps} />
          {last && <NightRunOverflow runId={last.runId} />}{" "}
          {selectedContext && selectedContext.url !== "about:blank" && (
            <ConversationViewAction
              command="toggle-conversation-browser-preview"
              current={conversationCurrent}
              {...auxReuseStaticIconButtonProps}
              aria-label={previewOpen ? "Hide browser preview" : "Show browser preview"}
              title="Browser preview"
              aria-pressed={previewOpen}
              invoke={() => setPreviewOpen((value) => !value)}
            >
              {shellIconGlobe}
            </ConversationViewAction>
          )}
          {turns.length > 0 && (
            <Tooltip content="Export conversation as Markdown">
              {(descriptionId) => (
                <ConversationViewAction
                  command="export-conversation-markdown"
                  current={conversationCurrent}
                  {...auxReuseStaticIconButtonProps}
                  disabled={exporting?.owner === conversationCurrent}
                  aria-describedby={descriptionId}
                  aria-label="Export conversation as Markdown"
                  invoke={exportConversation}
                >
                  {shellIconDownloadSm}
                </ConversationViewAction>
              )}
            </Tooltip>
          )}
          <ConversationViewAction
            command="continue-conversation-in-rail"
            current={conversationCurrent}
            {...auxReuseStaticIconButtonProps}
            title="Continue in side panel"
            aria-label="Continue in side panel"
            invoke={() => useStore.getState().showConversationInRail(id)}
          >
            {shellIconRail}
          </ConversationViewAction>
        </header>
      )}
      <div className="conversation-body">
        <div className="conversation-main">
          <div
            className="conversation-scroll"
            tabIndex={-1}
            ref={(node) => {
              scrolling.scrollRef.current = node;
              if (findReturnRef) findReturnRef.current = node;
            }}
          >
            <div className="conversation-thread" data-find-surface="conversation" ref={scrolling.threadRef}>
              {historyLoading && (
                <output data-block {...auxReuseStaticHintProps}>
                  Loading conversation…
                </output>
              )}
              {historyError && (
                <div {...auxReuseStaticFieldErrorProps}>
                  <p role="alert">Conversation history couldn’t be loaded. Your draft is kept.</p>
                  <ConversationAction
                    command="load-conversation-history"
                    current={() => conversationCurrent() && !!historyError && !historyLoading}
                    disabled={historyLoading}
                    invoke={() => loadTurns(earlier ?? undefined)}
                  >
                    Try again
                  </ConversationAction>
                  <ConversationDetails current={conversationCurrent} text={historyError} />
                </div>
              )}
              {earlier && !historyError && (
                <ConversationAction
                  command="load-conversation-history"
                  current={() => conversationCurrent() && !!earlier && !historyError && !historyLoading}
                  disabled={historyLoading}
                  invoke={() => loadTurns(earlier)}
                >
                  Load earlier messages
                </ConversationAction>
              )}
              {!turns.length && !historyLoading && !historyError && (
                <div className="conversation-empty">
                  <AuxMark />
                  <h1>What would you like to work on?</h1>
                  <p>Ask a question or give Aux a task in the browser.</p>
                </div>
              )}
              {turns.map((run) => (
                <article className="conversation-turn" data-turn-id={run.runId} key={run.runId}>
                  <time
                    dateTime={new Date(run.createdAt).toISOString()}
                    title={new Date(run.createdAt).toLocaleString()}
                  >
                    {new Date(run.createdAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  <div className="user-message">{run.goal}</div>
                  {queuedMessages
                    .filter(
                      (message) =>
                        message.mode === "steer" &&
                        message.targetRunId === run.runId &&
                        message.status === "delivered",
                    )
                    .map((message) => (
                      <div className="conversation-steer" key={message.messageId}>
                        <small>Changed task</small>
                        <div className="user-message">{message.text}</div>
                      </div>
                    ))}
                  <RunPanel
                    savedAnswerIds={generated
                      .filter((item) => item.runId === run.runId && item.automaticReport === true)
                      .map((item) => item.artifactId)}
                    runId={run.runId}
                    conversation
                    readOnly={archived}
                    retryPageId={selectedContext?.pageId}
                    latest={run === last}
                    questionInComposer={run === last && answering}
                    controlsInComposer={run === last}
                    composerRef={textareaRef}
                    sources={sourcesByRun.get(run.runId) ?? NO_SOURCES}
                    onCitationOpen={openCitation}
                  />
                  <RunSources
                    current={sourceCurrent}
                    sources={sourcesByRun.get(run.runId) ?? NO_SOURCES}
                    profileNames={sourceProfileNames}
                    onOpen={(source) => {
                      setSourceDetail(source);
                      setImagePreview(null);
                      setDocumentPreview(null);
                      useStore.setState({ resultPreview: null });
                    }}
                  />
                  {generated.some((item) => item.runId === run.runId) && (
                    <div role="group" className="conversation-results" aria-label="Saved results">
                      {generated
                        .filter((item) => item.runId === run.runId)
                        .map((item) => (
                          <ResultCard
                            key={item.artifactId}
                            compact={item.automaticReport === true}
                            result={item}
                            revision={item.revision ?? artifactVersions[item.artifactId]}
                            onOpen={() => {
                              setSourceDetail(null);
                              setImagePreview(null);
                              setDocumentPreview(null);
                              useStore.setState({ resultPreview: item.artifactId });
                            }}
                          />
                        ))}
                    </div>
                  )}
                  <RunImages runId={run.runId} />
                </article>
              ))}
              {pendingTurns.map((turn) => (
                <article className="conversation-turn pending" key={turn.id} aria-busy="true">
                  <time dateTime={new Date(turn.createdAt).toISOString()}>
                    {new Date(turn.createdAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  <div className="user-message">{turn.goal}</div>
                  <output {...auxReuseStaticHintProps}>Starting…</output>
                </article>
              ))}
            </div>
          </div>
          {scrolling.awayFromLatest && (
            <div className="conversation-jump">
              <ConversationViewAction
                command="jump-conversation-to-latest"
                current={conversationCurrent}
                {...auxReuseStaticIconButtonProps}
                aria-label="Jump to latest"
                title="Jump to latest"
                invoke={scrolling.jumpToLatest}
              >
                {shellIconArrowDown}
              </ConversationViewAction>
            </div>
          )}
          <div className="conversation-compose">
            <div className="conversation-compose-content">
              {closedPage ? (
                <div className="conversation-context-note">
                  <span>
                    {selectedContext
                      ? selectedContext.title || selectedContext.url
                      : "This chat’s page is closed."}
                  </span>
                  {recoverUrl && (
                    <ConversationRecoveryAction
                      command="reopen-conversation-page"
                      current={conversationCurrent}
                      invoke={reopen}
                      disabled={reopening?.owner === conversationCurrent || live || taskBound}
                      title={recoverUrl}
                    >
                      {reopening?.owner === conversationCurrent ? "Opening…" : "Reopen"}
                    </ConversationRecoveryAction>
                  )}
                </div>
              ) : null}
              {archived && (
                <output className="conversation-archive-notice" data-block>
                  <span>This conversation is archived. Your draft is kept.</span>
                  {!taskBound && (
                    <ConversationRecoveryAction
                      command="restore-archived-conversation"
                      current={conversationCurrent}
                      invoke={restoreConversation}
                      disabled={restoring?.owner === conversationCurrent}
                    >
                      {restoring?.owner === conversationCurrent ? "Restoring…" : "Restore to reply"}
                    </ConversationRecoveryAction>
                  )}
                </output>
              )}
              {queued.length > 0 && (
                <section className="composer-queue" aria-label="Queued follow-ups">
                  <header>
                    Up next <span {...auxReuseStaticNumericCountProps}>{queued.length}</span>
                  </header>
                  <ol>
                    {queued.map((message) => (
                      <li key={message.messageId} data-message-id={message.messageId}>
                        <p>{message.text}</p>
                        <div className="queued-message-state">
                          <span role={message.status === "needs_attention" ? "alert" : undefined}>
                            {message.status === "needs_attention"
                              ? message.error || "This follow-up needs attention."
                              : message.status === "delivering"
                                ? "Starting next…"
                                : "Queued next"}
                          </span>
                          {message.status !== "delivering" && (
                            <>
                              <ConversationQueuedControls
                                message={message}
                                current={conversationCurrent}
                                disabled={archived || queueBusy?.owner === conversationCurrent}
                                onCancel={cancelQueued}
                              />
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <ComposerFrame
                notices={
                  <>
                    {last && <RunControls runId={last.runId} />}
                    {answering && (
                      <div className="composer-question" role="status">
                        <strong>Aux needs your answer</strong>
                        <p>{suspension?.request.instruction}</p>
                      </div>
                    )}
                    {last?.status === "needs_input" && !answering && suspension?.kind !== "handoff" && (
                      <div className="composer-question" role="status">
                        <strong>
                          {suspension
                            ? "Decision needed"
                            : suspensionLoaded
                              ? "Current request unavailable"
                              : "Loading current request"}
                        </strong>
                        <p>
                          {suspension
                            ? "Review the approval prompt before Aux continues."
                            : suspensionLoaded
                              ? "Refresh the request before continuing."
                              : "Checking the durable request…"}
                        </p>
                        {suspensionLoaded && !suspension && (
                          <ConversationLiveAction
                            command="reload-conversation-request"
                            current={liveControlCurrent}
                            {...auxReuseSmallButtonProps}
                            invoke={() => setSuspensionRefresh((value) => value + 1)}
                          >
                            Retry loading request
                          </ConversationLiveAction>
                        )}
                      </div>
                    )}
                  </>
                }
              >
                <div className="composer-context">
                  {((selectedContext && selectedContext.url !== "about:blank") ||
                    browserSources.length > 0) && (
                    <button
                      {...auxReuseNativeButtonTypeProps}
                      className="home-context-summary"
                      ref={contextControls.summaryRef}
                      data-command-id="toggle-conversation-context"
                      onClick={contextControls.onSummary}
                    >
                      {shellIconGlobe}
                      <span>
                        {selectedContext?.title || selectedContext?.url || "Selected browser context"}
                        {browserSources.length
                          ? ` · ${browserSources.length} saved ${browserSources.length === 1 ? "source" : "sources"}`
                          : ""}
                      </span>
                    </button>
                  )}
                  <AttachmentTray items={attachmentItems} disabled={contextLocked} busy={attachmentSaving} />
                  {id && turns.length > 0 && (
                    <ConversationContext
                      key={id}
                      chatId={id}
                      revision={`${turns.length}:${last?.status}`}
                      disabled={contextLocked || archived}
                      onBusy={setHistorySaving}
                    />
                  )}
                  {imageTray}
                </div>
                {!connected && (
                  <output {...auxReuseStaticHintProps} data-block>
                    Connecting to Aux… You can keep writing.
                  </output>
                )}
                {sendError && (
                  <div {...auxReuseStaticFieldErrorProps}>
                    <p role="alert">{sendError} Your reply is kept.</p>
                    {sendErrorDetails && (
                      <ConversationDetails current={conversationCurrent} text={sendErrorDetails} />
                    )}
                  </div>
                )}
                {taskBound ? (
                  <>
                    <ConversationTask
                      key={boundTaskId}
                      taskId={boundTaskId!}
                      live={live}
                      disabled={
                        attachmentSaving || historySaving || contextLocked || historyLoading || !!historyError
                      }
                      page={selectedContext}
                      context={contextPage}
                      linkedPageId={linked?.pageId}
                      onContext={setContextPage}
                      onStarted={() => {
                        if (activeChat.current === id) scrolling.jumpToLatest();
                      }}
                    />

                    {contextLoading && (
                      <output {...auxReuseStaticHintProps} data-block>
                        Loading saved context…
                      </output>
                    )}
                    {contextError && (
                      <div {...auxReuseStaticFieldErrorProps}>
                        <p role="alert">Saved context couldn’t be loaded. Your draft is kept.</p>
                        <ConversationAction
                          command="reload-conversation-context"
                          current={() =>
                            conversationCurrent() &&
                            !!contextError &&
                            !contextLoading &&
                            !contextRetryPending.current
                          }
                          disabled={contextLoading}
                          invoke={() => {
                            contextRetryPending.current = true;
                            setContextRefresh((value) => value + 1);
                          }}
                        >
                          Retry
                        </ConversationAction>
                        <ConversationDetails current={conversationCurrent} text={contextError} />
                      </div>
                    )}
                    {answering && (
                      <ComposerInput
                        workspaceId={workspaceContext.workspace?.workspaceId}
                        id={id}
                        answerRunId={answerRunId}
                        answerQuestion={answerQuestion}
                        inputProps={imageInput}
                        maxLength={20000}
                        disabled={archived || sending || answerPending}
                        placeholder="Answer Aux’s question…"
                        sendDisabled={archived || !connected || sending || answerPending}
                        onChange={setText}
                        onSend={() => void send()}
                        textareaRef={textareaRef}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {contextLoading && (
                      <output {...auxReuseStaticHintProps} data-block>
                        Loading saved context…
                      </output>
                    )}
                    {contextError && (
                      <div {...auxReuseStaticFieldErrorProps}>
                        <p role="alert">Saved context couldn’t be loaded. Your draft is kept.</p>
                        <ConversationAction
                          command="reload-conversation-context"
                          current={() =>
                            conversationCurrent() &&
                            !!contextError &&
                            !contextLoading &&
                            !contextRetryPending.current
                          }
                          disabled={contextLoading}
                          invoke={() => {
                            contextRetryPending.current = true;
                            setContextRefresh((value) => value + 1);
                          }}
                        >
                          Retry
                        </ConversationAction>
                        <ConversationDetails current={conversationCurrent} text={contextError} />
                      </div>
                    )}
                    {missingContext && !closedPage && (
                      <output {...auxReuseStaticFieldErrorProps} data-block>
                        The selected tab is unavailable. Choose another browser context before sending.
                      </output>
                    )}
                    {changedBrowserSources.length > 0 && !closedPage && (
                      <output {...auxReuseStaticFieldErrorProps} data-block>
                        A selected tab changed or closed. Update or remove it before sending.
                      </output>
                    )}

                    <ComposerInput
                      workspaceId={workspaceContext.workspace?.workspaceId}
                      id={id}
                      answerRunId={answerRunId}
                      answerQuestion={answerQuestion}
                      inputProps={imageInput}
                      maxLength={live ? 20000 : undefined}
                      disabled={archived || sending || answerPending}
                      placeholder={
                        effectiveLiveMode === "answer" && answering
                          ? "Answer Aux’s question…"
                          : live
                            ? effectiveLiveMode === "queue"
                              ? "Send when Aux finishes…"
                              : "Correct Aux while it works…"
                            : turns.length
                              ? "Reply, or give Aux a task…"
                              : selectedContext && selectedContext.url !== "about:blank"
                                ? "Ask about this page…"
                                : home
                                  ? "Ask Aux…"
                                  : "Ask Aux a question or give it a task…"
                      }
                      sendDisabled={
                        archived ||
                        !connected ||
                        sending ||
                        answerPending ||
                        (!answering &&
                          (attachmentSaving ||
                            historySaving ||
                            (!live && (missingContext || changedBrowserSources.length > 0)) ||
                            historyLoading ||
                            !!historyError ||
                            contextLoading ||
                            !!contextError))
                      }
                      onChange={setText}
                      onSend={() => void send()}
                      footer={composerFooter}
                      modes={composerModes}
                      textareaRef={textareaRef}
                    >
                      {home ? null : dictation}
                    </ComposerInput>
                  </>
                )}
              </ComposerFrame>
            </div>
          </div>
        </div>
        {supporting && (
          <SupportingContent
            key={imagePreview ? `${supportingKey}:${imagePreviewGeneration}` : supportingKey}
            container={conversationRoot}
            current={supportingCurrent}
            viewer={!!(resultPreview || documentPreview || imagePreview)}
            title={
              supportingKey === "browser"
                ? "Browser preview"
                : sourceDetail && supportingKey === sourceDetail.sourceId
                  ? "Source details"
                  : "Result details"
            }
            initiallyExpanded={supportingKey !== "browser"}
            onClose={closeSupporting}
          >
            {supporting}
          </SupportingContent>
        )}
      </div>
      {calendarSourceChoice && (
        <CalendarSourceChoiceDialog
          choice={calendarSourceChoice}
          returnFocus={calendarChoiceOpener}
          initialFocus={calendarChoiceCancel}
          onClose={() => setCalendarSourceChoice(null)}
          onChoose={(profile) => void openCalendarSourceInProfile(profile)}
          cancelControl={
            <ConversationSourceAction
              command="cancel-conversation-source-profile"
              current={currentCalendarChoice}
              controlRef={calendarChoiceCancel}
              {...auxReuseStaticIconButtonProps}
              aria-label="Cancel"
              invoke={() => setCalendarSourceChoice(null)}
            >
              {shellIconClose}
            </ConversationSourceAction>
          }
          profileControl={(profile) => (
            <ConversationSourceAction
              key={profile.id}
              command="choose-conversation-source-profile"
              current={currentCalendarChoice}
              {...auxReuseSmallButtonProps}
              invoke={() => openCalendarSourceInProfile(profile)}
            >
              {profile.name}
              {profile.current ? " · current" : ""}
            </ConversationSourceAction>
          )}
        />
      )}
    </section>
  );
}
