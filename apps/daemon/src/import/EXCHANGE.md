# Native credential exchange

Independent implementation of the ready OS flow, data mapping and session rules in
`docs/spec/native/credential-exchange.md`. No reference code, dictionary or manager
profile was read. Public API types come from the macOS SDK and Apple's
[ASCredentialImportManager documentation](https://developer.apple.com/documentation/authenticationservices/ascredentialimportmanager).

## Current local boundary

**Real OS exchange is unavailable in the default ad hoc build.** On this host an
actual independently compiled importer with the AutoFill Credential Provider
entitlement was killed with signal9 before producing a private-pipe reply. The
same executable, re-signed with empty entitlements, replied to ping/begin/cancel
and exited normally. Both probes used a disposable HOME and synthetic scope;
neither opened the OS chooser or read credentials. This is observed local signing
enforcement, not proof that every macOS configuration has identical policy.

The normal build deliberately retains a runnable plain ad hoc helper. Its
`capabilities.nativeCredentialExchange` reports
`{supported:false,reason:"os-authorized-signing-required"}`, and `exchange.begin`
fails with an actionable eligibility error. Existing file import remains usable.
There is no fake zero-item successful exchange. An explicit
`build.py --probe-exchange-entitlement` builds the restricted signature in a
separate `apps/password-importer/out/credential-exchange-entitled-probe/` directory;
it never replaces normal `dist/`. No Developer ID signing, provisioning or OS
permission change was performed or is implied.

The source includes the typed macOS26 import call, receiving-app activity handler,
credential-provider extension metadata and conditional session pipeline. Actual
chooser registration, real token delivery and password/passkey interoperability
remain unverified and must not be called complete.

## Transport and data

The already-running daemon-owned helper is the receiving NSApplication. A private
`exchange.begin` arms a fresh one-use session for an exact account/profile/Vault.
The OS delegate accepts the SDK's `ASCredentialExchangeActivity` and UUID
`ASCredentialImportToken` only while armed, then invokes the real import manager.
An unarmed second app instance refuses the token before reading credentials.
The SDK's actual activity constant evaluates to `ASCredentialExchangeActivity`;
that value is registered in the host plist despite a naming discrepancy in the
public documentation's prose.

Credentials remain in helper memory, with 10,000-entry/16MiB total and512KiB
individual/batch bounds. A fresh receipt is issued after the OS handoff. Because the OS UUID carries no Aux session nonce, the Vault user must review the received counts and exact destination and explicitly accept that receipt before any private read or write. This prevents an older source chooser arriving after a new destination was armed from automatically writing into it. Private reads page at most32 records; acknowledgment
must match the exact pending batch and occurs only after encrypted destination
acceptance. Passwords, optional notes, scope URLs and display metadata map to
ordinary encrypted login items. Imported P-256 PKCS#8 keys undergo curve and
key-pair signature validation and enter only the dedicated encrypted passkey
collection. Credential-ID/RP/key/user conflicts fail; matching existing keys and
password fingerprints deduplicate retries. Counters are zero when the public
exchange supplies no counter; no previous counter is invented. Unsupported
categories and unsupported passkey extensions are reported by kind/count. Source account/collection organization is not recreated; all accepted records go to the explicitly selected destination Vault.

The daemon validates current account, actual bound ordinary-profile bridge,
selected unlocked Vault and its security generation before and after asynchronous
helper work. Lock/security changes invalidate receipt acceptance and require explicit destination reauthorization plus receipt acceptance;
account/profile changes, cancellation, expiry and late callbacks cannot write.
Waiting/status polling does not acquire a Vault key and cannot renew idle expiry.
Sessions expire after10minutes without progress; terminal metadata expires after
24hours. Status contains counts/stages/timestamps only, never credential bytes.
JavaScript/Swift immutable strings cannot guarantee physical memory wiping; no
plaintext intermediary file, clipboard, log or generic agent transcript is used.

## Integrator hooks

Root owns shared registrations. Add these six literals to `HelperMethod`:
`exchange.begin`, `exchange.status`, `exchange.read`, `exchange.ack`,
`exchange.cancel`, `exchange.finish` (`capabilities` already exists).

With the daemon's existing `services`, actual `VaultService` and private
password-importer `HelperClient`:

```ts
import { CredentialExchange, createCredentialExchangeRouter } from './import/exchange.js';
const exchange = new CredentialExchange(services, vault, importer);
exchange.start();
// Root router:
credentialExchange: createCredentialExchangeRouter(services, exchange)
// Shutdown before importer.close():
await exchange.close();
```

Router access is limited to `password-manager-extension`. Procedures are
`support({accountId})`,
`begin({accountId,profileId,browserMode:'default',vaultId,authorized:true})`, and
`status/resume/cancel({accountId,sessionId})`, plus
`accept({accountId,sessionId,receiptId,authorized:true})`. Begin receives only user-consent
scope, never an arbitrary token or caller-provided credential JSON. The popup must resolve its actual native account/profile/mode and refuse private windows; it must never substitute an ordinary mode for an incognito result. Resume is an
explicit user action after unlock and scope revalidation. The UI should display
the actual support reason and preserve normal file import when unavailable.

Package the ordinary helper with its nested provider extension. Preserve nested
entitlements when re-signing any future OS-authorized build; changing an ad hoc
signature's entitlement text does not authorize it.

## Focused evidence

- Actual Swift host and provider extension compile and local ad hoc signing pass.
- `python3 apps/password-importer/scripts/exchange-smoke.py` runs only disposable
  private-pipe capability/auth checks and a synthetic, typed SDK mapping fixture.
  It does not call the OS import manager or open the source chooser.
- Four daemon scenarios use a real disposable encrypted Vault and synthetic helper
  boundaries: mixed password/ES256 acceptance and retry deduplication; late batch
  cancellation and unsupported-curve rejection before any password write;
  lock/explicit resume/bridge loss/unsigned refusal; timeout and terminal retention.
- Scoped TypeScript and owned Biome pass. No real OS exchange acceptance is claimed.
