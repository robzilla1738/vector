# Disposable Aux Data Protection access-group review

This is a read-only identification review, not an installation-state capture, migration approval, signing plan or runtime authorization. No Keychain calls, native addon execution, identity enumeration, profile reads or signing occurred. Existing accepted UI and packaged app inputs were not changed.

## Result

The reviewed legacy disposable Aux hosts declare this first and only explicit `keychain-access-groups` entry:

```
9F2JXY8TCK.dev.aux.dp.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476
```

The declaration already uses Aux exclusively. It is the effective default-group **candidate for historical Adds**, not the supplied original product group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography`. These two groups must not be conflated. No separate newly provisioned Aux production group is evidenced by this review.

For the same reviewed disposable installation, the existing Aux-only group can also be the proposed explicit **target** group, with new Aux-only service/account selectors. The executor requires disjoint original/target selector triples; it does not require a different access group. This is a candidate binding only. A real executor still needs a reviewed exact binding, actual authorized host/provisioning validation, captured original records and all-writer custody. No target has been activated or queried here.

## Why removing the group matters

`vendor/provided/native/keychain-query-map.mm` accepts only the original explicit group, removes `kSecAttrAccessGroup`, and namespaces service/account/tag/label with `aux.<scope>.` while retaining the full logical suffix. `keychain-interpose.mm` supplies that mapped dictionary to the actual SecItem function; it does not restore an explicit group.

Apple documents distinct omitted-group rules: Add chooses the first access group; CopyMatching, Update and Delete search all accessible groups. The canonical list also includes the application identifier and app groups. Thus one declared `keychain-access-groups` element does not prove an omitted-group read or delete is confined to that group. Explicit migration queries must not use an omitted-group fallback. [Apple: access-group attribute](https://developer.apple.com/documentation/security/ksecattraccessgroup), [Apple: sharing access](https://developer.apple.com/documentation/security/sharing-access-to-keychain-items-among-a-collection-of-apps).

The historical helper retains Data Protection semantics. Apple distinguishes Data Protection from the file-based keychain, and explains that a library uses its hosting executable's effective entitlements, with provisioning authorization relevant to Data Protection access. A displayed addon signature or an embedded entitlement alone is insufficient runtime proof. [Apple: TN3137](https://developer.apple.com/documentation/technotes/tn3137-on-mac-keychains).

## Exact legacy selector candidates

Let `P` be `aux.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476.`. All four candidates are generic-password Data Protection rows with service `P + aside.install`, and the group above:

| Role | Account |
| --- | --- |
| metadata | `P + aside.install.meta` |
| signing | `P + aside.install.sig` |
| KEM | `P + aside.install.kem` |
| wrapped root | `P + aside.dk` |

These are derived from the fixed diagnostic source and mapper, not discovered rows. They contain historical logical suffixes deliberately preserved by the old mapper. Do not replace those suffixes in a legacy lookup or interpret them as current target names. No record values or owner state were read.

`RecoveredInstallStorageQueries.swift` and `InstallationSecurityExecutor.swift` already require explicit nonempty access groups. The executor refuses target selector fields containing the former product name and refuses overlapping original/target triples. Its synthetic test groups are not evidence of a provisioned target group.

## Evidence strength and limits

- `proposal.json` and `signing-plan-summary.json` are preparations; their false execution fields are not signing receipts.
- Historical `provided-v498-local-auth-repair.json` references the actual signing receipt and reports daemon/CLI `defaultGroupVerified:true`; carrier is null. The fixed helper inspected returned row attributes and only returned an access-group hash when it matched the expected group. This strengthens historical evidence beyond default-group inference, but is not a fresh capture or proof that current rows exist or belong to a proposed migration.
- `public-artifacts.json` records display-only embedded entitlements and executable hashes for the fixed copied v498 daemon, CLI, carrier and v589 daemon. All four public displays succeeded and declared the same group/team with role-specific app identifiers. `signatureVerified:false` is intentional: this review did not run signature validity, provisioning validity or runtime access checks. The metadata is a static snapshot, not a reusable authorization token.
- v589's receipt says signed-and-static-verified-no-runtime. It must not inherit v498 runtime acceptance merely because the displayed group matches.

`source-pins.json` pins the precise source and historical evidence reviewed. These pins preserve truthful historical names; they are not new delivered product identifiers.

## Remaining boundary

A future explicitly authorized disposable migration must bind each original and target service/account/group, validate the actual host authority, and capture each exact row once under that explicit group. It must refuse unknown or conflicting groups rather than search broadly. This review supplies the group candidate and explains the old mapping; it does not supply current row ownership, keys, all-writer exclusion, a new profile or permission to execute migration.
