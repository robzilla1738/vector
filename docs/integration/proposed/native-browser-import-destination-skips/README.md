# Supplied Chromium destination skips (430)

Immutable one-file followup after `a9ba04615` (secret barriers). It changes only the supplied Chromium staged-secret path. Other importers and the legacy internal WebUI serial destination retain their current behavior. No GN or new target; root owns the importer service object check.

## Source effects

- Original4258848..42589d4 settles empty/missing real cookie manager and password store independently, then joins the actual callbacks. It uses factory EXPLICIT_ACCESS(0), without adding preference or GetError admission failures. The port does the same; real factory/store/CookieManager policies remain authoritative. A skipped group is not counted as imported.
- Original425b820..425baf8 constructs the source PasswordForm directly. Destination42589d4..4258b68 forwards the batch, without rejecting non-HTTP realms (including native credential realms) or filtering on a synthetic HTTP-only policy. Actual native store validation remains intact. Missing required staged secret remains an internal snapshot failure.
- Original425ab08..425ad80 skips partition parse errors or null CanonicalCookie; it does not fail the source batch. SameSite0/1/2 are preserved, otherwise -1; priority0/2 preserved, otherwise1; source scheme0/1/2 preserved, otherwise0; source type1/2 preserved, otherwise3. Source port passes to actual FromStorage, whose original/current implementation normalizes the port. Independent size/domain/path checks are removed in favor of actual canonicalization.
- Original425ad84..425aee4 builds the source URL with CookieDomainAndPathToURL(domain,path, secure || source_scheme==2), retries path `/` if invalid, then skips if still invalid. It does not inject the stored port into that URL.
- Original cookie reader passes expiry to FromStorage and has no pre-expiry clock rejection in this complete bounded function. Expired canonical cookies are sent to the real manager; its real result settles the callback barrier whether included or excluded. No acceptance is invented.

The mappings are decoded from the original SQL (pinned in source-evidence.json), column loads and CMP/CSEL at425abec..425aca4, rather than assuming equal enum ordinals between versions. The actual155 CookieDomainAndPathToURL and FromStorage definitions are pinned; there is no new cookie parser.

## Limits

Source snapshot, source-key, decryption, malformed database/schema and staged-order failures remain failures. The low-level source reader still has prior bounded size/text safeguards; this delta does not claim to finish every original parser field. Extension loading and Arc augmentation remain separate unported portions. No native compilation, actual profile/source/credential access, Keychain call, destination write or OS action occurred in this lane. Disposable patch replay and static original pins are the only verification here; compilation/runtime acceptance belongs to root.
