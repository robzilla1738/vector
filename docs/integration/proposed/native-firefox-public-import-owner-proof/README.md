# Supplied public Firefox import owner: exact port boundary

Evidence-only checkpoint requested by the integrator. No native patch is supplied because stock155 host completion cannot preserve the positively recovered full-import behavior by itself. This does not reduce the target to the currently backed subset.

## Public owner and real destination

`427acfc` is the supplied Firefox job Start. It changes the job to running, sets progress to0.1 and emits its real update through `42798c4`. It constructs the192-byte Firefox profile migrator at `4262bc0` using the actual target Profile, bookmarks-only flag and optional selected full profile path. `427ae00` disables its create-window behavior; `427ae70..74` starts mode1 with an actual once completion callback (`427b290`). Thus this API imports into the real current target Profile; it must not recreate a different account/profile or use a synthetic destination.

The migrator's Start `4262e44` invokes real ImporterList detection (`7820c24`) with application locale, include-interactive=false and a weak completion. Its ready callback `42631c0` reads the resulting genuine SourceProfile records, selects importer_type2 (Firefox), and if a selected path is present matches that actual full source path. A missing match or zero admitted items takes its actual failure path. It does not construct SourceProfile from an arbitrary API path, infer ownership from URLs, or reinterpret public capability strings as an item mask.

Original registry worker `78211b0..138c` uses GetFirefoxDetails, actual compatibility/version/app-path discovery, the original version>=48 admission and builds genuine Firefox SourceProfiles. At `7821270` it loads0x4b; `782130c` writes that exact services_supported value. The bit meanings match the retained actual ImportItem enum:

| Native bit | Meaning |
|---|---|
| 1 | HISTORY |
| 2 | FAVORITES/bookmarks |
| 8 | PASSWORDS |
| 64 | AUTOFILL_FORM_DATA |

Ready `4263424..3438` uses the selected record's real services_supported, or that value AND2 for bookmarks-only. The public five-kind descriptor is a discovery/UI contract; it is not this internal native mask. No source proof authorizes deriving the mask by enumerating the descriptor or discarding native autofill/password behavior.

Mode1 `4263454..347c` obtains the actual supplied current-profile destination and enters `4263a68`. That function creates the real ExternalProcessImporterHost (`7820514`), assigns the real progress observer (`792bcf0` stores observer at original host+30), constructs ProfileWriter for the actual destination and invokes actual StartImportSettings `4106178` with selected SourceProfile, target Profile, recovered mask and writer. The retained155 ImporterList/SourceProfile/host/bridge/ProfileWriter machinery is the appropriate implementation seam; the independent per-category SQLite/NSS replacement is not the original public owner.

## Original extensions that stock155 does not supply

There are two concrete prerequisites to using that seam faithfully on macOS:

1. **Passwords:** original services_supported includes PASSWORDS on this platform. Current155 importer_list.cc excludes PASSWORDS on Mac, and utility FirefoxImporter::ImportRemainingItems/ImportPasswords are also Mac-disabled. Merely changing the declared mask would advertise work the current stock utility does not execute. Additionally, original ImportItemEnded(8) reads original host flags+11c/+114 to record whether password import actually reported success; current stock host exposes no corresponding result. The actual original Mac password utility/result producer still needs recovery and port. These offsets are evidence about the original object, not fields to add blindly to155.
2. **Cookies:** cookies are absent from0x4b and are **not** an unsupported omission to hide. When not bookmarks-only, `4263c40..cd0` installs an original host+68 callback bound to `4263f48` and the real selected source path. `4263f48` has the exact literal `PrepareFirefoxCookies` and source path `chrome/browser/ui/webui/aside_importer/firefox_profile_importer.cc`; it posts the real Firefox cookies worker `4260740` with a completion pipeline. This original worker is separately supplied/decompiled and actually queries cookies.sqlite/moz_cookies. Current155 ExternalProcessImporterHost has no equivalent preparation hook. Hook invocation, cookie destination acknowledgments and its wait/settlement path must be carried through; reporting stock host completion alone would lose those effects.

Current155 copies of the genuine host/list/utility/observer/enum are pinned under evidence/current155 for exact comparison. No attempt is made to load NSS, import passwords or read any owner source here.

## Progress, completion and cancellation

The actual original observer vtable at e266d88 has ImportStarted and ImportItemStarted pointing to the same no-op function12dc0, ImportItemEnded at42648b0, ImportEnded at42648ec and two destructors. Those six chained pointers are pinned. The public job cannot truthfully acquire invented per-category progress or row totals from this observer.

ImportItemEnded sets original any-item-ended byte2d. For item8 it sets password-ended32 and derives password-success33 from the actual live host's two reported fields. ImportEnded clears the host's observer and the migrator's host pointer before later settlement, since the real host deletes itself after notification. It marks host-ended2e, may wait for the real outstanding cookie-preparation callback, and waits for the password result when that bit was requested. Its final success branch at426499c..49e0 requires the actual item/cookie/password outcome bytes rather than unconditional End→success. The typed semantics of every cookie wait/result member are not yet claimed beyond their pinned branch structure; a complete port must recover that producer instead of defaulting them true.

Public completion427b290 maps its real bool result to succeeded/failed, except an actual cancel request overrides to cancelled. Failure uses the original `Firefox import failed` string; succeeded gets progress1, other outcomes retain their prior real progress. Start failure and absent target retain their actual error paths, rather than returning a successful empty import.

Public Cancel427b13c sets the actual requested-cancel byte and calls the owned migrator when it exists. Migrator Cancel42637bc first detaches the host observer, invokes real host Cancel78205bc, clears its pointer and follows its actual failure/cleanup path. Stock host Cancel itself invokes ImportEnded then deletes the host. Therefore a new owner must not keep a dangling raw host, double-delete it or let cancelled callbacks resurrect the job. The existing original weak/callback lifetime and current target Profile lifetime remain required.

## Concrete implementation sequence

Reuse the real ImporterList detection and exact selected SourceProfile; restore original0x4b production and its genuine Mac password utility/result behavior; port the actual cookie preparation hook and acknowledged destination; then mount an owner that forwards the original start/ready/cancel/settled bool into the existing public job contract. Preserve the real target Profile, loaded model/Firefox lock behavior and real ProfileWriter/utility bridge. Only after those prerequisites exist can the inherited category loop be retired for this public route. A placeholder callback, unconditional ImportEnded success, fabricated password result or narrowed descriptor would not implement this owner.

`verify.py` checks the exact original thin hash,12 bounded range/listing hashes, literals, six observer slots and seven retained155 file hashes. It passes. This is static source proof, not an import/credential/UI acceptance claim. No source profile, database, NSS, Keychain, OS operation, native build or runtime execution occurred, and the shared checkout remains untouched.
