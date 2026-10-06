import { memo, useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { availableConversationPage } from "../conversation-page";
import { executeCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
import { sourceRef, sourceStatus } from "../browser-context-sources";
import { useShortcutLabel, withShortcut } from "../use-shortcut-label";
import type { PageTarget } from "@aux/contracts";
import { useStore, errToast } from "../store";
import { hostOf } from "../workspace";
import { Popover } from "../ui/popover";
import { shellIconCheck, shellIconDown, shellIconGlobe } from "./icons";
import "./ContextPicker.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

const availablePage = availableConversationPage;

function ContextChoice({
  choice,
  page,
  currentPage,
  disabled = false,
  selected,
  title,
  children,
  onSelect,
}: {
  choice: string;
  page?: PageTarget;
  currentPage?(): PageTarget | undefined;
  disabled?: boolean;
  selected: boolean;
  title: string;
  children: ReactNode;
  onSelect(value: string): void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const shortcut = useShortcutLabel("select-browser-context");
  useLayoutEffect(() => {
    const element = button.current;
    if (!element || disabled) return;
    const original = page ? sourceRef(page) : undefined;
    return registerScopedControl(element, "select-browser-context", choice, () => {
      if (original) {
        const current = currentPage?.();
        if (!current || !availablePage(current) || sourceStatus(original, [current]) !== "current")
          throw new Error("This browser context changed. Choose its current tab again.");
      } else if (choice !== "none") throw new Error("This browser context is unavailable.");
      return onSelect(choice);
    });
  }, [choice, page, currentPage, disabled, onSelect]);
  return (
    <button
      ref={button}
      {...auxNativeButtonTypeProps}
      className="context-choice"
      disabled={disabled}
      data-command-id="select-browser-context"
      title={withShortcut(title, shortcut)}
      aria-pressed={selected}
      onClick={(event) => {
        void executeCommand("select-browser-context", {
          payload: { pageId: choice },
          nativeInputEvent: event.nativeEvent,
        }).catch(errToast);
      }}
    >
      {children}
      {selected && shellIconCheck}
    </button>
  );
}

const BrowserContextChoice = memo(function BrowserContextChoice({
  pageId,
  value,
  onSelect,
  disabled,
}: {
  pageId: string;
  value: string;
  onSelect(value: string): void;
  disabled: boolean;
}) {
  const page = useStore((state) => state.pages.find((item) => item.pageId === pageId && availablePage(item)));
  if (!page) return null;
  return (
    <ContextChoice
      choice={pageId}
      page={page}
      currentPage={() => useStore.getState().pages.find((item) => item.pageId === pageId)}
      title={page.title ? `${page.title}\n${page.url}` : page.url}
      disabled={disabled}
      selected={value === pageId}
      onSelect={onSelect}
    >
      <span>
        <strong>{page.title || page.url}</strong>
        <small>{hostOf(page.url)}</small>
      </span>
    </ContextChoice>
  );
});

export function BrowserContextPicker({
  value,
  onChange,
  linkedPageId,
  disabled = false,
  allowNew = true,
}: {
  value: string;
  onChange(value: string): void;
  linkedPageId?: string;
  disabled?: boolean;
  allowNew?: boolean;
}) {
  const activePageId = useStore((state) => state.activePageId);
  const [query, setQuery] = useState("");
  const active = useStore((state) =>
    state.pages.find((page) => page.pageId === activePageId && availablePage(page)),
  );
  const linked = useStore((state) =>
    state.pages.find((page) => page.pageId === linkedPageId && availablePage(page)),
  );
  const chosen = useStore((state) =>
    state.pages.find((page) => page.pageId === value && availablePage(page)),
  );
  const label =
    value === "none"
      ? allowNew
        ? "Add browser context"
        : "Choose a browser tab"
      : value === "active"
        ? active
          ? `Current tab: ${active.title || active.url}`
          : "Current tab: no website"
        : value === "linked"
          ? linked
            ? `Conversation tab: ${linked.title || linked.url}`
            : "Conversation tab unavailable"
          : chosen?.title || chosen?.url || "Selected tab unavailable — choose another";
  const matches = useStore(
    useShallow((state) =>
      state.pages
        .filter(
          (page) =>
            availablePage(page) &&
            `${page.title} ${page.url}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
        )
        .map((page) => page.pageId),
    ),
  );
  return (
    <Popover
      label="Browser context"
      disabled={disabled}
      className="browser-context-trigger"
      trigger={
        <>
          {shellIconGlobe}
          <span title={label}>{label}</span>
          {shellIconDown}
        </>
      }
    >
      {(close) => {
        const select = (next: string) => {
          onChange(next);
          setQuery("");
          close();
        };
        const choice = (key: string, title: string, subtitle?: string, unavailable = false) => (
          <ContextChoice
            key={key}
            choice={key}
            page={key === "active" ? active : key === "linked" ? linked : undefined}
            currentPage={() => {
              const state = useStore.getState();
              const pageId = key === "active" ? state.activePageId : linkedPageId;
              return state.pages.find((page) => page.pageId === pageId);
            }}
            disabled={disabled || unavailable}
            title={subtitle ? `${title}\n${subtitle}` : title}
            selected={value === key}
            onSelect={select}
          >
            <span>
              <strong>{title}</strong>
              {subtitle && <small>{subtitle}</small>}
            </span>
          </ContextChoice>
        );
        return (
          <>
            <input
              type="search"
              autoComplete="off"
              aria-label="Find browser context"
              placeholder="Find a tab…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {!query && (
              <>
                {allowNew && choice("none", "No browser context", "Chat without attaching a tab")}
                {choice("active", "Current tab", active?.title || "No website open", !active)}
                {(linked || value === "linked") &&
                  choice("linked", "Conversation tab", linked?.title || "Unavailable", !linked)}
              </>
            )}
            <section className="context-picker-group" aria-label="Open browser tabs">
              <p>Open tabs</p>
              {matches.map((pageId) => (
                <BrowserContextChoice
                  key={pageId}
                  pageId={pageId}
                  value={value}
                  onSelect={select}
                  disabled={disabled}
                />
              ))}
              {!matches.length && <p>No matching available tabs.</p>}
            </section>
          </>
        );
      }}
    </Popover>
  );
}
