import { useCallback, useMemo, type ButtonHTMLAttributes, type RefObject, type ReactNode } from "react";
import type { ConversationSource } from "@aux/contracts";
import {
  useCommittedConversationOwner,
  useCurrentConversationCommand,
} from "./conversation-control-construction";
import { errToast } from "../store";
import { SourceRow } from "./SourceRow";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

type SourceCommand =
  | "toggle-conversation-sources"
  | "select-conversation-source"
  | "open-conversation-recorded-source"
  | "choose-conversation-source-profile"
  | "cancel-conversation-source-profile";
/** A source is recorded provenance; this owner never synthesizes a live document or Profile. */
export function useConversationSourcesOwner(current: () => boolean, sources: ConversationSource[]) {
  const snapshot = JSON.stringify(sources);
  const identity = useMemo(
    () => ({
      current,
      snapshot,
      records: new Set((JSON.parse(snapshot) as ConversationSource[]).map((value) => JSON.stringify(value))),
    }),
    [current, snapshot],
  );
  return useCommittedConversationOwner(
    identity,
    (source?: ConversationSource) => {
      return current() && (!source || identity.records.has(JSON.stringify(source)));
    },
    [identity, current],
  );
}
function useSourceControl(
  command: SourceCommand,
  current: () => boolean,
  invoke: (element: HTMLElement, event?: Event) => unknown,
) {
  return useCurrentConversationCommand<HTMLElement>(
    command,
    current,
    invoke,
    "Choose the original recorded conversation source.",
    true,
    (error) => {
      if (current()) errToast(error);
    },
  );
}
export function ConversationSourceAction({
  command,
  current,
  invoke,
  controlRef,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: SourceCommand;
  current(): boolean;
  invoke(): unknown;
  controlRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [ref, run] = useSourceControl(command, current, invoke);
  const originalRef = useCallback(
    (node: HTMLButtonElement | null) => {
      ref(node);
      if (controlRef) controlRef.current = node;
    },
    [ref, controlRef],
  );
  return (
    <button
      {...props}
      {...auxNativeButtonTypeProps}
      ref={originalRef}
      data-command-id={command}
      onClick={run}
    />
  );
}
export function ConversationSourceRow({
  command,
  current,
  invoke,
  source,
  profileNames,
}: {
  command: "select-conversation-source" | "open-conversation-recorded-source";
  current(): boolean;
  invoke(): unknown;
  source: ConversationSource;
  profileNames: Record<string, string>;
}) {
  const [ref, run] = useSourceControl(command, current, invoke);
  return (
    <SourceRow
      source={source}
      profileNames={profileNames}
      openRef={ref}
      onOpen={(event) => {
        if (event) run(event);
      }}
    />
  );
}
export function ConversationSourcesSummary({
  current,
  children,
}: {
  current(): boolean;
  children: ReactNode;
}) {
  const [ref, run] = useSourceControl("toggle-conversation-sources", current, (summary, event) => {
    const details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.firstElementChild !== summary)
      throw new Error("Choose the original Sources disclosure.");
    event?.preventDefault();
    details.open = !details.open;
  });
  return (
    <summary
      ref={ref}
      data-command-id="toggle-conversation-sources"
      onClick={(event) => {
        event.preventDefault();
        run(event);
      }}
    >
      {children}
    </summary>
  );
}
