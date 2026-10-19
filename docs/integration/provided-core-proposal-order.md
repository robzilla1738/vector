# Core native proposal review/application order

All source changes remain staged under docs/integration/proposed. The integrator owns actual shared checkout edits and native build scheduling. These five disjoint core patches apply together to current frozen source:

1. native-provided-preference-results.patch — actual core settings results and default-browser capability/policy checks.
2. native-provided-dock-results.patch — recovered original supported/isAdded/canAdd semantics around real Dock action.
3. native-provided-import-results.patch — actual original optional dataKinds, Safari source metadata and terminal state/errorMessage.
4. native-provided-import-consent.patch — remove independent incompatible transient gesture check; preserve original explicit UI permission/file flow and all private caller/profile/source/job protections.
5. native-provided-omnibox-results.patch — actual core match/selection/file context fields and recognized session ownership error.

Run `python3 vendor/provided/verify-native-core-proposals.py <native-source-root>`. It reads only the named native source files, verifies exact source hashes and ordered anchor counts, replays the actual patches in a newly created disposable directory, and verifies output hashes. It never edits the native checkout, compiles, runs the browser or accesses owner data. It fails on source drift rather than refreshing reviewed hashes.

The older supervisor/profile proposals require integrator-owned identity-carrier and current explicit original-wire exceptions; do not blindly combine their historical auth/version edits. Owner-preserved daemon/CDP command strings include Aside.* and original tokens/domain/health contracts. Current Aux private native namespaces remain separate. Experimental webview is checkpointed separately, uncompiled and underlying feature disabled; do not enable it as part of these core changes. Capture/launch permissions also remain their separate reviewed proposal.

Remaining actual gaps: full action metadata/actuation and contextual Lens/AI modes, modifier navigation, native loaded-stack UI/behavior acceptance, original identity carrier/auth/profile gate composition and runtime packaging. A matching object shape is not proof that independently written native backend behavior equals the supplied implementation.
