import { Button, Dialog, ErrorNotice } from '@aux/ui';
import { useState } from 'react';
import { rpc } from './client';

const labels = {
  lowercase: 'Lowercase letters',
  uppercase: 'Uppercase letters',
  digits: 'Numbers',
  symbols: 'Symbols',
};
export function PasswordGenerator({
  onUse,
  onClose,
}: {
  onUse: (value: string) => void;
  onClose: () => void;
}) {
  const [options, setOptions] = useState({
    length: 24,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const enabled = Object.keys(labels).some(
    (key) => options[key as keyof typeof labels],
  );
  function change(next: typeof options) {
    setOptions(next);
    setValue('');
    setCopied(false);
  }
  return (
    <Dialog
      title="Create a password"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setValue('');
          setCopied(false);
          setError('');
          void rpc<{ password: string }>(
            'passwordManager.generatePassword',
            options,
            true,
          )
            .then((result) => setValue(result.password))
            .catch((error) => setError(error.message))
            .finally(() => setPending(false));
        }}
      >
        <label>
          Length
          <input
            className="field"
            type="number"
            min={8}
            max={256}
            required
            value={options.length}
            disabled={pending}
            onChange={(event) =>
              change({ ...options, length: Number(event.target.value) })
            }
          />
        </label>
        {Object.entries(labels).map(([name, label]) => (
          <label className="row" key={name}>
            <input
              type="checkbox"
              disabled={pending}
              checked={options[name as keyof typeof labels]}
              onChange={(event) =>
                change({ ...options, [name]: event.target.checked })
              }
            />
            {label}
          </label>
        ))}
        <Button type="submit" disabled={pending || !enabled}>
          Generate
        </Button>
        {value && (
          <>
            <input
              aria-label="Generated password"
              className="field"
              readOnly
              value={value}
            />
            <div className="row">
              <Button
                onClick={() =>
                  void navigator.clipboard
                    .writeText(value)
                    .then(() => setCopied(true))
                    .catch(() => setError('This password could not be copied.'))
                }
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                className="primary"
                onClick={() => {
                  onUse(value);
                  onClose();
                }}
              >
                Use password
              </Button>
            </div>
            <small>This password is saved only after you save the item.</small>
          </>
        )}
        {error && <ErrorNotice error={error} />}
      </form>
    </Dialog>
  );
}
