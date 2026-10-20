# Original saved-pin registration and empty default

This incremental correction follows `native-pinned-tab-entry-model` (root173). It leaves the original isolated profile key `pinned_tabs` intact and registers the same empty list with the source's actual flags. No default tiles, profile reads or live tabs are manufactured.

The exact original registration at03597aa0 builds `base::Value(Type::LIST)` (w1=7). Its constructor005cf5b0 takes branch005cf600 and zeros all list storage before recording type7: the default is genuinely empty. The following call03597ac8 to00bddc50 receives registry x0, `pinned_tabs` string_view x1/x2, default Value x3, **registration flags w4=1**, and RegisteredPrefType w5=0. The callee preserves w4 and inserts nonzero flags into its registration map, separately from w5's typed-pref map. This is the actual registry operation, not a reader of an absent preference. It supplies no URL/title seed.

Current155's `PrefRegistry::RegisterPreference(path, default_value, flags, type)` and `PrefRegistrySyncable::SYNCABLE_PREF = 1 << 0` provide the corresponding typed integration. `PrefRegistrySimple::RegisterListPref(path, flags)` constructs the empty list and passes those flags. The prior slice's default was correct; its implicit flags0 were incomplete. This correction uses the actual symbolic syncable flag without claiming that local-only Aux enables or contacts a cloud sync service.

Integrator: apply `native.patch` after the model. Its only existing-path input is model cc SHA53d26bd4…; output is recorded in manifest. The target needs the existing `//components/pref_registry` dependency for the symbolic header (root owns GN). Keep root173's actual profile-scoped registration call. No preference setter, OS domain or source app was executed.

`python3 .../verify.py` checks original binary range hashes and exact AArch64 caller operands/list construction, current155 header pins, and incremental replay in a disposable directory. This is static verification; no build, native mutation or UI acceptance occurred.
