import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type RefObject,
} from "react";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
import { errToast } from "../store";
import type { OwnerNotice } from "./run-notifications";
import {
  onInAppNoticePreferenceChange,
  readInAppNoticePreference,
  writeInAppNoticePreference,
} from "./run-notice-preference";
import "./RunNoticeControls.css";
import { nativePoliteLiveProps } from "../ui/native-attribute-props";

type NoticeCommand =
  | "toggle-task-notices"
  | "review-task-notice"
  | "dismiss-task-notice"
  | "toggle-system-task-notices"
  | "toggle-task-focus-mode";
/** Local attention controls use their original mounted element and callback. */
export function useAttentionCommand(
  element: RefObject<HTMLElement | null>,
  command: NoticeCommand,
  invoke: () => unknown,
  dismiss?: () => unknown,
) {
  const scopeId = useId();
  const completionOwner = useRef<(() => boolean) | null>(null);
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    windowKind = bridge.windowKind;
  useLayoutEffect(() => {
    const original = element.current;
    if (!original) return;
    let live = true;
    const current = () =>
      live &&
      element.current === original &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode &&
      bridge.windowKind === windowKind;
    completionOwner.current = current;
    const enroll = (id: NoticeCommand, callback: () => unknown) =>
      registerScopedControl(original, id, scopeId, () => {
        if (!current()) throw new Error("Choose the current task notice.");
        return callback();
      });
    const remove = enroll(command, invoke);
    const removeEscape =
      dismiss && command !== "dismiss-task-notice" ? enroll("dismiss-task-notice", dismiss) : undefined;
    return () => {
      live = false;
      remove();
      removeEscape?.();
    };
  }, [element, command, invoke, dismiss, scopeId, windowId, privateMode, windowKind]);
  function run(id: NoticeCommand, event: Event) {
    const current = completionOwner.current;
    if (!current?.()) return;
    const completion = guardCommandCompletion(
      executeCommand(id, { payload: { scopeId }, nativeInputEvent: event }),
      current,
    );
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
  }
  return run;
}
function NoticeButton({
  command,
  invoke,
  dismiss,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  command: NoticeCommand;
  invoke(): unknown;
  dismiss?: () => unknown;
}) {
  const element = useRef<HTMLButtonElement>(null);
  const run = useAttentionCommand(element, command, invoke, dismiss);
  return (
    <button
      {...props}
      ref={element}
      data-command-id={command}
      onClick={(event) => run(command, event.nativeEvent)}
      onKeyDown={(event) => {
        if (dismiss && event.key === "Escape") {
          event.stopPropagation();
          run("dismiss-task-notice", event.nativeEvent);
        }
      }}
    />
  );
}

export function RunNoticePreference() {
  const [preference, setPreference] = useState(readInAppNoticePreference);
  useEffect(() => onInAppNoticePreferenceChange(() => setPreference(readInAppNoticePreference())), []);
  return (
    <NoticeButton
      command="toggle-task-notices"
      className="run-notice-preference btn sm ghost"
      aria-pressed={preference === "all"}
      invoke={() => {
        const next = readInAppNoticePreference() === "all" ? "off" : "all";
        writeInAppNoticePreference(next);
        setPreference(next);
      }}
    >
      Task notices {preference === "all" ? "on" : "off"}
    </NoticeButton>
  );
}

/** Visible on return to Aux when OS notification delivery is unavailable. */
export function RunNoticeBanner({
  notice,
  onReview,
  onDismiss,
}: {
  notice: OwnerNotice;
  onReview(runId: string): void;
  onDismiss(): void;
}) {
  return (
    <aside className="run-failure run-notice-banner" {...nativePoliteLiveProps} aria-label="Task notice">
      <div>
        <strong>{notice.title}</strong>
        <p {...staticHintProps}>{notice.body}</p>
      </div>
      <div {...staticRowProps}>
        <NoticeButton
          command="review-task-notice"
          className="btn sm primary"
          invoke={() => onReview(notice.runId)}
          dismiss={onDismiss}
        >
          Review task
        </NoticeButton>
        <NoticeButton
          command="dismiss-task-notice"
          {...smallGhostButtonProps}
          aria-label="Dismiss task notice"
          invoke={onDismiss}
          dismiss={onDismiss}
        >
          Dismiss
        </NoticeButton>
      </div>
    </aside>
  );
}
