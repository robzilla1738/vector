# Signed pre-generation fresh bootstrap policy

This inactive native successor addresses a real mismatch: selected-installation policies require a home/scope, generated public keys and exact four-row ciphertext hashes, which cannot exist before a new installation generates them. It does not modify or weaken the existing selected v1–v4 policies, replace legacy migration, or activate startup.

`AuxSignedFreshBootstrapPolicyLoader.load()` returns `AuxAuthenticatedFreshBootstrapPolicy` only after the actual current-process/static Apple signature requirement, reviewed developer team/certificate/role, exact host entitlements, fixed sealed resource `AuxFreshBootstrapPolicy.json`, loaded-image identities/bytes and private-parent checks. Live signature and sealed-file authentication precede parsing. The parser is strict about unknown/duplicate fields, including escaped duplicates, and rejects future home/scope/key/hash fields and caller hardware/downgrade controls. Parsing captured bytes alone grants nothing.

The new signed resource contains only:

- `format: aux.fresh.bootstrap.policy.v1`, actual `role: daemon|cli`;
- `canonicalPrivateParent`, bound to a canonical existing private 0700 current-UID/no-ACL directory by the actual reader;
- `accessGroup`, one explicit team-prefixed Aux group exactly equal to the actual authenticated host's sole signed access-group entitlement;
- `authoritySelection: aux.fresh.authority.host-availability.v1`, a fixed contract for the existing `AuxFreshFourRowPreparation.prepareForCurrentHost` policy, never JSON capability/downgrade flags;
- for daemon only, the exact reviewed PDF and macOS-utility image objects. CLI admits only its host/runtime pair; daemon requires all four fixed images already loaded.

The dynamic home/scope is deliberately absent. `AuxAuthenticatedFreshBootstrapPolicy` has a fileprivate initializer in the actual reader file. Its native-only `createFreshHome()` first reauthenticates current bundle/resource/CDHash, then invokes `AuxFreshNativeHome.create(inCanonicalPrivateParent:)`. That concrete producer exclusively reserves the parent and retains the newly created private home FD. No parser-contents overload, Boolean approval, generic receipt or JS/environment input creates an authenticated policy/home.

The new reader reuses the count-pinned existing host loader's actual resource FD custody, live/static signature checks, image signatures and byte hashes, system-image/import restrictions and final revalidation. `baseline/` and `source-review.patch` make the changes reviewable without editing active host files. Its single access-group value comes from sealed policy **and** real signed entitlements; it is not an arbitrary service/account selector.

At source commit, static source/dependency and authentication-order checks pass. The focused pure captured-policy fixture and full actual reader+home separate-file Swift typecheck are prepared but still queued behind the integrator's browser build lock. No compiler/runtime success is claimed until separate evidence is committed. Commands are `python3 verify.py`, and (serialized through `scripts/native-build.py`) `sh check.sh` / `sh typecheck.sh`. The captured fixture never calls the live reader or home creation.

Remaining production seams are explicit:

1. No signed resource exists or is authorized for this new path. No signing/provisioning plan or execution is included. Current pinned PDF/utility bytes are unsigned; they cannot simultaneously satisfy this reader's actual Apple-signature requirement. Any signed successor changes those hashes and requires separate exact-byte review. Host/runtime signature acceptance and current loaded-image ordering are not proven by source checks.
2. The authenticated fresh home is physical FD ownership, not proof that historical rows are absent or all writers are excluded. It cannot adopt a prior/partial reservation or be used as migration-by-empty-new-namespace. Legacy/current artifacts and genuine scope admission still require the explicit native coordinator; legacy migration remains required.
3. There is no factory invocation or secure-row capture/write here. A downstream genuine native owner must pair the authenticated role/group and retained fresh-home scope with exact-selector absence checks, actual host-derived factory selection, approved fifth-stage selector and durable fresh installation coordinator. It must not manufacture `CallerAssertedFreshAdmission` provenance from this policy, a receipt or a Boolean. Existing selected-state runtime owner registration still needs a trusted terminal handoff after genuine four-row validation; no per-account re-signing is implied.
4. No startup marker/first refusal, native registration, active host graph, root pins, browser checkout, package or UI changes. No owner state, protected authority, Keychain/SecItem/SecKey, actual signature-reader execution, OS grants, original addon or cloud calls were performed.

## Subsequent focused evidence

After the browser build released `/tmp/aux-build.lock`, both queued commands completed successfully without source corrections: 30 captured pre-generation policy/signature/image checks passed, and the actual signed reader plus retained-home producer typechecked as four separate Swift files for arm64/macOS 13 with the installed Swift 6.4 SDK. `evidence.json` pins source and check inputs. The live signed reader was never called, so no authenticated policy/home was created and no signature/Keychain/authority/runtime-admission result is claimed. No broad suite or full host/browser build was repeated.
