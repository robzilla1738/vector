import { useEffect, useRef, useState } from "react";
import { Switch } from "../ui";
import { SettingsField as Field } from "../settings/primitives";
import { Popover } from "../ui/popover";
import { Menu } from "../ui/dialog";
import { ChevronDown, Check, Volume2 } from "../ui/icons";
import { playTaskSound, taskSounds, type TaskSound } from "./task-sound";
import "./TaskAttentionSettings.css";
import {
  onInAppNoticePreferenceChange,
  readSystemTaskNotices,
  readTaskFocusMode,
  writeSystemTaskNotices,
  writeTaskFocusMode,
  readTaskNoticeKinds,
  writeTaskNoticeKinds,
  readTaskSound,
  readSelectedTaskSound,
  writeTaskSound,
} from "./run-notice-preference";

import { useAttentionCommand } from "./RunNoticeControls";

function AttentionSwitch({
  command,
  label,
  checked,
  disabled,
  read,
  write,
}: {
  command: "toggle-system-task-notices" | "toggle-task-focus-mode";
  label: string;
  checked: boolean;
  disabled?: boolean;
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
      disabled={disabled}
      onChange={(event) => run(command, event.nativeEvent)}
    />
  );
}

/** Local Profile attention controls. Focus Mode always wins over both delivery surfaces. */
export function TaskAttentionSettings({ active = true }: { active?: boolean }) {
  const [kinds, setKinds] = useState(readTaskNoticeKinds);
  const [noticeMenu, setNoticeMenu] = useState<"first" | "last" | null>(null);
  const noticeTrigger = useRef<HTMLButtonElement>(null);
  if (!active && noticeMenu !== null) setNoticeMenu(null);
  const [sound, setSound] = useState(readTaskSound);
  const [lastSound, setLastSound] = useState<TaskSound>(readSelectedTaskSound);
  const [previewing, setPreviewing] = useState(false);
  const [soundError, setSoundError] = useState("");
  const selected = Number(kinds.attention) + Number(kinds.completion) + Number(kinds.routine);
  async function preview() {
    setPreviewing(true);
    setSoundError("");
    try {
      await playTaskSound(sound === "off" ? lastSound : sound);
    } catch {
      setSoundError("Sound could not play. Check your audio output and try again.");
    } finally {
      setPreviewing(false);
    }
  }
  const [system, setSystem] = useState(readSystemTaskNotices);
  const [focus, setFocus] = useState(readTaskFocusMode);
  useEffect(
    () =>
      onInAppNoticePreferenceChange(() => {
        setKinds(readTaskNoticeKinds());
        setSound(readTaskSound());
        setLastSound(readSelectedTaskSound());
        setSystem(readSystemTaskNotices());
        setFocus(readTaskFocusMode());
      }),
    [],
  );
  return (
    <div className="task-attention-settings">
      <h3>Chat</h3>
      <div className="settings-card">
        <Field
          compact
          label="Task notifications"
          hint="Choose which task events can notify you. Focus Mode pauses all alerts."
        >
          <button
            type="button"
            ref={noticeTrigger}
            className="btn task-notice-trigger"
            aria-label="Task notification types"
            aria-haspopup="menu"
            aria-expanded={noticeMenu !== null}
            disabled={!active}
            onClick={() => setNoticeMenu((current) => (current === null ? "first" : null))}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              setNoticeMenu(event.key === "ArrowUp" ? "last" : "first");
            }}
          >
            <span>
              {selected === 3
                ? "Everything"
                : selected === 0
                  ? "Off"
                  : selected === 2
                    ? "2 types"
                    : kinds.attention
                      ? "Needs attention"
                      : kinds.completion
                        ? "Task completions"
                        : "Routine completions"}
            </span>
            <ChevronDown />
          </button>
          {active && noticeMenu !== null && (
            <Menu
              label="Task notification types"
              className="ctx-menu task-notice-types"
              anchor={noticeTrigger}
              returnFocus={noticeTrigger}
              atEnd={noticeMenu === "last"}
              onClose={() => setNoticeMenu(null)}
            >
              {(
                [
                  ["attention", "Needs attention", "Approvals, questions and handoffs"],
                  ["completion", "Task completions", "Tasks you start when they finish"],
                  ["routine", "Routine completions", "Tasks started by routines when they finish"],
                ] as const
              ).map(([key, label, hint]) => (
                <button
                  type="button"
                  key={key}
                  className="menu-item"
                  role="menuitemcheckbox"
                  aria-checked={kinds[key]}
                  onClick={() => {
                    const current = readTaskNoticeKinds();
                    writeTaskNoticeKinds({ ...current, [key]: !current[key] });
                  }}
                >
                  <span className="task-notice-copy">
                    <span>{label}</span>
                    <small>{hint}</small>
                  </span>
                  {kinds[key] && <Check />}
                </button>
              ))}
            </Menu>
          )}
        </Field>
        <Field
          compact
          label="Completion sound"
          hint="Play a sound when background tasks finish or need attention."
          details={
            <div className="task-sound-actions">
              <button
                type="button"
                className="btn small"
                disabled={!active || previewing}
                onClick={() => void preview()}
              >
                <Volume2 />
                {previewing ? "Playing…" : "Preview"}
              </button>
              <Popover
                label="Change completion sound"
                disabled={!active}
                trigger={
                  <>
                    Change <ChevronDown />
                  </>
                }
              >
                {(close) => (
                  <div className="task-notice-choices">
                    {Object.entries(taskSounds).map(([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        role="radio"
                        aria-checked={(sound === "off" ? lastSound : sound) === key}
                        onClick={() => {
                          setLastSound(key as TaskSound);
                          writeTaskSound(key as TaskSound);
                          close();
                        }}
                      >
                        {label}
                        {(sound === "off" ? lastSound : sound) === key && <Check />}
                      </button>
                    ))}
                  </div>
                )}
              </Popover>
              {soundError && <span role="alert">{soundError}</span>}
            </div>
          }
        >
          <Switch
            aria-label="Completion sound"
            checked={sound !== "off"}
            disabled={!active}
            onChange={(event) => writeTaskSound(event.target.checked ? lastSound : "off")}
          />
        </Field>
      </div>
      <details className="task-notification-details">
        <summary>Notification delivery</summary>
        <div className="settings-card">
          <Field
            compact
            label="System task notifications"
            hint="Also show generic alerts on this Mac while Aux is in the background. Task content stays in Aux."
          >
            <AttentionSwitch
              command="toggle-system-task-notices"
              label="System task notifications"
              disabled={!active}
              checked={system}
              read={readSystemTaskNotices}
              write={writeSystemTaskNotices}
            />
          </Field>
          <Field
            compact
            label="Focus Mode"
            hint="Pause task notices and sounds. Pending questions remain in Home and Tasks."
          >
            <AttentionSwitch
              command="toggle-task-focus-mode"
              label="Focus Mode"
              disabled={!active}
              checked={focus}
              read={readTaskFocusMode}
              write={writeTaskFocusMode}
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
