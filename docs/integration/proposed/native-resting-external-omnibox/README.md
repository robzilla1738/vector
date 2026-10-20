# Flat resting external omnibox

The existing source-backed NTP-only flat resting presentation excluded ordinary pages, yielding a black pill in the actual Aux screenshot. Extend that presentation to normal browser windows while retaining the existing hover, focus, input, high-contrast, popup and security-chip handling. No URL text/model, permission chip, site-information action, editing or bookmark action is replaced.

This is a minimal screenshot-grounded Chromium155 integration adaptation: supplied Aside out/pass1-ui-completion/aside-external.png versus Aux aux-before-external.png. It is not a claim that the original native domain/title owner has been ported. Full domain | title display and its unfocused interactions remain a concrete gap; no synthetic combined string is inserted into the editable omnibox. Screenshots stay uncommitted because they contain owner state.

Pinned actual533 preimage; one exact mutation anchor and patch dry-run. No native build, runtime interaction, profiles or state touched. Integrator should inspect an external page at rest and focus/cancel the omnibox once; security/siteinfo retains the existing control.
