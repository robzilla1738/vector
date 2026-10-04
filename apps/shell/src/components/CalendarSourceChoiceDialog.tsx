import { smallButtonProps } from "../ui/button-props";
import type { ConversationSource } from "@aux/contracts";
import type { ReactNode, RefObject } from "react";
import type { BrowserProfile } from "../bridge";
import { Dialog } from "../ui";
import { shellIconClose } from "./icons";
import "./CalendarSourceChoiceDialog.css";

interface Props {
  choice: {
    source: Extract<ConversationSource, { kind: "calendar" }>;
    profiles: BrowserProfile[];
  };
  returnFocus: RefObject<HTMLElement | null>;
  initialFocus: RefObject<HTMLButtonElement | null>;
  onClose(): void;
  onChoose(profile: BrowserProfile): void;
  cancelControl?: ReactNode;
  profileControl?: (profile: BrowserProfile) => ReactNode;
}

export function CalendarSourceChoiceDialog({
  choice,
  returnFocus,
  initialFocus,
  onClose,
  onChoose,
  cancelControl,
  profileControl,
}: Props) {
  return (
    <Dialog
      label="Open Calendar source"
      className="aux-dialog-surface conversation-calendar-choice"
      returnFocus={returnFocus}
      onClose={onClose}
    >
      <header>
        <h3>Open Calendar source</h3>
        {cancelControl ?? (
          <button ref={initialFocus} className="icon-btn" aria-label="Cancel" onClick={onClose}>
            {shellIconClose}
          </button>
        )}
      </header>
      <p>
        <b>{choice.source.title}</b>
        <br />
        Google account: {choice.source.accountKey}
      </p>
      <p>Choose the browser Profile signed in to this account.</p>
      <div className="conversation-calendar-profiles">
        {choice.profiles.map((profile) =>
          profileControl ? (
            profileControl(profile)
          ) : (
            <button key={profile.id} {...smallButtonProps} onClick={() => onChoose(profile)}>
              {profile.name}
              {profile.current ? " · current" : ""}
            </button>
          ),
        )}
      </div>
    </Dialog>
  );
}
