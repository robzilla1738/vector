# Restore the full original live-owner source-key prerequisite

This source-only correction **supersedes the optional-key allowance in 2502391dd**. The preceding reader-only recovery proved that the low-level decoder accepts absent AES state for non-v10 input, but did not establish that the public migration owner permits reaching it without a raw source key. Full-owner recovery now positively proves that it does not. The original caller gate must win.

Actual public flow: Chromium import job427b898 constructs a ChromiumProfileMigrator4252ec0 for the captured destination Profile. It calls Start42530c0 with explicit mode1 at427ba9c. The continuation42534e8 selects live/current-profile worker4253e58, not the separate mode0 new-profile recursive-copy worker4255868.

In worker4253e58, source encrypted DB eligibility helper4259690 is called at425497c. Once those databases exist,4254a40 loads the **raw source key optional present flag**, and4254a44 branches to real whole-worker failure4254ce8 when absent. That failure builds the source-specific access error; no password/cookie reader is called. Only a real present key proceeds to PBKDF2 and password/cookie readers. The worker also has explicit source-specific bypasses/empty-database handling; those do not authorize a generic no-key encrypted-category route.

This patch reverses only the earlier250 reader adapter/allowance, restoring the real upfront key failure for selected encrypted-category reads. It retains the earlier original two-store, blocked-form, first-wins merge, partial-decode and successful-empty-output corrections. No source key is created, substituted or read by verification; authentication/private API gates are unchanged. The former decoder proof remains historical low-level evidence, not a valid caller admission rule.

Baseline is exact2502391dd output; output is exactbe8a0db48 reader output. Root must rebase these hunks onto current423 while preserving L4 discovery changes. No GN/new API/dependency. Source-pinned bounded raw evidence and provided decompile are verified by `verify.py`; no build, source profile, runtime, Keychain, credential or OS operations were performed.
