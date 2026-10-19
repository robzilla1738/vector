import { requireAccount } from './native';
export const daemonUrl = 'http://127.0.0.1:21520';
let tokenPromise: Promise<string> | undefined;
async function authenticate() {
  const account = requireAccount();
  const challengeResponse = await fetch(
    `${daemonUrl}/auth/daemon/challenge?clientKind=agent-manager-extension`,
  );
  if (!challengeResponse.ok)
    throw new Error('Aux could not issue a connection challenge.');
  const challenge = (await challengeResponse.json()) as {
    challengeId: string;
    challenge: string;
  };
  const signed = await account.signDaemonAuthChallenge(challenge.challenge);
  const response = await fetch(`${daemonUrl}/auth/daemon/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: challenge.challengeId,
      signedChallenge: signed.signedChallenge,
    }),
  });
  if (!response.ok)
    throw new Error(
      'Aux could not verify this browser. Check the local installation identity.',
    );
  const session = (await response.json()) as { access_token: string };
  return session.access_token;
}
export function getToken() {
  tokenPromise ??= authenticate().catch((error) => {
    tokenPromise = undefined;
    throw error;
  });
  return tokenPromise;
}
export function reconnect() {
  tokenPromise = undefined;
}
export async function rpc<T>(
  procedure: string,
  input: Record<string, unknown> = {},
  mutation = false,
): Promise<T> {
  const token = await getToken();
  const url = new URL(`/trpc/${procedure}`, daemonUrl);
  if (!mutation) url.searchParams.set('input', JSON.stringify(input));
  const response = await fetch(url, {
    method: mutation ? 'POST' : 'GET',
    headers: {
      Authorization: `AuxDaemonSessionToken ${token}`,
      'Content-Type': 'application/json',
    },
    ...(mutation ? { body: JSON.stringify(input) } : {}),
  });
  const payload = (await response.json()) as {
    result?: { data: T };
    error?: { message?: string; json?: { message?: string } };
  };
  if (response.status === 401) reconnect();
  if (!response.ok || payload.error)
    throw new Error(
      payload.error?.message ??
        payload.error?.json?.message ??
        `Aux request failed (${response.status}).`,
    );
  if (!payload.result) throw new Error('Aux returned an invalid response.');
  return payload.result.data;
}
export async function resolveAccount() {
  const profile = await requireAccount().getProfileContext();
  const account = await rpc<{ id: number; name: string }>(
    'accounts.resolveProfileAccount',
    profile,
    true,
  );
  return { accountId: account.id, name: account.name, profile };
}
