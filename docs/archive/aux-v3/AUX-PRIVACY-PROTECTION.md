# Aux privacy and site protection — what ships and what it does not claim

Scope note for reviewers and release notes. Everything here is implemented and
verified in the desktop client; nothing below claims protection we do not have.

## Tracker and ad blocking

- One shared `webRequest` policy (`apps/desktop/main/request-policy.ts`) owns
  the session's `onBeforeRequest` listener and composes, in order: HTTPS-first
  upgrade → tracker/ad host blocking. No other module registers a listener for
  this event, so policies cannot silently replace each other. (`onBeforeSendHeaders`
  remains owned solely by the cloud-preview header policy.)
- Blocked hosts come from a built-in seed set plus maintained hosts-format
  filter lists (`filter-lists.ts`). Lists download over HTTPS only, honour
  etags, are size- and parse-validated, and commit atomically — a bad or partial
  update keeps the previous list. Startup never waits on the network: the seed
  plus whatever is cached applies immediately, so blocking works offline and on
  first run.
- Only subresources to listed hosts are cancelled; main-frame navigations are
  never blocked. Per-site pause/resume lives in Site Controls ("Block trackers
  and ads"), site exceptions are managed in Settings → Site permissions, and the
  cosmetic filter (isolated-world stylesheet for known ad containers) follows
  the same policy state.
- Blocking pauses apply to a hostname and its subdomains. Private-mode
  exceptions are session-only and never reach `privacy.json`.
- **What this is not:** domain blocking is not phishing, malware or scam
  protection. It does not check downloaded files, page content or domain
  reputation, and it must not be marketed as a substitute for Safe Browsing.

## HTTPS-first

- Main-frame `http:` navigations upgrade to `https:` except on local and
  development hosts (loopback, RFC-1918, link-local, `.local`/`.localhost`/
  `.test`/`.internal`/`.home.arpa`/`.lan`/`.corp`/`.intranet`/`.example`/
  `.invalid`, single-label names).
- If an upgraded site cannot serve HTTPS, the recovery surface offers
  "Continue over HTTP" — scoped to that host for the session. Typed `https://`
  navigations never get a downgrade offer.
- Certificate validation is independent: `certificate-error` decisions go
  through the existing per-host, session-scoped bypass and Chromium's verifier
  handles everything else. The http offer does not weaken TLS checks.

## Download protection

- `download-guard.ts` requires an explicit Keep/Discard before a file that can
  execute code (executables, installers, scripts, disk images, browser
  extension packages) or that arrives over unencrypted HTTP is saved. Discard
  removes the partial file.
- This is a local heuristic only. Aux does not check downloads against
  known-malware lists and cannot detect new or disguised threats; users should
  still treat unexpected downloads as unsafe.

## Private browsing

- Private mode runs in a separate process with a non-persistent session and no
  remote-debugging endpoint; private pages, history, thumbnails, permissions,
  downloads records and agent context stay in that process's memory.
- Blocking and HTTPS-first behave identically inside private mode. Site
  exceptions and proceed-insecure decisions taken there die with the window.

## Filter list licensing

- The seeded list is StevenBlack's unified hosts file (MIT licence), fetched at
  runtime from its upstream URL — not vendored. Custom user-added lists are
  fetched from their own URLs under the user's responsibility.

## Favicons

- Favicons come from page/session events with a local fallback renderer. Aux
  never queries third-party favicon services by hostname.
