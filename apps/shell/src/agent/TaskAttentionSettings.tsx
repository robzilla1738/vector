import { useEffect, useRef, useState } from "react";
import { SettingsRow as Field, SettingsGroup, Switch } from "../ui";
import {
  onInAppNoticePreferenceChange,
  readSystemTaskNotices,
  readTaskFocusMode,
  writeSystemTaskNotices,
  writeTaskFocusMode,
} from "./run-notice-preference";

import { useAttentionCommand } from "./RunNoticeControls";

function AttentionSwitch({
  command,
  label,
  checked,
  read,
  write,
}: {
  command: "toggle-system-task-notices" | "toggle-task-focus-mode";
  label: string;
  checked: boolean;
  read(): boolean;
  write(value: boolean): void;
}) {
  const element = useRef<HTMLInputElement>(null);
  const run = useAttentionCommand(element, command, () => write(!read()));
  return (
    <Switch
      controlRef={(node) => {
        element.current = node;
      }}
      data-command-id={command}
      aria-label={label}
      checked={checked}
      onChange={(event) => run(command, event.nativeEvent)}
    />
  );
}

/** Local Profile attention controls. Focus Mode always wins over both delivery surfaces. */
export function TaskAttentionSettings() {
  const [system, setSystem] = useState(readSystemTaskNotices);
  const [focus, setFocus] = useState(readTaskFocusMode);
  useEffect(
    () =>
      onInAppNoticePreferenceChange(() => {
        setSystem(readSystemTaskNotices());
        setFocus(readTaskFocusMode());
      }),
    [],
  );
  return (
    <SettingsGroup title="Task attention">
      <Field
        label="System task notifications"
        hint="When Task notices are on, show generic completion, question and handoff alerts on this Mac while Aux is in the background. Task titles, page text and answers stay in Aux. In-app attention remains available if macOS notifications are off."
      >
        <AttentionSwitch
          command="toggle-system-task-notices"
          label="System task notifications"
          checked={system}
          read={readSystemTaskNotices}
          write={writeSystemTaskNotices}
        />
      </Field>
      <Field
        label="Focus Mode"
        hint="Pause task notices while Focus Mode is on. Runs and their pending questions remain available in Home and Tasks."
      >
        <AttentionSwitch
          command="toggle-task-focus-mode"
          label="Focus Mode"
          checked={focus}
          read={readTaskFocusMode}
          write={writeTaskFocusMode}
        />
      </Field>
    </SettingsGroup>
  );
}
