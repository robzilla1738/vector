import { Button, ErrorNotice } from '@aux/ui';
import { useEffect, useRef, useState } from 'react';
import { rpc } from './client';
import { copySensitiveField } from './clipboard';

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
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(copiedTimer.current), []);
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
              void copySensitiveField(value.code)
                .then(() => {
                  setCopied(true);
                  clearTimeout(copiedTimer.current);
                  copiedTimer.current = setTimeout(
                    () => setCopied(false),
                    2000,
                  );
                })
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
