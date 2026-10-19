import type { AccountResolver, PasskeyRpc } from './native';
// Install once in the split-incognito Vault worker. Last-window removal is
// independent of popup lifetime. Native profile epochs isolate reopened sessions.
export function installPasskeyLifecycle(
  rpc: PasskeyRpc,
  resolveAccount: AccountResolver,
) {
  if (!chrome.extension.inIncognitoContext) return () => {};
  let running = false;
  async function clearIfClosed() {
    if (running) return;
    running = true;
    try {
      const windows = await chrome.windows.getAll();
      if (windows.some((window) => window.incognito)) return;
      const account = await resolveAccount();
      await rpc(
        'passkeys.clearEphemeral',
        {
          accountId: account.accountId,
          profileId: account.profile.profileId,
          browserMode: 'incognito',
        },
        true,
      );
    } catch {
      /* A restarted daemon has no ephemeral keys. No secrets are read here. */
    } finally {
      running = false;
    }
  }
  const removed = () => void clearIfClosed();
  chrome.windows.onRemoved.addListener(removed);
  void clearIfClosed();
  return () => chrome.windows.onRemoved.removeListener(removed);
}
