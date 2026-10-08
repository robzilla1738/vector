import { memo, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { ConversationSource, ConversationArtifact, Run, RunMessage } from "@aux/contracts";
import { isLive } from "../store";
import { RunPanel } from "./RunPanel";
import { RunImages } from "./RunImages";
import { ResultCard } from "./ResultCard";
import { CodingRunActivity } from "../features/coding/CodingRunActivity";
import { ConversationSourcesSummary, ConversationSourceRow } from "./ConversationSourceControls";
import { shellIconGlobe } from "../ui/icons";
import { staticNumericCountProps as auxReuseStaticNumericCountProps } from "../ui/class-props";

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

type Props = {
  run: Run;
  latest: boolean;
  archived: boolean;
  connected: boolean;
  branching: boolean;
  branchTurn(run: Run, mode: "branch" | "edit"): Promise<void>;
  queuedMessages: RunMessage[];
  generated: ConversationArtifact[];
  artifactVersions: Record<string, number>;
  retryPageId?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  sources: ConversationSource[];
  profileNames: Record<string, string>;
  sourceCurrent(source?: ConversationSource): boolean;
  openCitation(url: string, background: boolean, runId: string): boolean;
  onSource(source: ConversationSource): void;
  onResult(artifactId: string): void;
  visible: boolean;
  height?: number;
};
export const ConversationTurn = memo(function ConversationTurn({
  run,
  latest,
  archived,
  connected,
  branching,
  branchTurn,
  queuedMessages,
  generated,
  artifactVersions,
  retryPageId,
  textareaRef,
  sources,
  profileNames,
  sourceCurrent,
  openCitation,
  onSource,
  onResult,
  visible,
  height,
}: Props) {
  const article = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState(false);
  const focusOnOpen = useRef(false);
  const mounted = visible || opened;
  useLayoutEffect(() => {
    if (focusOnOpen.current && mounted) {
      focusOnOpen.current = false;
      article.current?.focus({ preventScroll: true });
    }
  }, [mounted]);
  return (
    <article
      ref={article}
      className="conversation-turn"
      data-turn-id={run.runId}
      data-turn-mounted={mounted}
      tabIndex={-1}
      style={mounted ? undefined : { height: height ?? 320, overflow: "hidden" }}
    >
      {mounted ? (
        <>
          <time
            dateTime={new Date(run.createdAt).toISOString()}
            title={new Date(run.createdAt).toLocaleString()}
          >
            {new Date(run.createdAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          <div className="user-message" data-find-part="goal">
            {run.goal}
          </div>
          {run.status === "completed" &&
            !archived &&
            !run.setId &&
            !run.config?.subagentProfile &&
            !run.config?.setMemberSource && (
              <div role="group" aria-label="Historical turn actions" className="conversation-turn-actions">
                <button
                  type="button"
                  disabled={!connected || branching}
                  onClick={() => void branchTurn(run, "branch")}
                >
                  Branch from here
                </button>
                <button
                  type="button"
                  disabled={!connected || branching}
                  onClick={() => void branchTurn(run, "edit")}
                >
                  Edit into new draft
                </button>
              </div>
            )}

          {queuedMessages
            .filter(
              (message) =>
                message.mode === "steer" &&
                message.targetRunId === run.runId &&
                message.status === "delivered",
            )
            .map((message) => (
              <div
                className="conversation-steer"
                data-find-part={`steer:${message.messageId}`}
                key={message.messageId}
              >
                <small>Changed task</small>
                <div className="user-message">{message.text}</div>
              </div>
            ))}
          <div>
            <RunPanel
              savedAnswerIds={generated
                .filter((item) => item.runId === run.runId && item.automaticReport === true)
                .map((item) => item.artifactId)}
              runId={run.runId}
              conversation
              readOnly={archived}
              retryPageId={retryPageId}
              latest={latest}
              suspensionInComposer={latest && run.status === "needs_input"}
              controlsInComposer={latest}
              composerRef={textareaRef}
              sources={sources}
              onCitationOpen={openCitation}
            />
          </div>
          <RunSources
            current={sourceCurrent}
            sources={sources}
            profileNames={profileNames}
            onOpen={(source) => {
              onSource(source);
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
                      onResult(item.artifactId);
                    }}
                  />
                ))}
            </div>
          )}
          {run.config?.projectRoot && <CodingRunActivity runId={run.runId} live={isLive(run)} />}
          <RunImages runId={run.runId} />
        </>
      ) : (
        <button
          type="button"
          className="conversation-turn-placeholder"
          onClick={() => {
            focusOnOpen.current = true;
            setOpened(true);
          }}
        >
          Show message · {run.goal.slice(0, 120)}
        </button>
      )}
    </article>
  );
});
