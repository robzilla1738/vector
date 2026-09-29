import { useEffect, useState } from "react";
import { SettingsRow as Field, SettingsGroup, Switch } from "../ui";
import { onInAppNoticePreferenceChange, readSystemTaskNotices, readTaskFocusMode,
  writeSystemTaskNotices, writeTaskFocusMode } from "./run-notice-preference";

/** Local Profile attention controls. Focus Mode always wins over both delivery surfaces. */
export function TaskAttentionSettings() {
  const [system, setSystem] = useState(readSystemTaskNotices);
  const [focus, setFocus] = useState(readTaskFocusMode);
  useEffect(() => onInAppNoticePreferenceChange(() => {
    setSystem(readSystemTaskNotices()); setFocus(readTaskFocusMode());
  }), []);
  return <SettingsGroup title="Task attention">
    <Field label="System task notifications" hint="When Task notices are on, show generic completion, question and handoff alerts on this Mac while Aux is in the background. Task titles, page text and answers stay in Aux. In-app attention remains available if macOS notifications are off.">
      <Switch aria-label="System task notifications" checked={system}
        onChange={(event) => { writeSystemTaskNotices(event.target.checked); setSystem(event.target.checked); }} />
    </Field>
    <Field label="Focus Mode" hint="Pause task notices while Focus Mode is on. Runs and their pending questions remain available in Home and Tasks.">
      <Switch aria-label="Focus Mode" checked={focus}
        onChange={(event) => { writeTaskFocusMode(event.target.checked); setFocus(event.target.checked); }} />
    </Field>
  </SettingsGroup>;
}
