import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Mic } from "./central-icons";
import { setDictationDraft, useDictationDrafts } from "../dictation-drafts";
import { bridge } from "../bridge";
import { parseVoiceCommand, runVoiceCommand, voiceCommandLabels } from "../voice-commands";

/** Dictated words remain a local, editable preview until the user inserts them. */
export function Dictation({
  draftKey,
  disabled,
  onInsert,
  composerRef,
}: {
  draftKey: string;
  disabled: boolean;
  onInsert: (text: string) => void;
  composerRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [available, setAvailable] = useState(false);
  const [reason, setReason] = useState("");
  const text = useDictationDrafts((state) => state.drafts[draftKey] ?? "");
  const setText = (value: string) => setDictationDraft(draftKey, value);
  const [phase, setPhase] = useState<"idle" | "saved" | "starting" | "recording" | "finishing" | "review">(
    text ? "review" : "idle",
  );
  const [error, setError] = useState("");
  const voiceCommand = phase === "review" ? parseVoiceCommand(text) : null;
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const transcript = useRef<HTMLTextAreaElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const session = useRef<string | null>(null);
  const alive = useRef(true);
  const holding = useRef(false);
  const recording = useRef(false);
  const releaseHold = useRef<() => void>(() => {});
  useEffect(() => {
    alive.current = true;
    void bridge
      .dictationStatus()
      .then((value) => {
        if (alive.current) {
          setAvailable(value.available);
          setReason(value.reason ?? "");
        }
      })
      .catch(() => {});
    const off = bridge.onDictation((event) => {
      if (event.sessionId !== session.current) return;
      if (event.text !== undefined) setText(event.text);
      if (event.type === "recording") {
        recording.current = true;
        setPhase("recording");
      }
      if (event.type === "finishing") setPhase("finishing");
      if (event.type === "final" || event.type === "error") {
        session.current = null;
        recording.current = false;
        holding.current = false;
        setPhase("review");
        if (event.type === "error") setError(event.message || "Dictation stopped. Try again.");
      }
    });
    const released = (event: KeyboardEvent) => {
      if (event.code === "Space" && holding.current) {
        event.preventDefault();
        releaseHold.current();
      }
    };
    const blurred = () => {
      if (holding.current) releaseHold.current();
    };
    window.addEventListener("keyup", released, true);
    window.addEventListener("blur", blurred);
    return () => {
      window.removeEventListener("keyup", released, true);
      window.removeEventListener("blur", blurred);
      alive.current = false;
      off();
      if (session.current) void bridge.cancelDictation(session.current).catch(() => {});
      session.current = null;
    };
  }, []);
  useEffect(() => {
    if (document.activeElement !== document.body && !panel.current?.contains(document.activeElement)) return;
    if (phase === "idle" || phase === "saved") trigger.current?.focus();
    else if (phase === "review") transcript.current?.focus();
    else (phase === "recording" ? stopButton : cancelButton).current?.focus();
  }, [phase]);
  function discard() {
    if (session.current) void bridge.cancelDictation(session.current).catch(() => {});
    session.current = null;
    recording.current = false;
    holding.current = false;
    setPhase("idle");
    setText("");
    setError("");
  }
  function cancelCapture() {
    if (session.current) void bridge.cancelDictation(session.current).catch(() => {});
    session.current = null;
    recording.current = false;
    holding.current = false;
    setPhase(text.trim() ? "review" : "idle");
    setError("");
  }
  useEffect(() => {
    if (!disabled || !session.current) return;
    void bridge.cancelDictation(session.current).catch(() => {});
    session.current = null;
    recording.current = false;
    holding.current = false;
    setPhase("review");
  }, [disabled]);
  async function start() {
    if (session.current || disabled) return;
    const id = crypto.randomUUID();
    session.current = id;
    recording.current = false;
    setPhase("starting");
    setText("");
    setError("");
    try {
      if (!(await bridge.startDictation(id))) throw new Error("Dictation could not start.");
    } catch (reason) {
      if (alive.current && session.current === id) {
        session.current = null;
        recording.current = false;
        holding.current = false;
        setPhase("review");
        setError(errorMessage(reason));
      }
    }
  }
  async function stop() {
    const id = session.current;
    if (!id) return;
    setPhase("finishing");
    try {
      if (!(await bridge.stopDictation(id))) throw new Error("Dictation is no longer recording.");
    } catch {
      if (session.current === id) {
        void bridge.cancelDictation(id).catch(() => {});
        session.current = null;
        recording.current = false;
        holding.current = false;
        setPhase("review");
        setError("Dictation stopped before finishing. Review the text below.");
      }
    }
  }
  releaseHold.current = () => {
    holding.current = false;
    if (recording.current) void stop();
    else discard(); // Releasing during permission/startup cannot begin capture later.
  };
  const statusHint = holding.current
    ? "Release Space to stop · on this Mac"
    : "On this Mac · never sent automatically";
  const transcriptPlaceholder =
    phase === "review" ? "No words captured. Try again when you’re ready." : "Your words appear here…";
  if (!available && !text) {
    return (
      <button
        className="dictation-trigger"
        disabled
        title={reason || "On-device dictation is unavailable in this environment."}
      >
        <Mic width={15} height={15} aria-hidden /> Dictate
      </button>
    );
  }
  if (phase === "idle" || phase === "saved")
    return (
      <button
        ref={trigger}
        className="dictation-trigger"
        disabled={disabled}
        onClick={() => (phase === "saved" ? setPhase("review") : void start())}
        onKeyDown={(event) => {
          if (event.code !== "Space" || event.nativeEvent.isComposing) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.repeat || holding.current) return;
          if (phase === "saved") {
            setPhase("review");
            return;
          }
          holding.current = true;
          void start();
        }}
        title={
          phase === "saved"
            ? "Review your unsent dictation"
            : "Click to dictate, or hold Space while focused to talk. Review before inserting."
        }
      >
        <Mic width={15} height={15} aria-hidden /> {phase === "saved" ? "Review dictation" : "Dictate"}
      </button>
    );
  return (
    <section
      ref={panel}
      className="dictation-panel"
      aria-label="Dictation"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        if (phase === "review") setPhase(text.trim() ? "saved" : "idle");
        else cancelCapture();
      }}
    >
      <div className="dictation-heading">
        <strong aria-live="polite">
          {phase === "recording"
            ? "Listening…"
            : phase === "starting"
              ? "Starting microphone…"
              : phase === "finishing"
                ? "Finishing…"
                : "Review dictation"}
        </strong>
        <span>{statusHint}</span>
      </div>
      {error && (
        <p role="alert" className="hint err">
          {error}
        </p>
      )}
      <textarea
        ref={transcript}
        aria-label="Dictation transcript"
        value={text}
        readOnly={phase !== "review"}
        placeholder={transcriptPlaceholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") event.stopPropagation();
        }}
      />
      <div className="dictation-actions">
        {phase === "recording" && (
          <button ref={stopButton} {...smallButtonProps} onClick={() => void stop()}>
            Stop recording
          </button>
        )}
        {phase === "review" && (
          <>
            <button
              {...smallButtonProps}
              disabled={disabled || !text.trim()}
              onClick={() => {
                onInsert(text.trim());
                discard();
                requestAnimationFrame(() => {
                  composerRef.current?.focus();
                });
              }}
            >
              Insert into message
            </button>
            {voiceCommand && (
              <button
                {...smallButtonProps}
                disabled={disabled}
                onClick={() => {
                  void runVoiceCommand(voiceCommand, bridge)
                    .then(() => discard())
                    .catch((reason) => setError(errorMessage(reason)));
                }}
              >
                {voiceCommandLabels[voiceCommand]}
              </button>
            )}
            <button {...smallGhostButtonProps} disabled={disabled || !available} onClick={() => void start()}>
              Record again
            </button>
          </>
        )}
        <button
          ref={cancelButton}
          {...smallGhostButtonProps}
          onClick={phase === "review" ? discard : cancelCapture}
        >
          {phase === "review" ? "Discard" : "Cancel"}
        </button>
      </div>
    </section>
  );
}
