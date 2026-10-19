/** User-initiated public-client OAuth. Never receives provider tokens or codes. */
import { Button, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rpc } from './daemon';
import './oauth-settings.css';

type Registration = {
  id: string;
  clientId: string;
  subject: string;
  email?: string;
  connected: boolean;
  planUsageEnabled: boolean;
  reauthorizationRequired: boolean;
  expiresAt: number | null;
  createdAt: number;
};
type Accounts = { activeId: string | null; registrations: Registration[] };
type Flow = {
  flowId: string;
  phase:
    | 'pending'
    | 'exchanging'
    | 'complete'
    | 'cancelled'
    | 'expired'
    | 'errored';
  expiresAt: number;
  registrationId?: string;
  error?: string;
  retryAvailable?: boolean;
};
function errorText(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The sign-in operation could not be completed.';
}
export function OpenAIOAuthSettings({
  accountId,
  onModelsChanged,
}: {
  accountId: number;
  onModelsChanged?: () => void;
}) {
  return (
    <OAuthAccountSettings
      key={accountId}
      accountId={accountId}
      onModelsChanged={onModelsChanged}
    />
  );
}
function OAuthAccountSettings({
  accountId,
  onModelsChanged,
}: {
  accountId: number;
  onModelsChanged: (() => void) | undefined;
}) {
  const [accounts, setAccounts] = useState<Accounts>();
  const [flow, setFlow] = useState<Flow>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<string>();
  const mounted = useRef(true),
    pending = useRef(false);
  const load = useCallback(async () => {
    const value = await rpc<Accounts>('models.oauthRegistrations', {
      accountId,
    });
    if (mounted.current) setAccounts(value);
  }, [accountId]);
  useEffect(() => {
    mounted.current = true;
    void load().catch((error) => {
      if (mounted.current) setError(errorText(error));
    });
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const flowId = flow?.flowId,
    phase = flow?.phase;
  useEffect(() => {
    if (!flowId || !phase || !['pending', 'exchanging'].includes(phase)) return;
    let stopped = false,
      running = false;
    const timer = setInterval(() => {
      if (running) return;
      running = true;
      void rpc<Flow>('models.oauthStatus', { accountId, flowId })
        .then(async (next) => {
          if (stopped || !mounted.current) return;
          setFlow(next);
          if (next.phase === 'complete') {
            await load();
            if (mounted.current && !stopped)
              setNotice(
                'Account identity verified. Refresh the model catalog to see the choices offered to this registration.',
              );
          }
          if (next.phase === 'errored')
            setError(
              next.error ?? 'Sign-in verification failed. Start a new attempt.',
            );
          if (next.phase === 'expired')
            setError('Sign-in expired. Start a new attempt.');
        })
        .catch((error) => {
          if (!stopped && mounted.current) setError(errorText(error));
        })
        .finally(() => {
          running = false;
        });
    }, 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [accountId, flowId, phase, load]);
  async function action(operation: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await operation();
    } catch (error) {
      if (mounted.current) setError(errorText(error));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const authorizing = !!flow && ['pending', 'exchanging'].includes(flow.phase);
  async function signIn(registrationId?: string, retryFlowId?: string) {
    await action(async () => {
      const next = await rpc<Flow & { authorizationUrl: string }>(
        'models.oauthAuthorize',
        {
          accountId,
          providerId: 'openai-codex',
          ...(registrationId ? { registrationId } : {}),
          ...(retryFlowId ? { retryFlowId } : {}),
        },
      );
      if (!mounted.current) {
        await rpc('models.oauthCancel', { accountId, flowId: next.flowId });
        return;
      }
      setFlow(next);
      const url = new URL(next.authorizationUrl);
      if (
        url.origin !== 'https://auth.openai.com' ||
        url.pathname !== '/api/accounts/authorize' ||
        url.searchParams.has('id_token_hint')
      )
        throw new Error(
          'Aux received an unexpected sign-in destination. Cancel this attempt.',
        );
      try {
        await chrome.tabs.create({ url: url.href, active: true });
      } catch {
        await rpc('models.oauthCancel', { accountId, flowId: next.flowId });
        throw new Error(
          'Aux could not open sign-in. The attempt was cancelled.',
        );
      }
    });
  }
  return (
    <section
      className="oauth-settings"
      aria-label="ChatGPT account connections"
    >
      <header>
        <div>
          <h2>ChatGPT accounts</h2>
          <p>
            Register Aux with your chosen account to authorize eligible ChatGPT
            plan usage. Access and available models depend on that account’s
            permissions and plan.
          </p>
        </div>
        <Button
          disabled={busy || authorizing}
          onClick={() => {
            void signIn();
          }}
        >
          Continue with ChatGPT
        </Button>
      </header>
      <p className="oauth-settings-note">
        Aux uses its own registration. Provider tokens stay in encrypted local
        daemon storage. Choosing an account here changes only this Aux account’s
        OpenAI provider.
      </p>
      {error && <ErrorNotice error={error} />}
      {notice && <p role="status">{notice}</p>}
      {flow && (
        <div className="oauth-flow" role="status">
          <strong>
            {flow.phase === 'pending'
              ? 'Waiting for sign-in'
              : flow.phase === 'exchanging'
                ? 'Verifying account identity'
                : flow.phase === 'complete'
                  ? 'Sign-in verified'
                  : flow.phase === 'cancelled'
                    ? 'Sign-in cancelled'
                    : flow.phase === 'expired'
                      ? 'Sign-in expired'
                      : 'Sign-in failed'}
          </strong>
          {flow.retryAvailable && (
            <Button
              className="secondary"
              disabled={busy}
              onClick={() => {
                void signIn(undefined, flow.flowId);
              }}
            >
              Try sign-in again
            </Button>
          )}
          {authorizing && (
            <>
              <p>
                Finish authorization in the browser. This attempt expires at{' '}
                {new Date(flow.expiresAt).toLocaleTimeString()}.
              </p>
              <Button
                className="secondary"
                disabled={busy}
                onClick={() => {
                  void action(async () => {
                    const next = await rpc<Flow>('models.oauthCancel', {
                      accountId,
                      flowId: flow.flowId,
                    });
                    if (mounted.current) setFlow(next);
                  });
                }}
              >
                Cancel sign-in
              </Button>
            </>
          )}
        </div>
      )}
      {!accounts && !error && <p role="status">Loading saved registrations…</p>}
      {accounts?.registrations.length === 0 && (
        <p>No ChatGPT accounts are connected.</p>
      )}
      <div className="oauth-account-list">
        {accounts?.registrations.map((account) => (
          <article key={account.id} className="oauth-account">
            <div>
              <h3>
                {account.email ?? 'Verified ChatGPT account'}{' '}
                {accounts.activeId === account.id && (
                  <span className="oauth-active">Selected</span>
                )}
              </h3>
              <p>
                Registration {account.clientId.slice(-12)} · Account{' '}
                {account.subject.slice(-8)}
              </p>
              <p>
                {account.reauthorizationRequired
                  ? 'Authorization expired or was revoked. Sign in again.'
                  : !account.connected
                    ? 'Signed out'
                    : account.planUsageEnabled
                      ? 'ChatGPT plan usage granted'
                      : 'Identity verified; ChatGPT plan usage was not granted.'}
              </p>
              {account.connected && account.expiresAt && (
                <p>
                  Access renews automatically when needed. Current token expiry:{' '}
                  {new Date(account.expiresAt).toLocaleString()}.
                </p>
              )}
            </div>
            <div className="oauth-actions">
              {account.connected && accounts.activeId !== account.id && (
                <Button
                  className="secondary"
                  disabled={busy || authorizing}
                  onClick={() => {
                    void action(async () => {
                      await rpc('models.oauthSelect', {
                        accountId,
                        registrationId: account.id,
                      });
                      await load();
                      onModelsChanged?.();
                    });
                  }}
                >
                  Use this account
                </Button>
              )}
              <Button
                className="secondary"
                disabled={busy || authorizing}
                onClick={() => {
                  void signIn(account.id);
                }}
              >
                {account.connected && !account.planUsageEnabled
                  ? 'Enable ChatGPT plan usage'
                  : 'Sign in again'}
              </Button>
              {account.connected && (
                <Button
                  className="secondary"
                  disabled={busy || authorizing}
                  onClick={() => setConfirm(account.id)}
                >
                  Sign out
                </Button>
              )}
            </div>
            {confirm === account.id && (
              <div className="oauth-signout">
                <p>
                  Sign out of this Aux registration? Aux will try to revoke the
                  renewable session and clear its saved tokens. The registration
                  identity is retained for future sign-in.
                </p>
                <Button
                  disabled={busy}
                  onClick={() => {
                    void action(async () => {
                      const result = await rpc<{ message: string }>(
                        'models.oauthSignOut',
                        { accountId, registrationId: account.id },
                      );
                      await load();
                      if (mounted.current) {
                        setConfirm(undefined);
                        setNotice(result.message);
                      }
                      onModelsChanged?.();
                    });
                  }}
                >
                  Confirm sign out
                </Button>
                <Button
                  className="secondary"
                  disabled={busy}
                  onClick={() => setConfirm(undefined)}
                >
                  Keep connected
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
      <footer>
        <Button
          className="secondary"
          disabled={
            busy ||
            authorizing ||
            !accounts?.registrations.some(
              (r) =>
                r.id === accounts.activeId && r.connected && r.planUsageEnabled,
            )
          }
          onClick={() => {
            void action(async () => {
              const models = await rpc<unknown[]>(
                'models.oauthDiscoverModels',
                { accountId },
              );
              if (mounted.current)
                setNotice(
                  `Loaded ${models.length} models offered to the selected account. Catalog access does not confirm a completed inference.`,
                );
              onModelsChanged?.();
            });
          }}
        >
          Refresh available models
        </Button>
        <a
          href="https://chatgpt.com/settings/usage"
          target="_blank"
          rel="noreferrer"
        >
          Manage ChatGPT usage and access
        </a>
      </footer>
    </section>
  );
}
