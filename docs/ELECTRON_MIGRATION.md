# Electron Aux → Chromium Aux migration handoff

The host-neutral preparation step is `prepareElectronMigration` in the runtime package. It reads the Electron Aux data directory and creates a **new** standalone bundle. It never opens the source for writing, copies a consistent SQLite snapshot with `VACUUM INTO`, and never reads or copies Chromium/Electron Cookies, Login Data, Web Data, Keychain material, browser profile files, or OS credentials. The source app and profile remain usable.

## Preparing a bundle

1. In the Electron Aux app, open **Settings → General → Task data backup** and choose **Export layout for Chromium migration…**. This saves the current Space, folder, pin, split, tab order, and tab label layout as JSON without changing the profile.
2. Unlock **Connections → Vault**, enter a new 12+ character transfer passphrase, and choose **Export credentials…** if credentials should move. The `.auxvault` file is a separate AES-256-GCM package; the migration bundle contains no vault metadata or secrets. Use a different transfer passphrase from the vault lock passphrase and keep both files private.
3. With the source app closed or quiescent, build the current runtime (`pnpm build`), then run:

   ```sh
   node scripts/migrate-electron-profile.mjs --source "$HOME/Library/Application Support/Aux Browser" --output /path/to/new-aux-migration --layout /path/to/aux-layout.json --dry-run
   node scripts/migrate-electron-profile.mjs --source "$HOME/Library/Application Support/Aux Browser" --output /path/to/new-aux-migration --layout /path/to/aux-layout.json
   ```

   `--layout` can be omitted for older profiles, but the report sets `omitted.layoutMissing=true` and only DB Space metadata is available. The report includes counts for migrated and omitted tabs, bookmarks, artifacts, and vault metadata. The output directory must be new and outside the source data directory. A matching rerun returns `alreadyPrepared=true`; a conflicting or damaged output is rejected. Dry run creates no bundle.

The private bundle contains `manifest.json`, `aux-state.sqlite`, and bounded copied artifact files. The copied database retains tasks, conversations, history, bookmarks, Spaces, and available saved artifacts. It drops browser target bindings and live tabs, disconnects old sessions, cancels unfinished runs and pending messages, pauses routines, clears outstanding action intents to `uncertain`, strips host-bound grants/tokens and vault metadata, removes protected article recall, and omits download records and files. Missing or unsafe artifacts are marked unavailable. The manifest contains only HTTP(S) tabs/bookmarks/pins without URL credentials.

## Native apply contract (manifest version 1)

The Chromium host must **not** treat bundle metadata as commands. Before use, parse `ElectronMigrationManifestSchema` and reject unknown versions, wrong paths, oversized files, symlinks, duplicate identifiers, or any failed SHA-256 check. The `contentHash` is SHA-256 of the JSON serialization of `{sourceSnapshotSha256,databaseSha,layout,tabs,bookmarks,bookmarkFolders,artifacts,omitted}` in that key order, using the field order and values returned by `ElectronMigrationManifestSchema.parse`; `createdAt` is intentionally excluded. The source snapshot hash is provenance for the pre-scrubbed Electron runtime state. `database.sha256` and each artifact SHA-256 cover the actual files the native host will read.

Apply only to a newly selected Chromium profile, under a migration lock. Use the copied runtime DB as the initial runtime state (after the current runtime's schema migration if needed), then create native browser tabs from `tabs` and import bookmarks/folders via native APIs. Use `sourcePageId` only as a translation key to new Chromium page IDs; do not reuse Electron target IDs or controllers. Preserve each tab's `spaceId`, `folderId`, ordinal, active state, and reviewed label after translating IDs. Map `layout.activeTabs` and `layout.splits` through the same translation; drop references whose source tab was omitted. Import Space records by stable `id` and `workspaceId`, respecting archived state, color, optional grain, pins, folder metadata, active Space, and split ratio. Upsert bookmarks by URL so the same manifest cannot duplicate them. No cookies, sessions, saved browser passwords, extensions, or download files are imported.

The native host should persist the manifest `contentHash` as its migration receipt in the destination profile and perform its DB/catalog/browser changes transactionally or with a recoverable checkpoint. On restart or retry, a matching receipt is a no-op and a different hash requires explicit new import handling. Do not mark the receipt complete until native tabs/bookmarks/Space layout and runtime DB are committed. The host should not read the separate `.auxvault` package automatically: a human supplies its transfer passphrase through the vault import flow after the new profile is ready. Vault import verifies the AEAD tag before parsing items and skips existing credentials by origin, username, and label.

## Verification

`tests/unit/electron-migration.test.ts` uses fixture profiles to check dry run, byte-for-byte source preservation, Space/layout/tab/bookmark mapping, artifact copy and hash, host-bound secret removal, idempotency, conflict rejection, and unsafe URL omission. `tests/unit/human-vault.test.ts` covers encrypted vault round-trip, wrong passphrases, tampering, and duplicate imports. Native apply and a round-trip on a copy of a real Electron profile remain the Chromium integration lane's release gate; this host-neutral preparation step does not claim those have run.
