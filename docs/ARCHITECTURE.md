# Aux architecture

The pinned Node runtime requires complete matching ICU data for memory tokenization with `Intl.Segmenter`. Packaging supplies official pinned ICU78 data through a fixed app-bundle path before Node initializes. The earlier small-ICU crash is resolved. Current delivery and acceptance evidence belongs in [STATUS](STATUS.md); the competitive execution remains active.

Aux is a Chromium browser with a trusted `chrome://aux/` React shell and a per-Profile Node runtime. Chromium owns windows, WebContents, tabs, navigation, browser sessions, extensions, history, bookmarks, permissions and the native glass underlay. The shell places page surfaces through SurfaceEmbed and invokes the native host through its packaged Mojo bootstrap.

```mermaid
flowchart TD
  Shell[chrome://aux React shell] <-->|Mojo host methods and events| Browser[Chromium native browser]
  Browser --> Pages[Profile WebContents and SurfaceEmbed]
  Browser <-->|authenticated runtime bridge| Runtime[Aux Node runtime]
  Runtime --> Store[Profile SQLite store]
  Runtime <-->|ManagedChromiumDriver / internal CDP broker| Browser
  CLI[CLI and MCP clients] <-->|authenticated loopback API| Runtime
  Runtime --> Models[AI Gateway / direct providers]
```

The native method registry advertises implemented capabilities. Feature entry points depend on those capabilities and user Labs preferences. Runtime-owned chat, task and AI data stream to the shell; browser-owned interactions must remain available independently of runtime readiness.

The runtime’s services coordinate agent execution, snapshots, policy decisions, durable effect receipts, artifacts, memory, routines and external tools. Observed element references are scoped to page and document epochs. Navigation or takeover invalidates earlier authority; Stop and Take over must fence in-flight work. Model and page content remain untrusted.

The loopback API uses a bearer token stored in the Profile runtime directory. CLI and MCP are clients of the same runtime policy rather than alternate authorities. Secrets are held by native secret storage; stored sensitive values currently use protected SQLite adapters.

Aux owns the agent loop; provider SDKs supply model transport rather than an embedded foreign agent runtime. Execution chooses the saved local or cloud target for the original turn; cloud SDK loading is deferred until that target is used. Resource admission uses the original run family, usage limits and reviewed account quote before a money decision. Provider stop acknowledgements settle retained resource receipts; ambiguous creation or cleanup stays unresolved. A typed resource handoff can switch the original family to local execution only after original-window proof and cleanup of every family resource. A provably unsent review retains its exact creation promise but cannot dispatch after the handoff. Shutdown synchronously retires active run proofs, controls and Set schedulers, then joins their original execution tasks and pending review continuations before closing cloud resources and the repository. Accepted leased Space-memory updates join their actual native key writes, durable watermark and lease release before repository closure; closing admission cannot abort an accepted write halfway through publication. Secrets remain in native credential storage.

Projects combine read-only Files/Changes with a reviewed terminal and native Preview. The runtime checks the original window and granted directory identity. Native listeners and isolated guest surfaces require real process/socket ownership and cleanup acknowledgements. Preview admission is internal to the authenticated native bridge, with a synchronous retirement fence at runtime shutdown. Native area 0096 adds cloud Preview with original VM/process/listener proof. Human Preview and Undo use the retained original Session and actual native window independently of agent dispatch; they never create or resume a VM. Successful completion transfers a background server's monitor and cancellation ownership before dispatch retires. Retention commits only with durable completion and keeps the original funding expiry; Stop, window retirement, policy/account changes and unknown process outcomes close the original Session. Native capability publication must register the concrete asynchronous handler, and Preview must receive the original native window context. Area 0034 repairs omissions in those registrations and routes. The runtime-only launcher checks the compiled ABI before staging runtime changes. Actual cloud acceptance remains separate from source checks and compilation.

The legacy JSON planner, Electron migration and standalone drivers have been removed. Backup exports minimize observation artifacts to retained evidence. [ROADMAP](ROADMAP.md) and [the execution graph](ROADMAP-EXECUTION-GRAPH.md) define the active work; [STATUS](STATUS.md) distinguishes integrated source from built and observed native behavior.

Native socket events replace periodic bridge polling. Chromium owns background tab discarding and native bookmark identities, so human browser controls do not require Node. Model context is a bounded projection of the complete durable transcript. Exact capture references bind selected saved articles; relevant excerpts use the remaining provider input budget after required plans, receipts and images. Automatic recall warms cooperatively and enters only ephemeral provider messages. It does not append plaintext recall into the durable transcript.

Private AI belongs to the actual Chromium off-the-record Profile. Authenticated native capability proof admits its UUID, in-memory SQLite and owner-only temporary files. The native Profile owns worker retirement and temporary cleanup; its existing private tabs retain signed-in sessions and exact document authority. Normal Temporary tasks remain isolated signed-out tabs. The authenticated native broker forwards only strict credential, budget and cloud realms to the original normal runtime. The selected provider descriptor and short-lived access lease inherit saved/environment/OAuth connections; refresh tokens and private content stay with their original owners. Original provider revocation aborts inherited private transports. Private daily/monthly costs use opaque aggregate leases without prompts, URLs, run IDs or provider identifiers. Accounting integration remains active, and this design has not yet passed the native lifecycle walkthrough.

Cloud coding captures the original VM, Session and command identities. Local and cloud file/process receipts share the encrypted ledger; remote receipts never become local PIDs or filesystem paths. Uncertain dispatch cannot replay, and background commands retain network policy until confirmed retirement. Cloud Preview and human Changes/Logs/Stop/Undo routing are integrated. Process metadata contains bounded summaries; encrypted UTF-8 chunks supply cursor-based history without SDK access. Schema-4 startup conversion removes the replaced embedded log field atomically after original key admission. Cloud code-mode parity and actual cloud workflow acceptance remain active.

## Browser chrome and chat surfaces

The native window supplies the glass underlay; the renderer keeps the primary page surface painted while transient menus, previews and the left hover sidebar are visible. Vertical address entry is owned by Sidebar/CommandBar; horizontal entry remains in Toolbar. Focus uses the existing command-bar routing and can reveal the vertical sidebar. Pinned tabs and bookmark folders are separate native browser state.

Conversation shares its compact composer between Home Ask and full chat. ChatPreferences exposes the remembered confirmation policy and a Popover containing RunOptions; model, reasoning, execution target and private-task controls retain their existing authority checks. Ask first is the fresh-profile default, Skip confirmation selects Full auto, and Auto remains a Settings choice. Anchored popovers use Dialog focus containment and viewport-clamped placement with a dark theme surface; they deliberately omit the decorative GlassMaterial stack. Only the left sidebar has edge-hover reveal. Interactive controls are excluded from native window-drag regions.

Current build/validation evidence and deferred acceptance live in [STATUS](STATUS.md); the roadmap describes targets rather than proof that every target has passed.

## Governed coding and approval fluidity

Aux’s tool loop owns coding execution. Trusted run configuration captures the
effective mode, project, declarative profile and pinned Aux Packages. Profile
tools and limits narrow parent authority. Durable run grants and current policy
are rechecked at dispatch; exact reviewed batches retain content/action digests
and observed versions. Browser dispatch revalidates and holds the reviewed element after asynchronous preparation. Broader grants remain separate choices; interrupted runs cannot accept new grants.

The filesystem worker implements bounded read/search and versioned file batches
under granted roots and credential exclusions. Protected file receipts retain
before/after content, binary/mode state and individual outcomes. Reconciliation
observes current state without replay; undo checks recorded results before
reversing effects. Temporary writes recheck the original version before replacement. Search inherits permitted project ignore rules when narrowed to a subdirectory. The change UI fetches metadata and lazily opens file diffs, with a final refresh independent of older in-flight requests.

CodingProcesses shares Bash Seatbelt and network admission. It owns detached
process groups, bounded logs/artifacts, policy-revocation monitoring and cleanup
barriers. A launch handshake persists process birth/group identity before command execution; restart cleanup checks that stable identity even when shell exec changes its command text. Recovery never launches a duplicate command. Process reconciliation
can establish an interrupted lifetime while retaining unknown command effects.
Arbitrary commands have no universal file or external-effect undo guarantee.

QuickJS filesystem/process APIs call these governed services without ambient
Node, credential or raw-eval authority. Protected host-call results and cell
sources support deterministic restart replay; transcript compaction does not
redispatch completed effects. Unknown mutation outcomes halt the cell instead of entering its successful replay cache. Bounded coding_state / fs.state pages expose unresolved receipts beyond recent context; failure diagnostics include stopped commands. Local coding is supported first; cloud coding
returns an explicit unsupported capability until its equivalent boundary exists.

Ordinary durable tool suspensions survive crash recovery and normal shutdown.
Shutdown aborts controls and retires executable approval proofs while retaining
the parked call. A trusted answer restores the original Aux loop and rechecks
current native source authority; an earlier action approval is refreshed before
dispatch. Stop still cancels the parked work. Budget, model and cloud-resource
reviews also survive restart through their dedicated Continue/retry actions.
Explicit resume binds the reopened native window to the unchanged run and
rechecks its workspace and source pages; expired native tokens are not reused.
Accepted non-execution answers remain encrypted with the parked call if a budget
pause occurs before consumption. Original cloud resources require exact provider
session identity and stop acknowledgement before local continuation releases
funding. Unknown creation outcomes remain unresolved and never trigger duplicate
creation. Model retry rechecks the same reviewed model's admission bounds.
Only trusted Aux UI can answer human questions or resume these reviews.

Coder cells use isolated Git worktrees with permitted dirty/untracked snapshots,
binary assets and modes. Parent integration uses governed writes and captured
parent versions, with stable review batches of at most 100 file changes. Continuing a partial integration verifies previously confirmed results in bounded worker batches and reviews only the remainder. Incomplete snapshots and conflicts remain inspectable rather
than being force-cleared. Aux Packages contain versioned declarative profiles,
skills, templates and registered-tool workflows; shipped directories are agent
write-protected, and package contents are pinned per run. Native terminals launch
an ordinary shell independently of the Aux agent loop.

An ordinary question answer retains an unchanged source selection and revalidates its native window, Space and document identity; it does not reopen a person reader beneath the run's existing page guard. On terminal borrowed-page cleanup, native admission records the exact returned document for the fixed person reader. New task registration clears that proof. The document's network tombstone remains, so completed-run readability does not restore late agent network authority. Parked tool results enter the transcript before newly refreshed context, preserving valid model tool-call pairing across continuation.

Ordinary restored tabs load from Chromium’s cached navigation state on initial observation and explicit activation. An interrupted first restore is rearmed only when its document is still empty, its saved entry remains restored, and native egress does not protect the document; runtime-owned pages are excluded. Isolation retirement owns its page identity across observer destruction. An unavailable restored source produces a typed stale-source result and keeps the reply draft; explicit mentions and persisted run sources remain strict.

Trusted header filtering receives the actual network endpoint, or for a pure cache hit the valid endpoint persisted with that exact cached response. Chromium’s cache transaction has no current socket in the latter case. Missing or malformed cached metadata still fails the existing semantic admission; no address is invented and no filter is bypassed.
