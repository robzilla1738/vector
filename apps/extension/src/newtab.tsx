import { Button, ErrorNotice, Mark } from '@aux/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AutocompleteResult } from './native';
import { native } from './native';
export function Newtab({ onTask }: { onTask: (draft: string) => void }) {
  const first = document.querySelector<HTMLInputElement>('#first-input');
  const [text, setText] = useState(first?.value ?? '');
  const [mode, setMode] = useState('find');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AutocompleteResult>();
  const [selected, setSelected] = useState(0);
  const session = useRef('');
  const input = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const early = document.querySelector<HTMLInputElement>('#first-input');
    if (early?.value) {
      setText(early.value);
      input.current?.setSelectionRange(
        early.selectionStart,
        early.selectionEnd,
      );
    }
  }, []);
  useEffect(() => {
    input.current?.focus();
    let active = true;
    const omnibox = native?.auxOmnibox;
    if (!omnibox) {
      setError(
        'Native search is unavailable. Open this page in the rebuilt Aux browser.',
      );
      return;
    }
    const listener = (id: string, value: AutocompleteResult) => {
      if (id === session.current && active) {
        setResult(value);
        setSelected(0);
      }
    };
    omnibox.onAutocompleteResultChanged.addListener(listener);
    void omnibox
      .createSession({ surface: 'newtab' })
      .then((value) => {
        if (active) session.current = value.sessionId;
        else void omnibox.destroySession(value.sessionId);
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
      omnibox.onAutocompleteResultChanged.removeListener(listener);
      if (session.current) void omnibox.destroySession(session.current);
    };
  }, []);
  useEffect(() => {
    if (mode === 'find' && session.current)
      void native?.auxOmnibox
        ?.queryAutocomplete(session.current, text)
        .catch((e) => setError(e.message));
  }, [text, mode]);
  async function activate() {
    if (!text.trim()) return;
    if (mode === 'do') {
      onTask(text);
      return;
    }
    if (!native?.auxOmnibox || !session.current) {
      setError('Native search is unavailable. Launch the rebuilt Aux browser.');
      return;
    }
    try {
      if (!result?.matches[selected]) {
        await native.auxOmnibox.queryAutocomplete(session.current, text);
        return;
      }
      await native.auxOmnibox.openAutocompleteMatch(session.current, {
        revision: result.revision,
        index: selected,
        disposition: 'currentTab',
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Search could not open this result.',
      );
    }
  }
  return (
    <main className="newtab">
      <Mark />
      <div className="search-region">
        <div className="search-card">
          <textarea
            ref={input}
            value={text}
            rows={1}
            aria-label={
              mode === 'find'
                ? 'Find a page or enter an address'
                : 'What should Aux work on?'
            }
            placeholder={
              mode === 'find'
                ? 'Find a page or enter an address'
                : 'What should Aux work on? Use @ to add context.'
            }
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void activate();
              }
              if (e.key === 'Tab' && !text) {
                e.preventDefault();
                setMode(mode === 'find' ? 'do' : 'find');
              }
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const length = result?.matches.length ?? 0;
                if (length)
                  setSelected(
                    (selected + (e.key === 'ArrowDown' ? 1 : -1) + length) %
                      length,
                  );
              }
              if (e.key === 'Escape') {
                setResult(undefined);
                void native?.auxOmnibox?.stopAutocomplete(
                  session.current,
                  true,
                );
              }
            }}
          />
          <div className="row spread">
            <span className="hint muted">
              <kbd className="keycap">Tab</kbd> change mode
            </span>
            <div className="mode-tabs" role="tablist" aria-label="Input mode">
              <Button
                role="tab"
                aria-selected={mode === 'find'}
                onClick={() => setMode('find')}
              >
                Find
              </Button>
              <Button
                role="tab"
                aria-selected={mode === 'do'}
                onClick={() => setMode('do')}
              >
                Do
              </Button>
            </div>
          </div>
        </div>
        {mode === 'find' && result && result.matches.length > 0 && (
          <div
            className="suggestions"
            role="listbox"
            aria-label="Search results"
          >
            {result.matches.map((match, index) => (
              <button
                type="button"
                key={match.id}
                role="option"
                aria-selected={index === selected}
                onMouseEnter={() => setSelected(index)}
                onClick={() => {
                  setSelected(index);
                  void native?.auxOmnibox
                    ?.openAutocompleteMatch(session.current, {
                      revision: result.revision,
                      index,
                      disposition: 'currentTab',
                    })
                    .catch((e) => setError(e.message));
                }}
              >
                <span>{match.title || match.fillIntoEdit}</span>
                <small>{match.description || match.destinationUrl}</small>
              </button>
            ))}
          </div>
        )}
        <div className="control-slot">
          {error && <ErrorNotice error={error} />}
        </div>
      </div>
    </main>
  );
}
