import { useShallow } from "zustand/react/shallow";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ConnectorCatalog, OrganizationSnapshot, Routine } from "@aux/contracts";
import type { ComposerPluginProps } from "../features/registry";
import { executeCommand } from "../commands";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { moveListFocus } from "../keyboard-list";
import { shellIconGlobe, shellIconClose } from "../components/icons";
import { caretAnchor } from "./caret";
import { mentionCandidates, mentionChipStatus } from "./candidates";
import { readMentionDraft, writeMentionDraft } from "./drafts";
import { registerMentionController } from "./controller";
import {
  backspaceMention,
  insertMention,
  mentionQuery,
  spliceMentionDraft,
  type MentionQuery,
} from "./tokens";
import "./mentions.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

export function MentionComposer({
  textareaRef,
  value,
  onChange,
  disabled,
  composerId,
  workspaceId,
}: ComposerPluginProps) {
  const pages = useStore(useShallow((state) => state.pages.allIds.map((id) => state.pages.byId[id]!)));
  const listId = useId();
  const [query, setQuery] = useState<MentionQuery | null>(null);
  const [anchor, setAnchor] = useState({ left: 0, top: 0 });
  const [organization, setOrganization] = useState<OrganizationSnapshot>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [connectors, setConnectors] = useState<ConnectorCatalog>();
  const [error, setError] = useState("");
  const [, repaint] = useState(0);
  const dismissed = useRef<string | null>(null);
  const rows = useRef<HTMLDivElement>(null);
  const draft = readMentionDraft(composerId, value);
  const candidates = useMemo(
    () => mentionCandidates({ pages, organization, routines, connectors }),
    [pages, organization, routines, connectors],
  );
  const matching = useMemo(
    () =>
      query
        ? candidates.filter((candidate) =>
            `${candidate.label} ${candidate.detail}`
              .toLocaleLowerCase()
              .includes(query.query.toLocaleLowerCase()),
          )
        : [],
    [candidates, query],
  );
  const open = !!query;
  useEffect(() => {
    if (!open) return;
    let live = true;
    const loads = [
      bridge.organizationSnapshot().then((result) => {
        if (live) setOrganization(result);
      }),
      call("routines.list", { limit: 200 }).then((result) => {
        if (live) setRoutines(result);
      }),
      ...(workspaceId
        ? [
            call("connectors.catalog", { workspaceId }).then((result) => {
              if (live) setConnectors(result);
            }),
          ]
        : []),
    ];
    void Promise.allSettled(loads).then((results) => {
      if (live && results.some((result) => result.status === "rejected"))
        setError("Some sources are unavailable. Available tabs can still be mentioned.");
    });
    return () => {
      live = false;
    };
  }, [open, workspaceId]);
  useEffect(() => {
    if (!query) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Node) ||
        textareaRef.current?.contains(target) ||
        rows.current?.contains(target)
      )
        return;
      setQuery(null);
      textareaRef.current?.setAttribute("aria-expanded", "false");
    };
    document.addEventListener("pointerdown", dismiss, true);
    return () => document.removeEventListener("pointerdown", dismiss, true);
  }, [query, textareaRef]);
  useEffect(() => {
    const input = textareaRef.current;
    if (!input) return;
    const update = () => {
      const current = mentionQuery(input.value, input.selectionStart);
      const key = current ? `${current.start}:${current.end}:${current.query}` : null;
      setQuery(disabled || dismissed.current === key ? null : current);
      setError("");
      if (current) setAnchor(caretAnchor(input, input.selectionStart));
      input.setAttribute("aria-controls", listId);
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", String(!!current && !disabled && dismissed.current !== key));
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.isComposing || disabled) return;
      const current = mentionQuery(input.value, input.selectionStart);
      if (
        current &&
        query &&
        ["Enter", "ArrowDown", "ArrowUp", "Escape"].includes(event.key) &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.key === "Escape") {
          dismissed.current = `${current.start}:${current.end}:${current.query}`;
          setQuery(null);
          input.setAttribute("aria-expanded", "false");
        } else if (event.key === "Enter") {
          if (matching[0])
            void executeCommand("mention-insert", {
              payload: { composerId, candidateId: matching[0].id },
            }).catch(errToast);
        } else {
          const options = rows.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
          (event.key === "ArrowUp" ? options?.[options.length - 1] : options?.[0])?.focus();
        }
        return;
      }
      if (event.key === "Backspace" && input.selectionStart === input.selectionEnd) {
        const currentDraft = readMentionDraft(composerId, input.value);
        const next = backspaceMention(currentDraft, input.selectionStart);
        if (next) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const token = currentDraft.tokens.find(
            (token) =>
              token.end === input.selectionStart ||
              (token.end + 1 === input.selectionStart && input.value[token.end] === " "),
          );
          if (token)
            void executeCommand("mention-remove", { payload: { composerId, tokenStart: token.start } }).catch(
              errToast,
            );
        }
      }
    };
    const beforeInput = (event: InputEvent) => {
      // Text identity is insufficient: replacing a token interior with identical
      // characters is still an edit and must drop its authority.
      const start = input.selectionStart,
        end = input.selectionEnd;
      const current = readMentionDraft(composerId, input.value);
      const tokens = current.tokens.filter((token) => {
        if (start !== end) return end <= token.start || start >= token.end;
        if (event.inputType.startsWith("delete")) return start < token.start || start > token.end;
        return start <= token.start || start >= token.end;
      });
      if (tokens.length !== current.tokens.length) writeMentionDraft(composerId, { ...current, tokens });
    };
    input.addEventListener("beforeinput", beforeInput);
    input.addEventListener("input", update);
    input.addEventListener("click", update);
    input.addEventListener("keyup", update);
    input.addEventListener("scroll", update);
    input.addEventListener("keydown", keydown, true);
    return () => {
      input.removeEventListener("beforeinput", beforeInput);
      input.removeEventListener("input", update);
      input.removeEventListener("click", update);
      input.removeEventListener("keyup", update);
      input.removeEventListener("scroll", update);
      input.removeEventListener("keydown", keydown, true);
      input.removeAttribute("aria-controls");
      input.removeAttribute("aria-autocomplete");
      input.removeAttribute("aria-expanded");
    };
  }, [textareaRef, disabled, composerId, matching, query, listId]);
  useEffect(
    () =>
      registerMentionController(composerId, {
        insert(candidateId) {
          const input = textareaRef.current;
          const candidate = candidates.find((value) => value.id === candidateId);
          const current = input ? mentionQuery(input.value, input.selectionStart) : null;
          if (!input || !candidate || !current || disabled)
            throw new Error("This source choice is no longer available.");
          const next = insertMention(
            readMentionDraft(composerId, input.value),
            current,
            candidate.label,
            candidate.ref,
          );
          writeMentionDraft(composerId, next);
          onChange(next.text);
          setQuery(null);
          input.setAttribute("aria-expanded", "false");
          requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(
              current.start + candidate.label.length + 2,
              current.start + candidate.label.length + 2,
            );
          });
        },
        remove(tokenStart) {
          const input = textareaRef.current;
          if (!input || disabled) throw new Error("This composer is unavailable.");
          const draft = readMentionDraft(composerId, input.value);
          const token = draft.tokens.find((value) => value.start === tokenStart);
          if (!token) throw new Error("This source token has changed.");
          const end = input.value[token.end] === " " ? token.end + 1 : token.end;
          const next = spliceMentionDraft(draft, token.start, end, "");
          writeMentionDraft(composerId, next);
          onChange(next.text);
          repaint((value) => value + 1);
          requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(token.start, token.start);
          });
        },
      }),
    [composerId, textareaRef, onChange, disabled, candidates],
  );
  return (
    <>
      {draft.tokens.length > 0 && (
        <div className="conversation-browser-sources mention-chips" aria-label="Mentioned sources">
          {draft.tokens.map((token) => {
            const status = mentionChipStatus(token.ref, pages);
            return (
              <span
                key={token.start}
                className={status === "Available" ? "" : "stale"}
                title={token.ref.kind === "tab" ? token.ref.url : token.ref.kind}
              >
                {shellIconGlobe}
                <span>{token.text}</span>
                {status !== "Available" && <small>{status}</small>}
                <button
                  {...auxNativeButtonTypeProps}
                  disabled={disabled}
                  data-command-id="mention-remove"
                  aria-label={`Remove ${token.text}`}
                  onClick={() =>
                    void executeCommand("mention-remove", {
                      payload: { composerId, tokenStart: token.start },
                    }).catch(errToast)
                  }
                >
                  {shellIconClose}
                </button>
              </span>
            );
          })}
        </div>
      )}
      {query &&
        createPortal(
          <div className="mention-popup" style={{ left: anchor.left, top: anchor.top }}>
            <div
              id={listId}
              ref={rows}
              role="listbox"
              tabIndex={-1}
              aria-label="Mention a source"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  dismissed.current = `${query.start}:${query.end}:${query.query}`;
                  setQuery(null);
                  textareaRef.current?.focus();
                } else moveListFocus(event, '[role="option"]');
              }}
            >
              {(["Tabs", "Folders and groups", "Spaces", "Skills", "Connectors"] as const).map((section) => {
                const items = matching.filter((candidate) => candidate.section === section);
                return items.length ? (
                  <fieldset key={section} aria-label={section}>
                    <legend>{section}</legend>
                    {items.map((candidate) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        key={candidate.id}
                        data-command-id="mention-insert"
                        disabled={draft.tokens.length >= 16}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                          void executeCommand("mention-insert", {
                            payload: { composerId, candidateId: candidate.id },
                          }).catch(errToast)
                        }
                      >
                        <span>{candidate.label}</span>
                        <small>{candidate.detail}</small>
                      </button>
                    ))}
                  </fieldset>
                ) : null;
              })}
              {!matching.length && <p>No matching sources.</p>}
            </div>
            {draft.tokens.length >= 16 && <output>A message can mention up to 16 sources.</output>}
            {error && <output>{error}</output>}
            <p>Other Profiles' tabs aren't available here</p>
          </div>,
          document.body,
        )}
    </>
  );
}
