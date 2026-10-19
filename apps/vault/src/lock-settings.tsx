import { Button, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './client';

const choices = [
  [15, '15 minutes'],
  [60, '1 hour'],
  [240, '4 hours'],
  [480, '8 hours'],
  [1440, '1 day'],
  [10080, '7 days'],
  [-1, 'Never'],
] as const;
export function VaultLockSettings({
  accountId,
  pending,
  mutate,
}: {
  accountId: number;
  pending: boolean;
  mutate: (
    procedure: string,
    input: Record<string, unknown>,
  ) => Promise<unknown>;
}) {
  const [saved, setSaved] = useState<number>();
  const [timeout, setTimeoutValue] = useState<number>();
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    void rpc<{ lockTimeoutMinutes: number }>('passwordManager.settings.get', {
      accountId,
    })
      .then((result) => {
        setSaved(result.lockTimeoutMinutes);
        setTimeoutValue(result.lockTimeoutMinutes);
      })
      .catch((error) => setError(error.message));
  }, [accountId]);
  useEffect(load, [load]);
  return (
    <section className="stack">
      <h3>Automatic lock</h3>
      <p>
        Lock after this period without Vault use. Checking lock status does not
        extend the timer.
      </p>
      <label>
        Time without Vault use
        <select
          value={timeout ?? ''}
          disabled={pending || saved === undefined}
          onChange={(event) => setTimeoutValue(Number(event.target.value))}
        >
          {timeout === undefined && <option value="">Loading…</option>}
          {choices.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Button
        disabled={pending || timeout === undefined || timeout === saved}
        onClick={() => {
          setError('');
          void mutate('passwordManager.settings.set', {
            settings: { lockTimeoutMinutes: timeout },
          })
            .then((result) => {
              const acknowledged = result as { lockTimeoutMinutes: number };
              setSaved(acknowledged.lockTimeoutMinutes);
              setTimeoutValue(acknowledged.lockTimeoutMinutes);
            })
            .catch((error) => setError(error.message));
        }}
      >
        Save automatic lock
      </Button>
      {error && <ErrorNotice error={error} retry={load} />}
    </section>
  );
}
