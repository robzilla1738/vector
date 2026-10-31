/** The Agent: one named, customizable assistant across individual chats
 * (docs/plans/2026-10-28-agent-model.md). Spaces replace profiles, and each data group
 * has its own account, so the agent's name, look and setup live once in a shared root
 * while each account keeps the ongoing chat `aux ask` uses, stored as homeSessionId, a
 * field native reads. The daemon entry loads this beside itself and passes the roots in; this module
 * owns only agent/agent.json and agent/avatar.png under the control roots, where the
 * agent's own file tools never write. */
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';

// The agent carries the browser's name and mark by default (owner, 2026-10-28).
export const DEFAULT_NAME = 'Aux';
// Version 2 profiles defaulted to "Otto", a mascot name since retired; they move back to Aux.
const RETIRED_DEFAULT_NAME = 'Otto';
const PROFILE_VERSION = 3;
export const ORIGINAL_OPENER = 'You are Aux, a helpful, proactive, and smart AI browser.';
const AGENT_PHRASE = "the user's personal agent, built into the Aux browser";
const MAX_AVATAR_BYTES = 768 * 1024;
const MAX_AVATAR_SIDE = 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// A chat's frozen prompt is rebuilt at most this often so memory stays current without
// defeating the provider's prompt cache between turns.
const PROMPT_MAX_AGE_MS = 6 * 60 * 60 * 1000;
// How many chats remember what their prompt was built from; an older one rebuilds once.
const MAX_PROMPT_STAMPS = 64;
// What a chat loads into its prompt, under the account task root: personality, instructions,
// and the prompt-loaded (L1) memory.
const CONTEXT_FILES = ['SOUL.md', 'AGENTS.md', 'memory/MEMORY.md', 'memory/USER.md'];
// Chat states that need the agent button's attention, least to most urgent.
const BUSY_STATUSES = ['running', 'awaiting-answer', 'awaiting-approval'];

/** A name the prompt can carry safely: one line, no markup, 1–32 characters. */
export function cleanName(value) {
  const name = String(value ?? '').normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}<>{}[\]`#*_|\\]/gu, '').replace(/\s+/g, ' ').trim();
  return [...name].slice(0, 32).join('').trim() || DEFAULT_NAME;
}

const defaults = () => ({version: PROFILE_VERSION, name: DEFAULT_NAME, homeSessionId: null, avatarRevision: '',
  setupCompleted: false, revision: 0, promptStamps: {}});

/** The stored profile in the current shape. Version 1 carried a style and an initiative
 * level, now dropped (the agent works on request; routines are its initiative); version 2
 * defaulted to Otto. */
function normalize(raw) {
  const stored = raw && typeof raw === 'object' ? raw : {};
  const profile = {...defaults(), ...stored};
  delete profile.style;
  delete profile.proactivity;
  delete profile.homePrompt;
  const retiredName = stored.version === 2 && profile.name === RETIRED_DEFAULT_NAME;
  return {
    ...profile,
    version: PROFILE_VERSION,
    name: retiredName ? DEFAULT_NAME : cleanName(profile.name),
    homeSessionId: typeof profile.homeSessionId === 'string' && profile.homeSessionId ? profile.homeSessionId : null,
    avatarRevision: /^[0-9a-f]{16}$/.test(profile.avatarRevision) ? profile.avatarRevision : '',
    setupCompleted: profile.setupCompleted === true,
    revision: Number.isSafeInteger(profile.revision) ? profile.revision : 0,
    promptStamps: profile.promptStamps && typeof profile.promptStamps === 'object' ? profile.promptStamps : {},
  };
}

/** The opening of every system prompt the agent's sessions use. It names the agent outright:
 * with only the supplied opener, models answered "who are you" with their own model name
 * (seen live with Muse Spark, 2026-10-28). The agent works on request; anything it starts on
 * its own comes from routines the user set up. */
export function identityBlock(profile) {
  return [`You are ${profile.name}, ${AGENT_PHRASE}. You are helpful and smart, and you work on what the user asks, thoroughly. You take on work unprompted only through routines the user has set up.`,
    `Your name is ${profile.name}. When asked who you are, you are ${profile.name}; the AI model behind you is an implementation detail, not your name.`,
    'If a task needs a shell and you have no tool for one, say so plainly and suggest connecting Claude Code or Codex in Settings › Models; they run here with their own shell.'].join('\n');
}

const sha = data => createHash('sha256').update(data).digest('hex');
const readText = file => { try { return readFileSync(file, 'utf8'); } catch { return ''; } };

function writeAtomic(file, data) {
  mkdirSync(path.dirname(file), {recursive: true, mode: 0o700});
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, data, {mode: 0o600});
  renameSync(temporary, file);
}

/** A PNG the extension rendered: magic bytes, an IHDR chunk and a sane size. */
export function parseAvatar(dataUrl) {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl ?? ''));
  if (!match) throw Error('The avatar must be a PNG image.');
  const bytes = Buffer.from(match[1], 'base64');
  if (bytes.length > MAX_AVATAR_BYTES) throw Error('The avatar image is too large.');
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_MAGIC) || bytes.toString('latin1', 12, 16) !== 'IHDR')
    throw Error('The avatar must be a PNG image.');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (!width || !height || width > MAX_AVATAR_SIDE || height > MAX_AVATAR_SIDE) throw Error('The avatar image size is not supported.');
  return bytes;
}

// What every account shares; the rest of a profile is the account's own.
const SHARED_FIELDS = ['name', 'avatarRevision', 'setupCompleted', 'revision'];

/** roots: {control(accountId), task(accountId), shared()} → absolute roots. */
export function createAuxAgent(roots) {
  const dir = account => path.join(roots.control(account), 'agent');
  const profileFile = account => path.join(dir(account), 'agent.json');
  const sharedFile = () => path.join(roots.shared(), 'agent', 'agent.json');
  const avatarFile = () => path.join(roots.shared(), 'agent', 'avatar.png');
  const parse = file => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; } };
  const pick = (profile, keys) => Object.fromEntries(keys.map(key => [key, profile[key]]));

  function read(account) {
    const own = parse(profileFile(account));
    // The first account read after the change brings its agent (and picture) to the shared root.
    let shared = parse(sharedFile());
    if (!shared && own) {
      shared = pick(normalize(own), SHARED_FIELDS);
      writeAtomic(sharedFile(), `${JSON.stringify(shared, null, 1)}\n`);
      try { writeAtomic(avatarFile(), readFileSync(path.join(dir(account), 'avatar.png'))); } catch {}
    }
    return normalize({...own, ...shared});
  }
  function save(account, profile) {
    const next = normalize(profile);
    writeAtomic(sharedFile(), `${JSON.stringify(pick(next, SHARED_FIELDS), null, 1)}\n`);
    writeAtomic(profileFile(account), `${JSON.stringify(next, null, 1)}\n`);
    return next;
  }
  const bump = (account, patch) => { const current = read(account); return save(account, {...current, ...patch, revision: current.revision + 1}); };

  /** What the extension shows and edits. usable: the `aux ask` chat still exists. */
  const view = (profile, usable) => ({
    name: profile.name, homeSessionId: usable ? profile.homeSessionId : null, avatarRevision: profile.avatarRevision,
    setupCompleted: profile.setupCompleted, isDefault: profile.name === DEFAULT_NAME && !profile.avatarRevision,
  });

  const contextStamp = (account, profile) =>
    sha([profile.revision, ...CONTEXT_FILES.map(file => readText(path.join(roots.task(account), file)))].join('\0')).slice(0, 16);

  return {
    read, view, identityBlock,
    update(account, input) {
      const patch = {};
      if (input.name !== undefined) patch.name = cleanName(input.name);
      if (input.setupCompleted !== undefined) patch.setupCompleted = input.setupCompleted === true;
      return bump(account, patch);
    },
    setAvatar(account, dataUrl) {
      const bytes = parseAvatar(dataUrl);
      writeAtomic(avatarFile(), bytes);
      return bump(account, {avatarRevision: sha(bytes).slice(0, 16)});
    },
    clearAvatar(account) {
      rmSync(avatarFile(), {force: true});
      return bump(account, {avatarRevision: ''});
    },
    /** The PNG bytes, or null when the agent uses the Aux mark. */
    avatar(account) {
      if (!read(account).avatarRevision) return null;
      try { return readFileSync(avatarFile()); } catch { return null; }
    },
    avatarDataUrl(account) {
      const bytes = this.avatar(account);
      return bytes ? `data:image/png;base64,${bytes.toString('base64')}` : null;
    },
    setAskChat(account, sessionId) { return save(account, {...read(account), homeSessionId: sessionId}); },

    /** The supplied opener replaced with this account's agent identity. */
    systemPrompt(prompt, account) {
      if (account === undefined || typeof prompt !== 'string' || !prompt.startsWith(ORIGINAL_OPENER)) return prompt;
      return identityBlock(read(account)) + prompt.slice(ORIGINAL_OPENER.length);
    },
    /** Whether a chat's frozen prompt predates the agent's identity, its SOUL.md, AGENTS.md or
     * memory. Rebuilding is the supplied path for an empty prompt; only prompts this agent
     * produced are ever considered. */
    promptStale(account, session, prompt) {
      if (!prompt || typeof prompt !== 'string') return false;
      if (!prompt.startsWith(ORIGINAL_OPENER) && !(prompt.startsWith('You are ') && prompt.includes(AGENT_PHRASE))) return false;
      const profile = read(account);
      if (!prompt.startsWith(identityBlock(profile))) return true;
      const built = profile.promptStamps[session?.id];
      return !!session?.id && (built?.stamp !== contextStamp(account, profile) || Date.now() - built.at >= PROMPT_MAX_AGE_MS);
    },
    /** Records a chat's context once its prompt was rebuilt and stored, so a failed rebuild is
     * tried again on the next turn. */
    promptBuilt(account, session, prompt) {
      const profile = read(account);
      if (!session?.id || typeof prompt !== 'string' || !prompt.startsWith(identityBlock(profile))) return;
      const stamps = Object.entries({...profile.promptStamps, [session.id]: {stamp: contextStamp(account, profile), at: Date.now()}});
      save(account, {...profile, promptStamps: Object.fromEntries(stamps.sort(([, a], [, b]) => a.at - b.at).slice(-MAX_PROMPT_STAMPS))});
    },
    /** A note for an open chat after a rename: a long conversation otherwise keeps
     * answering with the name in its own earlier replies (seen live, 2026-10-28). */
    renameNote(name) {
      return {role: 'system-message', kind: 'agent_identity', metadata: {}, timestamp: Date.now(),
        content: `The user renamed you to ${name}. Your name is ${name} from now on; earlier replies that used another name are out of date.`};
    },
    /** The native Chats feed with the agent's state added.
     * active: every running or suspended session, side chats and routines included; the
     * button shows the most urgent of them (approval, then question, then working), else
     * the ask chat's own state. */
    chromeChats(account, {pinned, recents}, preview, askPreview, active) {
      const profile = read(account);
      const ask = profile.homeSessionId ? askPreview(profile.homeSessionId) : undefined;
      const urgent = (a, b) => BUSY_STATUSES.indexOf(b) > BUSY_STATUSES.indexOf(a) ? b : a;
      return {
        pinned: pinned.map(preview), recents: recents.map(preview),
        agent: {name: profile.name, homeSessionId: ask ? profile.homeSessionId : null,
          status: active.map(row => preview(row).status).reduce(urgent, ask ? preview(ask).status : 'idle'),
          avatarRevision: profile.avatarRevision},
      };
    },
  };
}
