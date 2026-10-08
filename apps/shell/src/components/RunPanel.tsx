import { conversationReply } from "@aux/contracts";
import { orderedPages } from "../store/pages";
import { staticSmallIconButtonProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { RunPanelAction, RunPanelDisclosure } from "./RunPanelAction";
import { bridge } from "../bridge";
import { RunControls } from "./RunControls";
import type { ConversationSource } from "@aux/contracts";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useShallow } from "zustand/react/shallow";
import type { CompactObservation, Run, StepRecord } from "@aux/contracts";
import { decodeBase64Json, isLive, useStore, call } from "../store";
import { hostOf } from "../workspace";
import { ObservationPanel } from "./ObservationPanel";
import { StepTimeline, fmtMs } from "./StepTimeline";
import {
  shellIconAlert,
  shellIconCheck,
  shellIconCopy,
  shellIconGearSm,
  shellIconLayersSm,
  shellIconLock,
  shellIconReload,
  shellIconRight,
} from "../ui/icons";
import { openSavedTask } from "../task-navigation";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { RunTranscriptDetails } from "../transcript/RunTranscriptDetails";

import { STATUS_LABEL } from "../run-status";
import {
  staticSpacerProps as auxClassSpacerProps,
  staticNumericCountProps as auxClassNumericCountProps,
} from "../ui/class-props";
import {
  nativePoliteLiveProps,
  nativeStatusRoleProps,
  nativeAlertRoleProps,
} from "../ui/native-attribute-props";

/** Ticks on its own so a live run's clock never re-renders the whole panel. */
function Elapsed({ run }: { run: Run }) {
  const live = isLive(run);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [live]);
  const elapsed = Math.max(0, (run.endedAt ?? Date.now()) - (run.startedAt ?? run.createdAt));
  return (
    <span className="run-time" title="Elapsed">
      {fmtElapsed(elapsed)}
    </span>
  );
}

/** Whether `runId` is its conversation's newest turn. */
export function isLatestTurn(runs: readonly Run[], runId: string): boolean {
  const target = runs.find((item) => item.runId === runId);
  if (!target) return false;
  const chatId = target.config?.chatId ?? target.runId;
  let latest: Run | undefined;
  for (const item of runs) {
    if ((item.config?.chatId ?? item.runId) !== chatId) continue;
    if (
      !latest ||
      item.createdAt > latest.createdAt ||
      (item.createdAt === latest.createdAt && item.runId > latest.runId)
    )
      latest = item;
  }
  return latest?.runId === runId;
}

/** Display-only source resolution; retry still requires runtime authority. */
function retrySourceIds(run: Run): string[] | null {
  const refs = run.config?.contextPageRefs ?? [];
  const copies = run.config?.isolatedPageSources;
  let ids = run.pageIds;
  if (copies?.length) {
    const matches = run.pageIds.map((id) => copies.filter((copy) => copy.pageId === id));
    if (copies.length !== ids.length || matches.some((rows) => rows.length !== 1)) return null;
    ids = matches.map((rows) => rows[0]!.sourcePageId);
    if (
      new Set(ids).size !== ids.length ||
      refs.length !== ids.length ||
      matches.some((rows) => {
        const copy = rows[0]!;
        const sourceRefs = refs.filter((ref) => ref.pageId === copy.sourcePageId);
        return sourceRefs.length !== 1 || sourceRefs[0]!.url !== copy.url;
      })
    )
      return null;
  }
  return refs.some((ref) => !ids.includes(ref.pageId)) ? null : ids;
}

function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

function fmtCost(usd: number, estimated: boolean): string {
  if (!usd) return "";
  return `${estimated ? "≈" : ""}$${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)}`;
}

function ResultValue({ value }: { value: unknown }) {
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((item, i) => (
          <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>
        ))}
      </ul>
    );
  if (typeof value === "object" && value !== null) return <pre>{JSON.stringify(value, null, 2)}</pre>;
  if (typeof value === "string") return <AnswerMarkdown text={value} />;
  return String(value);
}

function ResultFields({ result, labeled }: { result: Record<string, unknown>; labeled: boolean }) {
  return (
    <div className="answer-result">
      {Object.entries(result).map(([key, value]) => (
        <div key={key} className="answer-row">
          {labeled && <div className="answer-key">{key.replace(/_/g, " ")}</div>}
          <div className="answer-value">
            <ResultValue value={value} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Final answer as prose — no status chrome, copy is an icon. */
function Answer({
  run,
  conversation = false,
  retry = null,
  stream,
  onCitationOpen,
  sources,
}: {
  sources?: ConversationSource[];
  run: Run;
  conversation?: boolean;
  retry?: ReactNode;
  stream?: string;
  onCitationOpen?: (url: string, background: boolean, runId: string) => boolean;
}) {
  const plainAnswer =
    run.result && Object.keys(run.result).length === 1 && typeof run.result.answer === "string"
      ? run.result.answer
      : null;
  const result = useMemo(
    () =>
      run.status === "completed" &&
      run.config?.implementation === "agent-loop" &&
      typeof run.result?.textProposal === "string"
        ? Object.fromEntries(Object.entries(run.result).filter(([key]) => key !== "textProposal"))
        : run.result,
    [run.result, run.status, run.config?.implementation],
  );
  const showSummary =
    !!run.statusMessage &&
    run.statusMessage !== run.error &&
    (!run.failure || !!run.result) &&
    !(run.status === "completed" && plainAnswer?.trim());
  const reply = conversation ? conversationReply(run) : null;
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => {
    const parts: string[] = [];
    if (showSummary) parts.push(run.statusMessage!);
    if (result)
      for (const [k, v] of Object.entries(result))
        parts.push(
          plainAnswer !== null ? plainAnswer : `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
        );
    if (run.error && !run.failure) parts.push(`Error: ${run.error}`);
    return parts.join("\n");
  }, [run, result, plainAnswer, showSummary]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copy = (current: () => boolean) =>
    navigator.clipboard.writeText(conversation && reply ? reply : text).then(() => {
      if (current()) setCopied(true);
    });
  // Streamed text is plain until the run settles; markdown parses once, at the end.
  if (isLive(run) && !run.error)
    return stream ? (
      <section className="answer" {...nativePoliteLiveProps} aria-busy="true">
        <p className="answer-text answer-stream">{stream}</p>
      </section>
    ) : null;
  if (conversation) {
    if (!reply && !retry && !(run.error && !run.failure)) return null;
    return (
      <section className="answer">
        {reply && (
          <div data-find-part="reply">
            <AnswerMarkdown
              text={reply}
              sources={sources}
              onOpenLink={
                onCitationOpen ? (url, background) => onCitationOpen(url, background, run.runId) : undefined
              }
            />
          </div>
        )}
        {(reply || retry) && (
          <span className="answer-tools">
            {reply && (
              <RunPanelAction
                command="copy-run-answer"
                run={run}
                className="icon-btn xs answer-copy"
                title={copied ? "Copied" : "Copy"}
                aria-label={copied ? "Copied" : "Copy answer"}
                invoke={copy}
              >
                {copied ? shellIconCheck : shellIconCopy}
              </RunPanelAction>
            )}
            {retry}
          </span>
        )}
        {run.error && !run.failure && (
          <p className="answer-text err" data-find-part="error">
            {run.error}
          </p>
        )}
      </section>
    );
  }
  if (!run.statusMessage && !run.result && !run.error) return null;
  return (
    <section className="answer">
      {text && (
        <RunPanelAction
          command="copy-run-answer"
          run={run}
          className="icon-btn xs answer-copy"
          title={copied ? "Copied" : "Copy"}
          aria-label={copied ? "Copied" : "Copy answer"}
          invoke={copy}
        >
          {copied ? shellIconCheck : shellIconCopy}
        </RunPanelAction>
      )}
      {showSummary && <AnswerMarkdown text={run.statusMessage!} />}
      {plainAnswer !== null && <AnswerMarkdown text={plainAnswer} />}
      {plainAnswer === null && result && Object.keys(result).length > 0 && (
        <RunPanelDisclosure
          command="toggle-run-result-details"
          run={run}
          className="answer-details"
          open={!run.statusMessage}
          summary="Result details"
        >
          <ResultFields result={result} labeled />
        </RunPanelDisclosure>
      )}
      {run.error && !run.failure && (
        <p className="answer-text err" data-find-part="error">
          {run.error}
        </p>
      )}
    </section>
  );
}

/** `latest` lets a conversation that already ordered its turns skip the per-panel scan. */
export const RunPanel = memo(function RunPanel({
  savedAnswerIds,
  runId,
  conversation = false,
  readOnly = false,
  retryPageId,
  latest,
  onCitationOpen,
  sources,
  suspensionInComposer = false,
  controlsInComposer = false,
  composerRef,
}: {
  savedAnswerIds?: readonly string[];
  controlsInComposer?: boolean;
  suspensionInComposer?: boolean;
  sources?: ConversationSource[];
  runId: string;
  conversation?: boolean;
  readOnly?: boolean;
  retryPageId?: string;
  latest?: boolean;
  onCitationOpen?: (url: string, background: boolean, runId: string) => boolean;
  composerRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const run = useStore((s) => s.runs.find((r) => r.runId === runId));
  const latestConversationTurn = useStore((s) => latest ?? isLatestTurn(s.runs, runId));
  const stream = useStore((s) => s.answerStreams[runId]);
  const steps = useStore((s) => s.steps[runId]);
  const stats = useStore((s) => s.modelStats[runId]);
  const obs = useStore((s) => s.observations[runId]);
  const prompt = useStore((s) => s.prompt);
  // Include retained original sources for retry availability, not authority.
  const retryIds = run ? retrySourceIds(run) : [];
  const runPages = useStore(
    useShallow((s) =>
      orderedPages(s.pages).filter(
        (p) =>
          (run?.pageIds ?? []).includes(p.pageId) || retryIds?.includes(p.pageId) || p.pageId === retryPageId,
      ),
    ),
  );
  const activePageId = useStore((s) => s.activePageId);
  const loadRun = useStore((s) => s.loadRun);
  const startRun = useStore((s) => s.startRun);
  const retryRun = useStore((s) => s.retryRun);
  const retrying = useStore((s) => !!s.retryingRuns[runId]);
  const activate = useStore((s) => s.activate);
  const [showObs, setShowObs] = useState(false);
  const [obsLoading, setObsLoading] = useState(false);
  const [obsError, setObsError] = useState("");
  const [inspectedArtifact, setInspectedArtifact] = useState<string | null>(null);
  const observationRequest = useRef(0);
  const [showSteps, setShowSteps] = useState(() => {
    const current = useStore.getState().runs.find((item) => item.runId === runId);
    return !conversation && !!current && isLive(current);
  });

  useEffect(() => {
    setShowObs(false);
    setObsLoading(false);
    setObsError("");
    setInspectedArtifact(null);
    const r = useStore.getState().runs.find((x) => x.runId === runId);
    setShowSteps(!conversation && !!r && isLive(r));
    if (!steps) void loadRun(runId);
    return () => {
      ++observationRequest.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  const inspectRef = useRef<(artifactId: string, current: () => boolean) => Promise<unknown>>(async () => {});
  const onInspect = useCallback(
    (artifactId: string, _step: StepRecord, current: () => boolean) =>
      inspectRef.current(artifactId, current),
    [],
  );

  if (!run) return <div className="rail-empty">This run is no longer available.</div>;

  const live = isLive(run);
  const originalPages = run.pageIds.map((id) => runPages.find((p) => p.pageId === id));
  const usable = (item?: (typeof runPages)[number]) =>
    !!item && !["crashed", "detached"].includes(item.viewStatus ?? "");
  const page = usable(originalPages[0]) ? originalPages[0] : undefined;
  const retryAvailable =
    retryIds !== null &&
    retryIds.every((id) => {
      const source = runPages.find((item) => item.pageId === id);
      if (!usable(source)) return false;
      const ref = run.config?.contextPageRefs?.find((item) => item.pageId === id);
      return (
        !ref ||
        (!source!.ownedByRuntime &&
          source!.url === ref.url &&
          source!.documentEpoch === ref.documentEpoch &&
          source!.sessionId === ref.sessionId)
      );
    });
  const multiTabBlocked = run.pageIds.length > 1 && !retryAvailable;
  const retryPage =
    !retryAvailable && !multiTabBlocked && run.pageIds.length === 1
      ? runPages.find((item) => item.pageId === retryPageId && usable(item))
      : undefined;
  const humanHolds = runPages.some(
    (page) => run.pageIds.includes(page.pageId) && page.controller === "human",
  );
  const asksMe = prompt?.runId === run.runId || run.status === "needs_input";
  const question = prompt?.runId === run.runId ? prompt.question : run.statusMessage;
  const calls = stats?.calls ?? run.config?.modelCalls;
  const openModelSettings = () =>
    useStore.setState({ overlay: "settings", settingsCategory: "Models", railOpen: true });

  const observationArtifact = [...(steps ?? [])]
    .reverse()
    .map((step) => (step.inputs as { obsArtifactId?: string } | undefined)?.obsArtifactId)
    .find(Boolean);
  const inspect = async (artifactId: string, current: () => boolean = () => true) => {
    const version = ++observationRequest.current;
    setInspectedArtifact(artifactId);
    setShowObs(true);
    setObsLoading(true);
    setObsError("");
    try {
      const res = await call("artifacts.read", { artifactId });
      if (version !== observationRequest.current || !current()) return res;
      const o = decodeBase64Json<CompactObservation>(res.dataBase64);
      if (!o || typeof o.text !== "string" || !Array.isArray(o.refs))
        throw new Error("The saved page snapshot could not be read.");
      useStore.setState((s) => ({ observations: { ...s.observations, [runId]: o } }));
      setShowObs(true);
      return res;
    } catch (e) {
      if (version === observationRequest.current && current()) setObsError(errorMessage(e));
      throw e;
    } finally {
      if (version === observationRequest.current && current()) setObsLoading(false);
    }
  };
  inspectRef.current = inspect;

  return (
    <div className="run-panel" data-testid="run-panel">
      <div className="run-goal">
        <h2>{run.goal}</h2>
      </div>

      {!(conversation && !live && run.status === "completed") && (
        <div className="run-status nums">
          {(!conversation ||
            !["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) && (
            <span className={`run-state ${run.status}`}>{STATUS_LABEL[run.status]}</span>
          )}
          {page && page.url !== "about:blank" && page.pageId !== activePageId && (
            <RunPanelAction
              command="activate-run-page"
              run={run}
              className="run-host"
              invoke={() => activate(page.pageId)}
              title={page.url}
            >
              {hostOf(page.url)}
              {run.pageIds.length > 1 ? ` +${run.pageIds.length - 1}` : ""}
            </RunPanelAction>
          )}
          <span {...auxClassSpacerProps} />
          <span className="run-acts">
            {!live &&
              (run.config?.taskId ? (
                <RunPanelAction
                  command="open-run-task"
                  run={run}
                  {...staticSmallIconButtonProps}
                  title="Open saved task"
                  aria-label="Open saved task"
                  invoke={() => openSavedTask(run.config!.taskId!)}
                >
                  {shellIconLayersSm}
                </RunPanelAction>
              ) : !conversation && !run.failure ? (
                <RunPanelAction
                  command="repeat-run"
                  run={run}
                  {...staticSmallIconButtonProps}
                  title="Run again"
                  aria-label="Run again"
                  invoke={() => startRun(run.goal, { pageId: run.pageIds[0] ?? null })}
                >
                  {shellIconReload}
                </RunPanelAction>
              ) : null)}
          </span>
        </div>
      )}
      {!live &&
        latestConversationTurn &&
        !run.config?.taskId &&
        !retryAvailable &&
        retryPage &&
        (!run.failure || run.failure.retryable) && (
          <section className="run-failure" {...nativeStatusRoleProps}>
            <div className="run-failure-copy">
              <strong>The original tab is unavailable</strong>
              <p>
                Retry using {retryPage.title || retryPage.url}. The saved request and context stay the same;
                the browser page changes.
              </p>
            </div>
            <RunPanelAction
              command="retry-run-selected-tab"
              run={run}
              {...smallButtonProps}
              disabled={readOnly || retrying}
              invoke={() => retryRun(run.runId, retryPage.pageId)}
            >
              {retrying ? "Retrying…" : "Retry in selected tab"}
            </RunPanelAction>
          </section>
        )}
      {!live && latestConversationTurn && !run.config?.taskId && multiTabBlocked && (
        <section className="run-failure" {...nativeStatusRoleProps}>
          <div className="run-failure-copy">
            <strong>Original tabs are missing</strong>
            <p>
              This turn used {run.pageIds.length} tabs. Restore those tabs before retrying. Aux will not retry
              a subset.
            </p>
          </div>
        </section>
      )}
      {!controlsInComposer && <RunControls runId={runId} compact />}

      {live && run.statusMessage && !asksMe && !conversation && (
        <p className="run-msg">{run.statusMessage}</p>
      )}

      <Answer
        run={run}
        sources={sources}
        conversation={conversation}
        stream={stream}
        onCitationOpen={onCitationOpen}
        retry={
          conversation && !live && latestConversationTurn && !run.failure && !run.config?.taskId ? (
            <RunPanelAction
              command="retry-run-turn"
              run={run}
              {...staticSmallIconButtonProps}
              title={retrying ? "Retrying…" : "Retry this turn"}
              aria-label={retrying ? "Retrying turn" : "Retry this turn"}
              disabled={readOnly || !retryAvailable || retrying || multiTabBlocked}
              invoke={() => retryRun(run.runId)}
            >
              {shellIconReload}
            </RunPanelAction>
          ) : null
        }
      />
      <RunTranscriptDetails
        savedAnswerIds={savedAnswerIds}
        run={run}
        question={question}
        readOnly={readOnly}
        suspensionInComposer={suspensionInComposer}
      />

      {(calls != null || stats || !conversation) && (
        <RunPanelDisclosure
          command="toggle-run-details"
          run={run}
          className="run-provenance"
          summary="Run details"
        >
          <div>
            <Elapsed run={run} />
            {calls != null && (
              <span>
                {calls} {calls === 1 ? "model call" : "model calls"}
              </span>
            )}
          </div>
          {stats && (
            <>
              <p>{[stats.providers.join(", "), stats.modelIds.join(", ")].filter(Boolean).join(" · ")}</p>
              <div>
                <span>
                  {stats.destinations.length
                    ? `Destination ${stats.destinations.join(", ")}`
                    : "Provider destination was not recorded"}
                </span>
                <span>
                  {stats.inputTokens.toLocaleString()} input · {stats.outputTokens.toLocaleString()} output
                  tokens
                </span>
                <span>
                  {stats.costComplete
                    ? `${fmtCost(stats.costUsd, false) || "$0.00"} recorded cost`
                    : `${fmtCost(stats.costUsd, true) || "$0 known"} · provider cost incomplete`}
                </span>
              </div>
            </>
          )}
        </RunPanelDisclosure>
      )}

      {run.failure && (
        <section className="run-failure" {...nativeStatusRoleProps}>
          <span className="run-failure-icon">{shellIconAlert}</span>
          <div className="run-failure-copy">
            <strong>
              {run.failure.action === "model_settings"
                ? "Connection needs attention"
                : run.failure.action === "permission_settings"
                  ? "Permission needed"
                  : "This turn stopped"}
            </strong>
            <p data-find-part="error">{run.failure.message}</p>
          </div>
          {latestConversationTurn &&
            !run.config?.taskId &&
            ["retry", "permission_settings"].includes(run.failure.action) &&
            retryAvailable && (
              <RunPanelAction
                command="retry-run-turn"
                run={run}
                {...smallButtonProps}
                disabled={readOnly || retrying}
                invoke={() => retryRun(run.runId)}
              >
                {shellIconReload}
                {retrying ? "Retrying…" : "Retry turn"}
              </RunPanelAction>
            )}
          {run.failure.action === "edit_request" && latestConversationTurn && (
            <RunPanelAction
              command="revise-run-request"
              run={run}
              {...smallButtonProps}
              disabled={readOnly}
              invoke={(current) => {
                if (run.config?.taskId) {
                  return openSavedTask(run.config.taskId);
                }
                const chatId = run.config?.chatId ?? run.runId;
                const state = useStore.getState();
                if (!state.conversationDrafts[`chat:${chatId}`]?.trim())
                  state.setConversationDraft(chatId, run.goal);
                state.openConversation(run.runId);
                requestAnimationFrame(() => {
                  if (current()) composerRef?.current?.focus();
                });
              }}
            >
              {run.config?.taskId ? "Edit task" : "Revise request"}
            </RunPanelAction>
          )}
          {run.failure.action === "permission_settings" && (
            <RunPanelAction
              command="review-run-permissions"
              run={run}
              {...smallButtonProps}
              invoke={() => {
                useStore.setState({ settingsCategory: "Permissions" });
                useStore.getState().setOverlay("settings");
              }}
            >
              {shellIconLock}Review permissions
            </RunPanelAction>
          )}
          {run.failure.action === "permission_settings" && run.config?.taskId && (
            <RunPanelAction
              command="open-run-task"
              run={run}
              {...smallButtonProps}
              invoke={() => openSavedTask(run.config!.taskId!)}
            >
              Open task
            </RunPanelAction>
          )}
          {/vault|credential grant|opaque reference|Unlock the agent vault/i.test(run.failure.message) && (
            <RunPanelAction
              command="open-run-vault"
              run={run}
              {...smallButtonProps}
              invoke={() => {
                useStore.setState({ settingsCategory: "Vault" });
                useStore.getState().setOverlay("settings");
              }}
            >
              {shellIconLock}Open vault
            </RunPanelAction>
          )}
          {run.failure.action === "model_settings" && (
            <RunPanelAction
              command="open-run-model-settings"
              run={run}
              {...smallButtonProps}
              invoke={openModelSettings}
            >
              {shellIconGearSm}Model settings
            </RunPanelAction>
          )}
        </section>
      )}

      {(!conversation || (steps?.length ?? 0) > 0) && (
        <section className="run-section">
          <RunPanelAction
            command="toggle-run-steps"
            run={run}
            className="run-section-head toggle"
            aria-expanded={showSteps}
            invoke={() => setShowSteps((v) => !v)}
          >
            <span className={`chev ${showSteps ? "open" : ""}`}>{shellIconRight}</span>
            <span>{conversation ? "Work history" : "Steps"}</span>
            <span {...auxClassNumericCountProps}>{steps?.length ?? 0}</span>
            {steps && steps.length > 0 && (
              <span className="sum nums">
                {fmtMs(steps.reduce((a, s) => a + (s.outcome?.durationMs ?? 0), 0))}
              </span>
            )}
          </RunPanelAction>
          {showSteps && (!!steps?.length || live) && (
            <StepTimeline
              run={run}
              windowId={bridge.windowId}
              privateMode={bridge.privateMode}
              windowKind={bridge.windowKind}
              compact
              steps={steps ?? []}
              live={live && !humanHolds && run.status !== "paused"}
              onInspect={onInspect}
            />
          )}
        </section>
      )}

      {(obs || observationArtifact) && (!conversation || showSteps) && (
        <section className="run-section">
          <RunPanelAction
            command="toggle-run-page"
            run={run}
            className="run-section-head toggle"
            aria-expanded={showObs}
            invoke={(current) => {
              if (!showObs && !obs && observationArtifact) return inspect(observationArtifact, current);
              else setShowObs((value) => !value);
            }}
          >
            <span className={`chev ${showObs ? "open" : ""}`}>{shellIconRight}</span>
            <span>Page</span>
            {obs && <span {...auxClassNumericCountProps}>{obs.refs.length}</span>}
          </RunPanelAction>
          {showObs &&
            (obsLoading ? (
              <output {...staticHintProps} data-block>
                Loading saved page…
              </output>
            ) : obsError ? (
              <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
                {obsError}{" "}
                {(inspectedArtifact || observationArtifact) && (
                  <RunPanelAction
                    command="retry-run-page-observation"
                    run={run}
                    {...smallButtonProps}
                    invoke={(current) => inspect((inspectedArtifact || observationArtifact)!, current)}
                  >
                    Retry
                  </RunPanelAction>
                )}
              </p>
            ) : obs ? (
              <ObservationPanel compact obs={obs} />
            ) : null)}
        </section>
      )}
    </div>
  );
});
