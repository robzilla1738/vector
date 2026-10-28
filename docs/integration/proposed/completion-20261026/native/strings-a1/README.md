# strings-a1: Chrome/Chromium rewording and launch languages

2026-10-28. Applied to the durable checkout on 2026-10-28 (01–04). Agent plan Phase 1A (Google and Chrome surfaces, strings) and Phase 3 (Languages, decision 9). Nothing was written to the checkout; every change is a count-checked edit spec for `scripts/candidate/apply_checkout_edits.py`.

## Apply

```sh
python3 scripts/candidate/apply_checkout_edits.py --check docs/integration/proposed/completion-20261026/native/strings-a1/edits/0{1,2,3,4}-*.json
python3 scripts/candidate/apply_checkout_edits.py         docs/integration/proposed/completion-20261026/native/strings-a1/edits/0{1,2,3,4}-*.json
python3 scripts/strings/build_checkout_strings.py check    # after applying: every Aux-changed message has all 9 launch translations
```

The applier simulates every edit in order first and writes nothing on any mismatch. Then rebuild natively (`python3 scripts/native-build.py …`) and re-export `chromium/tree`.

## Edit files

| File | What |
|---|---|
| `edits/01-english.json` | Part A English rewording in `.grd/.grdp` (239 messages), the new `chrome/app/aux_strings.grdp` (291 `IDS_AUX_*` messages) and its `<part>` include in `generated_resources.grd` |
| `edits/02-code.json` | C++ edits in 40 files (Aux-owned views, their Aux hunks in upstream views, and the restart dialog in `chrome_browser_main.cc`): 228 literals plus 16 formatted strings move to `l10n_util::GetString(F)UTF16(IDS_AUX_…)`, the 47 profile icon names move to IDs (`ProfileIndicatorIconDescriptor::label_id`), and the two includes each file needs |
| `edits/03-xtb.json` | One append per `.xtb` (54 files): translations for es, fr, de, pt-BR, it, ja, ko, zh-CN, zh-TW |
| `edits/04-settings-labels.json` | Settings labels without Google: "You and Google" → "You and Aux" (`IDS_SETTINGS_PEOPLE`) and "Google services" → "Services" (`IDS_SETTINGS_GOOGLE_SERVICES_PAGE_TITLE`), with the nine translations derived from Chromium's own. Applied after 01–03 |

## Sources (inputs to `scripts/strings/build_checkout_strings.py build`)

- `part-a.json`: per-message decisions. `swap` replaces the product name outside proper names; `[old, new]` replaces exact text (support links now point to `https://app.getaux.co/docs`); a third `"en"` element marks an English-only grammar fix ("a Aux" → "an Aux"). `skip` records why 155 Chrome strings stay (Google sign-in/sync, Gemini/Glic/actor, iOS promos, proper names such as Chrome Web Store, Chrome Apps, Chrome Enterprise, Chrome Root Program, legal notices). `swept_files` lists the files an earlier branding sweep changed without translations.
- `aux-literals.json`: the `IDS_AUX_*` messages with translator descriptions, the literal→ID map, and the hand-written edits for concatenated strings.
- `translations/<locale>.json`: hand translations for what could not be derived mechanically. `translation-requests.json` lists those requests with the upstream reference translation; `summary.json` has the counts.
- `glossary.md`: terms and tone per locale.
- `extension-i18n.md`, `extension-catalog/`: the Agent extension plan (no i18n layer exists; D8 is four `en-US` formatter edits in `integration/extension-ui-a1/edits.json`) and a 455-key catalog in all nine locales.

## How translations were made

Changing English changes grit's message ID, so the old translation stops matching. The builder computes IDs with grit itself (`tools/grit`, imported read-only) and:

1. **Mechanical** (7,156): for a message whose new English is the upstream English with the product name swapped, it takes Chromium's upstream translation and swaps the name the same way, only when the name count matches the English; Korean particles and French elision are corrected (`Aux를`, `d'Aux`). This also restores translations for about 600 messages the earlier Chromium→Aux sweep left English-only in every locale.
2. **Translation memory**: an `IDS_AUX_*` message whose English already exists in Chromium (Settings, Downloads, Task Manager…) reuses that ID's translation, so it needs no entry at all.
3. **Hand** (2,492 entries across the nine locales: 142 reworded Chromium messages and 235 `IDS_AUX_*` messages): everything else, checked by `build_checkout_strings.py validate` (placeholders, well-formed XML).

## Not done here

- `IDS_*` strings outside the launch languages fall back to English Aux text (grit `fallback_to_english="true"`), not "Chrome".
- Literals kept: "Aux Tasks" (a bookmark folder matched by name), the location-bar "Aux", file extensions.
- The extension catalog is a plan input; the transforms that inject it, and removing the four D8 edits, belong in the extension delta.
- `extension-catalog/de.json` still uses "Sie"; the native strings use Chromium's "du".
