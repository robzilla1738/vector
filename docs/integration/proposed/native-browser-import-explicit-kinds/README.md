# Supplied explicit import-kind contract

Narrow first slice of original browser-import recovery, atop actual416. One count-checked existing source change. Proposed only; no shared edit, build, helper/OS operation or source-profile data read.

Original startImport4276580 admits **omitted** dataKinds for full import or **exactly [`bookmarks`]** for partial import. At4276984 it requires a List,4276994..99c length1,42769a4 typeString,42769c4 length9 and42769cc..69f8 the exact bookmark bytes. Omission branches directly to a false bookmarks-only flag at4276a94; success stores true at42769fc. Other explicit kinds/lists return actual Invalid import options. This is not a guessed importer ImportItem bitmask.

The current independent service admitted arbitrary supported explicit kinds and a public categories alias; that overstates the supplied native API. This proposal validates the real supplied dataKinds shape before selecting a source path or starting work. Full default source/migrator selection remains unchanged and incomplete; encrypted capabilities are not widened. A malformed/unsupported explicit request still fails rather than importing the default full set.

The existing `categories` alias is retained **only** for the actual separately identified internal native-import-webui caller, whose current fixed renderer explicitly constructs that field. It is rejected for Agent/Vault extension calls and does not become a supplied feature. This avoids silently turning that existing internal partial selection into full import. That retired recovery WebUI is not represented as fidelity evidence or an original supplied surface.

No schema change/GN/dependency is required: supplied IDL startImport already takes extensible JsonObject. Source UI passes dataKinds unchanged (or omits it), so its behavior is preserved. This does not claim full source/category import acceptance, Safari/Arc metadata support or source-key authority.

Further recovery positively confirms atlas→chatgpt-atlas alias and separate original Firefox/Chromium/Safari native jobs. Their missing full migrator behavior remains separate; no new Safe Storage families, NSS substitute or raw secret parser is inferred from this validation change. Root may apply/compile this first slice while the source-owned migrator recovery continues.

Verifier checks original byte/source pins and replays the one-file patch in a temporary tree only.
