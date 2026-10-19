# Native retirement proposals

These are staged review artifacts over the frozen 100-patch reconstruction, not changes to the active native checkout. The integrator owns patch ordering and final consolidation. Do not add the old deltas to a final shipped series merely because their resulting source is clean: their deleted lines retain historical identifiers. Consolidate from upstream to approved final bytes.

- 0102 rewrites ten retained UI comments and passkeys documentation. It changes no executable behavior.
- 0103 uses the independent Agent identity from design metadata and the existing central native constant. New-tab matching follows the independent manifest's `index.html` root; side-panel chat remains `index.html#/chat`. It replaces the obsolete direct tab-search extension popup with the existing authenticated native bubble dispatch. Fresh compilation and disposable-profile route checks are required.
- 0104 removes retired-only branches under the supported shell-disabled configuration, simplifies shared browser/shell GN conditions, drops the shell argument and its derived macros, removes a macro-only SurfaceEmbed buildflag dependency, and removes two unused legacy preference-header includes. The old preference header has declarations only. Unsupported legacy release/utility assertions become explicitly false.

`scripts/propose-shell-retirement.py` parses condition boundaries and protects C++/GN strings and comments. It refuses unknown shell disjunctions rather than guessing. Five focused boundary tests pass. An independent `/usr/bin/unifdef -k` text projection compares 66 changed C++ files at the disabled-shell values; the resulting tokens match, excluding the two reviewed declaration-only/macro-only header dependencies. This is a limited textual equivalence argument, not native preprocessing, compilation, link or runtime proof. The proposal changes 82 paths.

The latest five-area artifacts are in `out/consolidated-retirement-clean/`. Forward application compares all 678 included paths without mismatch; reversing all five restores baseline tree `7a8cca3b478830bd3033aeab8de2594ebdce17f9`. All five patch files pass the artifact checker and contain no reference-name hits, including diff context. The two unchanged public upstream English comment hits occur only in whole-file audits, outside final patch context, and remain untouched. A broad scan of the disposable upstream reapply tree also flags three upstream files whose hashes occur in the reference index; that whole-tree result is not an artifact provenance pass. Manual provenance review remains required.

## Remaining review hooks

Two GN-unreachable legacy integration source files still include retired headers: `webui_browser/aux_device_confirmation.h` uses `runtime_host.h`; `webui_browser/aux_omnibox_handler.cc` uses `egress_controller.h` and `page_identity.h`. Their target membership was removed by the retired shell branch. Do not guess whether an owner plans to reuse them. Four retired generated-resource entries remain in `tools/gritsettings/resource_ids.spec`. Decide their removal with the complete resource retirement, not an unchecked global substitution.

Before applying 0104, the integrator must remove the retired `enable_aux_shell = false` assignment from the workspace GN flags and generated build args. This staged lane does not own those shared configuration files. The independent browser flag and current browser branches remain.

## Resource inventory and backup condition

Metadata-only inventory found 466 files (12,198,362 bytes) in `chrome/browser/ui/aux`, 302 files (4,391,492 bytes) in `chrome/browser/resources/aux`, and three files (23,808 bytes) in `chrome/browser/resources/aux_host`. `ui/aux/generated` and `resources/aux` were absent. No generated/vendor resource contents were opened and nothing was deleted.

Before any removal, review the concrete path inventory with the owner, satisfy the accepted plan's owner condition for untracked resources, and make a dated local opaque archive outside the native checkout. Verify archive membership and metadata against the inventory, and retain it through the fresh full build and runtime acceptance. The integrator handles this condition.

## Reproduction

Run the committed series verifier into a new directory, apply only explicitly reviewed proposal deltas to its disposable tree, then run the retirement proposal generator and area consolidator into separate new output directories. The area manifest records the original proof revision and proposal names; source comparison predates those proposals. Later native changes require a fresh committed proof and regeneration. No source, full-build, runtime, or final parity acceptance should be inferred from these scripts alone.
