// The Agent in the Agent extension (docs/plans/2026-10-28-agent-model.md): one shared store
// for the agent profile, its avatar, the side panel title and greeting, the setup and
// customize sheet, and the Settings section. Built only from the supplied components and
// tokens; scripts/release/transforms.mjs copies this file to dist/assets/ and wires it in.
import {A as interop, C as cx, E as requireReact, w as requireJsx} from "./browser-color-scheme-Df5VSuPV.js";
import {Kt as useAccount, Wt as AccountProvider, cn as Input} from "./strip-markdown-DRcmtuJc.js";
import {g as trpc, i as readAccount} from "./queries-ldd77hNk.js";
import {t as Button} from "./button-82u7k4S8.js";
import {t as Textarea} from "./textarea-5TASg52t.js";
import {t as Tooltip} from "./simple-tooltip-CHhnBkHz.js";
import {a as openExtensionPage, i as isSidepanel} from "./extension-page-url-BH3pfT7h.js";
import {a as SettingText, c as SettingSection, i as SettingRow, l as SettingGroup, n as SettingControl} from "./-layouts-CcApOQbE.js";
import {n as useAgentSettings} from "./use-agent-settings-DiedG0R1.js";

const React = interop(requireReact(), 1);
const j = requireJsx();
const {useCallback, useEffect, useRef, useState, useSyncExternalStore} = React;

const GETTING_READY = "Getting your agent ready…";
const DEFAULT = Object.freeze({name: "Aux", homeSessionId: null, avatarRevision: "", setupCompleted: true, isDefault: true});
const NAME_KEY = "aux.agent.name.v1";
// Dispatched on the side panel's window when the agent button is clicked: back to the home thread.
const HOME_EVENT = "aux-agent-home";
// The command bar's question for this window's panel, and how long it waits to be picked up.
const PENDING_ASK_KEY = "aux.agent.pendingAsk.v1";
const PENDING_ASK_MS = 15000;
// ---------------------------------------------------------------------------------- store

const stores = new Map();
let sideChatDraft = false;

function readStoredName() {
  try { return localStorage.getItem(NAME_KEY) || DEFAULT.name; } catch { return DEFAULT.name; }
}
let lastName = readStoredName();

function storeFor(accountId) {
  let store = stores.get(accountId);
  if (!store) {
    store = {accountId, snapshot: {agent: {...DEFAULT, name: lastName, setupCompleted: true}, avatarUrl: null, ready: false},
      listeners: new Set(), pending: null, stop: null};
    stores.set(accountId, store);
  }
  return store;
}

const nameListeners = new Set();
function publish(store, patch) {
  store.snapshot = {...store.snapshot, ...patch};
  if (store.snapshot.agent.name !== lastName) {
    lastName = store.snapshot.agent.name;
    try { localStorage.setItem(NAME_KEY, lastName); } catch {}
    for (const listener of nameListeners) listener();
  }
  for (const listener of store.listeners) listener();
}
const subscribeName = listener => { nameListeners.add(listener); return () => nameListeners.delete(listener); };

async function load(store, agent) {
  const next = agent ?? await trpc.settings.agentGet.query({accountId: store.accountId});
  let avatarUrl = store.snapshot.avatarUrl;
  if (!next.avatarRevision) avatarUrl = null;
  else if (next.avatarRevision !== store.snapshot.agent.avatarRevision || !avatarUrl)
    avatarUrl = (await trpc.settings.agentAvatar.query({accountId: store.accountId, revision: next.avatarRevision})).dataUrl;
  publish(store, {agent: next, avatarUrl, ready: true});
  return next;
}

function refresh(store) {
  store.pending ??= load(store).then(
    () => { if (store.snapshot.unreachable) publish(store, {unreachable: false}); },
    () => publish(store, {ready: true, unreachable: true}),
  ).finally(() => { store.pending = null; });
  return store.pending;
}

/** Asks the browser to start a failed daemon now, where it can; the next load says how it went. */
const retryDaemon = () => { try { globalThis.chrome?.auxBrowserPreferences?.retryDaemon?.()?.catch?.(() => {}); } catch {} };

/** Loads now, then again on focus and every 15 s while visible, so edits from Settings or
 * another window show up everywhere. Returns the stop function. */
function watch(store) {
  refresh(store);
  const onFocus = () => refresh(store);
  const timer = setInterval(() => document.visibilityState === "visible" && refresh(store), 15000);
  window.addEventListener("focus", onFocus);
  return () => { clearInterval(timer); window.removeEventListener("focus", onFocus); };
}

/** The agent for the current account, kept fresh while any view shows it. */
export const useAuxAgent = () => useAgentFor(useAccount().accountId);

function useAgentFor(accountId) {
  const store = storeFor(accountId);
  const subscribe = useCallback(listener => {
    store.listeners.add(listener);
    if (!store.stop) store.stop = watch(store);
    return () => {
      store.listeners.delete(listener);
      if (!store.listeners.size) { store.stop(); store.stop = null; }
    };
  }, [store]);
  const snapshot = useSyncExternalStore(subscribe, () => store.snapshot);
  const call = useCallback(async (procedure, input) => load(store, await trpc.settings[procedure].mutate({accountId, ...input})), [store, accountId]);
  return {...snapshot, accountId, call, refresh: () => refresh(store), tryAgain: () => { retryDaemon(); return refresh(store); }};
}

/** The composer's empty-text hint, following renames; `explicit` (a caller's own hint) wins.
 * A hook, so call sites call it on every render, never behind `??`. */
export function useAuxAgentPlaceholder(explicit) {
  const name = useSyncExternalStore(subscribeName, () => lastName);
  return explicit ?? `Message ${name}, @ for context`;
}
export const auxAgentAsk = () => `Ask ${lastName}`;
/** Whether an empty panel is a side chat draft rather than the home thread. Every view
 * that reads it re-renders when it changes, even if the route stays the same. */
function setSideChatDraft(value) {
  if (sideChatDraft === value) return;
  sideChatDraft = value;
  for (const store of stores.values()) publish(store, {sideChatDraft: value});
}
/** "+" in the side panel opens a side chat draft instead of the home thread. */
export function auxAgentStartSideChat() { setSideChatDraft(true); }
/** The chat menu's filters. Side chats start in the side panel or the full view; routines,
 * channels and New Tab carry their own trigger. */
const CHAT_FILTERS = [
  {id: "side", label: "Side chats", empty: "No side chats yet", matches: ({trigger}) => !trigger || trigger.type === "user" && trigger.source === "sidepanel"},
  {id: "routines", label: "Routines", empty: "No routine chats yet", matches: ({trigger}) => trigger?.type === "routine" || trigger?.type === "standalone-routine"},
  {id: "channels", label: "Channels", empty: "No channel chats yet", matches: ({trigger}) => trigger?.type === "channel"},
  {id: "new-tab", label: "New Tab", empty: "No New Tab chats yet", matches: ({trigger}) => trigger?.type === "user" && trigger.source === "new-tab"},
];
const chatFilter = id => CHAT_FILTERS.find(filter => filter.id === id) ?? CHAT_FILTERS[0];
/** Chat menu rows under a filter, without the home thread, which the title represents. */
export function auxAgentChats(rows, filter) {
  const home = [...stores.values()].map(store => store.snapshot.agent.homeSessionId).filter(Boolean);
  return rows.filter(row => chatFilter(filter).matches(row) && !home.includes(row.id));
}
export const auxAgentChatsEmpty = filter => chatFilter(filter).empty;
/** The session list's options for a filter: routine chats are left out unless asked for. */
export const auxAgentChatsQuery = filter => filter === "routines" ? {routines: "include"} : {};
/** The row of filters at the top of the chat menu. */
export const AuxAgentChatFilters = ({value, onChange}) => j.jsx("div", {role: "radiogroup", "aria-label": "Show chats", className: "flex flex-wrap gap-1 px-1 pt-1 pb-1.5",
  children: CHAT_FILTERS.map(({id, label}) => j.jsx("button", {type: "button", role: "radio", "aria-checked": value === id, onClick: () => onChange(id),
    className: cx("rounded-full px-2 py-0.5 text-xs font-medium transition-colors", value === id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-muted"),
    children: label}, id))});

// --------------------------------------------------------------------------------- avatar

// The canonical arch mark (assets/brand/arch-mark.svg) in its 80-unit box. The native sidebar
// button draws the same mark (kAuxNewTabMarkIcon), so the two stay one logo.
const MARK = ["m40.02 10.25c-17.45 0-31.34 15.33-31.34 33.27v21c0 2.47 2.51 3.44 4.6 2.1 7.21-5.48 11.98-15.6 11.98-25.54v-0.81c0-8.41 6.94-14.73 14.73-14.73 7.8 0 14.7 6.69 14.7 14.73v0.81c0 10.31 4.89 20.08 11.99 25.53 2.07 1.38 4.56 0.39 4.56-2l-0.15-20.46c0-19.06-13.61-33.9-31.07-33.9z",
  "m50.38 52.49-7.44-12.09c-0.62-1.08-1.79-1.67-2.99-1.67s-2.37 0.71-3.01 1.77l-7.35 12.02c-0.7 1.2-0.35 2.87 0.84 3.79 1.14 0.8 2.74 0.5 3.78-0.38 1.87-1.62 3.73-2.8 5.71-2.8 2.11 0 4.07 1.24 5.88 2.8 1.09 0.88 2.57 1.18 3.78 0.43 1.24-0.81 1.5-2.56 0.8-3.87z"];
// Classic is the mark in the theme's text color (no picture: every surface draws it); the
// others are the mark in a color, rendered to a transparent picture.
const LOOKS = [
  {id: "classic", label: "Classic"},
  {id: "ocean", label: "Ocean", fill: ["#60a5fa", "#2563eb"]},
  {id: "iris", label: "Iris", fill: ["#a78bfa", "#7c3aed"]},
  {id: "aurora", label: "Aurora", fill: ["#a78bfa", "#22d3ee"]},
  {id: "sunset", label: "Sunset", fill: ["#fbbf24", "#f43f5e"]},
];
const DEFAULT_LOOK = LOOKS[0];

const Mark = ({size}) => j.jsx("svg", {viewBox: "0 0 80 80", width: size, height: size, "aria-hidden": true, focusable: "false",
  children: MARK.map(d => j.jsx("path", {d, fill: "currentColor"}, d))});

const canvas = () => { const c = document.createElement("canvas"); c.width = c.height = 256; return [c, c.getContext("2d")]; };

function renderLook(look) {
  const [c, g] = canvas();
  // The mark's box in its viewBox is about 63 × 57, centered near (40, 39). Pictures are shown
  // as circles, so the mark fills about three quarters of the width (the size Classic draws at)
  // and its feet stay inside the circle.
  const path = new Path2D(), matrix = new DOMMatrix().translate(128, 128).scale(3.05).translate(-40, -39);
  for (const d of MARK) path.addPath(new Path2D(d), matrix);
  const [from, to] = look.fill, fill = g.createLinearGradient(40, 216, 216, 40);
  fill.addColorStop(0, from);
  fill.addColorStop(1, to);
  g.fillStyle = fill;
  g.fill(path);
  return c.toDataURL("image/png");
}

let lookImages;
const looks = () => (lookImages ??= LOOKS.map(look => ({...look, image: look.fill ? renderLook(look) : null})));

/** The agent's face: its picture, or the Aux mark in the theme's text color. */
export function AuxAgentAvatar({size = 20, src, className}) {
  const agent = useAuxAgent();
  const url = src === undefined ? agent.avatarUrl : src;
  return url
    ? j.jsx("img", {src: url, alt: "", width: size, height: size, draggable: false, className: cx("shrink-0 rounded-full object-cover", className), style: {width: size, height: size}})
    : j.jsx("span", {className: cx("text-foreground flex shrink-0 items-center justify-center", className), style: {width: size, height: size}, children: j.jsx(Mark, {size: Math.round(size * 0.9)})});
}

function renderPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), image = new Image();
    image.onload = () => {
      const [c, g] = canvas(), side = Math.min(image.width, image.height);
      g.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/png"));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(Error("That image could not be opened.")); };
    image.src = url;
  });
}

/** Opens an Agent page: in place inside the full view, in a new tab from the side panel. */
function openPage(accountId, page) {
  const path = `/u/${accountId}/${page}`;
  if (isSidepanel()) openExtensionPage(path);
  else window.location.hash = path;
}

// ---------------------------------------------------------------------------------- editor

const Label = ({children, htmlFor}) => j.jsx(htmlFor ? "label" : "span", {htmlFor, className: "text-muted-foreground text-xs font-medium", children});

/** Name and look. The agent works on request, so there is no style or initiative to set: what it
 * does unasked comes from routines (see RoutinesHint). */
function AgentFields({draft, setDraft, error, centered = false}) {
  const fileRef = useRef(null);
  const set = patch => setDraft(current => ({...current, ...patch}));
  // A selected look wears a ring with a gap, like a color picker.
  const tile = (key, selected, onClick, child, title) => j.jsx("button", {type: "button", title, "aria-label": title, "aria-pressed": selected, onClick,
    className: "flex size-10 items-center justify-center rounded-full",
    style: {boxShadow: selected ? "0 0 0 2px var(--background), 0 0 0 4px var(--foreground)" : undefined}, children: child}, key);

  return j.jsxs("div", {className: "flex min-w-0 flex-col gap-5", children: [
    j.jsxs("div", {className: cx("flex min-w-0 gap-3", centered ? "flex-col items-center" : "items-center"), children: [
      j.jsx(AuxAgentAvatar, {size: centered ? 72 : 52, src: draft.avatar}),
      j.jsxs("div", {className: cx("flex min-w-0 flex-col gap-1.5", centered ? "w-full items-stretch" : "flex-1"), children: [
        j.jsx(Label, {htmlFor: "aux-agent-name", children: "Name"}),
        j.jsx(Input, {id: "aux-agent-name", value: draft.name, maxLength: 32, autoComplete: "off", spellCheck: false,
          onChange: event => set({name: event.target.value})}),
      ]}),
    ]}),
    j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
      j.jsx(Label, {children: "Look"}),
      j.jsxs("div", {className: "flex flex-wrap gap-2.5", children: [
        ...looks().map(look => tile(look.id, draft.look === look.id, () => set({look: look.id, avatar: look.image}),
          j.jsx("span", {className: "size-8 rounded-full", style: {background: look.fill ? `linear-gradient(45deg, ${look.fill.join(", ")})` : "var(--foreground)"}}), look.label)),
        tile("custom", draft.look === "custom", () => fileRef.current?.click(),
          draft.look === "custom" && draft.avatar
            ? j.jsx("img", {src: draft.avatar, alt: "", className: "size-8 rounded-full object-cover", draggable: false})
            : j.jsx("span", {className: "border-border text-muted-foreground flex size-8 items-center justify-center rounded-full border text-base leading-none", children: "+"}),
          "Your own picture"),
        j.jsx("input", {ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/heic", hidden: true, onChange: async event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try { set({look: "custom", avatar: await renderPhoto(file), error: null}); } catch (problem) { set({error: problem.message}); }
        }}),
      ]}),
    ]}),
    (error || draft.error) && j.jsx("p", {className: "text-destructive text-xs", role: "alert", children: error || draft.error}),
  ]});
}

/** The look a saved picture came from: one of the mark's colors, or the user's own picture. */
const lookOf = avatarUrl => !avatarUrl ? DEFAULT_LOOK.id : looks().find(look => look.image === avatarUrl)?.id ?? "custom";

const draftFrom = (agent, avatarUrl) => ({name: agent.name, look: lookOf(avatarUrl), avatar: avatarUrl, error: null});
const draftChanged = (draft, original) => draft.name !== original.name || draft.avatar !== original.avatar;

async function saveDraft(agent, draft, original) {
  const name = draft.name.trim() || DEFAULT.name;
  if (name !== original.agent.name || !original.agent.setupCompleted)
    await agent.call("agentUpdate", {name, setupCompleted: true});
  if (draft.avatar !== original.avatarUrl)
    await (draft.avatar ? agent.call("agentSetAvatar", {dataUrl: draft.avatar}) : agent.call("agentClearAvatar", {}));
}

// AGENTS.md starts with a seeded heading and comment ("# Agent Rules", "<!-- … -->"). People
// see and edit only what follows; the preamble is written back as it was.
const PREAMBLE = /^(?:\s*#[^\n]*\n|\s*<!--[\s\S]*?-->[^\S\n]*\n?)*\s*/;
const DEFAULT_PREAMBLE = "# Agent Rules\n\n";

/** AGENTS.md, the instructions the agent reads before every conversation; read while enabled.
 * Until a read succeeds the text is null, so nothing can be edited or saved over the file. */
function useInstructions(accountId, enabled = true) {
  const [text, setText] = useState(null);
  const [saved, setSaved] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const preamble = useRef(DEFAULT_PREAMBLE);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setFailed(false);
    trpc.settings.readContextFile.query({accountId, fileName: "AGENTS.md"}).then(({content}) => {
      if (!live) return;
      const head = PREAMBLE.exec(content)?.[0] ?? "";
      preamble.current = head.trim() ? `${head.trimEnd()}\n\n` : DEFAULT_PREAMBLE;
      const body = content.slice(head.length).trimEnd();
      setText(body);
      setSaved(body);
    }, () => live && (setText(null), setSaved(null), setFailed(true)));
    return () => { live = false; };
  }, [accountId, enabled, attempt]);
  const save = async () => {
    if (text === null || text === saved) return;
    const body = text.trim();
    await trpc.settings.writeContextFile.mutate({accountId, fileName: "AGENTS.md", content: `${preamble.current}${body}${body ? "\n" : ""}`});
    setSaved(text);
  };
  return {text, setText, saved, failed, retry: () => setAttempt(count => count + 1),
    dirty: text !== null && text !== saved, save, discard: () => setText(saved)};
}

const InstructionsBox = ({instructions, name}) => instructions.failed
  ? j.jsxs("div", {className: "flex items-center justify-between gap-2", role: "alert", children: [
    j.jsx("p", {className: "text-muted-foreground text-sm", children: "Couldn't load instructions."}),
    j.jsx(Button, {variant: "outline", size: "sm", onClick: instructions.retry, children: "Retry"}),
  ]})
  : j.jsx(Textarea, {value: instructions.text ?? "", disabled: instructions.text === null, rows: 4,
    className: "text-sm", placeholder: `Anything ${name} should always keep in mind. "Show prices in USD." "I prefer primary sources."`,
    onChange: event => instructions.setText(event.target.value)});

/** Where initiative lives: routines, not a personality dial. */
const RoutinesHint = ({accountId, name}) => j.jsxs("p", {className: "text-muted-foreground text-xs", children: [
  `${name} works when you ask. To have it check in or run something on a schedule, `,
  j.jsx("button", {type: "button", className: "text-foreground underline underline-offset-2", onClick: () => openPage(accountId, "settings/routines"), children: "set up a routine"}),
  "."]});

/** Customize the agent, filling the side panel; with setup, the first-run "Meet your agent". */
export function AuxAgentSheet({open, onOpenChange, setup = false}) {
  const agent = useAuxAgent();
  const instructions = useInstructions(agent.accountId, open && !setup);
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => { if (open) { setDraft(draftFrom(agent.agent, agent.avatarUrl)); setError(null); setConfirming(false); } }, [open]);
  const dirty = draftChanged(draft, draftFrom(agent.agent, agent.avatarUrl)) || instructions.dirty;
  const finish = async save => {
    if (busy) return;
    setBusy(true);
    try {
      if (save) {
        await saveDraft(agent, draft, {agent: agent.agent, avatarUrl: agent.avatarUrl});
        if (!setup) await instructions.save();
      } else if (setup) await agent.call("agentUpdate", {setupCompleted: true});
      onOpenChange(false);
    } catch (problem) { setError(problem?.message ?? "Could not save."); } finally { setBusy(false); }
  };
  // Escape never counts as Skip: in Meet it only closes, and the sheet is offered again.
  // In Customize it asks before throwing edits away.
  const escape = () => {
    if (busy) return;
    if (setup) onOpenChange(false);
    else if (confirming) setConfirming(false);
    else if (dirty) setConfirming(true);
    else finish(false);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = event => event.key === "Escape" && escape();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!open) return null;
  const name = draft.name.trim() || DEFAULT.name;
  return j.jsxs("div", {role: "dialog", "aria-modal": true, "aria-labelledby": "aux-agent-sheet-title",
    className: "bg-background text-foreground no-drag flex flex-col", style: {position: "fixed", inset: 0, zIndex: 60}, children: [
    j.jsxs("div", {className: "flex shrink-0 items-start justify-between gap-2 px-5 pt-5 pb-2", children: [
      j.jsxs("div", {className: "flex min-w-0 flex-col gap-1", children: [
        j.jsx("h2", {id: "aux-agent-sheet-title", className: "font-display text-lg font-medium", children: setup ? "Meet your agent" : `Customize ${agent.agent.name}`}),
        j.jsx("p", {className: "text-muted-foreground text-sm", children: setup
          ? `${agent.agent.name} browses and gets things done when you ask, and remembers what matters. Make it yours, or keep the defaults.`
          : "Its name, its look, and anything it should always keep in mind."}),
      ]}),
      j.jsx(Button, {variant: "ghost", size: "icon-sm", shape: "pill", "aria-label": "Close", disabled: busy, onClick: () => finish(false),
        className: "text-muted-foreground shrink-0", children: j.jsx("svg", {viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": true,
          children: j.jsx("path", {d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round"})})}),
    ]}),
    j.jsx("div", {className: "min-h-0 flex-1 overflow-y-auto px-5 py-4", children: j.jsxs("div", {className: "flex min-w-0 flex-col gap-5", children: [
      j.jsx(AgentFields, {draft, setDraft, error, centered: true}),
      !setup && j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
        j.jsx(Label, {children: "Instructions"}),
        j.jsx(InstructionsBox, {instructions, name}),
      ]}),
      j.jsx(RoutinesHint, {accountId: agent.accountId, name}),
    ]})}),
    j.jsxs("div", {className: "flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3", children: confirming ? [
      j.jsx("p", {className: "text-muted-foreground min-w-0 flex-1 text-sm", role: "alert", children: "Discard your changes?"}),
      j.jsx(Button, {variant: "ghost", onClick: () => setConfirming(false), children: "Keep editing"}),
      j.jsx(Button, {disabled: busy, onClick: () => finish(false), children: "Discard"}),
    ] : [
      j.jsx(Button, {variant: "ghost", disabled: busy, onClick: () => finish(false), children: setup ? "Skip" : "Cancel"}),
      j.jsx(Button, {disabled: busy, onClick: () => finish(true), children: setup ? "Done" : "Save"}),
    ]}),
  ]});
}

// ------------------------------------------------------------------------------ side panel

/** Header title: the agent on its home thread; a way back to it from a side chat. menu(label)
 * renders the supplied chat menu, listing side chats, with an optional trigger label. */
export function AuxAgentTitle({sessionId, menu, navigate}) {
  const agent = useAuxAgent();
  const [open, setOpen] = useState(false);
  const home = agent.agent.homeSessionId;
  const onHome = sessionId ? sessionId === home : !sideChatDraft;
  if (onHome) {
    return j.jsxs(j.Fragment, {children: [
      // The name alone: the face already lives in the sidebar button and the greeting.
      j.jsx(Tooltip, {content: `Customize ${agent.agent.name}`, children: j.jsx(Button, {variant: "ghost", size: "sm", className: "no-drag min-w-0 px-2",
        "aria-label": `Customize ${agent.agent.name}`, onClick: () => setOpen(true),
        children: j.jsx("span", {className: "truncate text-sm font-medium", children: agent.agent.name})})}),
      menu("Side chats"),
      j.jsx(AuxAgentSheet, {open, onOpenChange: setOpen}),
    ]});
  }
  const back = () => { setSideChatDraft(false); navigate(home ?? null); };
  return j.jsxs(j.Fragment, {children: [
    j.jsx(Tooltip, {content: `Back to ${agent.agent.name}`, children: j.jsxs(Button, {variant: "ghost", size: "sm", className: "no-drag shrink-0 gap-1 px-1.5",
      "aria-label": `Back to ${agent.agent.name}`, onClick: back, children: [
        j.jsx("svg", {viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": true, className: "text-muted-foreground",
          children: j.jsx("path", {d: "M10 3 5 8l5 5", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round"})}),
        j.jsx("span", {className: "text-muted-foreground text-sm font-medium", children: agent.agent.name}),
      ]})}),
    sessionId ? menu() : j.jsx("span", {className: "text-muted-foreground truncate px-1 text-sm", children: "New side chat"}),
  ]});
}

/** Keeps the side panel on the agent's home thread: an empty panel opens it, the first chat
 * sent from an empty panel becomes it, and a new profile is offered the setup sheet once. */
export function AuxAgentHomeRoute({sessionId, onSessionChange}) {
  const agent = useAuxAgent();
  const {mode} = useAccount();
  const previous = useRef(sessionId);
  const claiming = useRef(false);
  const home = agent.agent.homeSessionId;
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    const before = previous.current;
    previous.current = sessionId;
    if (!agent.ready || mode === "incognito") return;
    if (sessionId && sessionId === home) { setSideChatDraft(false); return; }
    if (!sessionId && home && !sideChatDraft) { onSessionChange(home); return; }
    if (sessionId && !before && !home && !sideChatDraft && !claiming.current) {
      claiming.current = true;
      agent.call("agentSetHome", {sessionId}).catch(() => agent.refresh()).finally(() => { claiming.current = false; });
    }
    if (sessionId && !before && sideChatDraft) setSideChatDraft(false);
  }, [sessionId, home, agent.ready, mode]);

  useEffect(() => {
    if (agent.ready && !agent.agent.setupCompleted && mode !== "incognito") setSetupOpen(true);
  }, [agent.ready, agent.agent.setupCompleted, mode]);

  useEffect(() => {
    if (mode === "incognito") return;
    const goHome = () => { setSideChatDraft(false); onSessionChange(home ?? null); };
    // The background worker relays the agent button's click to every panel; only this window's acts.
    let windowId = null;
    chrome.windows?.getCurrent?.().then(current => { windowId = current.id; }, () => {});
    const relay = message => { if (message?.type === HOME_EVENT && message.windowId === windowId) goHome(); };
    window.addEventListener(HOME_EVENT, goHome);
    chrome.runtime?.onMessage?.addListener(relay);
    return () => { window.removeEventListener(HOME_EVENT, goHome); chrome.runtime?.onMessage?.removeListener(relay); };
  }, [home, mode, onSessionChange]);

  // A question asked from the command bar (aux-palette-ask.mjs) goes to the home thread. With no
  // home thread yet, it opens in the New Tab composer, as it did before the panel took it.
  useEffect(() => {
    if (!agent.ready || mode === "incognito" || !chrome.storage?.session) return;
    let alive = true;
    const take = async () => {
      const [current, stored] = await Promise.all([chrome.windows.getCurrent(), chrome.storage.session.get(PENDING_ASK_KEY)]);
      const ask = stored[PENDING_ASK_KEY];
      if (!alive || !ask || ask.windowId !== current.id) return;
      await chrome.storage.session.remove(PENDING_ASK_KEY);
      if (Date.now() - ask.at > PENDING_ASK_MS || typeof ask.text !== "string" || !ask.text.trim()) return;
      if (!home) {
        const url = new URL(chrome.runtime.getURL("newtab.html"));
        url.searchParams.set("mode", "ask"); url.searchParams.set("q", ask.text);
        await chrome.tabs.create({windowId: current.id, url: url.href});
        return;
      }
      setSideChatDraft(false); onSessionChange(home);
      await trpc.sessions.queue.mutate({accountId: agent.accountId, sessionId: home, prompt: ask.text});
    };
    const changed = (changes, area) => { if (area === "session" && changes[PENDING_ASK_KEY]?.newValue) take().catch(() => {}); };
    take().catch(() => {});
    chrome.storage.onChanged.addListener(changed);
    return () => { alive = false; chrome.storage.onChanged.removeListener(changed); };
  }, [agent.ready, agent.accountId, home, mode, onSessionChange]);

  return j.jsx(AuxAgentSheet, {setup: true, open: setupOpen, onOpenChange: setSetupOpen});
}

/** An empty conversation, in place of the supplied faint logo: who you are talking to, or,
 * with no model to answer, the way to connect one. */
export function AuxAgentEmptyState() {
  const agent = useAuxAgent();
  const {availableModels, isLoading} = useAgentSettings();
  const name = agent.agent.name;
  const unconnected = !isLoading && !availableModels.length;
  if (agent.unreachable) return j.jsxs("div", {role: "alert", className: "flex max-w-xs flex-col items-center gap-2.5 text-center", children: [
    j.jsx(AuxAgentAvatar, {size: 44}),
    j.jsx("div", {className: "font-display text-foreground text-lg font-medium", children: `${name} couldn’t start`}),
    j.jsx(Button, {variant: "outline", size: "sm", onClick: agent.tryAgain, children: "Try again"}),
  ]});
  if (!agent.ready) return j.jsx("div", {role: "status", className: "text-muted-foreground text-sm", children: GETTING_READY});
  return j.jsxs("div", {className: "flex max-w-xs flex-col items-center gap-2.5 text-center", children: [
    j.jsx(AuxAgentAvatar, {size: 44}),
    j.jsx("div", {className: "font-display text-foreground text-lg font-medium", children: sideChatDraft ? "New side chat" : `Hi, I'm ${name}`}),
    j.jsx("div", {className: "text-muted-foreground text-sm", children: unconnected ? "Connect a model to start."
      : sideChatDraft ? `Starts fresh. ${name} still remembers what matters.`
      : "Ask me anything, or tell me what to get done on the web. I'll remember what matters."}),
    unconnected && j.jsx(Button, {variant: "outline", size: "sm", onClick: () => openPage(agent.accountId, "settings/model"), children: "Open Models"}),
  ]});
}

// -------------------------------------------------------------------------------- settings

/** Settings › Agents: the agent itself, above the supplied chat settings. */
export function AuxAgentSettings() {
  const agent = useAuxAgent();
  const instructions = useInstructions(agent.accountId);
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  useEffect(() => { if (agent.ready && !loaded.current) { loaded.current = true; setDraft(draftFrom(agent.agent, agent.avatarUrl)); } }, [agent.ready]);
  const original = draftFrom(agent.agent, agent.avatarUrl);
  const dirty = draftChanged(draft, original);
  const run = async action => {
    setBusy(true);
    setError(null);
    try { await action(); } catch (problem) { setError(problem?.message ?? "Could not save."); } finally { setBusy(false); }
  };
  const name = agent.agent.name;
  const saveRow = (show, onDiscard, onSave) => show && j.jsx(SettingRow, {children: j.jsxs(SettingControl, {className: "ml-auto flex gap-1", children: [
    j.jsx(Button, {variant: "ghost", size: "sm", disabled: busy, onClick: onDiscard, children: "Discard"}),
    j.jsx(Button, {size: "sm", disabled: busy, onClick: onSave, children: "Save"}),
  ]})});
  const link = (title, description, label, page) => j.jsxs(SettingRow, {children: [
    j.jsx(SettingText, {title, description}),
    j.jsx(SettingControl, {children: j.jsx(Button, {variant: "outline", size: "sm", onClick: () => openPage(agent.accountId, page), children: label})}),
  ]});
  return j.jsxs(SettingSection, {title: "Your agent", children: [
    agent.unreachable && j.jsx(SettingGroup, {children: j.jsxs(SettingRow, {role: "alert", children: [
      j.jsx(SettingText, {title: `${name} couldn’t start`, description: "Changes here wait until it’s running again."}),
      j.jsx(SettingControl, {children: j.jsx(Button, {variant: "outline", size: "sm", onClick: agent.tryAgain, children: "Try again"})}),
    ]})}),
    j.jsxs(SettingGroup, {children: [
      j.jsx(SettingRow, {className: "block", children: j.jsx(AgentFields, {draft, setDraft, error})}),
      saveRow(dirty, () => setDraft(original), () => run(() => saveDraft(agent, draft, {agent: agent.agent, avatarUrl: agent.avatarUrl}))),
    ]}),
    j.jsxs(SettingGroup, {children: [
      j.jsxs(SettingRow, {className: "flex-col items-stretch gap-2", children: [
        j.jsx(SettingText, {title: "Instructions", description: `${name} reads these before every conversation.`}),
        j.jsx(InstructionsBox, {instructions, name}),
      ]}),
      saveRow(instructions.dirty, instructions.discard, () => run(instructions.save)),
    ]}),
    j.jsxs(SettingGroup, {children: [
      link("Memory", `What ${name} remembers about you, and how to change it.`, "Open", "settings/memories"),
      link("Routines", `${name} works when you ask. Routines let it check in or run tasks on a schedule.`, "Set up", "settings/routines"),
    ]}),
  ]});
}

// ------------------------------------------------------------------------------ onboarding

/** Onboarding's Make it yours: the name and look, inline. Works before the daemon is ready: it
 * says so, and the fields arrive on their own. Every change saves, so Next never loses one. */
export function AuxAgentSetup() {
  const [accountId, setAccountId] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    const started = Date.now();
    const look = async () => {
      try {
        const account = await readAccount();
        if (live) setAccountId(account.accountId);
      } catch {
        if (!live) return;
        if (Date.now() - started >= SETUP_WAIT_MS) setFailed(true);
        else setTimeout(look, 2000);
      }
    };
    setFailed(false);
    look();
    return () => { live = false; };
  }, [attempt]);
  // Onboarding runs outside the app shell, and the model picker reads the account from context.
  if (accountId !== null) return j.jsx(AccountProvider, {
    value: {accountId, browserProfile: null, mode: "default"},
    children: j.jsx(AgentSetupFields, {accountId}),
  });
  if (!failed) return j.jsx("p", {role: "status", className: "text-muted-foreground text-sm", children: GETTING_READY});
  return j.jsxs("div", {role: "alert", className: "flex items-center gap-3", children: [
    j.jsx("p", {className: "text-muted-foreground text-sm", children: "Your agent couldn’t start. You can name it later in the agent panel."}),
    j.jsx(Button, {variant: "outline", size: "sm", onClick: () => { retryDaemon(); setAttempt(count => count + 1); }, children: "Try again"}),
  ]});
}
const SETUP_WAIT_MS = 60000;

function AgentSetupFields({accountId}) {
  const agent = useAgentFor(accountId);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const saved = useRef(null);
  useEffect(() => {
    if (!agent.ready || draft) return;
    setDraft(draftFrom(agent.agent, agent.avatarUrl));
    saved.current = {agent: agent.agent, avatarUrl: agent.avatarUrl};
    // This step is the setup sheet: the panel doesn't need to offer it again.
    if (!agent.agent.setupCompleted) agent.call("agentUpdate", {setupCompleted: true}).catch(() => {});
  }, [agent.ready]);
  useEffect(() => {
    if (!draft || !saved.current || !draftChanged(draft, draftFrom(saved.current.agent, saved.current.avatarUrl))) return;
    const timer = setTimeout(() => saveDraft(agent, draft, saved.current).then(
      () => { saved.current = {agent: {...saved.current.agent, name: draft.name.trim() || DEFAULT.name}, avatarUrl: draft.avatar}; setError(null); },
      problem => setError(problem?.message ?? "Could not save."),
    ), 400);
    return () => clearTimeout(timer);
  }, [draft]);
  if (!draft) return j.jsx("p", {role: "status", className: "text-muted-foreground text-sm", children: GETTING_READY});
  return j.jsx(AgentFields, {draft, setDraft, error});
}

// ---------------------------------------------------------------------------- local agents

/** Settings › Models: commands added by hand. A command is parsed by the daemon into the exact
 * program and arguments, shown back, and only saved after a confirm; it never goes near a shell. */
export function AuxLocalAgents() {
  const {accountId} = useAccount();
  const [agents, setAgents] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { trpc.models.providerCliAgents.query({accountId}).then(setAgents, () => {}); }, [accountId]);
  const run = async action => {
    setBusy(true);
    setError(null);
    try { await action(); } catch (problem) { setError(problem?.message ?? "Could not add this agent."); } finally { setBusy(false); }
  };
  const check = () => run(async () => {
    const {command} = await trpc.models.providerCliCheckAgent.mutate({accountId, command: draft.command});
    setDraft(current => ({...current, confirm: command}));
  });
  const add = () => run(async () => {
    const result = await trpc.models.providerCliAddAgent.mutate({accountId, name: draft.name, command: draft.command});
    setAgents(result.agents);
    setDraft(null);
  });
  const remove = id => run(async () => setAgents((await trpc.models.providerCliRemoveAgent.mutate({accountId, id})).agents));
  const close = () => { setDraft(null); setError(null); };
  return j.jsx(SettingSection, {title: "Local agents", children: j.jsxs(SettingGroup, {children: [
    agents.map(agent => j.jsxs(SettingRow, {children: [
      j.jsx(SettingText, {title: agent.name, description: j.jsx("code", {className: "font-mono text-xs break-all", children: agent.command})}),
      j.jsx(SettingControl, {children: j.jsx(Button, {variant: "outline", size: "sm", disabled: busy, onClick: () => remove(agent.id), children: "Remove"})}),
    ]}, agent.id)),
    !draft && j.jsxs(SettingRow, {children: [
      j.jsx(SettingText, {title: "Add a local agent…", description: "Any command that speaks the Agent Client Protocol."}),
      j.jsx(SettingControl, {children: j.jsx(Button, {variant: "outline", size: "sm", onClick: () => setDraft({name: "", command: ""}), children: "Add"})}),
    ]}),
    draft && j.jsx(SettingRow, {className: "block", children: j.jsxs("div", {className: "flex min-w-0 flex-col gap-3", children: [
      draft.confirm
        ? j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
          j.jsx("p", {className: "text-sm", children: `Aux will run exactly this whenever you use ${draft.name.trim() || "this agent"}. It runs as you, and its actions ask you first.`}),
          j.jsx("code", {className: "bg-muted rounded-lg p-2 font-mono text-xs break-all", children: draft.confirm}),
          j.jsx("p", {className: "text-muted-foreground text-xs", children: "Adding it starts it once, to check it speaks the protocol."}),
        ]})
        : j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
          j.jsx(Label, {htmlFor: "aux-local-agent-name", children: "Name"}),
          j.jsx(Input, {id: "aux-local-agent-name", value: draft.name, maxLength: 64, autoComplete: "off", spellCheck: false,
            onChange: event => setDraft({...draft, name: event.target.value})}),
          j.jsx(Label, {htmlFor: "aux-local-agent-command", children: "Command"}),
          j.jsx(Input, {id: "aux-local-agent-command", value: draft.command, placeholder: "my-agent --acp", autoComplete: "off", spellCheck: false,
            className: "font-mono", onChange: event => setDraft({...draft, command: event.target.value})}),
          j.jsx("p", {className: "text-muted-foreground text-xs", children: "Aux runs it directly, without a shell, so nothing in it is expanded."}),
        ]}),
      error && j.jsx("p", {className: "text-destructive text-xs", role: "alert", children: error}),
      j.jsxs("div", {className: "flex justify-end gap-1", children: [
        j.jsx(Button, {variant: "ghost", size: "sm", disabled: busy, onClick: draft.confirm ? () => setDraft({...draft, confirm: null}) : close, children: draft.confirm ? "Back" : "Cancel"}),
        draft.confirm
          ? j.jsx(Button, {size: "sm", disabled: busy, onClick: add, children: busy ? "Checking…" : "Add agent"})
          : j.jsx(Button, {size: "sm", disabled: busy || !draft.command.trim(), onClick: check, children: "Continue"}),
      ]}),
    ]})}),
  ]})});
}
