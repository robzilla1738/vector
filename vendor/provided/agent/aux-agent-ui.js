// The Agent in the Agent extension (docs/plans/2026-10-28-agent-model.md): one shared store
// for the agent profile, its avatar, the side panel title and greeting, the setup and
// customize sheet, and the Settings section. Built only from the supplied components and
// tokens; scripts/release/transforms.mjs copies this file to dist/assets/ and wires it in.
import {A as interop, C as cx, E as requireReact, w as requireJsx} from "./browser-color-scheme-Df5VSuPV.js";
import {Kt as useAccount, cn as Input} from "./strip-markdown-DRcmtuJc.js";
import {g as trpc} from "./queries-ldd77hNk.js";
import {t as Button} from "./button-82u7k4S8.js";
import {t as Textarea} from "./textarea-5TASg52t.js";
import {t as Tooltip} from "./simple-tooltip-CHhnBkHz.js";
import {a as openExtensionPage, i as isSidepanel} from "./extension-page-url-BH3pfT7h.js";
import {a as SettingText, c as SettingSection, i as SettingRow, l as SettingGroup, n as SettingControl} from "./-layouts-CcApOQbE.js";

const React = interop(requireReact(), 1);
const j = requireJsx();
const {useCallback, useEffect, useRef, useState, useSyncExternalStore} = React;

const DEFAULT = Object.freeze({name: "Otto", homeSessionId: null, avatarRevision: "", setupCompleted: true, isDefault: true});
const NAME_KEY = "aux.agent.name.v1";
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
  store.pending ??= load(store).catch(() => publish(store, {ready: true})).finally(() => { store.pending = null; });
  return store.pending;
}

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
export function useAuxAgent() {
  const {accountId} = useAccount();
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
  return {...snapshot, accountId, call, refresh: () => refresh(store)};
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
/** Chat menu rows without the home thread, which the title already represents. */
export function auxAgentSideChats(rows) {
  const home = [...stores.values()].map(store => store.snapshot.agent.homeSessionId).filter(Boolean);
  return home.length ? rows.filter(row => !home.includes(row.id)) : rows;
}

// --------------------------------------------------------------------------------- avatar

// Otto: a small rounded pebble with two pill eyes. One geometry in a 100-unit box, drawn as
// SVG on screen and onto a canvas for the looks; the native sidebar button draws the same
// shape in Silver (aux_agent_button.cc), so keep the three in step.
const MASCOT = {body: {cx: 50, cy: 52, r: 44}, eyes: [34, 66], eye: {y: 40, w: 10, h: 18, r: 5}, shine: {cx: 50, cy: 27, rx: 21, ry: 8}};
const LOOKS = [
  {id: "silver", label: "Silver", body: ["#ffffff", "#d3d7dd", "#9aa1ab"], eye: "#1b1d21"},
  {id: "sky", label: "Sky", body: ["#d6ecff", "#80bbff", "#3b82f6"], eye: "#0b1b33"},
  {id: "peach", label: "Peach", body: ["#ffe6cc", "#ffb38a", "#f472b6"], eye: "#3a1022"},
  {id: "mint", label: "Mint", body: ["#dcfbe8", "#7fe0b0", "#10b981"], eye: "#06291c"},
  {id: "midnight", label: "Midnight", body: ["#5b6472", "#2a303a", "#11151b"], eye: "#e8ecf2"},
];
const DEFAULT_LOOK = LOOKS[0];

let mascotIds = 0;
function Mascot({size, look = DEFAULT_LOOK}) {
  const [id] = useState(() => `aux-otto-${++mascotIds}`);
  const {body, eyes, eye, shine} = MASCOT;
  return j.jsxs("svg", {viewBox: "0 0 100 100", width: size, height: size, "aria-hidden": true, focusable: "false", children: [
    j.jsx("defs", {children: j.jsxs("linearGradient", {id, x1: 0, y1: 8, x2: 0, y2: 96, gradientUnits: "userSpaceOnUse", children: [
      j.jsx("stop", {offset: 0, stopColor: look.body[0]}), j.jsx("stop", {offset: 0.55, stopColor: look.body[1]}),
      j.jsx("stop", {offset: 1, stopColor: look.body[2]})]})}),
    j.jsx("circle", {...body, fill: `url(#${id})`, stroke: "rgba(0,0,0,0.12)", strokeWidth: 1.5}),
    j.jsx("ellipse", {...shine, fill: "rgba(255,255,255,0.35)"}),
    ...eyes.map(x => j.jsx("rect", {x: x - eye.w / 2, y: eye.y, width: eye.w, height: eye.h, rx: eye.r, fill: look.eye}, x)),
  ]});
}

const canvas = () => { const c = document.createElement("canvas"); c.width = c.height = 256; return [c, c.getContext("2d")]; };

function renderLook(look) {
  const [c, g] = canvas();
  const {body, eyes, eye, shine} = MASCOT;
  g.scale(2.56, 2.56);
  const fill = g.createLinearGradient(0, 8, 0, 96);
  look.body.forEach((color, index) => fill.addColorStop([0, 0.55, 1][index], color));
  g.beginPath();
  g.arc(body.cx, body.cy, body.r, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = "rgba(0,0,0,0.12)";
  g.stroke();
  g.beginPath();
  g.ellipse(shine.cx, shine.cy, shine.rx, shine.ry, 0, 0, Math.PI * 2);
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fill();
  g.fillStyle = look.eye;
  for (const x of eyes) { g.beginPath(); g.roundRect(x - eye.w / 2, eye.y, eye.w, eye.h, eye.r); g.fill(); }
  return c.toDataURL("image/png");
}

// Silver is the default face (no picture: every surface draws it); the others are pictures.
let lookImages;
const looks = () => (lookImages ??= LOOKS.map(look => ({...look, image: look === DEFAULT_LOOK ? null : renderLook(look)})));

/** The agent's face: its picture, or Otto in Silver. */
export function AuxAgentAvatar({size = 20, src, className}) {
  const agent = useAuxAgent();
  const url = src === undefined ? agent.avatarUrl : src;
  return url
    ? j.jsx("img", {src: url, alt: "", width: size, height: size, draggable: false, className: cx("shrink-0 rounded-full object-cover", className), style: {width: size, height: size}})
    : j.jsx("span", {className: cx("flex shrink-0 items-center justify-center", className), style: {width: size, height: size}, children: j.jsx(Mascot, {size})});
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

/** Name and look. Otto works on request, so there is no style or initiative to set: what it
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
          j.jsx("span", {className: "size-8 rounded-full", style: {background: `linear-gradient(180deg, ${look.body.join(", ")})`}}), look.label)),
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

/** The look a saved picture came from: one of Otto's looks, or the user's own picture. */
const lookOf = avatarUrl => !avatarUrl ? DEFAULT_LOOK.id : looks().find(look => look.image === avatarUrl)?.id ?? "custom";

const draftFrom = (agent, avatarUrl) => ({name: agent.name, look: lookOf(avatarUrl), avatar: avatarUrl, error: null});

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

/** AGENTS.md, the instructions the agent reads before every conversation; read while enabled. */
function useInstructions(accountId, enabled = true) {
  const [text, setText] = useState(null);
  const [saved, setSaved] = useState(null);
  const preamble = useRef(DEFAULT_PREAMBLE);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    trpc.settings.readContextFile.query({accountId, fileName: "AGENTS.md"}).then(({content}) => {
      if (!live) return;
      const head = PREAMBLE.exec(content)?.[0] ?? "";
      preamble.current = head.trim() ? `${head.trimEnd()}\n\n` : DEFAULT_PREAMBLE;
      const body = content.slice(head.length).trimEnd();
      setText(body);
      setSaved(body);
    }, () => live && (setText(""), setSaved("")));
    return () => { live = false; };
  }, [accountId, enabled]);
  const save = async () => {
    if (text === null || text === saved) return;
    const body = text.trim();
    await trpc.settings.writeContextFile.mutate({accountId, fileName: "AGENTS.md", content: `${preamble.current}${body}${body ? "\n" : ""}`});
    setSaved(text);
  };
  return {text, setText, saved, dirty: text !== null && text !== saved, save, discard: () => setText(saved)};
}

const InstructionsBox = ({instructions, name}) => j.jsx(Textarea, {value: instructions.text ?? "", disabled: instructions.text === null, rows: 4,
  className: "text-sm", placeholder: `Anything ${name} should always keep in mind. "Show prices in USD." "I prefer primary sources."`,
  onChange: event => instructions.setText(event.target.value)});

/** Where initiative lives: routines, not a personality dial. */
const RoutinesHint = ({accountId, name}) => j.jsxs("p", {className: "text-muted-foreground text-xs", children: [
  `${name} works when you ask. To have it check in or run something on a schedule, `,
  j.jsx("button", {type: "button", className: "text-foreground underline underline-offset-2", onClick: () => openPage(accountId, "settings/routines"), children: "set up a routine"}),
  "."]});

/** Customize the agent, filling the side panel; with setup, the first-run "Meet Otto". */
export function AuxAgentSheet({open, onOpenChange, setup = false}) {
  const agent = useAuxAgent();
  const instructions = useInstructions(agent.accountId, open && !setup);
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) { setDraft(draftFrom(agent.agent, agent.avatarUrl)); setError(null); } }, [open]);
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
  useEffect(() => {
    if (!open) return;
    const onKey = event => event.key === "Escape" && finish(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!open) return null;
  const name = draft.name.trim() || DEFAULT.name;
  return j.jsxs("div", {role: "dialog", "aria-modal": true, "aria-labelledby": "aux-agent-sheet-title",
    className: "bg-background text-foreground no-drag flex flex-col", style: {position: "fixed", inset: 0, zIndex: 60}, children: [
    j.jsxs("div", {className: "flex shrink-0 items-start justify-between gap-2 px-5 pt-5 pb-2", children: [
      j.jsxs("div", {className: "flex min-w-0 flex-col gap-1", children: [
        j.jsx("h2", {id: "aux-agent-sheet-title", className: "font-display text-lg font-medium", children: setup ? `Meet ${agent.agent.name}` : `Customize ${agent.agent.name}`}),
        j.jsx("p", {className: "text-muted-foreground text-sm", children: setup
          ? "Your agent in Aux. It browses and gets things done when you ask, and remembers what matters. Give it a name and a look, or keep the defaults."
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
    j.jsxs("div", {className: "flex shrink-0 justify-end gap-2 border-t px-5 py-3", children: [
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
      sessionId && menu("Side chats"),
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

  return j.jsx(AuxAgentSheet, {setup: true, open: setupOpen, onOpenChange: setSetupOpen});
}

/** An empty conversation, in place of the supplied faint logo: who you are talking to. */
export function AuxAgentEmptyState() {
  const agent = useAuxAgent();
  const name = agent.agent.name;
  return j.jsxs("div", {className: "flex max-w-xs flex-col items-center gap-2.5 text-center", children: [
    j.jsx(AuxAgentAvatar, {size: 44}),
    j.jsx("div", {className: "font-display text-foreground text-lg font-medium", children: sideChatDraft ? "New side chat" : `Hi, I'm ${name}`}),
    j.jsx("div", {className: "text-muted-foreground text-sm", children: sideChatDraft
      ? `Starts fresh. ${name} still remembers what matters.`
      : "Ask me anything, or tell me what to get done on the web. I'll remember what matters."}),
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
  const dirty = ["name", "avatar"].some(key => draft[key] !== original[key]);
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
