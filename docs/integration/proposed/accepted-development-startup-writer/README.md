# Explicit existing-scope startup acceptance writer

Review-only tool for the native startup contract in v574. It was syntax-parsed, not executed. It creates no new Aux home/profile, signs nothing, launches nothing, accesses no Keychain, and embeds no credential. Only the previously approved disposable home hash and its existing `preview-profile-local-browser-pass/Default` are accepted.

After the final exact resource inventory and native signature verification, with Aux closed, the integrator may explicitly run:

```sh
python3 docs/integration/proposed/accepted-development-startup-writer/write-accepted-startup.py \
  --receipt /absolute/path/to/final/reuse-receipt.json \
  --receipt-sha256 FINAL_EXACT_RECEIPT_SHA256 \
  --handoff /absolute/path/to/final/launch-handoff.json \
  --handoff-sha256 FINAL_EXACT_HANDOFF_SHA256 \
  --accept-existing-scope \
  --confirm-app-closed-and-full-inventory-verified
```

The uppercase placeholders deliberately cannot pass validation. Use current final descendant artifacts, never stale v566 pins. The last flag records the integrator's prerequisite confirmation; it does not itself verify process absence or scan all 11,201 inventory leaves. Those remain required immediately preceding steps. The writer streams the seven selected executables against the exact receipt inventory, verifies existing signatures, extracts their current architecture CDHashes, and checks three small resource seals against the inventory. Outer/framework code verification skips recursively rechecking every resource because the integrator has already done full verification; retained helper signatures receive strict resource verification.

The exact receipt must state signed-and-verified, eight retained helpers, reused parent Apple signatures, no Apple signing or Keychain operations, inherited authority and preserved untargeted leaves. Handoff receipt/scope/parent proof pins must match. Seven code identities and three seal hashes mirror the native reader. The embedded receipt retains exact UTF-8 bytes and SHA256; the complete record must fit the reader's 8 MiB bound. Runtime depends on none of the receipt/handoff/repository paths after creation.

The destination is the actual passwd user's `Library/Application Support/Aux/DevelopmentStartup/accepted.json`, independent of inherited HOME. Ancestor directories reject symlinks, foreign ownership and group/world writes; missing startup directories are made 0700, and the final directory must be exactly0700. File-descriptor-relative operations create and fsync a temporary0600 file, publish it by exclusive hardlink, remove the temporary link and fsync the directory. Every preexisting accepted.json is refused, including a recognized one. No record replacement, profile migration, additional scope or app relocation is authorized by this tool.

New tool: source hash is pinned in files.json; no preexisting script is replaced. Validation was Python AST parsing and inspection against the actual public v566 receipt/handoff schema and v574 native reader. Actual writing and Finder acceptance remain integrator actions after final verification.
