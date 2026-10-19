# Native Profile content bridge

Patch `0021-native-profile-content.patch` adds two authenticated runtime calls to
the Chromium browser process. Both use the regular Profile that owns the
runtime socket. Neither accepts a Profile path or a renderer-supplied Profile
identifier.

## Cookie import

`native.setCookies({cookies})` accepts at most 500 records and 2 MiB of string
data. Chromium sanitizes every cookie against an HTTP or HTTPS source URL and
the Profile cookie store decides whether it is accepted. Invalid records are
skipped; `count` reports accepted writes. Cookie values are never logged or
returned.

## Protected readable page

`native.captureReadablePage({pageId, workspaceId, expectedUrl})` requires the
page to be the active visible tab in the active browser window of the
authenticated Profile. The persisted Profile organization must map that page
to the active Space and that Space to the requested workspace. The exact
committed URL must be HTTPS with no URL credentials. Runtime-owned pages are
ineligible.

The browser records only response eligibility when a tab navigates: a
successful HTML response without `Cache-Control: no-store`. Pages whose
response preceded observer installation fail closed until they navigate
again. A fixed isolated-world script rejects sensitive or editable documents
and returns inert title/text only. The browser checks the document navigation
ID, URL, visibility, tab selection, Profile, Space, and output size after
extraction before replying. Text is limited to 64 KiB UTF-8 and title to
1 KiB UTF-8. No HTML, form values, headers, or page scripts cross this
boundary.

`native_content_unittests` exercises cookie sanitization, response eligibility,
and active Space/workspace matching. The patch is additive after patch 0020.
