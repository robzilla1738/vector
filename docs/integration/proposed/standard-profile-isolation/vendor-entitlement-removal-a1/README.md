# Remove dormant vendor staff payment privileges

The current a5 `accountHasAllowedPlan` bypasses paid-plan membership for `@aside.com` and `@at.studio`. One counted source edit removes both vendor privileges. The existing payment-free branch remains exactly `return !!Cn`; if payments are deliberately enabled later, the procedure checks explicit subscription-plan membership only. There is no replacement Aux email privilege, new entitlement service, UI change or account migration.

## Integration

`source/transform.mjs` exports `transformAuxVendorEntitlementRemoval(text) → {text, changes}`. Apply independently to the current ordinary source and dormant entry after the existing 197-anchor chain, then run the original entry projector and require equality. `overlay.json` pins both current input hashes and independently measured output hashes. Root owns the later producer/source-receipt/package coupling. No current projection or queued v9 checkpoint was changed.

The focused check replayed both exact leaves in memory and executed only the isolated pure entitlement predicate for signed-out, free and matching-plan accounts with vendor, Aux and unrelated email domains. Payments-disabled behavior is preserved. No daemon/provider/product was imported or executed, and no new projected leaf was written.

## Selected identity inventory

`identity-selected-leaves.json` verifies named files against the actual v6 app receipt, and separately records current a5 ordinary/dormant source evidence. This is a bounded inventory, not final-candidate clearance:

- Memory manifest/catalog still name `aside-memory-runtime-v1` and `aside-memory`; current a5 schema and signed-catalog domain still consume them. The memory-runtime lane owns coordinated metadata, filename and authentication changes. Signed payload text must not be renamed independently of its authenticated envelope.
- The CLI `provided-native.node` (SHA `66368b6846d2842a5ee0ba3d5c6d5d094fd40098d7819dbb63ef17600c85c3fc`) and daemon copy (SHA `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`) still contain `AsideNativeSwift`, `AsideNativeRun` and `AsideNativeFree`. The native-module lane owns coordinated caller/export/module changes; arbitrary string replacement is not safe.
- This proposal removes the payment privilege, but current a5 `isExperimentalEligible` separately accepts `@at.studio` through `INTERNAL_EMAIL_SUFFIX` (ordinary line1328). Canary mode and an explicit feature flag also qualify. That distinct vendor privilege is recorded for a narrow follow-on; it is not silently migrated to an Aux email suffix.
- The earlier 2026-10-22 whole-app identity audit describes another candidate and is historical only. The queued final app audit must classify final delivered findings, preserving standard HTML semantics and required third-party notices.

The accepted UI and revision17 resources are untouched. Remaining native/runtime identities prevent claiming no-trace branding completion from this source-only slice.
