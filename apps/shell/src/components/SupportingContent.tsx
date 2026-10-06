import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { executeCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";
import { createPortal } from "react-dom";
import { useNativeDialog } from "../ui/native-dialog";
import { useDismissable } from "../use-dismissable";
import { DetailPane } from "../ui";
import { shellIconOpen, shellIconResult } from "../ui/icons";
import "./SupportingContent.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

/** One supporting-content slot. The transcript and composer never remount. */
export function SupportingContent({
  container,
  title,
  children,
  onClose,
  initiallyExpanded = false,
  viewer = false,
  current,
}: {
  container: RefObject<HTMLElement | null>;
  title: string;
  children: ReactNode;
  onClose(): void;
  initiallyExpanded?: boolean;
  viewer?: boolean;
  current?(): boolean;
}) {
  const [wide, setWide] = useState(false);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [width, setWidth] = useState(320);
  const dialog = useRef<HTMLDialogElement>(null);
  const overlay = !wide && expanded;
  const scope = useId();
  const open = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null),
    resize = useRef<HTMLDivElement>(null);
  const identity = useMemo(() => ({ current, container }), [current, container]);
  const owner = useRef<{ active: boolean; identity: typeof identity; element: HTMLElement | null } | null>(
    null,
  );
  const drag = useRef<{ element: HTMLDivElement; pointerId: number; current(): boolean } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity, element: container.current };
    owner.current = original;
    return () => {
      original.active = false;
      const gesture = drag.current;
      if (gesture) {
        drag.current = null;
        if (gesture.element.hasPointerCapture(gesture.pointerId))
          gesture.element.releasePointerCapture(gesture.pointerId);
      }
    };
  }, [identity, container]);
  useEffect(() => {
    const original = owner.current;
    if (original?.active && original.identity === identity) original.element = container.current;
  }, [identity, container]);
  const owned = () => {
    const original = owner.current;
    if (!original?.active || original.identity !== identity) return false;
    if (!original.element) return false;
    if (container.current === original.element && !!original.element?.isConnected && (!current || current()))
      return true;
    original.active = false;
    return false;
  };
  const commandWidth = (command: string) =>
    setWidth((value) =>
      command === "reset-conversation-supporting-width"
        ? 320
        : Math.max(
            280,
            Math.min(440, value + (command === "increase-conversation-supporting-width" ? 16 : -16)),
          ),
    );
  useLayoutEffect(() => {
    if (!current) return;
    const controls: [string, HTMLElement | null, () => unknown][] = [
      ["open-conversation-supporting-content", open.current, () => setExpanded(true)],
      [
        "close-conversation-supporting-content",
        close.current,
        () => (overlay ? setExpanded(false) : onClose()),
      ],
      ...[
        "increase-conversation-supporting-width",
        "decrease-conversation-supporting-width",
        "reset-conversation-supporting-width",
      ].map(
        (command) =>
          [command, resize.current, () => commandWidth(command)] as [
            string,
            HTMLElement | null,
            () => unknown,
          ],
      ),
    ];
    const retire = controls.flatMap(([command, element, invoke]) =>
      element
        ? [
            registerScopedControl(element, command, scope, () =>
              owned()
                ? invoke()
                : guardCommandCompletion(
                    Promise.reject(new Error("Choose the original supporting content.")),
                    owned,
                  ),
            ),
          ]
        : [],
    );
    return () => retire.forEach((release) => release());
  });
  const run = (command: string, event: { nativeEvent: Event }) => {
    const completion = executeCommand(command, {
      payload: { scopeId: scope },
      nativeInputEvent: event.nativeEvent,
    });
    void completion.catch((reason) =>
      reportCommandCompletionFailure(completion, reason, (error) => {
        if (owned()) errToast(error);
      }),
    );
  };

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () => setWide(element.clientWidth >= 960);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container]);
  const collapse = () => {
    if (!current || owned()) setExpanded(false);
  };
  useDismissable(overlay, collapse);
  useNativeDialog(overlay, dialog);
  const pane = viewer ? (
    <div className="supporting-viewer">{children}</div>
  ) : (
    <DetailPane
      title={title}
      closeRef={(node) => {
        close.current = node;
      }}
      onClose={(event) =>
        current && event
          ? run("close-conversation-supporting-content", event)
          : overlay
            ? collapse()
            : onClose()
      }
    >
      {children}
    </DetailPane>
  );
  if (!wide)
    return (
      <>
        <button
          {...auxNativeButtonTypeProps}
          ref={open}
          data-command-id={current ? "open-conversation-supporting-content" : undefined}
          className="supporting-chip"
          onClick={(event) =>
            current ? run("open-conversation-supporting-content", event) : setExpanded(true)
          }
          aria-haspopup="dialog"
        >
          {shellIconResult}
          <span>{title}</span>
          {shellIconOpen}
        </button>
        {overlay &&
          createPortal(
            <dialog
              ref={dialog}
              tabIndex={-1}
              className="supporting-dialog ctx-menu"
              aria-label={title}
              onCancel={(event) => {
                event.preventDefault();
                collapse();
              }}
              onClick={(event) => {
                if (event.target === event.currentTarget) collapse();
              }}
            >
              {pane}
            </dialog>,
            document.body,
          )}
      </>
    );
  return (
    <aside className="supporting-content" style={{ width }}>
      <div
        ref={resize}
        className="supporting-resize"
        role="separator"
        tabIndex={0}
        aria-label="Supporting content width"
        aria-orientation="vertical"
        aria-valuemin={280}
        aria-valuemax={440}
        aria-valuenow={width}
        title="Drag to resize · double-click resets"
        onDoubleClick={(event) =>
          current ? run("reset-conversation-supporting-width", event) : setWidth(320)
        }
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            if (current)
              run(
                event.key === "ArrowLeft"
                  ? "increase-conversation-supporting-width"
                  : "decrease-conversation-supporting-width",
                event,
              );
            else
              setWidth((value) =>
                Math.max(280, Math.min(440, value + (event.key === "ArrowLeft" ? 16 : -16))),
              );
          }
          if (event.key === "Home") {
            event.preventDefault();
            if (current) run("reset-conversation-supporting-width", event);
            else setWidth(320);
          }
        }}
        onPointerDown={(event) => {
          if (current && !owned()) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { element: event.currentTarget, pointerId: event.pointerId, current: owned };
        }}
        onPointerMove={(event) => {
          const original = drag.current;
          if (
            !event.currentTarget.hasPointerCapture(event.pointerId) ||
            (current &&
              (!original ||
                original.element !== event.currentTarget ||
                original.pointerId !== event.pointerId ||
                !original.current()))
          )
            return;
          const edge = event.currentTarget.parentElement!.getBoundingClientRect().right;
          setWidth(Math.max(280, Math.min(440, edge - event.clientX)));
        }}
        onPointerUp={(event) => {
          const original = drag.current;
          if (
            current &&
            (!original || original.element !== event.currentTarget || original.pointerId !== event.pointerId)
          )
            return;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          if (drag.current === original) drag.current = null;
        }}
      />
      {pane}
    </aside>
  );
}
