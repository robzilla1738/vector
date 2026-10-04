import type { ConversationSource } from "@aux/contracts";
import type { RefObject } from "react";
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
}

export function CalendarSourceChoiceDialog({ choice, returnFocus, initialFocus, onClose, onChoose }: Props) {
  return (
    <Dialog
      label="Open Calendar source"
      className="aux-dialog-surface conversation-calendar-choice"
      returnFocus={returnFocus}
      onClose={onClose}
    >
      <header>
        <h3>Open Calendar source</h3>
        <button ref={initialFocus} className="icon-btn" aria-label="Cancel" onClick={onClose}>
          {shellIconClose}
        </button>
      </header>
      <p>
        <b>{choice.source.title}</b>
        <br />
        Google account: {choice.source.accountKey}
      </p>
      <p>Choose the browser Profile signed in to this account.</p>
      <div className="conversation-calendar-profiles">
        {choice.profiles.map((profile) => (
          <button key={profile.id} className="btn sm" onClick={() => onChoose(profile)}>
            {profile.name}
            {profile.current ? " · current" : ""}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
