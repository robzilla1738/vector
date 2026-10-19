/** Disposable original UI fixture. No daemon, profile APIs, secrets or OS requests. */
import { AuthGate } from '@aux/ui/security';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { VaultDialog } from '../src/dialog';
import { VaultChooser } from '../src/vault-chooser';

const element = document.getElementById('root');
if (!element) throw new Error('Missing fixture root');
const root = createRoot(element);
const results: Record<string, unknown> = {
  viewport: { width: innerWidth, height: innerHeight },
};
const wait = () => new Promise((resolve) => setTimeout(resolve, 50));
function dimensions(selector: string) {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Fixture element missing: ${selector}`);
  const style = getComputedStyle(element),
    rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    maxWidth: style.maxWidth,
    maxHeight: style.maxHeight,
    gap: style.gap,
    paddingTop: style.paddingTop,
    borderRadius: style.borderRadius,
    borderWidth: style.borderWidth,
    overflow: style.overflow,
  };
}
const fixtureRpc = async <T,>(): Promise<T> => {
  throw new Error('This fixture has no daemon or authentication capability.');
};
async function run() {
  for (const initialized of [true, false]) {
    flushSync(() =>
      root.render(
        <div className="vault-auth">
          <AuthGate
            key={String(initialized)}
            rpc={fixtureRpc}
            accountId={0}
            initialized={initialized}
            onUnlocked={async () => {}}
            error=""
          />
        </div>,
      ),
    );
    await wait();
    results[initialized ? 'unlock' : 'setup'] =
      dimensions('.aux-security-gate');
    if (initialized) results.decoration = dimensions('.aux-mark');
  }
  for (const kind of ['history', 'management', 'generator'] as const) {
    flushSync(() =>
      root.render(
        <VaultDialog
          key={kind}
          kind={kind}
          title={`Fixture ${kind}`}
          onClose={() => {}}
        >
          <div className="stack">
            <p>Original synthetic UI content with no saved credentials.</p>
            <div className="generator-length-controls">
              <input
                className="generator-length-slider"
                type="range"
                aria-label="Fixture length slider"
              />
              <input
                className="field generator-length-input"
                type="number"
                aria-label="Fixture length"
                defaultValue={20}
              />
            </div>
          </div>
        </VaultDialog>,
      ),
    );
    await wait();
    results[kind] = dimensions('dialog');
    if (kind === 'generator') {
      results.number = dimensions('.generator-length-input');
      results.slider = dimensions('.generator-length-slider');
    }
  }
  flushSync(() =>
    root.render(
      <VaultChooser
        vaults={[
          {
            id: 'fixture',
            name: 'Disposable fixture Vault',
            type: 'personal',
            revision: 1,
          },
        ]}
        value="fixture"
        onChange={() => {}}
      />,
    ),
  );
  document.querySelector<HTMLButtonElement>('.vault-chooser-trigger')?.click();
  await wait();
  results.chooser = dimensions('.vault-chooser');
  const options = document.querySelectorAll<HTMLButtonElement>(
    '.vault-chooser button',
  );
  options[0]?.focus();
  options[0]?.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
  );
  results.chooserArrowFocus = document.activeElement === options[1];
  flushSync(() =>
    root.render(
      <div className="vault">
        <div className="vault-panes">
          <section className="vault-list">
            <div className="items">
              <button type="button" className="vault-item">
                <span className="item-glyph">A</span>
                <span>
                  <strong>Synthetic saved item</strong>
                  <small>No credentials</small>
                </span>
              </button>
            </div>
          </section>
          <section className="vault-detail">
            <div className="vault-detail-content">
              <h2>Original fixture detail</h2>
              <p>This disposable surface contains no account data.</p>
            </div>
          </section>
        </div>
      </div>,
    ),
  );
  await wait();
  results.popup = dimensions('.vault');
  results.row = dimensions('.vault-item');
  results.detail = dimensions('.vault-detail');
  const output = document.createElement('pre');
  output.id = 'geometry-results';
  output.hidden = true;
  output.textContent = JSON.stringify(results);
  document.body.append(output);
  document.documentElement.dataset.fixtureComplete = 'true';
}
void run().catch((error) => {
  document.documentElement.dataset.fixtureError = String(error);
});
