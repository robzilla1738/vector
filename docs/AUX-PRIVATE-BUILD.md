# Aux private development build handoff

Status: candidate for founder review. Updated 2026-09-21. Development and unsigned
local packaged builds are available; neither is a signed or external release.
Current UI and remaining acceptance checks: [Aside parity](ASIDE-PARITY.md).

## Start and stop

From the repository root:

```sh
AUX_LOAD_DOTENV=0 pnpm dev
```

For a packaged isolated preview, run `pnpm package:local` then `pnpm preview`.
Do not assume an earlier temporary QA application is still running. Quit Aux normally
to let the desktop and runtime close together. The development profile, runtime data,
downloads, managed extensions, tasks, conversations, project records and recovery
data are stored separately according to the repository's development configuration.

## Usable experiences

- Browse with Aux's restored spaces, folders, pins and tabs; use vertical or top tabs,
  fully collapse the sidebar, and restore the selected workspace and open pages.
- Search or ask from the new-tab page; reopen persistent conversations, continue the
  same task, attach allowed page/document/project context, inspect evidence and export
  a receipt.
- Use history, bookmarks/import, downloads/uploads, clipboard, print/PDF, reader view,
  find, popups, multiple regular windows, private windows, site data and per-origin
  camera/microphone/notification/location decisions.
- Install a trusted unpacked extension into Aux-managed storage, disable or remove it,
  and keep regular extensions out of private windows.
- Use cross-origin popup/redirect sign-in flows in the shared regular profile. Modern
  screen sharing reaches the native macOS picker when supported and always requires a
  fresh source choice; legacy source-id capture fails closed.
- Configure one direct model provider or localhost OpenAI-compatible endpoint, then run,
  cancel, take over, resume and review task work with persistent action and uncertainty
  records. Or create a task/workspace-scoped MCP connection for installed Codex or
  Claude Code without granting either client global Aux access.
- Attach a repository to a task, use isolated checkouts, inspect/edit bounded files,
  run approved commands and services, open a verified localhost preview, review changes,
  create an exact local commit and export a durable handoff without pushing or publishing.
- Create a bounded cloud environment through an explicitly configured provider, upload
  the exact source tree and task lease, run commands/services or a detached worker,
  reconnect logs/results/artifacts, checkpoint or return authority, and clean up the
  provider resource. The typed SDK, CLI and MCP bridge share the same validated runtime
  contracts.
- Back up and stage recovery of Aux task/runtime data, export a content-free diagnostic
  report, and inspect private aggregate browser-health data.

## Known limitations for this review

- Aux remains an Electron development shell. Chrome Web Store installation, automatic
  extension updates, broad Chrome extension API parity, 1Password browser integration
  and Apple Passwords integration are not qualified.
- Real platform or synced passkeys require a stable signed application identity. The
  WebAuthn protocol path is qualified with virtual hardware, but the no-bundle decision
  leaves Touch ID and iCloud passkeys outside this build.
- Real SSO policy, MFA, microphone, conferencing and an intentional native screen-share
  selection need founder hands-on testing. Older macOS versions without the native
  picker cannot share a screen through the safe path.
- A model or external-agent account is not activated automatically. Provider tests can
  incur charges; Codex and Claude Code keep their own sign-in, model and approval state.
- GitHub, Vercel and Sentry connections are opt-in and read-only in this build. Remote
  pushes, pull requests, deployments, promotions, rollbacks and issue mutations are not
  performed. They require later explicit authorization.
- Cloud continuity requires an explicitly configured provider account. Provider-side
  currency budgets and a separately hosted deletion scheduler are unavailable; Aux
  enforces local concurrency, lifetime, session and transfer limits and reconciles
  cleanup while it is running. A disposable compute checkpoint is not universal rollback.
- Cloud work does not receive local browser cookies, saved sign-ins or local credential
  stores. Remote browser takeover is not available in this development build.

## First review path

1. Browse and organize several real sites, collapse and restore the sidebar, switch tab
   layout, restart Aux, and confirm the same working set returns.
2. Try a normal sign-in popup and the sites you use most. If desired, deliberately try a
   microphone, meeting, screen-sharing or passkey flow and record the exact outcome.
3. Configure one model endpoint or create one scoped external-agent connection. Run a
   task from a real page, interrupt it, reply in the full-page conversation and inspect
   its evidence and receipt.
4. Attach a disposable repository, make a bounded change, run its checks and preview,
   review the patch and create a local commit. Do not connect a production repository
   until the local workflow feels right.
5. Configure cloud or service connections only if you want to test them; no credential
   discovery or automatic paid-resource creation occurs.

The next roadmap should come from this hands-on review. Packaging, signing, release
preparation, a seven-day pilot, global mini popup, routines and speculative polish are
outside this handoff.

## September 23 shell checkpoint

See [current shell behavior](ui/design-update-2026-09-23.md) and
[focused native tests](local-testing.md#focused-shell-design-regressions).
Review horizontal and vertical modes, persistent versus preview sidebars, chat
folder actions, and URL reveal followed by page scrolling and window dragging.
Rebuild/relaunch native main and preload code for the input fixes; refreshing a
mock browser is insufficient. Local packages remain unsigned previews; signing,
notarization and the founder pilot are separate handoff gates.
