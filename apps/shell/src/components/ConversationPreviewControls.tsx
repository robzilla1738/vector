import { useCallback, useMemo, type ButtonHTMLAttributes, type RefObject } from "react";
import type { PageTarget } from "@aux/contracts";
import {
  useCommittedConversationOwner,
  useCurrentConversationCommand,
} from "./conversation-control-construction";
import { errToast } from "../store";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

export function previewPageIdentity(page: PageTarget | undefined) {
  return page
    ? JSON.stringify([
        page.pageId,
        page.targetId,
        page.backend,
        page.windowKind,
        page.url,
        page.documentEpoch,
        page.sessionId,
        page.windowId,
        page.controller,
        page.controllerEpoch,
        page.ownedByRuntime,
      ])
    : null;
}
/** Retain the actual selected person document, independently of transient paint/status updates. */
export function useConversationPreviewOwner(
  current: () => boolean,
  page: PageTarget | undefined,
  selection: string,
  layoutIdentity: string,
  read: () => PageTarget | undefined,
) {
  const pageIdentity = previewPageIdentity(page);
  const identity = useMemo(
    () => [current, pageIdentity, selection, layoutIdentity],
    [current, pageIdentity, selection, layoutIdentity],
  );
  return useCommittedConversationOwner(identity, () => {
    return current() && pageIdentity !== null && previewPageIdentity(read()) === pageIdentity;
  }, [identity, current, pageIdentity, read]);
}
export function ConversationPreviewAction({
  command,
  current,
  invoke,
  controlRef,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command:
    | "toggle-conversation-preview-menu"
    | "activate-conversation-preview-page"
    | "split-conversation-preview-page";
  current(): boolean;
  invoke(): unknown;
  controlRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [ref, run] = useCurrentConversationCommand<HTMLButtonElement>(
    command,
    current,
    () => invoke(),
    "Choose the current conversation preview page.",
    true,
    (original) => {
      if (current()) errToast(original);
    },
  );
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
