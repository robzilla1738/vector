# Full URL in inactive split captions; precise Peek refusal

Inactive three-file overlay. Apply after `peek-split-completion`: the Peek ingress baseline is that overlay's exact successor, while both mini-toolbar files use the actual selected Chromium baseline. The manifest contains all before/after hashes and ten uniquely matched source edits. Earlier overlays and the actual native tree remain untouched.

With the existing full-URL preference enabled, inactive split captions use Chromium `url_formatter::FormatUrl` with only `kFormatUrlOmitUsernamePassword`: scheme, complete host, port, path, query and fragment remain; embedded credentials remain hidden. The existing native label retains URL directionality. Full-URL captions elide at the tail so the origin stays visible, and the native tooltip reveals the complete security-formatted address. Selecting the pane still opens its existing real location editor. The previous compact domain, elision and tooltip behavior is unchanged when the preference is disabled.

A native `PrefChangeRegistrar` observes the actual attached WebContents profile. It resets and rebinds on attachment, resets on detachment, and updates the existing label immediately on preference changes. The current Chromium registrar also resets itself when its PrefService is destroyed. Detachment now clears the tab UI subscription so late updates cannot repopulate the old profile's address.

The Peek follow-up replaces the overly specific active-work message with the actual native refusal reason, or a safe generic fallback when no reason exists. The existing exact source document/window/profile/generation checks remain unchanged; no stale warning or fallback navigation is added.

`api-evidence.json` pins the actual inspected formatter, preference registrar and native location-bar preference implementation. Source edit counts and output hashes were checked during generation. No compilation, app interaction, test suite, provider call, lifecycle change or runtime acceptance was performed. No new GN/schema/pref registrations are required; the integrator compiles the existing mini-toolbar and Peek ingress translation units.
