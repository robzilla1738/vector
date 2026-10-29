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
import {a as SettingText, c as SettingSection, i as SettingRow, l as SettingGroup, n as SettingControl} from "./-layouts-CcApOQbE.js";

const React = interop(requireReact(), 1);
const j = requireJsx();
const {useCallback, useEffect, useRef, useState, useSyncExternalStore} = React;

const DEFAULT = Object.freeze({name: "Aux", style: "balanced", proactivity: "light", homeSessionId: null,
  avatarRevision: "", setupCompleted: true, isDefault: true});
const NAME_KEY = "aux.agent.name.v1";
const STYLES = [["balanced", "Balanced"], ["concise", "Concise"], ["warm", "Warm"], ["playful", "Playful"], ["professional", "Professional"]];
const PROACTIVITY = [
  ["off", "Off", "Only does what you ask."],
  ["light", "Light", "Follows through on what you start."],
  ["normal", "Normal", "Suggests and takes safe next steps."],
];
// The canonical arch mark (assets/brand/arch-mark.svg), drawn in the current text color.
const MARK = ["m40.02 10.25c-17.45 0-31.34 15.33-31.34 33.27v21c0 2.47 2.51 3.44 4.6 2.1 7.21-5.48 11.98-15.6 11.98-25.54v-0.81c0-8.41 6.94-14.73 14.73-14.73 7.8 0 14.7 6.69 14.7 14.73v0.81c0 10.31 4.89 20.08 11.99 25.53 2.07 1.38 4.56 0.39 4.56-2l-0.15-20.46c0-19.06-13.61-33.9-31.07-33.9z",
  "m50.38 52.49-7.44-12.09c-0.62-1.08-1.79-1.67-2.99-1.67s-2.37 0.71-3.01 1.77l-7.35 12.02c-0.7 1.2-0.35 2.87 0.84 3.79 1.14 0.8 2.74 0.5 3.78-0.38 1.87-1.62 3.73-2.8 5.71-2.8 2.11 0 4.07 1.24 5.88 2.8 1.09 0.88 2.57 1.18 3.78 0.43 1.24-0.81 1.5-2.56 0.8-3.87z"];

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

function publish(store, patch) {
  store.snapshot = {...store.snapshot, ...patch};
  if (store.snapshot.agent.name !== lastName) {
    lastName = store.snapshot.agent.name;
    try { localStorage.setItem(NAME_KEY, lastName); } catch {}
  }
  for (const listener of store.listeners) listener();
}

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

/** The composer's empty-text hint. */
export const auxAgentPlaceholder = () => `Message ${lastName}, @ for context`;
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

const Mark = ({size}) => j.jsx("svg", {viewBox: "0 0 80 80", width: size, height: size, "aria-hidden": true, focusable: "false",
  children: MARK.map(d => j.jsx("path", {d, fill: "currentColor"}, d))});

/** The agent's face: its picture, or the plain Aux mark like the native sidebar row. */
export function AuxAgentAvatar({size = 20, src, className}) {
  const agent = useAuxAgent();
  const url = src === undefined ? agent.avatarUrl : src;
  return url
    ? j.jsx("img", {src: url, alt: "", width: size, height: size, draggable: false, className: cx("shrink-0 rounded-full object-cover", className), style: {width: size, height: size}})
    : j.jsx("span", {className: cx("text-foreground flex shrink-0 items-center justify-center", className), style: {width: size, height: size}, children: j.jsx(Mark, {size: Math.round(size * 0.9)})});
}

// The Aux mark in a few finishes. Classic is the theme-colored mark itself (no picture);
// the others render to a transparent 256 px PNG that the sidebar and side panel show as is.
const LOOKS = [
  {id: "classic", label: "Classic"},
  {id: "ocean", label: "Ocean", fill: ["#3b82f6"]},
  {id: "iris", label: "Iris", fill: ["#8b5cf6"]},
  {id: "rose", label: "Rose", fill: ["#ec4899"]},
  {id: "ember", label: "Ember", fill: ["#f97316"]},
  {id: "aurora", label: "Aurora", fill: ["#a78bfa", "#22d3ee"]},
  {id: "sunset", label: "Sunset", fill: ["#fbbf24", "#f43f5e"]},
  {id: "neon", label: "Neon", fill: ["#67e8f9"], glow: "rgba(34, 211, 238, 0.9)"},
  {id: "halo", label: "Halo", fill: ["#ffffff"], glow: "rgba(167, 139, 250, 0.95)"},
];

const canvas = () => { const c = document.createElement("canvas"); c.width = c.height = 256; return [c, c.getContext("2d")]; };

function renderLook(look) {
  const [c, g] = canvas();
  // The mark's box in its 80-unit viewBox is about 63 × 57, centered near (40, 39).
  const scale = (look.glow ? 2.35 : 2.75), path = new Path2D();
  const matrix = new DOMMatrix().translate(128, 128).scale(scale).translate(-40, -39);
  for (const d of MARK) path.addPath(new Path2D(d), matrix);
  const [from, to = from] = look.fill;
  const fill = g.createLinearGradient(40, 216, 216, 40);
  fill.addColorStop(0, from);
  fill.addColorStop(1, to);
  g.fillStyle = fill;
  if (look.glow) {
    g.shadowColor = look.glow;
    for (const blur of [36, 14]) { g.shadowBlur = blur; g.fill(path); }
    g.shadowBlur = 0;
  }
  g.fill(path);
  return c.toDataURL("image/png");
}

let lookImages;
const looks = () => (lookImages ??= LOOKS.map(look => ({...look, image: look.fill ? renderLook(look) : null})));

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

// ---------------------------------------------------------------------------------- editor

/** Pill choices that wrap instead of truncating, so they fit any panel width. */
function Chips({options, value, onChange, label}) {
  return j.jsx("div", {role: "radiogroup", "aria-label": label, className: "flex flex-wrap gap-1.5",
    children: options.map(([id, text]) => j.jsx("button", {type: "button", role: "radio", "aria-checked": value === id, onClick: () => onChange(id),
      className: cx("h-7 rounded-full border px-3 text-xs font-medium transition-colors",
        value === id ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"),
      children: text}, id))});
}

const Label = ({children, htmlFor}) => j.jsx(htmlFor ? "label" : "span", {htmlFor, className: "text-muted-foreground text-xs font-medium", children});

/** The agent's identity form: look, name, style and initiative. */
function AgentFields({draft, setDraft, error, centered = false}) {
  const fileRef = useRef(null);
  const set = patch => setDraft(current => ({...current, ...patch}));
  const tile = (key, selected, onClick, child, title) => j.jsx("button", {type: "button", title, "aria-label": title, "aria-pressed": selected, onClick,
    className: cx("flex size-11 items-center justify-center overflow-hidden rounded-full border transition-colors",
      selected ? "border-foreground bg-muted" : "border-border hover:bg-muted"), children: child}, key);

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
      j.jsxs("div", {className: "flex flex-wrap gap-2", children: [
        ...looks().map(look => tile(look.id, draft.look === look.id, () => set({look: look.id, avatar: look.image}),
          look.image ? j.jsx("img", {src: look.image, alt: "", className: "size-7", draggable: false}) : j.jsx(Mark, {size: 22}), look.label)),
        tile("custom", draft.look === "custom", () => fileRef.current?.click(),
          draft.look === "custom" && draft.avatar
            ? j.jsx("img", {src: draft.avatar, alt: "", className: "size-full object-cover", draggable: false})
            : j.jsx("span", {className: "text-muted-foreground text-lg leading-none", children: "+"}), "Your own image"),
        j.jsx("input", {ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/heic", hidden: true, onChange: async event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try { set({look: "custom", avatar: await renderPhoto(file), error: null}); } catch (problem) { set({error: problem.message}); }
        }}),
      ]}),
    ]}),
    j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
      j.jsx(Label, {children: "Style"}),
      j.jsx(Chips, {label: "Style", options: STYLES, value: draft.style, onChange: style => set({style})}),
    ]}),
    j.jsxs("div", {className: "flex min-w-0 flex-col gap-2", children: [
      j.jsx(Label, {children: "Initiative"}),
      j.jsx(Chips, {label: "Initiative", options: PROACTIVITY, value: draft.proactivity, onChange: proactivity => set({proactivity})}),
      j.jsx("span", {className: "text-muted-foreground text-xs", children: PROACTIVITY.find(([id]) => id === draft.proactivity)?.[2]}),
    ]}),
    (error || draft.error) && j.jsx("p", {className: "text-destructive text-xs", role: "alert", children: error || draft.error}),
  ]});
}

/** The look a saved picture came from: one of the finishes, or the user's own image. */
const lookOf = avatarUrl => !avatarUrl ? "classic" : looks().find(look => look.image === avatarUrl)?.id ?? "custom";

const draftFrom = (agent, avatarUrl) => ({name: agent.name, style: agent.style, proactivity: agent.proactivity,
  look: lookOf(avatarUrl), avatar: avatarUrl, error: null});

async function saveDraft(agent, draft, original) {
  const name = draft.name.trim() || "Aux";
  if (name !== original.agent.name || draft.style !== original.agent.style || draft.proactivity !== original.agent.proactivity || !original.agent.setupCompleted)
    await agent.call("agentUpdate", {name, style: draft.style, proactivity: draft.proactivity, setupCompleted: true});
  if (draft.avatar !== original.avatarUrl)
    await (draft.avatar ? agent.call("agentSetAvatar", {dataUrl: draft.avatar}) : agent.call("agentClearAvatar", {}));
}

/** Customize the agent, filling the side panel; with setup, the first-run "Meet your agent". */
export function AuxAgentSheet({open, onOpenChange, setup = false}) {
  const agent = useAuxAgent();
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) { setDraft(draftFrom(agent.agent, agent.avatarUrl)); setError(null); } }, [open]);
  const finish = async save => {
    if (busy) return;
    setBusy(true);
    try {
      if (save) await saveDraft(agent, draft, {agent: agent.agent, avatarUrl: agent.avatarUrl});
      else if (setup) await agent.call("agentUpdate", {setupCompleted: true});
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
  return j.jsxs("div", {role: "dialog", "aria-modal": true, "aria-labelledby": "aux-agent-sheet-title",
    className: "bg-background text-foreground no-drag flex flex-col", style: {position: "fixed", inset: 0, zIndex: 60}, children: [
    j.jsxs("div", {className: "flex shrink-0 items-start justify-between gap-2 px-5 pt-5 pb-2", children: [
      j.jsxs("div", {className: "flex min-w-0 flex-col gap-1", children: [
        j.jsx("h2", {id: "aux-agent-sheet-title", className: "font-display text-lg font-medium", children: setup ? "Meet your agent" : `Customize ${agent.agent.name}`}),
        j.jsx("p", {className: "text-muted-foreground text-sm", children: setup
          ? "It works for you across the web and remembers what matters. Make it yours, or keep the defaults."
          : "Name, look and personality. Memory and instructions are in Settings."}),
      ]}),
      j.jsx(Button, {variant: "ghost", size: "icon-sm", shape: "pill", "aria-label": "Close", disabled: busy, onClick: () => finish(false),
        className: "text-muted-foreground shrink-0", children: j.jsx("svg", {viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": true,
          children: j.jsx("path", {d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round"})})}),
    ]}),
    j.jsx("div", {className: "min-h-0 flex-1 overflow-y-auto px-5 py-4", children: j.jsx(AgentFields, {draft, setDraft, error, centered: true})}),
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
      j.jsx(Tooltip, {content: `Customize ${agent.agent.name}`, children: j.jsxs(Button, {variant: "ghost", size: "sm", className: "no-drag min-w-0 gap-1.5 px-1.5",
        "aria-label": `Customize ${agent.agent.name}`, onClick: () => setOpen(true), children: [
          j.jsx(AuxAgentAvatar, {size: 18}),
          j.jsx("span", {className: "truncate text-sm font-medium", children: agent.agent.name}),
        ]})}),
      sessionId && menu("Side chats"),
      j.jsx(AuxAgentSheet, {open, onOpenChange: setOpen}),
    ]});
  }
  const back = () => { setSideChatDraft(false); navigate(home ?? null); };
  return j.jsxs(j.Fragment, {children: [
    j.jsx(Tooltip, {content: `Back to ${agent.agent.name}`, children: j.jsxs(Button, {variant: "ghost", size: "sm", className: "no-drag shrink-0 gap-1 px-1",
      "aria-label": `Back to ${agent.agent.name}`, onClick: back, children: [
        j.jsx("svg", {viewBox: "0 0 16 16", width: 12, height: 12, "aria-hidden": true, className: "text-muted-foreground",
          children: j.jsx("path", {d: "M10 3 5 8l5 5", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round"})}),
        j.jsx(AuxAgentAvatar, {size: 16}),
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

function ContextFile({accountId, fileName, title, description, placeholder}) {
  const [text, setText] = useState(null);
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    let live = true;
    trpc.settings.readContextFile.query({accountId, fileName}).then(({content}) => live && (setText(content), setSaved(content)), () => live && setText(""));
    return () => { live = false; };
  }, [accountId, fileName]);
  const dirty = text !== null && text !== saved;
  return j.jsxs(SettingRow, {className: "flex-col items-stretch gap-2", children: [
    j.jsx(SettingText, {title, description}),
    j.jsx(Textarea, {value: text ?? "", disabled: text === null, placeholder, rows: 5, className: "font-mono text-xs", onChange: event => setText(event.target.value)}),
    dirty && j.jsxs("div", {className: "flex justify-end gap-1", children: [
      j.jsx(Button, {variant: "ghost", size: "sm", onClick: () => setText(saved), children: "Discard"}),
      j.jsx(Button, {size: "sm", onClick: async () => { await trpc.settings.writeContextFile.mutate({accountId, fileName, content: text}); setSaved(text); }, children: "Save"}),
    ]}),
  ]});
}

/** Settings › Agents: the agent itself, above the supplied chat settings. */
export function AuxAgentSettings() {
  const agent = useAuxAgent();
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  useEffect(() => { if (agent.ready && !loaded.current) { loaded.current = true; setDraft(draftFrom(agent.agent, agent.avatarUrl)); } }, [agent.ready]);
  const original = draftFrom(agent.agent, agent.avatarUrl);
  const dirty = ["name", "style", "proactivity", "avatar"].some(key => draft[key] !== original[key]);
  const save = async () => {
    setBusy(true);
    setError(null);
    try { await saveDraft(agent, draft, {agent: agent.agent, avatarUrl: agent.avatarUrl}); } catch (problem) { setError(problem?.message ?? "Could not save."); } finally { setBusy(false); }
  };
  return j.jsxs(SettingSection, {title: "Your agent", children: [
    j.jsxs(SettingGroup, {children: [
      j.jsx(SettingRow, {className: "block", children: j.jsx(AgentFields, {draft, setDraft, error})}),
      dirty && j.jsx(SettingRow, {children: j.jsxs(SettingControl, {className: "ml-auto flex gap-1", children: [
        j.jsx(Button, {variant: "ghost", size: "sm", disabled: busy, onClick: () => setDraft(original), children: "Discard"}),
        j.jsx(Button, {size: "sm", disabled: busy, onClick: save, children: "Save"}),
      ]})}),
    ]}),
    j.jsxs(SettingGroup, {children: [
      j.jsx(ContextFile, {accountId: agent.accountId, fileName: "SOUL.md", title: "Personality",
        description: `Who ${agent.agent.name} is: tone, values, quirks. ${agent.agent.name} reads this before every conversation.`, placeholder: "Curious and direct. Prefers primary sources."}),
      j.jsx(ContextFile, {accountId: agent.accountId, fileName: "AGENTS.md", title: "Instructions",
        description: "Rules to always follow, such as preferred sites, formats or things to avoid.", placeholder: "Always show prices in USD."}),
    ]}),
  ]});
}
