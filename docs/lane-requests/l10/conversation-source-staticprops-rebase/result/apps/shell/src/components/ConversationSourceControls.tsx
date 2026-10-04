import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ButtonHTMLAttributes, type RefObject, type ReactNode, type SyntheticEvent } from "react";
import type { ConversationSource } from "@aux/contracts";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { executeCommand } from "../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";
import { SourceRow } from "./SourceRow";

type SourceCommand = "toggle-conversation-sources" | "select-conversation-source" | "open-conversation-recorded-source" | "choose-conversation-source-profile" | "cancel-conversation-source-profile";
/** A source is recorded provenance; this owner never synthesizes a live document or Profile. */
export function useConversationSourcesOwner(current: () => boolean, sources: ConversationSource[]) {
  const snapshot = JSON.stringify(sources);
  const identity = useMemo(() => ({ current, snapshot, records: new Set((JSON.parse(snapshot) as ConversationSource[]).map(value => JSON.stringify(value))) }), [current, snapshot]);
  const committed = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => { const original = { active: true, identity }; committed.current = original; return () => { original.active = false; }; }, [identity]);
  return useCallback((source?: ConversationSource) => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    if (current() && (!source || identity.records.has(JSON.stringify(source)))) return true;
    original.active = false; return false;
  }, [identity, current]);
}
function useSourceControl(command: SourceCommand, current: () => boolean, invoke: (element: HTMLElement, event?: Event) => unknown) {
  const scopeId = useId();
  const [ref] = usePreferenceCommand<HTMLElement>(command, scopeId, (element, event) => {
    if (!current()) return guardCommandCompletion(Promise.reject(new Error("Choose the original recorded conversation source.")), current);
    return invoke(element, event);
  });
  const run = (event: SyntheticEvent<HTMLElement>) => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch(reason => reportCommandCompletionFailure(completion, reason, error => { if (current()) errToast(error); }));
  };
  return [ref, run] as const;
}
export function ConversationSourceAction({ command, current, invoke, controlRef, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: SourceCommand; current(): boolean; invoke(): unknown; controlRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [ref, run] = useSourceControl(command, current, invoke);
  const originalRef = useCallback((node: HTMLButtonElement | null) => { ref(node); if (controlRef) controlRef.current = node; }, [ref, controlRef]);
  return <button {...props} type="button" ref={originalRef} data-command-id={command} onClick={run}/>;
}
export function ConversationSourceRow({ command, current, invoke, source, profileNames }: {
  command: "select-conversation-source" | "open-conversation-recorded-source"; current(): boolean; invoke(): unknown; source: ConversationSource; profileNames: Record<string, string>;
}) {
  const [ref, run] = useSourceControl(command, current, invoke);
  return <SourceRow source={source} profileNames={profileNames} openRef={ref} onOpen={event => { if (event) run(event); }}/>;
}
export function ConversationSourcesSummary({ current, children }: { current(): boolean; children: ReactNode }) {
  const [ref, run] = useSourceControl("toggle-conversation-sources", current, (summary, event) => {
    const details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.firstElementChild !== summary) throw new Error("Choose the original Sources disclosure.");
    event?.preventDefault(); details.open = !details.open;
  });
  return <summary ref={ref} data-command-id="toggle-conversation-sources" onClick={run}>{children}</summary>;
}
