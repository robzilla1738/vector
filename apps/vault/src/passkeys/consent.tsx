import { useEffect, useRef, useState } from 'react';
import { type AccountResolver, credentials, type PasskeyRpc } from './native';
import './passkeys.css';

type Scope = {
  accountId: number;
  profileId: string;
  browserMode: 'default' | 'incognito';
};
type Preview = {
  requestId: string;
  kind: 'create' | 'get';
  rpId: string;
  origin: string;
  expiresAt: number;
  incognito: boolean;
  user: { name: string; displayName: string } | null;
  candidates: { id: string; userName: string; displayName: string }[];
};
export function PasskeyConsent({
  requestId,
  rpc,
  resolveAccount,
}: {
  requestId: string;
  rpc: PasskeyRpc;
  resolveAccount: AccountResolver;
}) {
  const [preview, setPreview] = useState<Preview>();
  const [scope, setScope] = useState<Scope>();
  const [selected, setSelected] = useState('');
  const [password, setPassword] = useState('');
  const [presence, setPresence] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(true),
    inflight = useRef(false);
  useEffect(() => {
    active.current = true;
    let canceled = false;
    void (async () => {
      const account = await resolveAccount();
      const proof = await credentials().getRequest(requestId);
      const request = JSON.parse(proof.payload) as {
        accountId: number;
        profileId: string;
        browserMode: string;
      };
      const mode = chrome.extension.inIncognitoContext
        ? 'incognito'
        : 'default';
      if (
        request.accountId !== account.accountId ||
        request.profileId !== account.profile.profileId ||
        request.browserMode !== mode
      )
        throw new Error(
          'This passkey request belongs to another browser profile or account.',
        );
      const current = {
        accountId: account.accountId,
        profileId: account.profile.profileId,
        browserMode: mode,
      } satisfies Scope;
      const data = await rpc<Preview>(
        'passkeys.begin',
        { ...current, proof },
        true,
      );
      if (canceled) return;
      setScope(current);
      setPreview(data);
      if (data.candidates.length === 1 && data.candidates[0])
        setSelected(data.candidates[0].id);
      try {
        const status = await rpc<{ available: boolean; enrolled: boolean }>(
          'passwordManager.auth.biometricStatus',
          { accountId: current.accountId },
        );
        if (!canceled) setBiometric(status.available && status.enrolled);
      } catch {
        /* Password verification remains available. */
      }
    })().catch((error) => {
      if (!canceled) {
        setTerminal(true);
        setError(
          error instanceof Error
            ? error.message
            : 'Passkey request unavailable.',
        );
      }
    });
    return () => {
      canceled = true;
      active.current = false;
    };
  }, [requestId, rpc, resolveAccount]);
  useEffect(() => {
    if (!preview || terminal || finished || busy) return;
    const timer = setInterval(() => {
      void credentials()
        .getRequest(requestId)
        .catch(() => {
          if (active.current) {
            setTerminal(true);
            setPassword('');
            setError(
              'This request ended, the page changed, or Vault locked. Start again on the site.',
            );
          }
        });
    }, 1500);
    return () => clearInterval(timer);
  }, [preview, terminal, finished, busy, requestId]);
  async function confirm(method: 'password' | 'biometric') {
    if (!scope || !preview || inflight.current || terminal || !presence) return;
    inflight.current = true;
    setBusy(true);
    setError('');
    const verification =
      method === 'password' ? { password } : { biometric: true };
    setPassword('');
    try {
      const response = await rpc<Record<string, unknown>>(
        'passkeys.confirm',
        {
          ...scope,
          requestId,
          userPresence: true,
          verification,
          ...(selected ? { selectedId: selected } : {}),
        },
        true,
      );
      const completed = await credentials().complete(requestId, response);
      if (!completed)
        throw new Error('The browser no longer accepts this passkey request.');
      if (active.current) setFinished(true);
    } catch (error) {
      if (active.current) {
        setTerminal(true);
        setError(
          error instanceof Error
            ? error.message
            : 'Passkey verification failed. Start again on the site.',
        );
      }
    } finally {
      inflight.current = false;
      if (active.current) setBusy(false);
    }
  }
  async function cancel() {
    if (inflight.current) return;
    setBusy(true);
    setPassword('');
    try {
      await credentials().reject(requestId);
      if (scope) await rpc('passkeys.cancel', { ...scope, requestId }, true);
      setTerminal(true);
      setError('Passkey request canceled. You can close this window.');
    } catch (error) {
      setTerminal(true);
      setError(
        error instanceof Error
          ? error.message
          : 'The request has already ended.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="passkey-consent">
      <div className="passkey-brand">Aux Vault</div>
      <h1>
        {finished
          ? 'Passkey ready'
          : preview?.kind === 'create'
            ? 'Create a passkey'
            : 'Use a passkey'}
      </h1>
      {error && (
        <p role="alert" className="passkey-error">
          {error}
        </p>
      )}
      {finished ? (
        <p>
          The result was returned to the requesting page. You can close this
          window.
        </p>
      ) : !preview && !terminal ? (
        <p role="status">Checking the browser request…</p>
      ) : (
        preview && (
          <>
            <dl>
              <dt>Site</dt>
              <dd>{preview.rpId}</dd>
              <dt>Origin</dt>
              <dd>{preview.origin}</dd>
            </dl>
            {preview.incognito && (
              <p className="passkey-private">
                Private session only. These passkeys stay in memory and
                disappear when the private session ends.
              </p>
            )}
            {preview.kind === 'create' ? (
              <p>
                Account:{' '}
                <strong>
                  {preview.user?.displayName || preview.user?.name}
                </strong>
                {preview.user?.displayName &&
                preview.user.name !== preview.user.displayName
                  ? ` (${preview.user.name})`
                  : ''}
              </p>
            ) : (
              <label>
                Passkey
                <select
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  disabled={busy || terminal}
                >
                  <option value="">Choose an account</option>
                  {preview.candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.displayName || candidate.userName}
                      {candidate.displayName &&
                      candidate.userName !== candidate.displayName
                        ? ` (${candidate.userName})`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {preview.kind === 'get' && !preview.candidates.length && (
              <p>
                No passkey is available for this site in this session. Cancel
                and choose another provider on the site.
              </p>
            )}
            {!terminal && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void confirm('password');
                }}
              >
                <label className="passkey-presence">
                  <input
                    type="checkbox"
                    checked={presence}
                    onChange={(event) => setPresence(event.target.checked)}
                    disabled={busy}
                  />
                  I approve this passkey request for {preview.rpId}.
                </label>
                <label>
                  Verify with your current Vault password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={busy}
                  />
                </label>
                <p>
                  Verification is required for this request even while Vault is
                  unlocked.
                </p>
                <div className="passkey-actions">
                  <button
                    type="submit"
                    disabled={
                      busy ||
                      !presence ||
                      !password ||
                      (preview.kind === 'get' && !selected)
                    }
                  >
                    {busy
                      ? 'Verifying…'
                      : preview.kind === 'create'
                        ? 'Create passkey'
                        : 'Use passkey'}
                  </button>
                  {biometric && (
                    <button
                      type="button"
                      disabled={
                        busy ||
                        !presence ||
                        (preview.kind === 'get' && !selected)
                      }
                      onClick={() => void confirm('biometric')}
                    >
                      Verify with Touch ID
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )
      )}
      {!finished && (
        <button
          className="passkey-cancel"
          type="button"
          disabled={busy}
          onClick={() => void cancel()}
        >
          Cancel request
        </button>
      )}
    </main>
  );
}
