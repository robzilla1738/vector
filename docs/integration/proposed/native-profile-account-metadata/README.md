# Original per-profile account email metadata

Original worker 4652ee0 reads the genuine private registry through 4100b88 and builds a path→email map for native profile tooltips. The UI reply 4653178 compares/swaps the map and refreshes the pager. It never authenticates an account, grants browsing or unlocks Vault.

The projection preserves actual source precedence. Legacy `profileBindings` rows require a nonempty binding userId and resolve that user first, falling back to their numeric accountId only when absent. Numeric `profileAccountBindings` rows require a nonnegative accountId. Each needs a real nonempty profilePath and account email. A presentation session is either both nonempty saved access/refresh tokens or `authStatus:"paused"`. Original account record+0x68 is email, not userId. The worker does not impose another userId requirement on numeric bindings. Original unique-map insertion makes the first path binding win, including legacy-before-numeric collisions.

`ReadPrivateAccountRegistry(home)` is the requested shared fixed-home reader seam. It delegates to the existing `ReadMetadata` for **accounts.json only**, 4MiB, retaining exactly its O_NOFOLLOW/O_CLOEXEC, owner, private mode, regular-file, size and RFC JSON checks. `ReadProfileSecurity` uses this reader and keeps all existing identity, version and classification checks. The metadata projection itself preserves the original reader's lack of a version/authentication gate; it returns only email strings and cannot authorize actions. No arbitrary filename/read API is introduced.

## Integration

Four-file proposal against frozen 232 `profile_state.h/.cc`. Add `profile_account_metadata.h/.cc` to the existing pure-base profile_state target; it has no UI/ProfileManager edge. Existing updater code may reuse:

```cpp
std::optional<base::DictValue>
aux::ReadPrivateAccountRegistry(const base::FilePath& home);
```

Pager metadata uses `ReadProfileAccountEmails(home)` on a MayBlock worker, then applies only the returned map on UI. Registry dictionaries/tokens are not logged, returned to extensions, persisted elsewhere or retained in UI. The upcoming pager owner coalesces requests and weakly binds replies.

`python3 verify.py` verifies original worker/reader/first-insertion instructions, retained pseudocode with its raw-target limitations, exact narrow reader delegation and four-file disposable patch replay. Two focused gtests are supplied for pure binding/session precedence and a disposable private-file/symlink fixture. These are **not compiled or executed by this lane**. Compilation and runtime observations remain integrator work. No owner data, shared native sources, OS grants or apps were accessed.
