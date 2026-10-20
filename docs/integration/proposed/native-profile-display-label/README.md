# Supplied shared profile display label

The original direct menu04573cd4 and preview465484c call the same helper040fde94. This ports that actual helper into a shared two-file155 utility; neither menu nor page is changed by this proposal.

- Missing entry produces the supplied literal `Profile`.
- At most one visible profile uses the real `ProfileAttributesEntry::GetName()`, falling back to `Profile` only when empty.
- With multiple profiles, a non-OTR already-loaded Profile may supply registered string preference `aside.account_display_name`, decoded UTF8 to UTF16. Empty/unavailable preference falls back to the real GAIA display name, then username, then local profile name. It does not load the target merely to resolve a label.
- The secondary local label is the real local profile name, falling back to GetName when empty. Original415a908 is enterprise-label-or-name, exactly current155 `GetLocalProfileName()`. Original2208598 selects given GAIA name, GAIA full name, then OIDC identity name, exactly current155 `GetGAIANameToDisplay()` plus its real GetGAIAName fallback.
- Empty names use `Profile`. Equal labels compare ASCII case-insensitively, preserving the primary's case. Distinct nonempty labels format exactly `primary (local)`. There is no trimming, Unicode case-folding, email inference or title-based profile lookup.

The roster count is the actual menu/gesture filtered roster count; it is not a new registry index. The internal `aside.account_display_name` key is preserved in actual isolated Aux profile prefs. Registration and writes remain the integrator's supplied-pref integration: the helper safely follows the original missing-preference fallback. This proposal does not register a guessed default or access owner prefs.

Integrator: add `profiles/aux_profile_display_label.{h,cc}` to the existing enabledAuxMac UI source list. Call the utility from the actual menu and preview producers with their real attributes entry, already-loaded actual target Profile or nullptr, and filtered count. L4 owns the menu caller; the live-preview owner supplies the other caller. The utility has no storage, asynchronous callbacks, UI trigger or profile-loading side effects.

The original binary, bounded body/getter/caller extracts and literal bytes are pinned. Focused verification independently replays both new files and confirms current155 getter source pins. No native compile, real profile access, target launch or UI/runtime acceptance.
