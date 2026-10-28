// The Agent in the Agent extension (docs/plans/2026-10-28-agent-model.md): one shared store
// for the agent profile, its avatar, the side panel title and greeting, the setup and
// customize sheet, and the Settings section. Built only from the supplied components and
// tokens; scripts/release/transforms.mjs copies this file to dist/assets/ and wires it in.
import {A as interop, C as cx, E as requireReact, w as requireJsx} from "./browser-color-scheme-Df5VSuPV.js";
import {Kt as useAccount, cn as Input} from "./strip-markdown-DRcmtuJc.js";
import {g as trpc} from "./queries-ldd77hNk.js";
import {t as Button} from "./button-82u7k4S8.js";
import {a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog} from "./dialog-BAUCI3Qq.js";
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
const COLORS = ["neutral-700", "blue-500", "violet-500", "pink-500", "orange-500", "amber-500", "emerald-500", "cyan-500"];
const SYMBOLS = ["✦", "☾", "☀︎", "♫", "✿", "⚑", "☕︎", "✈︎"];
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
/** "+" in the side panel opens a side chat draft instead of the home thread. */
export function auxAgentStartSideChat() { sideChatDraft = true; }
/** Chat menu rows without the home thread, which the title already represents. */
export function auxAgentSideChats(rows) {
  const home = [...stores.values()].map(store => store.snapshot.agent.homeSessionId).filter(Boolean);
  return home.length ? rows.filter(row => !home.includes(row.id)) : rows;
}

// --------------------------------------------------------------------------------- avatar

const Mark = ({size}) => j.jsx("svg", {viewBox: "0 0 80 80", width: size, height: size, "aria-hidden": true, focusable: "false",
  children: MARK.map(d => j.jsx("path", {d, fill: "currentColor"}, d))});

/** The agent's face: its picture, or the plain Aux mark like the native sidebar button. */
export function AuxAgentAvatar({size = 20, src, className}) {
  const agent = useAuxAgent();
  const url = src === undefined ? agent.avatarUrl : src;
  return url
    ? j.jsx("img", {src: url, alt: "", width: size, height: size, draggable: false, className: cx("shrink-0 rounded-full object-cover", className), style: {width: size, height: size}})
    : j.jsx("span", {className: cx("text-foreground flex shrink-0 items-center justify-center", className), style: {width: size, height: size}, children: j.jsx(Mark, {size: Math.round(size * 0.9)})});
}

const canvas = () => { const c = document.createElement("canvas"); c.width = c.height = 256; return [c, c.getContext("2d")]; };
const cssColor = token => getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim() || "#555";

function renderGlyph(glyph, color) {
  const [c, g] = canvas();
  g.fillStyle = cssColor(color);
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 ${[...glyph].length > 1 ? 104 : 128}px -apple-system, system-ui, sans-serif`;
  g.fillText(glyph, 128, 138);
  return c.toDataURL("image/png");
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

const initial = name => ([...name.trim()][0] ?? "A").toLocaleUpperCase();

// ---------------------------------------------------------------------------------- editor

function Choice({options, value, onChange, label}) {
  return j.jsx("div", {role: "radiogroup", "aria-label": label, className: "bg-muted flex w-full gap-0.5 rounded-lg p-0.5",
    children: options.map(([id, text]) => j.jsx("button", {type: "button", role: "radio", "aria-checked": value === id, onClick: () => onChange(id),
      className: cx("h-7 min-w-0 flex-1 truncate rounded-md px-2 text-xs font-medium transition-colors",
        value === id ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"),
      children: text}, id))});
}

/** The agent's identity form. draft and setDraft hold {name, style, proactivity, avatar}. */
function AgentFields({draft, setDraft, error}) {
  const fileRef = useRef(null);
  const set = patch => setDraft(current => ({...current, ...patch}));
  const color = draft.color ?? COLORS[1];
  const pick = (kind, glyph = draft.glyph) => set({kind, glyph, avatar: kind === "mark" ? null : renderGlyph(kind === "monogram" ? initial(draft.name) : glyph, color)});
  const recolor = next => set({color: next, avatar: draft.kind === "monogram" || draft.kind === "symbol"
    ? renderGlyph(draft.kind === "monogram" ? initial(draft.name) : draft.glyph, next) : draft.avatar});
  const tile = (key, selected, onClick, child, title) => j.jsx("button", {type: "button", title, "aria-label": title, "aria-pressed": selected, onClick,
    className: cx("flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors",
      selected ? "border-foreground" : "border-border hover:bg-muted"), children: child}, key);

  return j.jsxs("div", {className: "flex flex-col gap-4", children: [
    j.jsxs("div", {className: "flex items-center gap-3", children: [
      j.jsx(AuxAgentAvatar, {size: 56, src: draft.avatar}),
      j.jsxs("div", {className: "flex min-w-0 flex-1 flex-col gap-1", children: [
        j.jsx("label", {className: "text-muted-foreground text-xs", htmlFor: "aux-agent-name", children: "Name"}),
        j.jsx(Input, {id: "aux-agent-name", value: draft.name, maxLength: 32, autoComplete: "off", spellCheck: false,
          onChange: event => {
            const name = event.target.value;
            setDraft(current => ({...current, name, avatar: current.kind === "monogram" ? renderGlyph(initial(name), current.color ?? COLORS[1]) : current.avatar}));
          }}),
      ]}),
    ]}),
    j.jsxs("div", {className: "flex flex-col gap-2", children: [
      j.jsx("span", {className: "text-muted-foreground text-xs", children: "Avatar"}),
      j.jsxs("div", {className: "flex flex-wrap gap-1.5", children: [
        tile("mark", draft.kind === "mark", () => pick("mark"), j.jsx(Mark, {size: 18}), "Aux mark"),
        tile("monogram", draft.kind === "monogram", () => pick("monogram"), j.jsx("span", {className: "text-sm font-semibold", children: initial(draft.name)}), "Initial"),
        ...SYMBOLS.map(glyph => tile(glyph, draft.kind === "symbol" && draft.glyph === glyph, () => pick("symbol", glyph), j.jsx("span", {className: "text-base", children: glyph}), "Symbol")),
        tile("photo", draft.kind === "photo", () => fileRef.current?.click(), j.jsx("span", {className: "text-muted-foreground text-lg leading-none", children: "+"}), "Upload a photo"),
        j.jsx("input", {ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/heic", hidden: true, onChange: async event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try { set({kind: "photo", avatar: await renderPhoto(file), error: null}); } catch (problem) { set({error: problem.message}); }
        }}),
      ]}),
      (draft.kind === "monogram" || draft.kind === "symbol") && j.jsx("div", {className: "flex gap-1.5", role: "radiogroup", "aria-label": "Color",
        children: COLORS.map(token => j.jsx("button", {type: "button", role: "radio", "aria-checked": color === token, "aria-label": token.split("-")[0], onClick: () => recolor(token),
          className: cx("size-5 rounded-full border-2 transition-transform", color === token ? "border-foreground" : "border-transparent"),
          style: {background: `var(--color-${token})`}}, token))}),
    ]}),
    j.jsxs("div", {className: "flex flex-col gap-2", children: [
      j.jsx("span", {className: "text-muted-foreground text-xs", children: "Style"}),
      j.jsx(Choice, {label: "Style", options: STYLES, value: draft.style, onChange: style => set({style})}),
    ]}),
    j.jsxs("div", {className: "flex flex-col gap-2", children: [
      j.jsx("span", {className: "text-muted-foreground text-xs", children: "Initiative"}),
      j.jsx(Choice, {label: "Initiative", options: PROACTIVITY, value: draft.proactivity, onChange: proactivity => set({proactivity})}),
      j.jsx("span", {className: "text-muted-foreground text-xs", children: PROACTIVITY.find(([id]) => id === draft.proactivity)?.[2]}),
    ]}),
    (error || draft.error) && j.jsx("p", {className: "text-destructive text-xs", role: "alert", children: error || draft.error}),
  ]});
}

const draftFrom = (agent, avatarUrl) => ({name: agent.name, style: agent.style, proactivity: agent.proactivity,
  kind: avatarUrl ? "photo" : "mark", avatar: avatarUrl, color: COLORS[1], glyph: SYMBOLS[0], error: null});

async function saveDraft(agent, draft, original) {
  const name = draft.name.trim() || "Aux";
  let result;
  if (name !== original.agent.name || draft.style !== original.agent.style || draft.proactivity !== original.agent.proactivity || !original.agent.setupCompleted)
    result = await agent.call("agentUpdate", {name, style: draft.style, proactivity: draft.proactivity, setupCompleted: true});
  if (draft.avatar !== original.avatarUrl)
    result = draft.avatar ? await agent.call("agentSetAvatar", {dataUrl: draft.avatar}) : await agent.call("agentClearAvatar", {});
  return result;
}

/** Customize the agent; with setup, the first-run "Meet your agent" sheet. */
export function AuxAgentSheet({open, onOpenChange, setup = false}) {
  const agent = useAuxAgent();
  const [draft, setDraft] = useState(() => draftFrom(agent.agent, agent.avatarUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) { setDraft(draftFrom(agent.agent, agent.avatarUrl)); setError(null); } }, [open]);
  const finish = async save => {
    setBusy(true);
    try {
      if (save) await saveDraft(agent, draft, {agent: agent.agent, avatarUrl: agent.avatarUrl});
      else if (setup) await agent.call("agentUpdate", {setupCompleted: true});
      onOpenChange(false);
    } catch (problem) { setError(problem?.message ?? "Could not save."); } finally { setBusy(false); }
  };
  return j.jsx(Dialog, {open, onOpenChange: next => !busy && (next ? onOpenChange(true) : finish(false)), children: j.jsxs(DialogContent, {className: "gap-5 sm:max-w-sm", children: [
    j.jsxs(DialogHeader, {children: [
      j.jsx(DialogTitle, {children: setup ? "Meet your agent" : `Customize ${agent.agent.name}`}),
      j.jsx(DialogDescription, {children: setup
        ? "Aux works for you across the web and remembers what matters. Give it a name and a look, or keep the defaults."
        : "Name, look and personality. Memory and instructions are in Settings."}),
    ]}),
    j.jsx(AgentFields, {draft, setDraft, error}),
    j.jsxs(DialogFooter, {children: [
      j.jsx(Button, {variant: "ghost", disabled: busy, onClick: () => finish(false), children: setup ? "Skip" : "Cancel"}),
      j.jsx(Button, {disabled: busy, onClick: () => finish(true), children: setup ? "Done" : "Save"}),
    ]}),
  ]})});
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
  const back = () => { sideChatDraft = false; navigate(home ?? null); };
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
    if (sessionId && sessionId === home) { sideChatDraft = false; return; }
    if (!sessionId && home && !sideChatDraft) { onSessionChange(home); return; }
    if (sessionId && !before && !home && !sideChatDraft && !claiming.current) {
      claiming.current = true;
      agent.call("agentSetHome", {sessionId}).catch(() => agent.refresh()).finally(() => { claiming.current = false; });
    }
    if (sessionId && !before && sideChatDraft) sideChatDraft = false;
  }, [sessionId, home, agent.ready, mode]);

  useEffect(() => {
    if (agent.ready && !agent.agent.setupCompleted && mode !== "incognito") setSetupOpen(true);
  }, [agent.ready, agent.agent.setupCompleted, mode]);

  return j.jsx(AuxAgentSheet, {setup: true, open: setupOpen, onOpenChange: setSetupOpen});
}

/** The empty home thread: who you are talking to. */
export function AuxAgentGreeting() {
  const agent = useAuxAgent();
  // With a home thread the panel is about to open it; only an agent without one greets here.
  if (sideChatDraft || !agent.ready || agent.agent.homeSessionId) return null;
  return j.jsxs("div", {"aria-hidden": true, className: "text-center", style: {position: "fixed", left: 16, right: 16, top: "34%", pointerEvents: "none",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10}, children: [
    j.jsx(AuxAgentAvatar, {size: 44}),
    j.jsx("div", {className: "font-display text-foreground text-lg font-medium", children: `Hi, I'm ${agent.agent.name}`}),
    j.jsx("div", {className: "text-muted-foreground text-sm", style: {maxWidth: 260}, children: "Ask me anything, or tell me what to get done on the web. I'll remember what matters."}),
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
