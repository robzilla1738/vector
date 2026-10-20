# Genuine standalone importer creator and Settings entry

Four source outputs: two new files, plus five counted PeopleHandler anchors against the current read-only native baseline. Root owns target registration/application/build. No shared native checkout changes or runtime operations.

## Callable owner

`aux_importer::ShowStandaloneImporter(Profile&, BrowserWindowInterface* owning_window)` reuses the actual same-original-profile importer app window (Show then Activate), otherwise creates the real trusted/user-gesture app popup named `aux-import-data`, centers **720×500** in the originating window bounds (restored-bounds fallback), chooses the matching display work area or primary fallback, applies `AdjustToFit`, adds one active `chrome://aux-import-data/` tab, configures native appearance and shows it. Real profile-creation failure returns null; the owner's actual off-record gate is preserved. There is no ordinary-tab fallback or generic successful creation result.

Original `4202ac4` and `4203838` prove the entire sequence. `7b64ba0` initializes type4 (AppPopup), trusted byte+20, name+28 and bounds+10; `4202dc0` writes uint16(1) at params+44. This is the same original postfactory write in the positively mapped cache creator `455d200` from `native-profile-switch-workspace`: **omit_from_session_restore=true, should_trigger_session_restore=false**. The current port uses those actual named155 fields, not numeric offset writes. The original's later +a0/+a2 zero writes are retained through the factory's default-zero state; no invented vertical-tab overrides are added.

Current155 reentrancy adaptations are bounded: weak Browser identity around native Show and navigation, weak Profile across actual window creation, and weak Widget after native style mutations. A real failed tab creation retires only the just-created widget; it never closes another browser. Existing-window reuse remains based on actual app marker plus original Profile, exactly as the original predicate.

## Full original AppKit appearance

The bounded `458cc00..458cf98` body is ported rather than using account-popup styling:

* Remove miniaturizable/resizable style bits, add full-size-content style. Unless already full-screen-auxiliary, remove primary/auxiliary full-screen collection bits.
* Use the original SkColorToSRGBNSColor conversion (8a546ec: float /255, NSColorSpace.sRGBColorSpace/components/count4), provided unchanged by actual155 skia/ext. Query the actual Widget color mode for original semantic role243 **before** forcing DarkAqua. Original mixer `35e8438..35e84f0` gives dark **ff18181b**, light **ffffffff**; role243's table tuple and the imported NSAppearanceNameDarkAqua binding are pinned. No155 numeric ColorId is reused.
* Set DarkAqua, opaque window/background, actual content and immediate native superview layers with the same background.
* Empty title, hidden title text, transparent titlebar, background-window dragging.
* Close button visible/enabled; miniaturize and zoom hidden/initially disabled; then original final enable-all-three sequence. The otherwise redundant final enable calls are retained, so hidden controls and enabled state match the supplied code.

The page itself retains the supplied HTML/CSS/resources. No independent UI is introduced.

## Actual entry, not a new extension API

Exact registration `7dc5134..5168` binds `4202ac4` under the23-byte Settings message **openBrowserImportWindow**, immediately between **ShowAccountSettingsUI** and **SetDatatype**. These neighbors match actual155 `settings::PeopleHandler::RegisterMessages`. The proposal adds that original empty-args message and native handler under `ENABLE_AUX_BROWSER && IS_MAC`. The handler passes its actual Profile and actual browser containing the Settings WebContents. It does not add `auxBrowserImport` IDL/CDP methods or broaden renderer authority.

The already delivered strict standalone-authority helpers can safely capture controls/retirement only from this owner. Direct navigation in an ordinary browser remains insufficient authority. Root's import Handler remains untouched here; it should reject unsupported ordinary contexts as already documented.

## GN integration guidance

Root plans the `.mm` in main `//chrome/browser/ui` (real browser creation/navigation already live there), with a header-only importer `:standalone_window` interface consumed by UI and Settings `:impl`. Add actual Views/Display/UI color headers and **AppKit/QuartzCore** frameworks; avoid an importer-to-full-UI dependency cycle. This proposal does not edit shared GN or root composition.

Verification: whole original thin hash, eight bounded code ranges,22 selector trampoline bytes, three exact entry/host literals, color-role/DarkAqua/empty-title data, all baseline/output hashes, five single-use anchors and four-output disposable patch replay. No build, native launch, profile read/create, window/Keychain/OS action or runtime acceptance is claimed. Current normal-profile auth startup remains its separate real boundary.
