# Restore the real source extension registry after aborted transfer

The actual helper already retains the physical browser rather than a Profile and
already implements old-registry detach, target-empty rebind and a BrowserContext
check on actual extension-unload events. Keep that implementation.

Add cold validation that its actual source registry is observed and retain a weak
source identity during preparation. Commit observes the real target registry with
the existing target identity/empty-model checks and clears the source identity.
AbortAuxProfileSwitch instead checks that the browser's authoritative profile is
the captured source and reobserves its real registry after core rollback restored
the source tabs. It does not transfer tabs or weaken the target-empty guard. No
unload event, extension operation, reload or successful switch is synthesized.

The complete transaction provider must call CanPrepareForAuxProfileSwitch before
side effects, PrepareForAuxProfileSwitch before transfer, existing Rebind on commit
or Abort on source rollback. No new owned service, observer identity, factory or
GN dependency is introduced. Source pins are actual applied v96; compilation and
runtime acceptance are separate evidence.
