import { useEffect, useState } from 'react';
import { Button, ErrorNotice, Mark } from './index';

export function AuthGate({
  rpc,
  accountId,
  initialized,
  onUnlocked,
  onStarted,
  onRecoveryStateChange,
  error: parentError,
}: {
  rpc: <T>(
    procedure: string,
    input: Record<string, unknown>,
    mutation?: boolean,
  ) => Promise<T>;
  accountId: number;
  initialized: boolean;
  onUnlocked: () => Promise<void>;
  onStarted?: () => void;
  onRecoveryStateChange?: (holding: boolean) => void;
  error: string;
}) {
  const [mode, setMode] = useState(initialized ? 'unlock' : 'setup');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recovery, setRecovery] = useState('');
  const [issuedKey, setIssuedKey] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [biometry, setBiometry] = useState<{
    available: boolean;
    enrolled: boolean;
  }>();
  useEffect(() => {
    let active = true;
    void rpc<{ available: boolean; enrolled: boolean }>(
      'passwordManager.auth.biometricStatus',
      { accountId },
    )
      .then((value) => {
        if (active) setBiometry(value);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [accountId, rpc]);
  async function submit() {
    if (mode !== 'unlock' && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    onStarted?.();
    if (mode !== 'unlock') onRecoveryStateChange?.(true);
    setPending(true);
    setError('');
    try {
      const procedure =
        mode === 'setup'
          ? 'passwordManager.auth.setup'
          : mode === 'recover'
            ? 'passwordManager.auth.recoverPassword'
            : 'passwordManager.auth.unlock';
      const result = await rpc<{ recoveryKey?: string }>(
        procedure,
        {
          accountId,
          ...(mode === 'recover'
            ? { recoveryKey: recovery, newPassword: password }
            : { password }),
        },
        true,
      );
      setPassword('');
      setConfirmPassword('');
      setRecovery('');
      if (result.recoveryKey) {
        setIssuedKey(result.recoveryKey);
        return;
      }
      await onUnlocked();
    } catch (error) {
      onRecoveryStateChange?.(false);
      setError(
        error instanceof Error
          ? error.message
          : 'The Vault could not be unlocked.',
      );
    } finally {
      setPending(false);
    }
  }
  if (issuedKey)
    return (
      <SavedRecoveryKey
        recoveryKey={issuedKey}
        accountId={accountId}
        rpc={rpc}
        onVerified={async () => {
          await onUnlocked();
          setIssuedKey('');
          onRecoveryStateChange?.(false);
        }}
      />
    );
  return (
    <main className="aux-security-gate">
      <Mark />
      <h2>
        {mode === 'setup'
          ? 'Set up your local Vault'
          : mode === 'recover'
            ? 'Recover vault access'
            : 'Unlock your vault'}
      </h2>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {mode === 'recover' && (
          <label>
            Recovery key
            <input
              className="field"
              type="password"
              required
              autoComplete="off"
              value={recovery}
              onChange={(event) => setRecovery(event.target.value.trim())}
            />
          </label>
        )}
        <label>
          {mode === 'unlock' ? 'Vault password' : 'New Vault password'}
          <input
            className="field"
            type="password"
            autoComplete={
              mode === 'unlock' ? 'current-password' : 'new-password'
            }
            minLength={mode === 'unlock' ? 1 : 8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {mode !== 'unlock' && (
          <label>
            Repeat the new password
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        )}
        {(error || parentError) && <ErrorNotice error={error || parentError} />}
        <Button type="submit" className="primary" disabled={pending}>
          {pending
            ? 'Opening…'
            : mode === 'unlock'
              ? 'Unlock'
              : mode === 'setup'
                ? 'Create Vault'
                : 'Recover access'}
        </Button>
        {mode === 'unlock' && biometry?.available && biometry.enrolled && (
          <Button
            disabled={pending}
            onClick={() => {
              setPending(true);
              setError('');
              void rpc(
                'passwordManager.auth.biometricUnlock',
                { accountId },
                true,
              )
                .then(onUnlocked)
                .catch((error) => setError(error.message))
                .finally(() => setPending(false));
            }}
          >
            Use Touch ID
          </Button>
        )}
        {initialized && (
          <Button
            className="ghost"
            onClick={() => {
              setMode(mode === 'unlock' ? 'recover' : 'unlock');
              setError('');
              setPassword('');
              setConfirmPassword('');
            }}
          >
            {mode === 'unlock' ? 'Use a recovery key' : 'Back to unlock'}
          </Button>
        )}
      </form>
      <small>Your encrypted Vault stays in your local Aux account.</small>
    </main>
  );
}

/** Retain an issued recovery key until the user verifies their saved copy. */
export function SavedRecoveryKey({
  recoveryKey,
  accountId,
  rpc,
  onVerified,
}: {
  recoveryKey: string;
  accountId: number;
  rpc: <T>(
    procedure: string,
    input: Record<string, unknown>,
    mutation?: boolean,
  ) => Promise<T>;
  onVerified: () => Promise<void>;
}) {
  const [verification, setVerification] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <section className="aux-security-gate recovery">
      <h2>Save your recovery key</h2>
      <p>
        Keep this key somewhere safe. It is required if you lose your Vault
        password. A replacement key invalidates any previous recovery key.
      </p>
      <code className="recovery-key">{recoveryKey}</code>
      <div className="row">
        <Button
          onClick={() =>
            void navigator.clipboard
              .writeText(recoveryKey)
              .then(() => setCopied(true))
              .catch(() => setError('The recovery key could not be copied.'))
          }
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          onClick={() => {
            try {
              const url = URL.createObjectURL(
                new Blob([`${recoveryKey}\n`], { type: 'text/plain' }),
              );
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'aux-vault-recovery.txt';
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch {
              setError('The recovery key file could not be saved.');
            }
          }}
        >
          Save file
        </Button>
      </div>
      <label className="row">
        <input
          type="checkbox"
          checked={saved}
          onChange={(event) => setSaved(event.target.checked)}
        />
        I saved this key somewhere safe.
      </label>
      <label>
        Enter the last six characters to verify your saved key
        <input
          className="field"
          autoComplete="off"
          value={verification}
          onChange={(event) => setVerification(event.target.value)}
        />
      </label>
      {error && <ErrorNotice error={error} />}
      <Button
        className="primary"
        disabled={!saved || verification !== recoveryKey.slice(-6) || pending}
        onClick={() => {
          setPending(true);
          setError('');
          void rpc(
            'passwordManager.auth.verifyRecovery',
            { accountId, recoveryKey },
            true,
          )
            .then(onVerified)
            .catch((error) => setError(error.message))
            .finally(() => setPending(false));
        }}
      >
        Finish
      </Button>
    </section>
  );
}
