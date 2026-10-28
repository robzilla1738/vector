# Agent extension localization (strings-a1, Phase 3 item 3)

2026-10-28. Read-only investigation plus a proposed catalog. Nothing in the candidate, the pipeline or git was changed.

Inputs read: the sealed candidate extension `out/provided-candidate-completion-20261026-a1/Aux.app/Contents/Resources/aux/apps/extension/dist` (`EXT` below) and the frozen supplied copy `out/provided-source-snapshot-1.26.1016.1852/agent`. The snapshot holds the same minified bundle and no source maps. Its only `.map` files belong to `node-pty` in the daemon. So the candidate's minified chunks are the only source, and every change has to be a count-checked text edit on them.

Deliverables in this folder:

- `extension-i18n.md`: this plan.
- `extension-catalog/en.json`: 455 keys. Each key has `message`, `description`, `source` (a path relative to `EXT`) and `anchor`. Every anchor occurs exactly once in its source file and contains the English literal exactly once.
- `extension-catalog/{es,fr,de,pt-BR,it,ja,ko,zh-CN,zh-TW}.json`: `{"key": "translation"}` for all 455 keys. They follow `glossary.md`.

## 1. How strings are held today

The extension has **no i18n layer**. All UI copy is English literals inlined in minified React code.

- There is no `_locales/`, no `default_locale` in `manifest.json`, no `chrome.i18n.getMessage` and no `__MSG_` placeholders. There is also no i18next, react-intl, `useTranslation` or `formatMessage`.
- The only `chrome.i18n` uses are behavioral, not copy:
  - `background.js` `Zg(chrome.i18n.getUILanguage())` and `assets/translate-status-B2-Ij1Y9.js` pick the target language for "Translate this page".
  - `assets/voice-dictation-overlay-CtbBZWfm.js` sends `getUILanguage()` as the speech-to-text language.
  - `content/content.js` calls `chrome.i18n.detectLanguage`.
- Copy appears in these positions:
  - JSX props: `children:"…"`, `title:`, `label:`, `description:`, `placeholder:`, `"aria-label":`, `actionLabel:`.
  - JSX child arrays: `children:["Last updated at ",x]`.
  - Toast calls: `Z.error("…")`, `w.success("…")`.
  - Module-level config objects, such as the settings search index `q2=[{path:…,title:"Theme",description:"Choose how Aux looks"}]` and the settings nav `y=[{title:"Personal",items:[{label:"General"…}]}]`.
  - Template literals, such as `` `Connect Aux to ${t}` ``.
- The bundle is Vite/rolldown output: 1,056 JS chunks, 251 of which use the JSX runtime. **All 251 import `assets/browser-color-scheme-Df5VSuPV.js`**, which holds React's `jsx` runtime and has no imports of its own. Each chunk starts with the same PostHog chunk-id IIFE (`!function(){try{…}catch(e){}}();`).

### Pages and bundles that hold UI

| Page (HTML) | Entry chunk | Main UI chunks |
|---|---|---|
| `sidepanel.html`, `main.html`, `minipopup.html`, `account-password.html` (same 6,590-byte shell, router-driven) | `extension-main-Dz1-AsCT.js` | chat: `sidebar-Cj9gldy1.js`, `sidepanel-CI-CbXmY.js`, `-components-4o0FSqQ9.js`, `_sessionId-ClN_BWh5.js`, `session-composer-Dc0LRfZA.js`, `conversation-D9Q3VEsl.js`, `permission-approval-D-GTf91U.js`, `model-select-BvZsM1Kl.js`, `tasks-*.js`, `projects-*.js`; settings: `route-TQyeTEXE.js` (nav and search index), `general-3dgRbrRk.js`, `appearance-*.js`, `privacy-BeEEt9Qu.js`, `account-Dr_CA8LL.js`, `agents-urkO3LLg.js`, `channels-CJn5l9_T.js`, `provider-Cw0zhujt.js`, `connect-dialog-CacgpFap.js`, `mcps-*.js`, `developers-*.js`, `settings-DguZi_c6.js` (memory), `archived-chats-*.js`, `mini-popup-BBLwe-a8.js`, `inbox-*.js`, `context-awareness-*.js`; onboarding: `onboarding-helper-*.js`, `import-browser-*.js`, `use-browser-importer-*.js`, `done-DPzI9pFd.js`, `full-disk-access-*.js`, `splash-D666ivBP.js`, `sign-in`/`sign-up`/`email-code-verification` |
| `newtab.html` | `newtab-editor-u_GbForB.js` (runs first, **does not import the runtime chunk**), then `newtab-CnOLQ0yu.js` | `search-view-*.js` |
| `tabsearch.html` | `tabsearch-3k_2hgil.js` | none |
| `minipopup.html` (Mini popup) | `minipopup-LkDLFvnq.js` | reuses composer and permission chunks |
| `notification.html` | `notification-BC4Db68a.js` (no copy found) | none |
| `iframe.html` (in-page overlays: lasso, capture) | `iframe-Cu8MKeFf.js` | `lasso-*.js`, `capture-toolbar-*.js` |
| Service worker | `background.js` (unminified module) | context menus "Capture", "Translate this page", `` `Translate this in ${t}` `` |

## 2. How D8 is implemented and where to remove it

D8 ("pin the extension to English for launch") is **not** a manifest, native or locale switch. The extension has no catalog to pin, so D8 is just four count-checked edits in `docs/integration/proposed/completion-20261026/integration/extension-ui-a1/edits.json` (README: "D8: … the four number and date formatters that used the browser locale now use `en-US`"). They are applied through `prepare_edits.py`, so they are present in the a1 candidate:

| File (`EXT/assets/`) | Supplied bytes | D8 edit (current candidate) |
|---|---|---|
| `extension-main-Dz1-AsCT.js` | `e.indexedChunks.toLocaleString()` | `e.indexedChunks.toLocaleString("en-US")` |
| `session-composer-Dc0LRfZA.js` | `e.pastedText.characterCount.toLocaleString()` | `…toLocaleString("en-US")` |
| `conversation-D9Q3VEsl.js` | `toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})` | `toLocaleTimeString("en-US",{…})` |
| `detect-tools-Bq1QGFUu.js` | `s.scannedVisits.toLocaleString()` | `…toLocaleString("en-US")` |

Nothing else pins the locale:

- `rg "D8|en-US|locale"` over `scripts/` finds only an unrelated comment about locale paks in `repair_combined.py`.
- `chromium/tree/aux.patch` has no extension-locale switch.
- There is no native flag.
- `release-audit/components.md` lists the residuals that D8 left alone: `conversation-*.js` `toLocaleString([],{month…})`, `markdown-*.js` `Intl.NumberFormat()` and the dictation language.

**Removal** means four edits that restore the supplied bytes, each count 1 (verified on the a1 candidate):

```json
{"target":"Contents/Resources/aux/apps/extension/dist/assets/extension-main-Dz1-AsCT.js","edits":[{"find":"e.indexedChunks.toLocaleString(\"en-US\")","replace":"e.indexedChunks.toLocaleString()","count":1,"why":"Unpin D8: follow the browser locale"}]}
```

The other three follow the same pattern, with `[]` restored for the `conversation` time. The supplied code also hard-codes `en-US` in places D8 never touched. Handle them like this:

- **Switch** `session-composer-Dc0LRfZA.js` `function So(e,t=Date.now(),n="en-US")` to `n=globalThis.__auxLocale||"en-US"` (count 1). It formats chat day separators ("Today", weekday, date) beside translated copy. Its `" at "` separator is English and needs a catalog key (§5).
- **Keep `en-US`:**
  - `model-BrFuJM2w.js` `Et=t=>t.toLocaleString("en-US")`. Its output is parsed back by `_t`, which strips only `[,_\s]`, so a German `1.000` would break the round trip.
  - `date-CxUVm-Dr.js`, the dayjs timezone plugin, which uses `en-US` only to parse.
  - The billing chunks (`add-on-credits-dialog`, `pricing-table-shared`, `payment-use`), which are hidden by D4.
- **Later, with their sentences:** `strip-markdown-DRcmtuJc.js` builds "today / tomorrow / on {date} at {time}" with `en-US`. `tool-definition-registry-Cc6FCFb2.js` uses `Intl.ListFormat("en-US")` and `PluralRules("en-US")` for routine schedules and "N unmodified lines", and `provider-Cw0zhujt.js` uses `ListFormat("en")` ("Weekdays", "Everyday"). These pieces are English sentences, so they move to the catalog with placeholders, and the formatter takes `__auxLocale` in the same edit.

## 3. Design

### Decision: a runtime catalog in an existing chunk, with stable keys and per-site count-checked edits

**Option rejected: `_locales/<l>/messages.json` plus `default_locale`.** Three things rule it out:

1. **The approved executor forbids it.** `repair_combined.py` accepts only existing leaves ("Only enumerated existing leaves may change"). It checks that packaged coverage is unchanged ("Unexpected packaged resource coverage change"). For the manifest, it allows only a strictly newer `version` and dropping `web_accessible_resources` entries (`old_manifest==new_manifest`). New `_locales/*` files and a `default_locale` key would need a new executor, a new review hash (`approvedReviewSha256`) and owner approval.
2. **It saves no edits.** The bundle still has no `getMessage` calls, so every literal needs the same per-site edit either way.
3. **It covers nothing extra.** `chrome.i18n.getMessage` follows the same browser UI language that `getUILanguage()` returns.

**Option rejected: intercepting the `jsx` runtime and translating any string child that matches a catalog English text.** It would change only one file, but it would also translate user and web content that happens to match. A tab titled "History", a bookmark "Settings" or a chat reply "Cancel" would all change. It also can't reach toasts, `document.title` or service-worker strings. English keys also collide: "Read" is both a permission kind and a delivery status, "Open" is both a verb and a state, and the target languages translate these differently.

**Chosen design:**

1. **A prelude** goes into `assets/browser-color-scheme-Df5VSuPV.js`, immediately after its PostHog IIFE. Every UI chunk imports this chunk, and ES modules evaluate dependencies first, so `__auxT` exists before any chunk body runs. That includes module-level config such as the settings index. The prelude:
   - holds the nine locale tables (no English table, because English stays inline at each site);
   - picks a table once from `chrome.i18n.getUILanguage()` (falling back to `navigator.language`). The lookup tries the exact tag, then a mapped tag (`pt`→`pt-BR`, `zh`/`zh-Hans*`/`zh-SG`→`zh-CN`, `zh-TW`/`zh-HK`/`zh-MO`/`zh-Hant*`→`zh-TW`), then the base language (`es-419`→`es`, `fr-CA`→`fr`), then English. `pt-PT` maps to `pt-BR` because it is closer than English; owner to confirm;
   - sets `globalThis.__auxLocale` ("en-US" for English, otherwise the chosen tag);
   - defines `__auxT(key, en, vars)`, `__auxN(key, n, enOne, enOther, vars)` for plurals through `Intl.PluralRules(__auxLocale)` with `key.one`/`key.other` entries, and `__auxR(key, en, parts)` for rich text. `__auxR` returns an array that splices JSX elements into `{name}` slots;
   - when `getUILanguage()` is `en-XA`, the pseudo-locale Chromium already ships (`Aux Framework.framework/…/Resources/en_XA.lproj`), returns pseudo-text generated from `en`: accented, about 40% longer, in brackets. This gives a pseudo run with no extra build, and normal users can't select `en-XA` in macOS.
2. **A smaller prelude** goes into `background.js` with only the background keys. `background.js` is a separate module service worker.
3. **Modules that run before the runtime chunk** get a side-effect import: `newtab-editor-u_GbForB.js` executes before `newtab-CnOLQ0yu.js` and imports nothing that loads the prelude. Edit: `}catch(e){}}();import{` → `}catch(e){}}();import"./browser-color-scheme-Df5VSuPV.js";import{` (count 1). `newtab.html` already modulepreloads that chunk, so this costs no fetch, only earlier evaluation. Verify the theme still applies.
4. **Each catalog site** becomes `__auxT("key","English")`. English stays inline as the fallback, so a missing key or prelude degrades to today's text, and the edit stays readable in review.

Key style: `surface.name` (`sidebar.new_chat`, `settings.theme`). Keys are stable across bundle refreshes. When the supplied bundle changes, only anchors move.

### Where the edits live and how they are produced

- **A new generator, `scripts/candidate/build_extension_i18n.py`** (to write). It reads `extension-catalog/*.json` and a site list, then writes `docs/integration/proposed/completion-20261026/integration/extension-i18n-a1/edits.json` in the existing `aux.candidate-edits.v1` format. The receipt README sits next to it, as with `extension-ui-a1`.
- **Site list.** `en.json` gives one verified anchor per key. The generator also searches the surface's files for every other occurrence of the same JSON literal in a display position (allowlisted prop names, toast calls, the settings index and nav arrays). It gives each one its own unique anchor and records it, so a reviewer can refuse logic uses such as `value:"search"` or `===`. In the source files, 56 of the 455 keys occur more than once, for 518 literal sites in total. A single key must cover the same text in the settings index and on the page, because search matches on those titles.
- **Overlapping anchors.** Ten anchor pairs overlap, so the generator merges them into one edit per file that rewrites both literals (count 1):
  - `_sessionId`: `session.completed`/`session.paused`;
  - `permission-approval`: `approval.read`/`approval.write`;
  - `session-composer`: `composer.effort`/`composer.model`;
  - `route-TQyeTEXE`, a chain: `task_notifications`→`access_permission`→`file_permission_desc`→`follow_up_behavior`→`follow_up_desc`→`messages_access`, plus the pairs `advanced`/`recent_chats` and `connect`/`default_model`.
- **Applying the edits.** Run `prepare_edits.py --app <candidate> --edits …/extension-i18n-a1/edits.json --out <dir>`, then `freeze_plan.py --resource …` for each leaf, then `repair_combined.py`. All edited leaves are `.js` under `EXT`, which `resource_leaf()` allows. The same edits file also bumps `manifest.json` `"version": "1.26.1016.1890"` to `…1891`, following the `extension-ui-a1` pattern, so that Chromium reloads the component extension.

### Transform shape: worked examples from the a1 bundle

Each is one entry in `files[].edits` (`target` is under `Contents/Resources/aux/apps/extension/dist/`). Every `find` was verified with count 1.

**A. The prelude** (`assets/browser-color-scheme-Df5VSuPV.js`):

```json
{"find":"}catch(e){}}();var cn=Object.create,","replace":"}catch(e){}}();/* Aux i18n */(()=>{const g=globalThis;if(g.__auxT)return;const C={\"es\":{…},\"fr\":{…},…};…g.__auxLocale=…;g.__auxT=(k,e,v)=>…;g.__auxN=…;g.__auxR=…})();var cn=Object.create,","count":1,"why":"Extension i18n: runtime catalog keyed by stable ids, chosen by chrome.i18n.getUILanguage()"}
```

**B. A JSX child** (`assets/sidebar-Cj9gldy1.js`, key `sidebar.new_chat`; `en.json` anchor `children:"New chat"`):

```json
{"find":"children:\"New chat\"","replace":"children:__auxT(\"sidebar.new_chat\",\"New chat\")","count":1,"why":"i18n sidebar.new_chat"}
```

**C. Module-level settings index** (`assets/route-TQyeTEXE.js`, keys `settings.theme` and `settings.choose_how_aux_looks`). The index is evaluated at import, after the prelude:

```json
{"find":"title:\"Theme\"","replace":"title:__auxT(\"settings.theme\",\"Theme\")","count":1,"why":"i18n settings.theme"},
{"find":"description:\"Choose how Aux looks\"","replace":"description:__auxT(\"settings.choose_how_aux_looks\",\"Choose how Aux looks\")","count":1,"why":"i18n settings.choose_how_aux_looks"}
```

**D. A toast** (`assets/minipopup-LkDLFvnq.js`, key `minipopup.save_draft_failed`):

```json
{"find":"\"Could not save this draft. Keep this window open and try again.\"","replace":"__auxT(\"minipopup.save_draft_failed\",\"Could not save this draft. Keep this window open and try again.\")","count":1,"why":"i18n minipopup.save_draft_failed"}
```

**E. Service worker** (`background.js`, key `contextmenu.translate_page`; the background prelude goes before `const auxBoundBrowserMethods=new Set(`, count 1):

```json
{"find":"title: \"Translate this page\"","replace":"title: __auxT(\"contextmenu.translate_page\",\"Translate this page\")","count":1,"why":"i18n contextmenu.translate_page"}
```

Interpolated copy (later batch) uses placeholders, for example `` title: `Translate this in ${t}` `` → `title: __auxT("contextmenu.translate_selection","Translate this in {language}",{language:t})`. A child array that mixes text and a link, such as `import-browser` "You can import browser data anytime in" + link + "so you don't have to…", is replaced as a whole with `children:__auxR("onboarding.import_later","You can import browser data anytime in {settings} so you don't have to configure Aux from scratch.",{settings:(0,e.jsx)(…)})`.

## 4. String inventory

Method: a scripted pass over all 1,056 chunks (`python3 -I`). It collected string literals in display positions (the prop names above, JSX child arrays and toast calls) from the 251 JSX chunks plus `background.js`. It filtered out CSS classes, identifiers, URLs, log text (`[Tag] …`) and analytics keys. It excluded third-party text (Shiki language names, KaTeX and Mermaid option docs), the redirected routes that never render (billing, password manager and Vault, `/artifact-test`, `/error-test`, `/liquid-glass-playground`, the chat playground) and the D4 payment chunks.

**Total estimate: about 1,600 unique literal strings (about 6,600 English words) across about 104 UI chunks.** That figure includes about 70 onboarding-animation fixture strings in `splash-D666ivBP.js` ("Check Netflix usage", "Daily briefing"…). Add about 50 interpolated template literals and about 50 toast templates, plus a tail the pattern scan misses: strings in plain arrays (settings `sections:[…]`), `useState("…")` defaults and helper arguments. **Plan for 1,700–1,800 messages and about 2,000 edit sites.** The excluded hidden chunks add about 500 more strings, which should not be translated.

Per surface (unique strings; surfaces share some, so the rows overlap):

| Surface | Unique strings | Notes |
|---|---|---|
| Settings and options (all settings pages, settings search index and nav, providers, connect dialog, agents, channels, MCPs, memory, privacy, archived, tasks and projects) | ~950 | largest: `route-TQyeTEXE` 137, `connect-dialog` 96, `agents` 85, `channels` 80, `provider` 71, `privacy` 69, `account` 56, `appearance` 48, `general` 45 |
| Chat side panel (sidebar, session header, composer, conversation, approvals, model select, artifacts, diff viewer) | ~550 | `session-composer` 118, `conversation` 61, `_sessionId` 50, `permission-approval` 25 |
| Onboarding and sign-in | ~170 | about 70 of them are splash animation fixtures |
| Mini popup | ~30 | |
| Tab search | ~10 | |
| New tab | ~8 | including `newtab-editor` placeholders |
| Service worker | 3 | context menus |

**In this catalog: 455 keys** (518 literal sites in their source files) for the main surfaces: common buttons 30, chat sidebar and side panel 12, tab search 8, new tab 7, Mini popup 24 + 5 settings, profile menu 2, settings nav, pages and search index 127, General 17, Memory 9, archived chats 14, approvals 13, model select 8, onboarding 50, chat session menu 32, composer 45, conversation 25, tasks 17, projects 4, feedback dialog 4, context menus 2. Every entry is a complete literal (no fragments, no `${}`); strings tied to hidden Pro/credits/Ultrabrowse features (D4/D6) were left out.

- common buttons: 30
- chat sidebar and side panel: 12
- tab search: 8
- new tab: 7
- Mini popup: 25 + 5 settings
- profile menu: 2
- settings nav, pages and search index: 133
- General: 17
- Memory: 9
- archived chats: 14
- approvals: 13
- model select: 8
- onboarding: 57
- chat session menu: 33
- composer: 46
- conversation: 25
- tasks: 17
- projects: 4
- feedback dialog: 4
- context menus: 2

Every entry is a complete literal (no fragments, no `${}`). Strings tied to hidden Pro, credits or Ultrabrowse features (D4/D6) were left out.

## 5. Risks

- **Seal, receipts and hashes.** Edited chunks keep their Vite hashed file names. Nothing at runtime checks a name against its content, but `verify-candidate.py` pins (89 today) and `bundle.json` change on reseal, and `repair_combined.py` rewrites the sha256 and bytes of the packaged records. The manifest version must go up or Chromium keeps the cached component extension. The prelude in `browser-color-scheme-*` adds about 250 KB for this catalog and about 1 MB at full coverage. Every page parses it.
- **Count drift.** A later supplied refresh or another edits file touching the same chunk (`extension-ui-a1` already edits `extension-main`, `route-TQyeTEXE`, `session-composer`, `conversation` and `channels`) makes counts fail loudly. That is intended: regenerate anchors from `en.json` messages, never hand-patch.
- **Logic uses of literals.** Some English literals are also compared or used as values (`value:"search"`, `e.mode==="read"?"Read":"Write"`). Only the display literal in the anchor is wrapped. The site list must mark every extra occurrence as display or logic before the generator includes it.
- **Concatenation.** Fragments can't be translated as they stand:
  - `"Last updated at "` and `" chunks"` (`extension-main`);
  - `" hosts from "…" visits in the last "…"days (…noise hosts dropped)"` (`detect-tools`);
  - `"Others "` and `"Settings "` (`import-browser`);
  - `"Replying to "` and `"Updated "` (`conversation`);
  - `"Page "` (`archived-chats`);
  - `" at "` (`session-composer` `So`);
  - "today/tomorrow/on … at …" (`strip-markdown`);
  - `` `${r.length-3} more` `` and `` `day ${n}` `` (`tool-definition-registry`).

  Each array or template is replaced whole with a placeholder message (`__auxT`/`__auxR`).
- **Plurals.** "credit/credits", "N unmodified line(s)", "N more" and day counts use `__auxN` with `.one`/`.other`. Japanese, Korean and Chinese use `other` only, and the European locales use one/other. None of the 455 keys needs a plural.
- **Dates and numbers.** See §2: switch `So`, revert the four D8 edits, keep `model-*` `Et` and the dayjs parse in `en-US`, and give `strip-markdown` and `tool-definition-registry` locale-aware sentences.
- **Layout.** German is about 30% longer and French adds no-break spaces. One fixed-width spot is known: the new tab Search/Ask switch has `[&_button]:w-16` (4 rem), so "Rechercher" and "Demander" may clip. Its fix is a separate layout edit (`w-auto px-3`), recorded as a localization adaptation, not a redesign. CJK text falls back from AuxDisplay to the system font (Hiragino, PingFang, Apple SD Gothic), which is expected.
- **Agent-facing text.** `onboarding.fda.confirm_enabled` ("I've enabled the macOS permission. Please continue.") is sent to the agent as a message. Translating it is harmless. Prompt bodies (suggested tasks, "Use this prompt") are not in the catalog and should stay as they are.
- **Glossary gaps.** These terms aren't in `glossary.md`. The terms used here should be added:

  | English | es | fr | de | pt-BR | it | ja | ko | zh-CN | zh-TW |
  |---|---|---|---|---|---|---|---|---|---|
  | Mini popup | Minipopup | Mini-fenêtre | Mini-Pop-up | Minijanela | Mini popup | ミニポップアップ | 미니 팝업 | 迷你弹出窗口 | 迷你彈出式視窗 |
  | Lasso | Lazo | Lasso | Lasso | Laço | Lazo | なげなわ | 올가미 | 套索 | 套索 |
  | Context Awareness | Conciencia del contexto | Connaissance du contexte | Kontextbewusstsein | Percepção de contexto | Consapevolezza del contesto | コンテキスト認識 | 컨텍스트 인식 | 情境感知 | 情境感知 |
  | Subagents | Subagentes | Sous-agents | Subagenten | Subagentes | Subagenti | サブエージェント | 하위 에이전트 | 子智能体 | 子代理程式 |
  | Session | sesión | session | Sitzung | sessão | sessione | セッション | 세션 | 会话 | 工作階段 |
  | Memory | memoria | mémoire | Gedächtnis (memories: Erinnerungen) | memória | memoria | メモリ | 메모리 | 记忆 | 記憶 |

- **Branding.** `newtab.drag_image_lens` is supplied copy that names Google Lens. It is translated as supplied. Whether it should show at all is a separate UI decision.

## 6. Verification

1. **Static checks.**
   - Validate the catalog: identical key sets, valid JSON, placeholders, numbers and "…" preserved, and Aux/Peek untranslated. This passed for this deliverable with a `python3 -I` checker: 455 keys × 9 locales, every anchor unique in the candidate.
   - After `prepare_edits.py`, parse every edited chunk with `node --check --input-type=module`.
   - Confirm each catalog key appears in at least one edit and that the count of `__auxT(` equals the number of wrapped sites.
   - `rg '"en-US"'` must show only the kept sites.
   - `pnpm test`.
2. **Pseudo-locale run.** Launch the resealed candidate through `Launch Aux.command` with a disposable profile and `-AppleLanguages '(en-XA)'` passed to that process only. The launcher may need an extra-args pass-through, and the system language must not change. Chromium's own `en_XA` pak pseudo-localizes native UI, and the prelude pseudo-localizes catalog strings. Walk these surfaces:
   - the sidebar and side panel chat: send a message, trigger an approval, the share dialog, archive and delete dialogs;
   - the new tab in both modes, including placeholders and the drag overlay;
   - tab search;
   - the Mini popup;
   - every settings page and the settings search;
   - onboarding on a fresh profile, including import and done;
   - the page context menu.

   Any plain English text is a missed string; any clipped bracket is a truncation. List both in STATUS.
3. **Japanese run** (`-AppleLanguages '(ja)'`). Check:
   - that `getUILanguage()` returns `ja` (DevTools on the side panel);
   - CJK font fallback and line breaking in settings descriptions;
   - the chat day separators ("今日", weekday) once `So` follows `__auxLocale`;
   - that the "Translate this page" target is still Japanese.
4. **German run** (`-AppleLanguages '(de)'`). Check:
   - long labels in the settings nav, new tab mode switch, composer menus and approval card;
   - number formatting in the memory chunk count and pasted-text size;
   - that the model token input still accepts and round-trips values, since `Et` stays `en-US`.
5. **Fallback.** A non-launch locale such as `sv` must show English copy with no errors (unknown locale falls back to `en`), and `pt-PT` must show the `pt-BR` table.
6. **Record** observed results and gaps in `docs/STATUS.md` as usual.

## 7. Next steps

1. Write `build_extension_i18n.py`, including the site list, the logic-or-display review and the merged overlapping anchors, and generate `extension-i18n-a1/edits.json` for these 455 keys plus the D8 revert and the `So` switch.
2. Reseal, run the pseudo-locale, Japanese and German runs, and fix truncation.
3. Extend the catalog in batches to the rest of settings (providers, connect dialog, agents, channels, privacy, account) and the remaining chat surfaces. Then do interpolated and fragment messages with `__auxT`/`__auxR`/`__auxN`, up to the ~1,750 estimate.
