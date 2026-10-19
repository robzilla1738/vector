import { Button, ErrorNotice, Mark } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { native } from './native';
import './plugin-settings.css';

type Popup = { enabled: boolean; shortcut: string };
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The popup setting could not be updated.';
export function PopupSettings() {
  const [current, setCurrent] = useState<Popup>();
  const [shortcut, setShortcut] = useState('');
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const read = useCallback(async () => {
    const api = native?.auxMiniPopup;
    if (!api?.getEnabled || !api.getShortcut)
      throw new Error(
        'This browser is missing the native Quick Popup settings API. Launch the rebuilt Aux browser.',
      );
    const [enabled, shortcut] = await Promise.all([
      api.getEnabled(),
      api.getShortcut(),
    ]);
    if (typeof enabled !== 'boolean' || typeof shortcut !== 'string')
      throw new Error('The native popup settings response is invalid.');
    const value = { enabled, shortcut };
    setCurrent(value);
    return value;
  }, []);
  useEffect(() => {
    let active = true;
    void read()
      .then((value) => {
        if (active) setShortcut(value.shortcut);
      })
      .catch((error) => {
        if (active) setError(message(error));
      });
    return () => {
      active = false;
    };
  }, [read]);
  async function update(
    method: 'setEnabled' | 'setShortcut',
    value: boolean | string,
  ) {
    setPending(true);
    setError('');
    setNotice('');
    setRecording(false);
    try {
      const call = native?.auxMiniPopup?.[method];
      if (!call)
        throw new Error(
          `This browser is missing the native ${method} capability.`,
        );
      await call(value);
      const actual = await read();
      setShortcut(actual.shortcut);
      setNotice(
        method === 'setEnabled'
          ? actual.enabled
            ? 'Quick Popup enabled.'
            : 'Quick Popup disabled. Your shortcut is preserved.'
          : `Shortcut saved: ${actual.shortcut}`,
      );
    } catch (error) {
      setError(message(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="plugin-settings">
      <figure
        className="popup-preview"
        aria-label="Illustration of the Aux Quick Popup"
      >
        <div>
          <Mark />
          <span>Aux Quick Popup</span>
        </div>
        <p>Start a task from wherever you work.</p>
        <figcaption>Open Aux with your saved global shortcut.</figcaption>
      </figure>
      {error && (
        <ErrorNotice
          error={error}
          retry={() => {
            void read()
              .then((value) => {
                setShortcut(value.shortcut);
                setError('');
              })
              .catch((error) => setError(message(error)));
          }}
        />
      )}
      {!current && !error && (
        <p role="status">Reading native popup preferences…</p>
      )}
      {current && (
        <>
          <div className="setting row spread wrap">
            <div>
              <strong>Enable Quick Popup</strong>
              <small>
                Use a global shortcut to open Aux for this browser profile.
              </small>
            </div>
            <label className="row">
              Enabled
              <input
                type="checkbox"
                checked={current.enabled}
                disabled={pending}
                onChange={(event) => {
                  void update('setEnabled', event.target.checked);
                }}
              />
            </label>
          </div>
          <form
            className="plugin-form"
            onSubmit={(event) => {
              event.preventDefault();
              void update('setShortcut', shortcut.trim());
            }}
          >
            <label>
              Global shortcut
              <input
                value={shortcut}
                disabled={pending || !current.enabled}
                placeholder="Command+Shift+Space"
                autoComplete="off"
                onChange={(event) => {
                  setShortcut(event.target.value);
                  setNotice('');
                }}
                onKeyDown={(event) => {
                  if (!recording) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.key === 'Escape') {
                    setRecording(false);
                    setShortcut(current.shortcut);
                    return;
                  }
                  if (['Meta', 'Control', 'Alt', 'Shift'].includes(event.key))
                    return;
                  const modifiers = [
                    event.metaKey ? 'Command' : '',
                    event.ctrlKey ? 'Control' : '',
                    event.altKey ? 'Alt' : '',
                    event.shiftKey ? 'Shift' : '',
                  ].filter(Boolean);
                  const key =
                    event.key === ' '
                      ? 'Space'
                      : event.key.length === 1
                        ? event.key.toUpperCase()
                        : event.key;
                  setShortcut([...modifiers, key].join('+'));
                  setRecording(false);
                  setNotice('');
                }}
              />
            </label>
            <p className="muted">
              Saved shortcut: <kbd>{current.shortcut || 'None'}</kbd>. The
              native browser validates registration and reports conflicts. Some
              system-reserved shortcuts must be entered manually.
            </p>
            <div className="row wrap">
              <Button
                disabled={pending || !current.enabled}
                onClick={(event) => {
                  setRecording(true);
                  setNotice('');
                  event.currentTarget
                    .closest('form')
                    ?.querySelector('input')
                    ?.focus();
                }}
              >
                {recording
                  ? 'Press a shortcut (Escape cancels)'
                  : 'Record shortcut'}
              </Button>
              <Button
                type="submit"
                disabled={
                  pending ||
                  !current.enabled ||
                  !shortcut.trim() ||
                  shortcut.trim() === current.shortcut
                }
              >
                Save shortcut
              </Button>
              <Button
                disabled={
                  pending ||
                  !current.enabled ||
                  shortcut === 'Command+Shift+Space'
                }
                onClick={() => {
                  setShortcut('Command+Shift+Space');
                  setNotice('');
                }}
              >
                Use default shortcut
              </Button>
            </div>
          </form>
        </>
      )}
      {pending && (
        <p role="status">Updating the native shortcut registration…</p>
      )}
      {notice && <output className="notice">{notice}</output>}
    </section>
  );
}
