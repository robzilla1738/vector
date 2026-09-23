# Aux private desktop review

This is an early hands-on build for evaluating the browser and task experience,
not the completed founder candidate or an external release.

## Current handoff

On 2026-09-19 the updated development app was rebuilt from source and left open for
review. Dev port 5197 and the Aux runtime are live. This launch uses the existing
Aux development profile; its page URLs and contents were not enumerated during the
handoff. If it has since been closed, start it again with
`AUX_LOAD_DOTENV=0 pnpm dev` from this repository.
Startup now regenerates desktop entrypoints from source before opening the app.
No new application bundle is needed.

For the first live agent check, configure your preferred provider and model in
**More → Settings → Models** (or open Settings with **⌘,**), then identify the
connection to use. Enter credentials in Aux, not in chat. Agent validation still
requires a successful connection and a real task; browsing alone does not prove it.
OpenAI-compatible endpoints are supported: remote destinations require HTTPS while
localhost may use HTTP. Aux shows the exact destination before testing and does not
fall back to another provider. It stores the key with OS encryption; it does not
discover or import a key from your password manager.

The development build has passed the integrated browser, Library, task evidence,
setup and synthetic external-agent journey, plus quit/reopen organization and
page-crash recovery. If the execution runtime stops or the Mac wakes to a stale
connection, Aux now keeps native tabs live, pauses agent work, reconnects, and
reattaches without replacing tabs or losing a live page draft. The supplied Aux
artwork and neutral frosted shell have been
inspected in actual rendered captures. These checks do not substitute for your
visual approval or a live provider-backed task.

The same build now supports coherent keyboard movement through Search/Ask, spaces,
folders, tabs, settings categories and appearance choices. Sidebar collapse returns
focus to a visible restore control, then back to the workspace when expanded.
Reduced Motion stops shell and progress animation; Reduced Transparency uses the
solid sidebar. Conversation and settings controls now expose useful names and group
semantics. This is automated and rendered evidence, not a completed manual VoiceOver
review of Aux plus arbitrary websites.

Middle-clicking a link now creates a visible background tab without changing the
selected tab, and closing a foreground tab opened by a page returns to its opener.
The underlying cross-origin popup flow preserves redirects, referrers, cookies,
state and opener completion in isolated synthetic sites. This makes ordinary link
and sign-in navigation ready for hands-on review; real SSO providers, passkey
hardware and password-manager integrations remain separate compatibility gates.

The user provisionally accepted the current design and requested continued roadmap
work. For hands-on use: browse and organize tabs, quit and reopen, then try a saved
task. Live agent qualification
needs a provider connection you configure in Settings → Models. Packaging stays
deferred. The wider roadmap remains open.

Authentication limits: native Touch ID/passkeys and 1Password/Apple Passwords
integration are not qualified in this development build. Existing Chrome extension
compatibility is partial. Synthetic login-window and virtual WebAuthn checks are
not proof that these native integrations work. See `AUX-BROWSER-COMPATIBILITY.md`
for the evidence and remaining shell decision.

## Development review

Tabs now respect a website's unsaved-work warning when closing, following links,
or reloading. **Stay** keeps the live document; **Leave** proceeds. This protection
is verified for individual tabs and now for ordinary whole-window close and Quit
in newly launched source builds. Cancel keeps all tabs alive, including a tab whose
warning you already approved. Session recovery restores tabs, not
unsaved form values. Crash recovery also does not restore unsaved forms. The native
exit adapter is pinned to Electron 43.6.0 and requires requalification on upgrades.

Camera and microphone decisions are now separate in Settings → Site permissions.
Older combined decisions require fresh approval. Synthetic camera capture and a
local WebRTC video/generated-audio/data exchange work, but microphone capture is
not qualified: the synthetic microphone fixture times out in Aux and the separate
Chromium reference browser. Screen sharing remains unavailable: the current runtime does not distinguish its
permission request safely from legacy desktop capture. Real hardware and conferencing services
remain open acceptance checks; do not rely on Aux for an important call yet.

Protected websites using HTTP authentication now show an Aux sign-in dialog with
an explicit site origin. You can retry or cancel; Aux does not save the entered
credentials, though Chromium may reuse them during the session. Basic authentication
is verified with a synthetic local server; enterprise proxy/Digest behavior remains
unqualified. This is separate from passkeys and password-manager integration.

For a site with a stuck local session, open Settings → Site permissions, choose an
open website under Website data, and select **Clear website data…**. Confirmation
explains the sign-out/local-data impact, including related-subdomain cookies.
Reload the site's tabs afterward. This preserves history, bookmarks, permissions
and cached files; it is not a complete browsing-data wipe.

The current priority is the running development app. Packaging is deferred at
the user’s request. From this repository, run:

```sh
pnpm dev
```

This compiles the workspace, waits for its development renderer, then launches
the real Electron browser. Normal browsing does not start the fixture servers.
If port 5197 is occupied, startup stops with an error; close the other development
server and retry. Closing Aux stops its renderer server.

Use **File → New Private Window** (**⌘⇧N**) for an isolated browsing process.
It keeps tabs, history, site data and permission decisions out of the regular Aux
runtime and removes its temporary profile when closed. Agent, project and settings
controls are intentionally absent. Files you explicitly download remain on the Mac.
Closing the private window protects unsaved forms; closing the regular Aux window
leaves the private process alone. Choosing Quit for the whole app coordinates every
regular and private window: if any page chooses Stay, all windows remain available;
if every page agrees to Leave, Aux closes them and removes the private scratch data.

## Design review

The next build follows the supplied Aside references using Aux branding. Start with
Search/Ask on a new tab (Tab switches modes while the field has focus; Shift-Tab
leaves normally). Recent conversation cards open saved full-page threads. The
sidebar’s More menu exposes Chats, Tasks, Library, Downloads and Settings. Conversation replies retain their chat
identifier; saved-task runs direct you through Tasks to preserve their scope.
Screenshots are captured artifacts, not claims of current page state. A linked
browser preview opens the actual task tab when it still exists.

In a full-page chat, open **Context** to inspect or exclude earlier turns and attach
up to five local text, Markdown, CSV or JSON documents. Aux stores a bounded text
snapshot, never the source path. You can deselect or remove a document before the
next reply, and an unsent document-backed chat survives restart. Attach only files
you intend to place in that conversation's context.

A saved task keeps one full-page conversation across its revisions. Open it from the
task's **Open full conversation** action or from Chats. Its task workspace is fixed,
while prior turns, local snapshots and generated artifacts remain selectable for the
next revision. Rename, archive or restore it from Tasks so its scope and revision
history stay authoritative.

Parent tasks can coordinate bounded child tasks without inheriting their tabs,
repositories or credentials. The parent receipt lists every descendant and remains
in progress, uncertain, not met or awaiting review until the corresponding child
work is resolved; it becomes accepted only when every descendant receipt is accepted.
The receipt also separates the parent’s model usage from the coordinated total.
Archive unresolved actions only after reconciling them, and archive descendants
before their parent.

Supported text artifacts created by earlier turns appear in the same panel under
**Generated artifacts**. They remain excluded until you select them. The selected
output and its exact artifact identity carry into the next reply and survive an Aux
restart; internal observation files and binary outputs do not appear as text context.

Choose a saved workspace in the same panel to share one concise memory note across
that workspace's conversations and tasks. Aux records the exact note revision used
by each run. Editing the note does not expand browser, project or action permissions,
and an older run or retry keeps its historical snapshot.

Use the small download icon in a saved conversation header to export a portable
Markdown transcript. It includes visible answers and provenance identifiers while
omitting hidden prompt context, local snapshot bodies, workspace-note content and
filesystem paths. This transcript is useful for review and handoff; it is not an
action receipt or proof that an external change occurred.

Completed turns show a compact **Sources** section when Aux observed web pages.
Expand it to see the page title, host and observation time. Selecting a source opens
its original live tab or restores the URL in a new tab when necessary. Exports carry
the exact observation identity and revision without including the captured page
body. A source proves what Aux read at that time; it does not independently confirm
that a remote action succeeded.

During a live conversation turn, use the hand icon beside the run status to take
over its actual browser tab. Aux pauses the task while you work. Return every held
page to continue, or stop the task from its conversation. Taking control does not
grant new permissions or claim that an interrupted external action succeeded.

Completed and interrupted turns show the recorded provider and model beneath their
status. Expand that row to inspect the sanitized provider origin, token counts and
whether provider cost data was complete. This identity is historical and survives a
restart; changing the current model setting does not rewrite it. Saved-task receipts
and exports include the same provider, model and destination summary.

Settings is a dedicated page with categories and search. Appearance controls
system/light/dark, solid/translucent sidebar, Liquid Glass/titlebar/sidebar/under-window
materials, sidebar tint, content opacity and horizontal/vertical tabs. macOS 26+
uses public AppKit Liquid Glass with older-system vibrancy fallback. OS reduced transparency overrides glass. Reduced
motion disables transitions. Sidebar edge resize is keyboard accessible.

## A useful first session

1. Browse using the address bar. Open a few tabs, then choose **Library** in the
   sidebar. Save the current page, search bookmarks, rename one, remove it and use
   **Undo remove**. Switch to **History** to search recent visits. Opening a page
   already in a normal tab switches to it; otherwise Aux opens a new tab.
   **⌘D** still bookmarks a page, and **⌘Y** opens Library's History view.
   Settings is available through the sidebar’s More menu or ⌘,. Judge discoverability,
   readability, navigation, and control placement.
2. Open **Tasks** from the sidebar. Create a workspace and task. Write a concrete
   objective and one acceptance criterion per line. Save it.
3. Choose **Attach current tab**. This saves a new task revision. For a criterion,
   choose **Capture current page**, then open the captured text. Capture stores a
   dated local text snapshot; attach and capture only pages you want in the task.
4. Select evidence, add a review note, and choose **Accept criterion** or
   **Mark not met**. Accepting every criterion produces **Accepted by you**.
   This records your assessment; it does not imply independent verification.
5. Close and reopen Tasks. Inspect the saved evidence, edit the objective, and
   see that earlier acceptance does not carry over to a revised task. Archive
   and restore a task to evaluate organization.
6. Choose **Set up agent** or open Settings. Choose Gateway, OpenAI, Anthropic, or Google. Enter your own provider key and
   choose **Save key**. Choose a suggested model or enter an exact model ID and
   **Save model**. **Test connection** sends synthetic requests (which can incur
   provider charges), not page content. A configured key does not prove a working
   connection. Check **Agent permissions** before choosing **Run on current tab**.
   The displayed permissions match the effective defaults; turn Write off for
   read-only work. Missing setup opens Settings without creating a run or tab,
   and the agent composer retains your prompt. Failed starts retain it too.
   Current-tab task execution is wired to the runtime, but a live model-backed
   run is not qualified by the credential-free review smoke. No missing key will
   be searched for automatically.

If a run leaves a consequential action uncertain, the receipt shows it. Check
independent records, record current evidence and a reason, then reconcile it as
applied/not applied. Reconciliation records your decision; it does not repeat the
action. A new task run remains blocked until unresolved effects are reconciled.

## Use your existing agent

Settings → **External agents** generates MCP setup for Codex or Claude Code. The
page shows whether each client is installed and the exact detected version before
you create a connection. Detection runs only its `--version` command; Aux does not
read that client's account or credentials.
Aux MCP bridge lets an external client work with Aux pages and saved tasks,
record evidence, and leave it for your review. With an attached managed checkout,
the same scoped connection can propose reviewed file changes and commands, start a
service, then request a localhost preview. Aux asks before opening the preview and
only that connection can inspect the new tab. It does not need a Gateway key in
Aux unless you ask it to start Aux's built-in agent. See
[External agent setup and authority](AUX-EXTERNAL-AGENTS.md) before connecting.
Actual Codex/Claude authenticated sessions remain unqualified.

For an attached local project, a ready **Prepared change review** can now create an
exact local commit after a native confirmation. Enter the author name and email you
want recorded; Aux does not look up global Git identity or credentials. The commit
stays inside the isolated checkout and does not push or create a pull request.
If Aux exits while a reviewed local service is running, its saved record becomes
**interrupted**. Open the same task revision and choose **Review and restart service**
to inspect and launch a new process. Aux never restarts repository code silently.

For a task with an attached project, the cloud panel can create a bounded Vercel
Sandbox after an explicit billing acknowledgement. New environments use the
Universal image; legacy Node/Python environments remain supported. **Upload source
& task brief** transfers the exact checkout snapshot plus the saved task's title,
objective, criteria and revision. It does not transfer browser sessions, local
environment variables, model keys or workspace memory. Choose **Hand off task** to
grant that sandbox sole control of the exact task revision and source tree. Aux then
locks local task edits, local runs and project writes until **Stop, checkpoint & return
to Aux** or Delete returns authority. The worker's result must carry the displayed
lease ID, which prevents output from an older or different coordinator being imported.
If the worker needs your signed-in browser, a credential, an approval, a local file or
an answer, it can return a structured nonsecret local request. Review the result and
choose **Checkpoint & continue locally**; Aux retains the request, stops remote compute
and returns the exact task revision to local control. Resume and hand off again only
after completing that local step.
Authenticate any cloud coding-agent CLI yourself in the task-scoped terminal, then use a reviewed detached
service if work must continue after Aux closes. On return, refresh its durable logs,
inspect files or export the workspace before accepting any criterion. A worker can
write the declared `.aux/result.json`; **Review worker result** verifies its task
revision and uploaded source tree. Save declared result artifacts individually or
choose **Preserve result & import claims** to retain the manifest and up to 50 MB of
declared artifacts in Aux task data. The receipt can export those preserved bytes
after the sandbox is gone. Imported claims remain external evidence and never accept
a criterion for you. This workflow still needs live
qualification against your configured Vercel account.

## What to evaluate now

- Can you navigate, organize tabs, and find controls without friction?
- Does creating a task feel natural, and are objective/criteria distinctions clear?
- Is the evidence readable? Can you tell what you accepted and when?
- Are runtime errors and interrupted work understandable and recoverable?
- What should move, shrink, disappear, or become one click before daily use?

## Known gaps and sequence after review

The build does not establish full browser compatibility (extensions, password
manager/native messaging, SSO/passkeys, DRM, and other advanced workflows).
Persistent task workspaces and existing tab spaces are not yet one unified model.
Task editing and evidence now use a full-page view with local draft recovery and
search and exportable Markdown receipts. Saved URL and tab references support
rename, removal and explicit opening. Attaching a URL does not read it or grant
access; changes create a task revision requiring fresh evidence review. Browser evidence is
a historical snapshot with known-change invalidation, not continuous monitoring.

Local/cloud development environments, Codex/Claude integration qualification,
cloud continuation while the Mac sleeps, broader service adapters, automated
independent outcome verification, full identity migration, and complete recovery
coverage remain on the roadmap. These should not delay your first visual and
interaction review. The next delivery priorities are daily browsing polish and
agent setup, then complete local-work workflows and cloud capabilities.

Draft continuity check: type different unfinished replies in two conversations,
then move between them and the agent side panel. Each keeps its own text. Existing
chat drafts and the generic new-chat prompt are saved locally and survive reloads.
Home also remembers whether Search or Ask was selected; an unfinished Ask prompt
continues in New chat and the agent panel.
The new-chat browser-context choice also survives when the page remains available;
closing it falls back to a new browser tab without deleting the prompt. A submitted
reply clears only its own draft after success.


### Closed tabs

Command-Shift-T or File → Reopen Closed Tab restores a recently closed tab to its
space, folder and position, even after switching spaces or fully restarting Aux.
The regular profile retains the newest 20 entries for up to 30 days. Private tabs
are never added. If a space was removed, Aux uses the current space; a deleted folder
is not recreated. Recovery reopens the URL, not unsaved form contents or navigation
history.


### Bring your bookmarks

Library → Import HTML accepts a bookmark export from another browser. Review the
preview, then choose Import bookmarks. Existing titles stay intact; duplicate and
unsupported links are reported. Folder contents become a flat bookmark list and
do not change sidebar folders or pins. Imports accept up to 10,000 web bookmarks
in a file smaller than 5 MB. Files with embedded credentials or executable URLs
are excluded. Aux reads only the file you select.

Export HTML opens the native save dialog and writes a standard browser bookmark
file. Reimporting it does not create duplicates. This does not import browser
passwords, cookies, sessions, or full profiles.


### Downloads

Open Downloads in the sidebar (Command-Shift-J) to pause, resume or cancel an
active download. Controls survive a UI reload while the browser process remains
running. Completed files offer Open and Reveal; missing-file failures are shown
in the shelf. Unfinished transfers from a previous app session show Interrupted
and can use **Retry** when Aux has a saved HTTP(S) source. Retry starts a new
download in the current folder and retains the old record. It does not resume
partial bytes. Older records without a saved source, temporary blob downloads,
expired links and form-generated downloads may require the original page.
Cross-restart partial-transfer resume remains later work.

**Change folder** opens a native folder picker. The choice persists after restart
and applies to new downloads; active downloads retain their original destination.
**Use default** returns to Aux's private downloads folder without moving existing
files. If a chosen folder disappears or is no longer writable, the download is
interrupted with guidance to choose a folder and retry. Readable
filenames are retained with numbered suffixes for known collisions.

### Page recovery

A crashed page offers Reload without replacing its tab. A failed connection shows
its attempted address with Try again and, when available, Go back. Recovery keeps
the tab identity and restores the runtime connection; unsaved page edits may be
lost. This journey has been exercised in the development app using local fixtures.

### Website permissions

Settings → Site permissions lists saved website access separately from agent
permissions. Search by website or permission and reset one decision or a whole
site. Reload the site to request access again. Stop an active capture or close its
tab when immediate termination is needed; reset alone is not a stop-capture control.

For the website currently open, select the globe/lock/warning icon in the address
field. The compact control center shows whether the connection is encrypted, the
page's visible cookie count and saved access decisions. Reset one permission or all
site access there. **Clear…** uses a native confirmation, can sign you out, and
clears stored website data only after rechecking that the tab is still on the same
origin. Private windows expose the same controls for their in-memory session only.
The connection label does not audit mixed content or expose certificate-chain detail.

### PDF export

Use File → Save Page as PDF (Command-Shift-P), or search that command in the
palette. Choose a destination in the native save dialog. Aux exports the native
browser page's printable content and CSS page breaks; it does not archive all
interactive state. Use Print for printer-specific layout choices.


### Task editing continuity

Tasks remembers the last workspace and selected task. Unsaved title, objective and
criteria edits stay local to that task (or the workspace’s new-task form) across
switching and renderer reload. Save task explicitly updates the runtime record.
If another client changed the saved revision, review it before choosing Use my
draft with this revision, or discard your draft and reload the saved task.
Browser spaces and task workspaces remain separate; this does not merge their data.

### Slow-page continuity

Opening a page selects its tab before loading finishes. You can bookmark it while
it loads, switch away, or close it; a late open response does not reclaim your
selection or recreate the closed tab. The earlier bookmark/sidebar smoke failure
was traced to late tab activation and an invalid asynchronous readiness check;
the corrected full browser/task journey passes.


### Export a task receipt

In Tasks, open the saved task and choose Export receipt as Markdown under Evidence
and receipt. The native Save dialog exports a dated snapshot with objective,
reviews, evidence provenance and source URLs, stale warnings, unresolved actions,
run history and recorded cost. Captured page text is omitted unless you enable it.
The export is a review document, not a task backup or a claim of independent
verification. Reload a task that changed elsewhere before exporting its new revision.

### Quit and reopen

Normal app restart now preserves tab identity, spaces, folder membership, order
and the selected tab. Reopened tabs load their URLs as new documents; unsaved
forms and the old navigation stack are not restored. Earlier page observations
remain stale and require fresh capture. The shell waits for the restored tab list
before updating saved organization, so partially restored lists do not reorder it.

### Updated minimal shell

Restart the development app with `pnpm dev` to pick up the native material changes.
Vertical tabs now leave the full content height to the page. Collapse removes
the sidebar entirely; click the narrow left edge, press Command-S, or use
Command-L to bring back the address field. Horizontal tabs retain their toolbar.
The footer is New chat / Agent / More; utility actions remain in More. Appearance
keeps Theme, Glass/Solid and tab layout, without a blur slider. Glass is native
macOS vibrancy with neutral styling, not the AppKit Liquid Glass API.

## Local document evidence

Open More → Tasks, save a task with a criterion, then choose **Import document**.
Select a UTF-8 `.txt`, `.md`, `.csv` or `.json` file up to 512 KB. Inspect the preview
and choose **Save document evidence**. The saved copy survives restarting Aux and
changes to the original. Select its checkbox, add your review note, and accept or
reject the criterion. Export the receipt; **Include captured text** is off by default.
Importing does not send file contents to a model. The saved fingerprint identifies
captured bytes; the document's claims still require your judgment. PDF and Office
formats are not supported by this import flow yet.

## Find while browsing

Command-F searches visible page text; Enter/Shift-Enter and the arrow controls move
between matches. Search stays open as you switch tabs and refreshes after navigation.
Escape/Done clears highlights and pending search work. Command-plus/minus/zero
continue to control page zoom while Find is open.

## Saved task history

Open More → Tasks, select a saved task, then **Task history**. Choose a saved
revision to inspect its objective, resources, evidence and recorded review. Export
its receipt with captured text included only if needed. **Back to current task**
returns to the draft you were editing. Earlier evidence remains accessible after
editing or archiving a task and after restarting Aux.

An earlier receipt identifies the current task revision and does not establish
its outcome. Evidence freshness is checked when viewed or exported, rather than
reconstructing the state of the browser at the old revision's date.

From a saved-task run, **Open saved task** returns to that exact task and workspace
in both the side panel and full conversation. Start further work from the task so
revision, acceptance criteria and unresolved-action checks remain in force.

## Attach an isolated local project

Open a saved task's resources and expand **Local projects**. Select a Git repository
using the native folder picker, review its path, commit and working-tree status,
then choose **Create isolated checkout**. Aux creates a new local branch/checkout
from that saved commit and attaches it to the task. Uncommitted and untracked files
stay in your original checkout and are not copied.

For an app that does not have a repository yet, choose **New blank project**, name it,
and choose **Create and attach**. Aux creates an empty managed Git baseline with no
remote and no inherited Git identity. Open **Files** to create the first source or
manifest file, then use the same commands, previews, recovery, review and local commit
flow. Nothing is pushed or published; GitHub checks remain unavailable until a remote
is deliberately configured outside this setup flow.

Use **Inspect checkout** and **Refresh checkout status** to see changes made by an
external editor; **Show in Finder** opens the checkout's location. Restart Aux and
return to the task to reopen the same project. Removing its task reference keeps
all checkout files; use **Attach to task** to restore the reference.

For one text file, choose **Files**, open it, then choose **Open externally**. The
checkout must be attached to the current task. Aux opens that exact managed-checkout
path and checks it when you return. If you had no Aux draft, the editor loads the
outside change. If both copies changed, it keeps the Aux draft visible, previews the
disk version and blocks normal saving until you choose **Use external version** or
**Replace disk with Aux draft**. Replacing keeps the displaced disk version in
recovery history. **Check disk changes** performs the same comparison on demand.

Setup does not run hooks, filters, dependency installation or project commands.

### Connect a GitHub account for read-only delivery checks

Open Settings → Connections and enter a fine-grained GitHub token limited to the
repositories Aux may inspect. The token is saved with OS encryption and is not returned
to the page. **Check connection** records the account and reported scopes. **Disconnect**
removes the saved token and health record. Aux does not search GitHub CLI, Keychain,
browser cookies or other credential stores for an existing login.

For an attached checkout whose origin is a recognized `github.com` URL, choose **Check
GitHub**. Aux reports repository visibility and access, the default branch, whether the
checkout baseline and local head exist remotely, and the local head's current combined
commit status. The dated result survives restart and appears in the prepared delivery
handoff. **Open repository** opens it in an Aux tab. This flow is read-only: it does not
push the branch, create a pull request, publish, or authorize a later write.
The same check lists recently updated open issues for that repository. **Open issue**
opens the canonical GitHub page, while **Attach to task** saves the issue URL and
identity as a normal revision-checked task resource. The live view may show a bounded
body excerpt, but Aux does not retain issue bodies in the durable project record and
does not grant the task GitHub-token authority.
Submodule/large-file downloads and an interactive terminal remain later work.
Selected-file editing is described below. Explicit command execution and localhost previews are described below. Review may show encoded Git paths for unusual filenames.

After **Inspect checkout**, expand **Review changes** to read the net tracked diff
against the commit chosen during setup. It includes subsequent commits, staged
changes and working-tree edits. Refresh after editing externally. New untracked
filenames appear separately. Choose one to preview its saved text without staging
it or changing the index. The preview is a timestamped snapshot, excludes unsaved
drafts, and clears when checkout status refreshes. Empty files are identified;
binary, linked or oversized files report the editor's read limit instead.
Ignored files and submodule contents are not included. Binary tracked changes
show Git's notice rather than binary data.
Large previews report their limit instead of silently showing an empty diff.

Choose **Prepare delivery handoff** after refreshing checkout status. Aux regenerates
a local reviewer summary, pull-request draft, portable Git patch and integrity
manifest from the current task revision. **Ready for local review** requires a
complete patch and a successful latest bounded check; attention items explain what
is missing. Open either Markdown file, export the patch through the native save
dialog, or reveal all handoff files in Finder. The manifest records SHA-256 hashes.
This action does not stage, commit, push or create a pull request. Patch preparation
includes regular untracked files and is limited to 2 MB; unsupported or oversized
content leaves the handoff in **Needs attention** instead of producing a partial
patch.

## Run a local check or preview server

In **Local projects**, choose **Commands & preview**. Enter a command and choose
**Review and run**. The native dialog shows the command and checkout; Cancel runs
nothing. Commands are not sandboxed and can access local files/network. Aux uses
a separate HOME and does not pass inherited provider credentials. Commands and
output are saved locally, so avoid placing secrets directly in command text.

The **Project environment** section inspects fixed root manifests without running
repository code. It reports relevant JavaScript, Python, Rust, Go, Ruby, JVM, PHP and
container tools, lockfiles, prepared dependency state, common checks and recognized
local service entry points. Python choices cover declared pytest, Ruff and mypy checks
plus Django, FastAPI and Flask servers. Other ecosystems load conservative manifest-
derived build, test and service commands only when their required tool is available.
In a declared JavaScript workspace it
also compares the checkout with the saved baseline, identifies affected packages
and internal dependents, and explains each selection. Choosing an affected check,
setup, check or dev script only loads its exact command into the field; inspect it and use **Review and run**
normally. Setup commands may download dependencies and execute package/build hooks,
as the native confirmation explains. Refresh re-reads the checkout, and Aux also
refreshes after a recorded command finishes. This covers common root-level projects
across those ecosystems. Complex or custom toolchains still need a manually reviewed
command.

Expand a saved result to read output and its exit status. Use **Stop command** for
an active process. Ordinary commands stop after ten minutes or normal Aux quit. **Keep running as a
local service** removes the ten-minute deadline and allows editing while the
service runs; it still stops on normal quit. Interactive input and detached
daemons are not supported. Restart restores records, never
restarts commands. After force quit, verify old processes before running again.

For a local web server, enter its HTTP(S) localhost address and choose **Check
preview** or **Check & open preview**. Aux checks for a successful HTTP response
before opening the actual browser tab. Repeating **Check & open preview** reloads and
activates the linked tab. Return to Tasks → Local projects → Commands & preview to
inspect recent console and network activity, refresh the diagnostic snapshot, open
the linked tab, inspect process logs or stop a service. Aux pauses diagnostics and
explains recovery if that tab closes or navigates away. This evidence describes the
page; it does not prove that a particular command owns the address.
A linked, live preview also offers **Prepare incident snapshot**. This saves the
current checkout state and bounded diff with recent project commands, console messages
and network responses outside the checkout. URL query values are redacted. Open the
report from the saved status beside diagnostics. It is dated evidence for investigation,
not a root-cause or successful-fix claim.
A successful command exit does not automatically accept the task's criteria.

Cloud worker results can be preserved before stopping a sandbox even when the worker
needs local input or made no acceptance claim. **Preserve result** stores the exact
manifest and verified artifacts in the task receipt; **Checkpoint and continue
locally** does this automatically. Importing worker claims remains a separate review
step. This path is available after a Vercel account is configured in Aux and has not
yet been qualified against the user's live account.
For work that should continue after closing Aux, enter the worker executable and one
argument per line, then choose **Hand off & run in background**. Aux transfers the
displayed task revision and source-tree lease and starts one detached process for the
environment's bounded session. Reopen Aux and use **Command history** to reconcile
logs and **Review worker result** to inspect `.aux/result.json`. This starts exactly
the command shown; it does not install an agent or copy local credentials into the
sandbox. The worker can complete the result contract by sending a JSON object with
`status` and `summary` to `node .aux/write-result.mjs`; the helper safely fills the
current task, source and lease identities and writes the manifest atomically.
When a `needs_input` result names an attached browser tab or URL, **Open requested
browser context** opens that exact local resource. Complete the signed-in step locally,
then checkpoint to return task authority before editing or running local project work.
The cloud sandbox never receives the browser profile or its credentials.
If scheduled retention expires while a sandbox still owns the task, Aux checkpoints
it and returns authority locally, then keeps the checkpoint for a 24-hour result
recovery window before deletion. A retained cloud environment keeps its repository
attached so inspection, export and cleanup cannot be stranded.
Before that checkpoint, Aux preserves any validated worker result and declared
artifacts in the task receipt. The cloud panel states whether a result was preserved,
none existed, or preservation needs retry. Final scheduled deletion is refused while
result preservation remains unresolved.
While any sandbox record remains retained, Aux also refuses to disconnect Vercel or
change the selected Vercel team/project. Replace a revoked token to recover access,
then delete or reconcile every environment before changing that connection scope.

For an attached project, choose **Check operations** to read the selected Vercel
project's latest deployment and the selected Sentry project's unresolved issues.
Open a result in its real browser page or choose **Attach to task** to retain that
exact URL and identity on the current task revision. This is read-only context: it
does not grant the task either service token, change production, or establish that a
Sentry issue caused the observed failure.

## Attach a command result to a criterion

In a saved task's **Evidence and receipt**, choose **Import command result** for a
criterion. Choose a finished command from one of the task's attached projects,
inspect its command/output and outcome, then **Save command evidence**. The result
is now a saved historical snapshot for your review, not automatic task acceptance.

Its provenance and limitations appear in exported receipts. Command text, working
directory and output are omitted unless **Include captured text** is selected.
Later local edits and commands do not update this snapshot. A new task revision
requires new evidence; earlier evidence remains accessible in Task history.

## Edit a project file

Choose **Files** in a local project, filter by filename, and open an existing UTF-8
text file. Edits are kept as a local draft until **Save file**. Return after restart
and open the same file to recover its draft. Refresh checkout status afterward to
review the saved diff. The original source checkout stays untouched.

To add a file, choose **New file**, enter a relative path such as
`src/components/example.ts`, then **Create file**. Aux creates an empty file and
any missing folders, opens it in the editor, and keeps your other file drafts.
Edit and save normally. The file appears as untracked in checkout changes until
you stage it yourself. Existing files, ignored paths, Git metadata, nested
repositories and symlinked folders are refused. A failed creation can leave empty
folders; no existing files are overwritten.

If another editor changes a file that was not opened through Aux, **Check disk
changes** detects the same conflict and retains your draft. **Reload disk and discard
draft** remains the direct way to abandon the Aux draft.
Each successful save retains the prior contents in a recovery JSON file;
**Show recovery copy** reveals it in Finder. Stop active build/check commands before saving; local services may watch edits.

Choose **Recovery history**, then a dated **Preview** to inspect an earlier version.
**Restore this version** preserves the current file as another recovery copy before
replacing it. Reopen history to restore that copy if you want to undo the change.
Save or explicitly discard an unsaved draft first; external file changes still
block restoration. History survives restarting Aux. Copies that fail verification
are reported and left on disk. The list inspects the newest 100 project recovery
copies; older copies remain on disk, and projects exceeding 1,000 copies require
manual inspection in Finder.

This is a light editor for text files up to 256 KB, with filename search, safe
in-checkout rename, confirmed deletion and task-scoped default-app handoff. Rename and deletion
retain verified recovery copies outside the checkout. Binary files, links, ignored
files and Git metadata are not supported. It does not automatically merge conflicts.

### Check a local preview before opening

Start your server, enter its local URL, and choose **Check preview**. A successful
HTTP response, refusal, timeout, redirect or HTTP error is reported with a timestamp.
**Check & open preview** checks again and opens the page only after a 2xx response.
The project remembers the URL and last check across restart; the UI also remembers
the linked Aux tab and can resume its bounded console/network view when that tab is
recovered. It does not restart the server or treat the old result as live status.

Checks use no browser login/cookies and do not follow redirects. HTTPS certificates
must be trusted. A successful response does not establish that this command owns
that port or that the application's behavior is correct.

### Commands keep their task context

The command form and native approval show the saved task revision. Attach the
project to that task before running. If the task changes while approval is open,
Aux rejects the launch; reopen the current task and review again. Active agent
work, archived tasks and unresolved actions also block preparation.

Saved results retain the original execution task/revision, including after restart
or import as evidence. Later task edits do not retarget a command already running.
Older command records are explicitly labeled when no task binding was recorded.

For JavaScript package workspaces, Cargo workspaces and Go workspaces, **Project
environment** shows the bounded packages, crates or modules detected from root
manifests. Changed members are labeled **Affected** and can load a combined check
command. Loading does not run anything; review the exact command and approve it in
the native confirmation. Linked or malformed members outside the checkout are
ignored. Cargo uses `--locked` only when the project has `Cargo.lock`.

The local CLI mirrors the saved-task inspection path without requiring raw RPC
names. Run `auxctl workspace list`, `auxctl task list`, then use `auxctl dev` or
`auxctl cloud` with the task ID and current revision shown by `task get`. `auxctl
help` lists the exact forms. Task definitions and patches can be supplied as `@file`.
The CLI uses the running Aux loopback runtime and cannot bypass revision checks,
task scope or native confirmation. It has no command for reading provider secrets,
publishing changes, creating remote PRs, deploying, or deleting cloud resources.

### Keep a development server running while editing

For a dev server, enable **Keep running as a local service** before **Review and
run**. The native approval states that it will run until stopped or Aux quits.
Open its preview, return to **Files**, edit and save. A watcher-enabled server can
update the browser page while it stays running; Aux does not add hot reload to
servers that do not support it.

Return to **Commands & preview** and choose **Stop service** when finished. The
service and its task revision remain in saved history. Ordinary build/check
commands keep the ten-minute deadline and block file saves while running.

### Tab audio

A playing tab shows a speaker button in vertical and horizontal layouts. Click it
or focus it and press Space to mute that tab without activating it. A muted tab
keeps an Unmute button even when playback stops. You can also mute a silent tab
from its sidebar tab menu or the webpage's native context menu.

Mute follows the current native tab through navigation and shell reload. It is
not a saved per-site policy and does not persist when Aux quits or the native tab
is recreated. Media/DRM/conferencing compatibility remains a separate qualification.

Independent sign-in windows now receive their own Close, Reload, Back/Forward, zoom
and Print commands in new source launches. Canceling an unsaved-work warning keeps
the popup and opener alive. This is popup support, not yet full additional Aux
windows or private browsing; commands using main-shell overlays are not fully
qualified for popup focus.

## Use a local model without an API key

In **Settings → Models**, choose **OpenAI-compatible**, enter the local server's
OpenAI-compatible endpoint (for example `http://localhost:11434/v1`), and save the
exact model ID exposed by that server. The key field is optional for loopback
endpoints. After saving the endpoint, choose **Discover models**, select or enter the
planner model, save it, and choose **Test connection** before starting agent work.

Aux sends prompts and screenshots to that endpoint when a task needs them. A server
on another host still requires HTTPS and a configured key. Aux does not discover,
download or start a local model, and this source build was not live-qualified against
one because no compatible server was running. If the server requires its own token,
save it through the same encrypted key field.

## Reading articles

Choose **View → Reader View** (**⌘⌥R**) on an article. Aux displays formatted text
and links in a quiet reading column; A−/A+ adjust and remember text size. **Back to
page** returns to the same live page, preserving its draft and scroll. Links open
in new tabs. Reader extraction stays local and transient; it does not start an
agent or save an observation. Images/media are not included in this first version,
and pages without readable articles display an unavailable state.

## September 23 shell checkpoint

See [current shell behavior](ui/design-update-2026-09-23.md) and
[focused native tests](local-testing.md#focused-shell-design-regressions).
Review horizontal and vertical modes, persistent versus preview sidebars, chat
folder actions, and URL reveal followed by page scrolling and window dragging.
Rebuild/relaunch native main and preload code for the input fixes; refreshing a
mock browser is insufficient. Local packages remain unsigned previews; signing,
notarization and the founder pilot are separate handoff gates.
