import { Button, ErrorNotice } from '@aux/ui';
import { useEffect, useState } from 'react';
import { rpc } from './client';

export function OneTimeCode({
  accountId,
  itemId,
}: {
  accountId: number;
  itemId: string;
}) {
  const [value, setValue] = useState<{ code: string; expiresAt: number }>();
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const result = await rpc<{ code: string; expiresAt: number }>(
          'vault.getOneTimeCode',
          { accountId, itemId },
        );
        if (!active) return;
        setValue(result);
        setCopied(false);
        setError('');
        timer = setTimeout(
          () => void refresh(),
          Math.max(100, result.expiresAt - Date.now() + 50),
        );
      } catch (error) {
        if (active) {
          setValue(undefined);
          setError(
            error instanceof Error
              ? error.message
              : 'The one-time code is unavailable.',
          );
        }
      }
    }
    void refresh();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(clock);
    };
  }, [accountId, itemId]);
  const current = value && value.expiresAt > now;
  return (
    <section className="detail-field">
      <small>One-time code</small>
      {current && (
        <div className="row">
          <output aria-label="One-time code">{value.code}</output>
          <small>
            {Math.max(0, Math.ceil((value.expiresAt - now) / 1000))}s
          </small>
          <Button
            onClick={() => {
              if (Date.now() >= value.expiresAt) return;
              void navigator.clipboard
                .writeText(value.code)
                .then(() => setCopied(true))
                .catch(() => setError('This code could not be copied.'));
            }}
          >
            {copied ? 'Copied' : 'Copy code'}
          </Button>
        </div>
      )}
      {error && <ErrorNotice error={error} />}
    </section>
  );
}
