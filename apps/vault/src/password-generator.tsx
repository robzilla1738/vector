import { Button, Dialog, ErrorNotice } from '@aux/ui';
import { useEffect, useState } from 'react';
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
    kind: 'password',
    length: 20,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    avoidAmbiguous: true,
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: false,
  });
  const [value, setValue] = useState('');
  const [entropy, setEntropy] = useState<number>();
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const enabled =
    options.kind === 'passphrase' ||
    Object.keys(labels).some((key) => options[key as keyof typeof labels]);
  const valid =
    enabled &&
    (options.kind === 'passphrase'
      ? options.wordCount >= 3 &&
        options.wordCount <= 10 &&
        options.separator.length >= 1 &&
        options.separator.length <= 3
      : options.length >= 8 && options.length <= 64);
  useEffect(() => {
    let active = true;
    setValue('');
    setEntropy(undefined);
    setCopied(false);
    setError('');
    if (!valid) {
      setPending(false);
      return;
    }
    setPending(true);
    void rpc<{ password: string; entropyBits?: number }>(
      'passwordManager.generatePassword',
      options,
      true,
    )
      .then((result) => {
        if (active) {
          setValue(result.password);
          setEntropy(result.entropyBits);
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, [options, valid]);
  return (
    <Dialog title="Create a password" onClose={onClose}>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setOptions((current) => ({ ...current }));
        }}
      >
        <label>
          Style
          <select
            value={options.kind}
            onChange={(event) =>
              setOptions({ ...options, kind: event.target.value })
            }
          >
            <option value="password">Characters</option>
            <option value="passphrase">Words</option>
          </select>
        </label>
        {options.kind === 'password' ? (
          <>
            <label>
              Length
              <input
                className="field"
                type="number"
                min={8}
                max={64}
                required
                value={options.length}
                onChange={(event) =>
                  setOptions({ ...options, length: Number(event.target.value) })
                }
              />
            </label>
            {Object.entries(labels).map(([name, label]) => (
              <label className="row" key={name}>
                <input
                  type="checkbox"
                  checked={options[name as keyof typeof labels]}
                  onChange={(event) =>
                    setOptions({ ...options, [name]: event.target.checked })
                  }
                />
                {label}
              </label>
            ))}
            <label className="row">
              <input
                type="checkbox"
                checked={options.avoidAmbiguous}
                onChange={(event) =>
                  setOptions({
                    ...options,
                    avoidAmbiguous: event.target.checked,
                  })
                }
              />
              Avoid similar-looking characters
            </label>
          </>
        ) : (
          <>
            <label>
              Words
              <input
                className="field"
                type="number"
                min={3}
                max={10}
                required
                value={options.wordCount}
                onChange={(event) =>
                  setOptions({
                    ...options,
                    wordCount: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Separator
              <input
                className="field"
                minLength={1}
                maxLength={3}
                required
                value={options.separator}
                onChange={(event) =>
                  setOptions({ ...options, separator: event.target.value })
                }
              />
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={options.capitalize}
                onChange={(event) =>
                  setOptions({ ...options, capitalize: event.target.checked })
                }
              />
              Capitalize words
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={options.includeNumber}
                onChange={(event) =>
                  setOptions({
                    ...options,
                    includeNumber: event.target.checked,
                  })
                }
              />
              Add a three-digit number
            </label>
          </>
        )}
        <Button type="submit" disabled={pending || !valid}>
          Generate again
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
            {entropy !== undefined && (
              <small>
                Randomness: {Math.floor(entropy)} bits from independently chosen
                words.
              </small>
            )}
            <small>This password is saved only after you save the item.</small>
          </>
        )}
        {error && <ErrorNotice error={error} />}
      </form>
    </Dialog>
  );
}
