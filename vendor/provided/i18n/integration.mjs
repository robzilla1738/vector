/** The Agent extension's languages (decision 9). The bundle holds English literals with no i18n
 * layer, so the last release transform wraps each one in a `__auxT(key, english)` call, and
 * `assets/aux-i18n.js`, generated here from catalog/, defines that call. English stays at each site
 * as the fallback. Every JSX chunk imports browser-color-scheme, so importing the runtime there puts
 * it ahead of all of them; the two entry points that don't import it get their own import. */
import {readFileSync} from 'node:fs';

export const LOCALES = Object.freeze(['es', 'fr', 'de', 'pt-BR', 'it', 'ja', 'ko', 'zh-CN', 'zh-TW']);
export const RUNTIME_FILE = 'aux-i18n.js';
const CATALOG = new URL('./catalog/', import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(`${name}.json`, CATALOG), 'utf8'));

export const ENGLISH = Object.freeze(read('en'));
/** Strings the first catalog didn't cover, keyed by hash: own-en.json, own-<locale>.json. A template
 * literal's substitutions appear as {1}, {2} in order. */
export const OWN = Object.freeze(read('own-en'));
const tables = () => Object.fromEntries(LOCALES.map(locale => [locale, {...read(locale), ...read(`own-${locale}`)}]));

const JSX_RUNTIME = 'browser-color-scheme-Df5VSuPV.js';
export const RUNTIME_IMPORTERS = Object.freeze([`assets/${JSX_RUNTIME}`, 'assets/newtab-editor-u_GbForB.js', 'background.js']);
const POSTHOG_END = '}catch(e){}}();';
const DISPLAY = /(?<![\w$.])(children|title|label|description|placeholder|"aria-label"|'aria-label'|actionLabel|tooltip|content|payload|message|subtitle):\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\$\n]|\\.)*`)/g;
const TOAST = /(\.(?:error|success|info|warning)\()("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\$\n]|\\.)*`)(?=[,)])/g;

/** The value of a JavaScript string literal with no substitutions. */
const literalValue = literal => JSON.parse(`"${literal.slice(1, -1).replace(/\\'/g, "'").replace(/\\`/g, '`').replace(/(?<!\\)((?:\\\\)*)"/g, '$1\\"')}"`);

const byEnglish = new Map();
for (const [key, {message}] of Object.entries(ENGLISH)) if (!byEnglish.has(message)) byEnglish.set(message, key);
for (const [key, message] of Object.entries(OWN)) if (!byEnglish.has(message)) byEnglish.set(message, key);

const call = (key, message, values) => `__auxT(${JSON.stringify(key)},${JSON.stringify(message)}${values?.length ? `,{${values.map((value, index) => `${index + 1}:${value}`).join(',')}}` : ''})`;
const TEMPLATE = /(?<![\w$.])(children|title|label|description|placeholder|actionLabel|tooltip|content|message|subtitle):\s*`((?:[^`\\$\n]|\$\{[\w$.?]+\})+)`/g;
/** A template literal as a catalog message and its substitutions; null if it has none. */
export function templateMessage(body) {
  const values = [], message = body.replace(/\$\{([\w$.?]+)\}/g, (all, value) => `{${values.push(value)}}`);
  return values.length ? {message, values} : null;
}

/** The runtime module: picks one table from the browser's language, once. */
export function runtimeModule() {
  return `const g=globalThis,T=${JSON.stringify(tables())};
const pick=tag=>{const t=String(tag||'').replace('_','-');if(T[t])return t;const l=t.toLowerCase();if(l.startsWith('zh'))return /tw|hk|mo|hant/.test(l)?'zh-TW':'zh-CN';if(l.startsWith('pt'))return 'pt-BR';const b=l.split('-')[0];return T[b]?b:null};
let tag;try{tag=g.chrome?.i18n?.getUILanguage?.()}catch{}
const locale=pick(tag||g.navigator?.language),table=locale?T[locale]:{};
g.__auxLocale=locale||'en-US';
g.__auxT=(key,english,values)=>{const text=table[key]??english;return values?text.replace(/\\{(\\w+)\\}/g,(all,name)=>name in values?values[name]:all):text};
`;
}

/** text with every catalog string at a display position wrapped, and how many of each. */
export function localize(text, used = new Set()) {
  const wrap = (literal, prefix) => {
    let message;
    try { message = literalValue(literal); } catch { return null; }
    const key = byEnglish.get(message);
    if (!key) return null;
    used.add(key);
    return `${prefix}${call(key, message)}`;
  };
  const template = (all, prop, body) => {
    const found = templateMessage(body), key = found && byEnglish.get(found.message);
    if (!key) return all;
    used.add(key);
    return `${prop}:${call(key, found.message, found.values)}`;
  };
  return text.replace(DISPLAY, (all, prop, literal) => wrap(literal, `${prop}:`) ?? all).replace(TOAST, (all, open, literal) => wrap(literal, open) ?? all).replace(TEMPLATE, template);
}

/** Anchors that sit in a position the sweep doesn't know: the catalog names each site exactly. */
export function localizeAnchors(relative, text, used = new Set()) {
  let result = text;
  for (const [key, {message, source, anchor}] of Object.entries(ENGLISH)) {
    if (source !== relative || used.has(key) || result.split(anchor).length !== 2) continue;
    const literal = [JSON.stringify(message), `'${message.replaceAll("'", "\\'")}'`, `\`${message}\``].find(form => anchor.includes(form));
    if (!literal) continue;
    result = result.replace(anchor, () => anchor.replace(literal, () => call(key, message)));
    used.add(key);
  }
  return result;
}

const IMPORT_RUNTIME = {[`assets/${JSX_RUNTIME}`]: `./${RUNTIME_FILE}`, 'assets/newtab-editor-u_GbForB.js': `./${RUNTIME_FILE}`, 'background.js': `./assets/${RUNTIME_FILE}`};

export function withRuntime(relative, text) {
  const target = IMPORT_RUNTIME[relative];
  if (!target) return text;
  if (relative === 'background.js') return `import "${target}";\n${text}`;
  if (text.split(POSTHOG_END).length < 2) throw Error(`Languages: ${relative} drifted`);
  return text.replace(POSTHOG_END, () => `${POSTHOG_END}import"${target}";`);
}

/** The chunks that get strings: those that run with the runtime loaded. */
export const carriesStrings = (relative, text) => relative in IMPORT_RUNTIME || text.includes(`/${JSX_RUNTIME}"`);

/** Numbers and times beside translated text follow the language; these are Aux's route sources, kept
 * byte-comparable to the supplied screens, so the change is made here. Sites whose output is parsed
 * back, or that sit inside an English sentence, stay en-US. */
export const FORMAT_EDITS = Object.freeze({
  'assets/extension-main-Dz1-AsCT.js': [[".indexedChunks.toLocaleString('en-US')", '.indexedChunks.toLocaleString(globalThis.__auxLocale)']],
  'assets/session-composer-Dc0LRfZA.js': [[".characterCount.toLocaleString('en-US')", '.characterCount.toLocaleString(globalThis.__auxLocale)'],
    ["function So(e, t = Date.now(), n = 'en-US') {", "function So(e, t = Date.now(), n = globalThis.__auxLocale || 'en-US') {"]],
  'assets/conversation-D9Q3VEsl.js': [["toLocaleTimeString('en-US', {hour", 'toLocaleTimeString(globalThis.__auxLocale, {hour']],
  'assets/detect-tools-Bq1QGFUu.js': [[".scannedVisits.toLocaleString('en-US')", '.scannedVisits.toLocaleString(globalThis.__auxLocale)']],
});

export function followLocale(relative, text) {
  let result = text;
  for (const [find, replace] of FORMAT_EDITS[relative] ?? []) {
    if (result.split(find).length !== 2) throw Error(`Languages: ${relative}: expected one ${find}`);
    result = result.replace(find, () => replace);
  }
  return result;
}

/** What a source block of a chunk reads after this pass. */
export const localizedBlock = (relative, block) => (FORMAT_EDITS[relative] ?? []).reduce((text, [find, replace]) => text.replaceAll(find, replace), localize(block));
