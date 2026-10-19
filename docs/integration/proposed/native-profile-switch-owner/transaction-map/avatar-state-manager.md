# Stable avatar button state-manager profile migration

Four current155 source files only: AvatarToolbarButton and its state manager.
The outer button and the embedded state-manager object remain the same objects;
no whole toolbar recreation, placeholder avatar or new profile UI is introduced.

## Actual owner boundary

The actual state manager holds an immutable-at-construction profile reference,
IdentityManager, ProfileAttributesStorage and SubscriptionEligibilityService
observations, a map of profile state providers, weak delayed IPH callbacks,
profile-specific state-coordinator observers, and permanent button listeners.
Providers additionally own sync/signin/passkey/management/pref/timer observations.
Changing only Browser identity therefore leaves real old-profile services active.

The actual factory creates a subscription-free NormalStateProvider for regular
profiles and registers exactly three kinds of profile-owned state observers:
OnSigninCoordinator, PromoStateProviderCoordinator and passkey state reporter
(subject to existing feature eligibility). Other external state observers and
button observers use the public registration methods and must remain intact.

## Concrete caller API and ordering

The existing actual AvatarToolbarButton forwards:

- `CanRebindForAuxProfileSwitch()` requires normal regular source identity, no
  running state update/initialization, no explicit externally owned state override,
  and no showing real ProfileMenuCoordinator bubble.
- `PrepareForAuxProfileSwitch()` runs before Browser identity changes. It cancels
  state-manager weak tasks, detaches the three manager service observations, clears
  pending source sign-in-choice Gaia ID, and removes only the internally recorded
  old-profile coordinator/reporter observer registrations. It preserves external
  state-observer registration order and the same checked button ObserverList.
  It destroys the actual profile-observing providers (their own destructors retire
  their service observations/timers/weak closures). The already-existing actual
  NormalStateProvider is retained solely for safe synchronous getter/animation
  access during the cold interval; it is not a fabricated unavailable/default
  provider and no new old-profile service is queried or observed by preparation.
  Prepared update requests and button activation are suppressed.
- `RebindForAuxProfileSwitch(target_profile)` runs after committed target Browser
  identity and required target services. It verifies real target identity,
  destroys the retained source normal provider, updates the manager's nonnull
  profile reference, and invokes the existing full state factory/initialization
  order against actual target services. The existing icon/text update methods
  refresh the same button. The window creation time remains the same real window
  creation time, not a fabricated new-window timestamp.

The orchestrator must keep these calls inside its synchronous cold UI transaction;
no prepared state or source normal provider may escape as the target window's
finished state. Abort can restore the source identity and invoke the same rebind
path. An active explicit button-state owner is rejected up front rather than
silently losing its scoped callback. Button listeners remain attached throughout.

## Observer preservation

A separate private list records only the factory's profile-owned registrations.
The ordinary existing state observer list remains the dispatch list, with its
existing ordering. Preparation erases only matching profile-owned registrations;
rebind records the actual target coordinators. It does not clear external observer
registrations or replace the button's ObserverList. Provider destructors remove
only their own button listener registrations as they already do on normal teardown.

This is an explicit current155 profile-service adaptation. Original04559f80 and
045b7db8 establish that the real supplied transaction refreshes profile-bound
window/view services; they do not prove an identically named old avatar helper,
so no old-offset/avatar class identity is claimed here.

## Verification and remaining acceptance

Manifest pins all four actual read-only native inputs and output hashes. Temporary
patch checking/application, exact output comparisons and unchanged shared inputs
pass. No native build/shared writes, profile data, target execution or runtime
acceptance occurred. Disposable integration must verify target name/avatar/error
states, no source identity/pref notifications reaching the switched button,
retained external observers, profile-menu/explicit-state refusal and abort recovery.
