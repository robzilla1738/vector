# Bounded local browser milestone — current checklist

The selected app is `out/provided-candidate-fresh-browser-20261025-a45/Aux.app`; the accepted app remains intact. This checklist concerns a usable local browser candidate, not feature-complete product or release acceptance.

## Must finish

- [x] Native first-window activation construction order and ordinary daemon storage startup.
- [x] HTTP adapter request cloning; actual daemon health200 and connected chat observed in A17.
- [ ] Integrate and actually verify standard isolated-profile window selection (focus/open target; source window stays intact).
- [ ] Integrate genuine native session restore for newly admitted fresh profiles and logical-ID session snapshot persistence.
- [ ] Integrate real registered graceful daemon shutdown entry; verify physical descendant closure without claiming peer loss is clean.
- [ ] Preserve exact UI/art/styles and assemble/sign only the already approved candidate objects.

## Must verify

- [x] Actual A17 startup, loopback and public HTTPS navigation.
- [x] Actual fresh Work/Personal cookie/localStorage and chat-context separation.
- [x] Actual shared tab list with independent selected views in two windows.
- [x] Actual local TXT attachment and unsent drafts; tab/settings round-trip.
- [ ] Corrected native session restart recovers actual draft and attachment; A17 failure remains historical.
- [ ] Corrected profile selector preserves source drafts and selects the real target window.
- [ ] Corrected daemon exit physically drains; A17 forced cleanup remains historical.
- [x] Actual sidebar collapse/expand, connected chat, settings and supplied/accepted screenshot comparison in A17.
- [ ] Observe the final packaged UI after integration; repeat only affected behavior checks.

## Explicit follow-ups / can defer for this milestone

- BYOK/eligible subscription-backed AI and hosted/account-dependent functions need an actual authorized account/provider check. No inference used in these local checks.
- Third-party extension/1Password/native-messaging compatibility remains unverified; supervised native helper execution is disabled in ordinary mode. Do not call that complete.
- Privileged tasks, exec/PTY, Computer Use and native addons remain disabled. Their authority architecture is a separate deferred milestone.
- CLI routing is packaged but unverified and does not hold up the first local browser.
- Legacy profiles remain refused. No credentials, ciphertext, draft keys or existing startup choices are silently migrated/reset. Existing disposable profiles created by older candidates keep their startup preference; new behavior is checked with newly created disposable profiles inside the same approved scope.
- Advanced interrupted migration/recovery, broad crash testing, mobile and cloud/distribution are deferred. Consequence: this candidate is for bounded local browser use, not a migration/release candidate.
- Genuine hover animation is not re-injected by the current computer-input API. Existing accepted implementation stays unchanged; manual hover follow-up remains explicit.

No provisioning, OS grants, owner profiles/credentials or release work is included.
