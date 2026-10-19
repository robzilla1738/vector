import { useCallback, useEffect, useRef, useState } from 'react';
import type { VaultRecord } from './client';
import {
  actualExchangeScope,
  type ExchangeScope,
  type ExchangeSession,
  type ExchangeSupport,
  exchangeRpc,
  matchesScope,
  receiptReviewKey,
  rememberExchange,
  terminalExchange,
  trackedExchange,
} from './exchange-client';
import './credential-exchange.css';

const stages: Record<ExchangeSession['stage'], string> = {
  'source-export': 'Waiting for the source password manager',
  'destination-check': 'Checking the selected destination',
  normalizing: 'Validating credential keys and metadata',
  writing: 'Saving encrypted records',
  'authorization-required': 'Destination authorization required',
  'receipt-review': 'Received export ready for review',
  complete: 'Exchange finished',
};
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The native exchange request failed.';
}
function supportReason(reason: string) {
  if (reason === 'os-authorized-signing-required')
    return 'Native credential exchange needs OS-authorized app signing. This local ad hoc build cannot receive an OS exchange. You can still import an exported CSV or JSON file.';
  return `Native credential exchange is unavailable: ${reason || 'The native helper did not provide an eligibility reason.'} File import remains available.`;
}
export function CredentialExchangeImport({
  accountId,
  vaults,
  initialVaultId,
  onImported,
}: {
  accountId: number;
  vaults: VaultRecord[];
  initialVaultId: string;
  onImported: () => void | Promise<void>;
}) {
  const [support, setSupport] = useState<ExchangeSupport>();
  const [scope, setScope] = useState<ExchangeScope>();
  const [session, setSession] = useState<ExchangeSession>();
  const [destination, setDestination] = useState(initialVaultId);
  const [authorized, setAuthorized] = useState(false);
  const [reviewed, setReviewed] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');
  const busy = useRef(false),
    alive = useRef(true),
    notified = useRef(new Set<string>()),
    imported = useRef(onImported);
  useEffect(() => {
    imported.current = onImported;
  }, [onImported]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      exchangeRpc<ExchangeSupport>('support', { accountId }),
      actualExchangeScope(accountId),
    ]);
    if (!alive.current) return;
    if (results[0].status === 'fulfilled') setSupport(results[0].value);
    else setError(message(results[0].reason));
    if (results[1].status === 'fulfilled') {
      const current = results[1].value;
      setScope(current);
      try {
        const id = await trackedExchange(current);
        if (id) {
          const job = await exchangeRpc<ExchangeSession>('status', {
            accountId,
            sessionId: id,
          });
          matchesScope(job, current);
          if (alive.current) {
            setSession(job);
            setDestination(job.vaultId);
          }
        }
      } catch (cause) {
        if (alive.current) setError(message(cause));
      }
    } else {
      setScope(undefined);
      setError(message(results[1].reason));
    }
    if (alive.current) setLoading(false);
  }, [accountId]);
  useEffect(() => {
    setSession(undefined);
    setSupport(undefined);
    setScope(undefined);
    setReviewed('');
    setAuthorized(false);
    void load();
  }, [load]);
  const sessionId = session?.id,
    isTerminal = session ? terminalExchange(session) : true;
  useEffect(() => {
    if (!sessionId || isTerminal) return;
    let disposed = false,
      inFlight = false;
    const poll = async () => {
      if (inFlight || busy.current) return;
      inFlight = true;
      try {
        const current = await actualExchangeScope(accountId);
        const job = await exchangeRpc<ExchangeSession>('status', {
          accountId,
          sessionId,
        });
        matchesScope(job, current);
        if (!disposed) {
          setScope(current);
          setSession(job);
          setPollError('');
        }
      } catch (cause) {
        if (!disposed) setPollError(message(cause));
      } finally {
        inFlight = false;
      }
    };
    const timer = setInterval(() => void poll(), 1500);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [accountId, sessionId, isTerminal]);
  useEffect(() => {
    if (session?.state !== 'succeeded' || notified.current.has(session.id))
      return;
    notified.current.add(session.id);
    void Promise.resolve()
      .then(() => imported.current())
      .catch((cause) => {
        if (alive.current)
          setError(
            `The exchange finished, but refreshing Vault failed: ${message(cause)}`,
          );
      });
  }, [session]);
  async function run(action: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      if (alive.current) setError(message(cause));
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  }
  async function checkedScope() {
    const current = await actualExchangeScope(accountId);
    if (
      scope &&
      (current.profileId !== scope.profileId ||
        current.profilePath !== scope.profilePath)
    )
      throw new Error('The browser profile changed. Reopen the import panel.');
    return current;
  }
  async function update(job: ExchangeSession, current: ExchangeScope) {
    matchesScope(job, current);
    if (alive.current) {
      setSession(job);
      setDestination(job.vaultId);
      setReviewed('');
      setPollError('');
    }
    try {
      await rememberExchange(job);
    } catch {
      throw new Error(
        'The exchange session exists, but this browser could not retain its session tracking. Keep this panel open to manage it.',
      );
    }
  }
  const target = vaults.find((vault) => vault.id === destination);
  const active = session && !terminalExchange(session);
  const reviewKey = session ? receiptReviewKey(session) : '';
  return (
    <section
      className="credential-exchange stack"
      aria-label="Native credential exchange"
    >
      <h3>Receive from a password manager</h3>
      <p>
        On an eligible Mac, begin an export in the source password manager and
        select Aux in the system receiving-app chooser. Review the received
        counts here before accepting encrypted records into your chosen Vault.
      </p>
      {loading && <p role="status">Checking native exchange support…</p>}
      {support && !support.supported && (
        <p role="status" className="exchange-unavailable">
          {supportReason(support.reason)}
        </p>
      )}
      {support?.supported && (
        <p>
          Native helper capability is available. The system must still authorize
          the actual exchange.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {pollError && (
        <p role="alert">
          Status could not be verified: {pollError} Acceptance is paused until
          status can be checked again.
        </p>
      )}
      {!active && (
        <>
          <label>
            Destination Vault
            <select
              value={destination}
              disabled={pending || loading}
              onChange={(event) => {
                setDestination(event.target.value);
                setAuthorized(false);
              }}
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
          </label>
          {scope && (
            <p className="exchange-scope">
              Account {scope.accountId} · Profile {scope.profileId} · Ordinary
              window
            </p>
          )}
          <label className="exchange-consent">
            <input
              type="checkbox"
              checked={authorized}
              disabled={pending || !support?.supported || !scope || !target}
              onChange={(event) => setAuthorized(event.target.checked)}
            />
            <span>
              I authorize receiving credentials into{' '}
              {target?.name ?? 'the selected Vault'} in this account and
              profile.
            </span>
          </label>
          <button
            type="button"
            disabled={
              loading ||
              pending ||
              !support?.supported ||
              !scope ||
              !target ||
              !authorized
            }
            onClick={() =>
              void run(async () => {
                const current = await checkedScope();
                const fresh = await exchangeRpc<ExchangeSupport>('support', {
                  accountId,
                });
                setSupport(fresh);
                if (!fresh.supported)
                  throw new Error(supportReason(fresh.reason));
                const job = await exchangeRpc<ExchangeSession>(
                  'begin',
                  {
                    accountId,
                    profileId: current.profileId,
                    browserMode: current.browserMode,
                    vaultId: destination,
                    authorized: true,
                  },
                  true,
                );
                await update(job, current);
                setAuthorized(false);
              })
            }
          >
            {pending ? 'Preparing…' : 'Begin native exchange'}
          </button>
        </>
      )}
      {session && (
        <section
          className="exchange-progress stack"
          aria-label="Credential exchange progress"
          aria-live="polite"
        >
          <h4>{stages[session.stage] ?? session.stage}</h4>
          <p>
            Session {session.state} · Destination{' '}
            {vaults.find((vault) => vault.id === session.vaultId)?.name ??
              session.vaultId}
          </p>
          <dl>
            <dt>Passwords</dt>
            <dd>
              {session.passwordCompleted} of {session.passwordTotal} processed ·{' '}
              {session.passwordsCreated} saved · {session.passwordsSkipped}{' '}
              already present
            </dd>
            <dt>Passkeys</dt>
            <dd>
              {session.passkeyCompleted} of {session.passkeyTotal} processed ·{' '}
              {session.passkeysCreated} saved · {session.passkeysSkipped}{' '}
              already present
            </dd>
          </dl>
          {Object.keys(session.unsupported).length > 0 && (
            <ul aria-label="Unsupported received categories">
              {Object.entries(session.unsupported).map(([kind, count]) => (
                <li key={kind}>
                  {kind}: {count} unsupported
                </li>
              ))}
            </ul>
          )}
          <p className="exchange-time">
            Updated {new Date(session.updatedAt).toLocaleString()}
          </p>
          {session.error && <p role="alert">{session.error}</p>}
          {session.helperCleanupFailed && (
            <p role="alert">
              The helper did not confirm cleanup. Its session is no longer
              authorized to accept records.
            </p>
          )}
          {active && session.needsAuthorization && (
            <>
              <p>
                Unlock this Vault, then explicitly authorize the same
                destination again. Any received receipt must be reviewed again.
              </p>
              <button
                type="button"
                disabled={pending || !target}
                onClick={() =>
                  void run(async () => {
                    const current = await checkedScope();
                    const job = await exchangeRpc<ExchangeSession>(
                      'resume',
                      { accountId, sessionId: session.id },
                      true,
                    );
                    await update(job, current);
                  })
                }
              >
                Resume into {target?.name ?? 'selected Vault'} after unlocking
              </button>
            </>
          )}
          {active &&
            !session.needsAuthorization &&
            session.needsAcceptance &&
            session.receiptId && (
              <div className="exchange-receipt stack">
                <h4>Review this received export</h4>
                <p>
                  Accept {session.passwordTotal} passwords and{' '}
                  {session.passkeyTotal} passkeys into{' '}
                  {target?.name ?? session.vaultId}. Unsupported categories
                  listed above will not be imported.
                </p>
                <p className="exchange-scope">
                  Account {session.accountId} · Profile {session.profileId} ·
                  Receipt {session.receiptId}
                </p>
                <label className="exchange-consent">
                  <input
                    type="checkbox"
                    checked={reviewed === reviewKey}
                    disabled={pending || !!pollError || !target}
                    onChange={(event) =>
                      setReviewed(event.target.checked ? reviewKey : '')
                    }
                  />
                  <span>
                    I reviewed the destination and received counts for this
                    receipt.
                  </span>
                </label>
                <button
                  type="button"
                  disabled={
                    pending || !!pollError || !target || reviewed !== reviewKey
                  }
                  onClick={() =>
                    void run(async () => {
                      const current = await checkedScope();
                      const fresh = await exchangeRpc<ExchangeSession>(
                        'status',
                        { accountId, sessionId: session.id },
                      );
                      matchesScope(fresh, current);
                      if (
                        fresh.needsAuthorization ||
                        !fresh.needsAcceptance ||
                        !fresh.receiptId ||
                        receiptReviewKey(fresh) !== reviewKey
                      ) {
                        setSession(fresh);
                        setReviewed('');
                        throw new Error(
                          'The export or destination authorization changed. Review the current receipt again.',
                        );
                      }
                      const job = await exchangeRpc<ExchangeSession>(
                        'accept',
                        {
                          accountId,
                          sessionId: fresh.id,
                          receiptId: fresh.receiptId,
                          authorized: true,
                        },
                        true,
                      );
                      await update(job, current);
                    })
                  }
                >
                  Accept reviewed export
                </button>
              </div>
            )}
          {active && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  const current = await checkedScope();
                  const job = await exchangeRpc<ExchangeSession>(
                    'cancel',
                    { accountId, sessionId: session.id },
                    true,
                  );
                  await update(job, current);
                })
              }
            >
              Cancel this exchange
            </button>
          )}
        </section>
      )}
      {!active && (
        <button
          type="button"
          disabled={loading || pending}
          onClick={() => void load()}
        >
          Check native support again
        </button>
      )}
      <p className="exchange-note">
        Use file import for exported CSV or JSON files.
      </p>
    </section>
  );
}
