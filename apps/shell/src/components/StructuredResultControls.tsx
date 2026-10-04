import { useId, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
import { errToast } from "../store";
type StructuredCommand =
  "toggle-saved-result-format" | "select-saved-result-row" | "close-saved-result-row-details";
function useStructuredControl<E extends HTMLElement>(
  command: StructuredCommand,
  current: () => boolean,
  invoke: (event?: Event) => unknown,
) {
  const scope = useId();
  const [ref, run] = usePreferenceCommand<E>(
    command,
    scope,
    (_element, event) =>
      current()
        ? invoke(event)
        : guardCommandCompletion(
            Promise.reject(new Error("Choose the original saved result source.")),
            current,
          ),
    (error) => {
      if (current()) errToast(error);
    },
  );

  return [ref, run] as const;
}
export function StructuredResultControl({
  command,
  current,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: Exclude<StructuredCommand, "select-saved-result-row">;
  current(): boolean;
  invoke(): unknown;
}) {
  const [ref, run] = useStructuredControl<HTMLButtonElement>(command, current, invoke);
  return <button {...props} ref={ref} data-command-id={command} onClick={run} />;
}
export function StructuredResultRow({
  current,
  invoke,
  originalRef,
  ...props
}: Omit<HTMLAttributes<HTMLTableRowElement>, "onClick" | "onKeyDown"> & {
  current(): boolean;
  invoke(event?: Event): unknown;
  originalRef(node: HTMLTableRowElement | null): void;
}) {
  const [ref, run] = useStructuredControl<HTMLTableRowElement>("select-saved-result-row", current, invoke);
  return (
    <tr
      {...props}
      ref={(node) => {
        ref(node);
        originalRef(node);
      }}
      data-command-id="select-saved-result-row"
      onClick={run}
      onKeyDown={(event) => {
        if (["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          run(event);
        }
      }}
    />
  );
}
