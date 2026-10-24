# Profile authority decision for the next implementation batch

The desktop feature build and inactive package do not change this contract. No installation, signing, OS grant or owner-state access is proposed here. Keep current refusal gates until an explicit contract is selected and implemented.

## A. Standard browser profile isolation

Separate profile cookies, extensions and site state; scope Aux tasks, views, files, installation authority and provider credentials to their admitted owner. Close admission, settle and authenticate every supervised Aux browser/daemon/helper/service/descendant before reopening its state. Unrelated programs running as the same macOS user are outside the isolation guarantee. This matches the stated browser organization/privacy use case, but explicitly narrows the earlier mandatory-host-writer contract and requires its policy/docs to change together. It does not permit silently declaring untracked Aux writers drained.

## B. Isolation from unrelated same-user writers

Retain the existing stronger contract. Introduce a mandatory OS/principal/storage boundary covering all actual writers, already-open objects and aliases. This needs a concrete architecture plus authority/install decisions and substantial integration; ordinary path checks, repeated inventories, advisory locks, retained FDs or signing alone cannot provide it. Do not infer approval to install or grant anything from choosing this direction.

## Work common to either direction

The native whole-directory publisher must preserve authenticated retained Owner/task-FD lifetime, complete seed verification, settled copy workers, durability, single fixed-target exclusive rename, unchanged EEXIST destination and explicit unknown-outcome handling. The current native execution lock does not cover JavaScript stage mutation or cleanup: under A, every Aux stage mutator and cleanup needs an exclusive retained lease, cross-process exclusion and settlement accounting; under B, mandatory source-name/object custody is additionally required. An open directory FD or exclusive destination rename alone cannot prevent source-name substitution. Existing caches need authoritative completeness/version validation rather than treating retained as verified. See ../../profile-isolation-local-finish/runtime-publication-successor-blocker/README.md for the source-bound feasibility evidence.

The clean-reopen and complete-drain contracts depend on which writer universe is in scope. Current evidence is collected in remaining-authority-gates.md; current code deliberately refuses whole-writer clean proof and previously admitted-root reopening. No cold/runtime activation is implied by a passing feature build or by this review.
