// Approval preview only: creates a private disposable directory and JSON.
// Never imports the native binding or calls any Security/Keychain operation.
import { createHash } from 'node:crypto';
import { mkdirSync, realpathSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function createDpQueryPreview(output) {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'aux-provided-dp-approval-')));
  const scope = createHash('sha256').update(home).digest('hex');
  const qualify = (name) => `aux.${scope}.${name}`;
  const rows = ['aside.install.meta', 'aside.install.sig', 'aside.install.kem', 'aside.dk'].map((account) => ({
    itemClass: 'kSecClassGenericPassword',
    service: qualify('aside.install'),
    account: qualify(account),
    label: null,
    dataProtectionKeychain: true,
    authenticationUI: 'kSecUseAuthenticationUIFail',
    accessGroup: 'original Aside group omitted; actual host entitlement/default group must be observed',
    encryptedOrHardwareKeyBytes: 'original supplied native format; never part of preview/log output',
  }));
  const preview = {
    version: 1, status: 'preview-only-no-keychain-calls-authorized', home, scope,
    originalBindingSha256: 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb',
    rows,
    proposedCommands: [
      { command: 'install-status', operations: ['read exact scoped installation rows; no mutation'] },
      { command: 'install-init', operations: ['read exact scoped rows', 'generate original selected installation scheme', 'delete/add exact scoped rows through original installSave; no file-Keychain substitution'] },
      { command: 'get-public-keys', operations: ['read scoped metadata/signing/KEM blobs', 'return public scheme/keys only'] },
      { command: 'cdp-sign', operations: ['read scoped metadata/signing blob', 'sign generated disposable HTTP-domain and raw-CDP challenge fixtures'] },
    ],
    cleanup: { status: 'not-implemented-not-executed', permittedSelectorsOnly: rows.map(({ itemClass, service, account, dataProtectionKeychain, authenticationUI }) => ({ itemClass, service, account, dataProtectionKeychain, authenticationUI })),
      prohibitions: ['no wildcard/prefix enumeration', 'no owner original selectors', 'no other Aux scope', 'no native install-destroy until its complete deletion surface is reviewed'] },
    forbidden: ['owner Aside group/selectors', 'owner accounts/credentials', 'opaque caller item handles', 'sync/user-independent storage', 'default/search-list changes', 'file-Keychain downgrade', 'forced P256/software downgrade', 'interactive grant/biometric prompt'],
    remainingGates: ['compiled guard/carrier/interposer fixtures', 'deny-all original module load proof', 'complete query coverage review', 'actual shared Aux entitlement-domain review', 'explicit human authorization before any proposed crypto/Keychain command'],
    executedOperations: ['mkdtemp private local directory', 'canonical-home SHA256', 'write approval preview JSON'],
  };
  output = resolve(output);
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'dp-query-preview.json'), `${JSON.stringify(preview, null, 2)}\n`, { mode: 0o600 });
  return preview;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const p = createDpQueryPreview(process.argv[2] ?? 'out/provided-dp-preview');
  console.log(JSON.stringify({ previewOnly: true, home: p.home, scope: p.scope, rowCount: p.rows.length }));
}
