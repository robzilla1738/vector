# Original native profile inventory

Apply this one-file incremental proposal after `profile-identity` c3a130418. It restores the supplied `getProfiles` read behavior without changing the real native extension allowlist or private route mutation authorization. Independent replay/output verification passed. It is uncompiled and runtime-unverified.

The actual original native registration factory at `0x46ae210` points to vtable `0xe26ea98`, whose Run is `0x4274758` (bounded complete body included). That Run gets the real profile attributes storage and its original sorted-display order, excludes `IsOmitted` entries at byte `+0x60`, and emits precisely the four IDL fields:

- `profileIndex`: actual entry index in the complete sorted vector, including omitted entries in the index count.
- `name`: real `ProfileAttributesEntry::GetName()`, supplied helper `0x2208380` also recovered in the existing native-profile-display-label proposal.
- `isCurrent`: actual entry path equality with the calling original Profile path (`0x10cc104` is equality).
- `isLocked`: `0x2577ce8`, the actual attributes getter for `profile.info_cache` / `force_signin_profile_locked`. This is current155 `IsSigninRequired()`, not a synthesized Vault lock predicate.

There is no supplied daemon request, Vault query, account creation, Preferences file access, UUID creation, or local/current-account inference in this method. The prior independent asynchronous Vault decoration blocked the original profile list while the daemon was unavailable and exposed a different lock policy. Private opening still passes through the existing separate `openProfileRoute` real identity, registered profile, account/Vault and URL checks; this listing grants no navigation permission.

The source strings in the included getter resolve at `0xcefb62d` (`profile.info_cache`) and `0xcefb3c4` (`force_signin_profile_locked`). Exact framework SHA256 is `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Bounded disassembly only; no native app/owner state execution.
