import { resolveAccount, rpc } from './client';
export type ExchangeScope = {
  accountId: number;
  profileId: string;
  profilePath: string;
  browserMode: 'default';
};
export type ExchangeSupport = { supported: boolean; reason: string };
export type ExchangeSession = {
  id: string;
  accountId: number;
  profileId: string;
  vaultId: string;
  browserMode: 'default';
  state:
    | 'waiting'
    | 'importing'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'timeout';
  stage:
    | 'source-export'
    | 'destination-check'
    | 'normalizing'
    | 'writing'
    | 'authorization-required'
    | 'receipt-review'
    | 'complete';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  needsAuthorization: boolean;
  needsAcceptance: boolean;
  receiptId: string | null;
  passwordTotal: number;
  passkeyTotal: number;
  passwordCompleted: number;
  passkeyCompleted: number;
  passwordsCreated: number;
  passwordsSkipped: number;
  passkeysCreated: number;
  passkeysSkipped: number;
  unsupported: Record<string, number>;
  error?: string;
  helperCleanupFailed?: boolean;
};
export async function actualExchangeScope(
  accountId: number,
): Promise<ExchangeScope> {
  if (
    typeof globalThis.chrome?.extension?.inIncognitoContext !== 'boolean' ||
    !chrome.windows?.getCurrent
  )
    throw new Error(
      'Native exchange requires the rebuilt Aux browser and its current profile context.',
    );
  if (chrome.extension.inIncognitoContext)
    throw new Error(
      'Native credential exchange is unavailable in private windows. Open Aux Vault in an ordinary window.',
    );
  const window = await chrome.windows.getCurrent();
  if (window.incognito !== false)
    throw new Error(
      'An ordinary browser window must be verified before native exchange.',
    );
  const account = await resolveAccount();
  const profile = account.profile as typeof account.profile & {
    browserMode?: unknown;
  };
  if (
    account.accountId !== accountId ||
    !profile.profileId ||
    !profile.profilePath ||
    profile.browserMode !== 'default'
  )
    throw new Error(
      'The actual native account/profile must match an ordinary window. Reopen Aux Vault in that window.',
    );
  return {
    accountId,
    profileId: profile.profileId,
    profilePath: profile.profilePath,
    browserMode: profile.browserMode,
  };
}
const TRACKING = 'auxVaultCredentialExchangeSession';
export async function rememberExchange(session: ExchangeSession) {
  await chrome.storage.session.set({
    [TRACKING]: {
      sessionId: session.id,
      accountId: session.accountId,
      profileId: session.profileId,
      vaultId: session.vaultId,
      browserMode: session.browserMode,
    },
  });
}
export async function trackedExchange(
  scope: ExchangeScope,
): Promise<string | undefined> {
  const stored = (await chrome.storage.session.get(TRACKING))[TRACKING];
  const value = stored as Record<string, unknown> | undefined;
  if (
    !value ||
    typeof value !== 'object' ||
    value.accountId !== scope.accountId ||
    value.profileId !== scope.profileId ||
    value.browserMode !== scope.browserMode ||
    typeof value.sessionId !== 'string'
  )
    return;
  return value.sessionId;
}
export function matchesScope(session: ExchangeSession, scope: ExchangeScope) {
  if (
    session.accountId !== scope.accountId ||
    session.profileId !== scope.profileId ||
    session.browserMode !== scope.browserMode
  )
    throw new Error(
      'The native exchange belongs to a different account or browser profile.',
    );
}
export const exchangeRpc = <T>(
  procedure: string,
  input: Record<string, unknown>,
  mutation = false,
) => rpc<T>(`credentialExchange.${procedure}`, input, mutation);
export function terminalExchange(session: ExchangeSession) {
  return ['succeeded', 'failed', 'cancelled', 'timeout'].includes(
    session.state,
  );
}
export function receiptReviewKey(session: ExchangeSession) {
  return JSON.stringify([
    session.id,
    session.receiptId,
    session.vaultId,
    session.passwordTotal,
    session.passkeyTotal,
    session.unsupported,
  ]);
}
