# Production storage correction: preserve original Data Protection behavior

This supersedes fresh-keychain-plan.md as a production direction. That earlier file backend was an internal fixture strategy and is not the owner's required product. The supplied DP/enclave/access-control implementation wins. No file Keychain is created, opened or substituted; there is no search-list/default mutation path.

Current source removes the file-Keychain handle prerequisite from the Node guard/carrier. The interceptor preserves DP=true, access-control/accessibility values and original encrypted/hardware-key bytes. It maps recognized item service/account/application identities into immutable `aux.<SHA256(canonical AUX_HOME)>.<original logical name>`, removes only the exact original Aside access group, and tightens unattended query interaction to kSecUseAuthenticationUIFail. Sync/user-independent storage, caller search-list/keychain/item handles, unsupported classes and unclassified queries refuse. Unknown CryptoKit requests or entitlement errors remain errors; no P256 downgrade, fake grant, fake unlock or storage fallback is added.

Removing the original group alone does **not** establish a shared DP entitlement domain across differently signed daemon/CLI/carrier hosts. The actual Aux common group/default-domain behavior must be reviewed and observed. The mapper does not borrow the owner's original group to make authentication succeed. That is a real acceptance gate under local ad hoc signing.

## Concrete review preview

`approval-preview/dp-query-preview.json` records a newly created private disposable local home, its canonical SHA scope, exact original binding hash, four proposed installation item selectors, permitted operations and cleanup restrictions. It contains no key material, tokens or credentials. Its service/account strings are the exact mapper composition rule, established against the pinned original install service/account initializers. No kSecAttrLabel is invented: original installation base queries use service/account, and preview label is null.

`vendor/provided/dp-query-preview.mjs` generates this artifact without loading native code or calling Security. The directory exists, but no Keychain rows have been queried or created. This file is a preview, **not authorization**. Root will resolve explicit user authorization only when the compiled restricted probe and query review are concrete; no request is made by this child slice.

Proposed first actual probe is limited to original install-status/install-init/get-public-keys/cdp-sign on the exact fresh scope. Original installation init may generate whichever hardware/software scheme its original platform detection selects. Unclassified enclave operations must refuse rather than invent unsupported behavior. The probe must suppress raw native secret-bearing outputs and report public scheme/boolean/count evidence only.

Cleanup is not implemented or executed in this slice. Any cleanup proposal must use only the four exact selector dictionaries in the preview, with DP=true and no UI, after recording which fresh rows were created. No wildcard search, other-home scope or broad original install-destroy is authorized. If cleanup cannot be proven confined, leave the fresh rows and report the gap; do not broaden deletion or silently claim success.

Node/parent worker loaders retain explicit runtime acceptance and actual interposition handshakes. Deny-all load probes remain usable without invoking crypto; production is not declared ready merely because a flag can be set. All current native revisions remain queued for compilation behind the full build. Five Node fixtures still pass; no current native DP-preservation fixture runtime result is claimed until that queued build runs.
