# Original profile and account password stores

Source-only one-file proposal. No browser, source profile, credential, Keychain or OS operation was performed. Not compiled/runtime accepted. Discovery changes are owned separately by L4; this patch only adds includes and changes the encrypted-reader/authorization blocks below discovery.

The supplied `ChromiumProfileMigrator` password reader at 425b128 builds two real FilePaths, **Login Data first, Login Data For Account second**, skips absent files, reads each present database and merges the resulting forms into a single output. Original 425b658..425b74c constructs the first-wins set key from signon realm, UTF8 username value, UTF8 password value and blocked state, separated by newline. This is not URL matching or a guessed password-store identity. The exact SELECT text, form-field assignments and string constants are pinned.

Current native `ReadEncryptedCategory` and its preauthorization check address only Login Data. An account-store-only source therefore errors before reading; a source with both databases silently omits the account store. This patch reads each existing original path in order, uses the existing real snapshot/decryption/row conversion, and applies the original first-wins identity to the imported password rows. It also allows the real preauthorization check to select the account database when the profile database is absent. Cookie database selection and output remain unchanged. The existing 50,000-row/32MiB category bounds apply to the combined result, rather than independently allowing twice as much decoded material.

## Source boundary and remaining scope

The original reader copies each present DB into a temporary `scoped_dir` when possible, falls back to its source path if staging fails, opens it, and removes staging afterward. The existing native worker uses bounded read-only SQLite backup snapshots into memory; this patch retains that actual integration rather than replacing it with an unreviewed filesystem copy/fallback. It performs no destination writes itself; the existing native destination-store owner still receives the rows. No secret-bearing rows become extension RPC results or model text.

The current reader excludes blocked entries and fails a category when a value cannot be decrypted; the original supports blocked forms and tracks successful/failed decryptions. Those differences remain explicit and are **not** claimed fixed by this two-store slice. This also does not complete original Firefox/Safari migration, Atlas encryption, all source metadata fields or the full original job/utility lifecycle.

## Evidence

`source-evidence.json` pins the full original arm64 image, bounded raw ranges and exact literals. `stores-and-reader.asm` pins both paths, file existence, staging/copy/open/cleanup; `ordered-merge.asm` pins 24-byte FilePath iteration and the four-part first-wins key; `form-fields.asm` pins field assignments from the literal 27-column query. The retained bounded REA snapshot is recorded by its Evidence ID and raw-range digest; LLVM operands are authority where external helpers remain unnamed.

## Integration

File: `chrome/browser/extensions/api/aux_browser_import/migrator.cc`; target remains `chrome/browser/extensions/api/aux_browser_import:migrator`. No GN/dependency change. It is disjoint from L4's root/path discovery edits in the same file, so root may replay the original proposal against its baseline then rebase these exact reader hunks onto L4's output. Do not overwrite L4's discovery changes with this full source snapshot.

Run `python3 verify.py --native-root <chromium/src>` for raw source pins and a disposable patch replay only. Root owns focused C++ compilation. Runtime import requires separately authorized disposable source state; this delivery does not authorize it.
