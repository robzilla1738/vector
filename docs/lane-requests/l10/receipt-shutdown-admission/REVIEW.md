# Persistent native admission closure during shutdown

Apply after47148dd5, independently of c88c6803. Exact three-leaf patch SHA2564f0d280e83b79efde5683bcb8e47247b716ba0c167aca9d2b6514007d39f723b. Baseline/result pins supplied; preserve root newer main onText/no-page regions.

Root review correctly found the global retirement barrier releases before egress-close/run-interruption. The new actual RuntimeShutdownAdmission is instantiated at the beginning of startRuntime, before native producers. Quiescence closes it synchronously. The actual native permission sourceCheck refuses both initial acquisition and its retained pre/post-await fence after admission closes, persisting refusal through barrier release and cleanup. API cleanup remains outside the mutation barrier, avoiding blocked-handler deadlock.

The real controller fixture uses this same producer. Its regression starts with an actual authorized receipt, closes admission, awaits actual controller retirement, then sends a new native batch while the run still says running. It must deny without pending consent after the barrier is gone; no duplicate simulated shutdown guard.

Validation: npx tsc -b PASS; two focused suites46PASS (native45/runtime shutdown1), focused oxlint PASS. Source-only; no native build/journey claim.
