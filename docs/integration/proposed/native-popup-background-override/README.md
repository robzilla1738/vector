# Supplied popup effective-background override

Proposal only. No shared writes, native compile/launch/signing, owner profile or OS action. Four-file incremental patch after `native-mini-popup-transparency`: exact popup input`1af1ab19d632beed41ee0d35524a0604167d60a8cfd14d926ccc06493d938f25`; actual current content public/base files are included as pinned baselines. Compose after root v62, retaining its unrelated header hooks. No GN, macOS, NTP/transition or profile-switch edit is required.

## Actual third color slot

The previously unresolved final04598fcc call is an **optional effective-background override**, distinct from both renderer content color and default color. Original vtable neighbors identify032a83c0(default setter),404c900(optional override setter),404c8d0(content setter) and404ca04(base getter) /69e535c(Mac getter). The field at`+0x158` wins over content`+0x150`, which otherwise wins over default`+0x160`.

This patch restores that behavior through a narrow public `SetBackgroundColorOverride(optional<SkColor>)` and its RenderWidgetHostViewBase implementation. The spelling is a local port name, not a recovered original symbol or a new extension wire contract. Present colors require transparent/opaque alpha; unset restores ordinary precedence. An unchanged optional is a no-op. Changes update the native platform color and notify the owner only when effective opacity changes, using the same existing base-class idiom as color copying.

Original034ec6b8 copies **all three** optionals, including an absent override when source content/default state is present. An entirely empty source is ignored. The port preserves those conditions, equality checks, assignments and effective-opacity update. The popup helper invokes default transparent followed by override transparent only when a current render view exists, matching04598fcc. Ordinary views never set the new optional, so their existing content/default behavior remains.

## Lifecycle and macOS details

The generic persistent background observer is intentionally unchanged. Its actual original vtable entry points to032a82c4; the recorded raw tail loads its stored color and branches **only** to the default setter032a83c0. It does not apply an override to every frame. The separate initial helper's conditional current-view override plus all-three-color copy behavior is the actual source contract. No popup retry or generic observer mode is invented. Initial/no-view paths and actual render-view replacement remain runtime acceptance cases; static checks do not claim that a nonexistent initial view received an override.

Original Mac69e535c applies the same precedence, then converts a transparent native **query** result to white. Current155 already does this by calling the base getter and retaining its white fallback. Its actual platform update uses the base result. Consequently, this patch changes no Mac getter, material, private selector, permission or color-clamping behavior. It also leaves the prior page-base transparency path intact.

## Evidence and checks

`source-evidence.json` pins the original arm64 image, three vtable neighborhoods, six fresh bounded REA dossiers and the current155 lifecycle/Mac/helper sources. The original snippets are static instructions/pseudocode, not original compilable C++. Raw-provider tail/bad-data warnings are retained; the disassembled observer tail specifically resolves that limitation for the default-only call. Effective precedence and copying are direct observed field flows, not inferred from UI prose.

Run `python3 docs/integration/proposed/native-popup-background-override/verify.py`. It checks the actual original arm64 hash/vtable words, actual current input hashes, all four baseline/output hashes, isolated patch replay and focused precedence/copy/source-scope guards. Formatting follows surrounding Chromium code. No native method runs.

Root should compile the popup object plus renderer-view base and affected Mac content targets under the build lock. Actual disposable observation still needs opaque renderer-background content with a transparent popup override, a frame/view replacement, clearing an override restoring normal behavior, and both-theme popup/option presentation. This source proposal does not establish visual acceptance. The AppKit material itself is still being traced; it is not silently replaced with a guessed material enum.
