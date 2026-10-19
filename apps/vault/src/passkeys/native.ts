export type NativePasskeyProof = { payload: string; signature: string };
type NativeCredentials = {
  getRequest(id: string): Promise<NativePasskeyProof>;
  complete(id: string, response: Record<string, unknown>): Promise<boolean>;
  reject(id: string): Promise<boolean>;
};
export function credentials(): NativeCredentials {
  const api = (
    globalThis.chrome as typeof chrome & { auxCredentials?: NativeCredentials }
  )?.auxCredentials;
  if (!api)
    throw new Error(
      'Passkeys require the rebuilt Aux browser and its private Vault capability.',
    );
  return api;
}
export type PasskeyRpc = <T>(
  path: string,
  input?: Record<string, unknown>,
  mutation?: boolean,
) => Promise<T>;
export type AccountResolver = () => Promise<{
  accountId: number;
  profile: { profileId: string };
}>;
export function requestIdFromHash(hash = location.hash): string | undefined {
  return /^#\/passkeys\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(
    hash,
  )?.[1];
}
