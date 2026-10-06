import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(new URL('../../chromium/test-fixtures/aux-host.js', import.meta.url), 'utf8');
function boot(origin = 'chrome://aux') {
  const window: any = {};
  const storage = new Map<string, string>();
  const send = vi.fn((_channel: string, [id, method]: any[]) => {
    queueMicrotask(() => window.auxHostReply(id, method === 'state'
      ? { tabs: [{ pageId: 'native-1', targetId: 'target-1', url: 'https://example.com/', title: 'Example' }], activePageId: 'native-1' }
      : true));
  });
  runInNewContext(source, {
    window, location: { origin, search: '?window=window-1&profile=profile-1' }, URLSearchParams,
    chrome: { send }, setTimeout, clearTimeout, setInterval: vi.fn(),
    matchMedia: () => ({ matches: false }),
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
  });
  return { window, send, port: window.auxChromiumHost };
}

describe('candidate WebUI bootstrap', () => {
  it('installs only at the Aux WebUI origin', () => {
    const { port, send } = boot('https://example.com');
    expect(port).toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });
  it('publishes actual native tab identity and rejects unavailable runtime operations', async () => {
    const { port } = boot();
    const snapshot = await port.request('tabsSnapshot', []);
    expect(snapshot.tabs[0]).toMatchObject({ pageId: 'native-1', targetId: 'target-1', windowId: 'window-1' });
    expect(snapshot.windows[0].activePageId).toBe('native-1');
    await expect(port.request('invoke', ['runs.create', {}])).rejects.toThrow('not integrated');
    await expect(port.request('bindTabSpace', ['foreign-tab', 'space'])).rejects.toThrow('Unknown tab');
  });
  it('preserves a modal overlay when toolbar coverage closes and rejects stale tickets', async () => {
    const { port, send } = boot();
    await port.request('overlay', [true]);
    await port.request('toolbarOverlay', [true, 4]);
    await port.request('toolbarOverlay', [false, 5]);
    expect(send.mock.calls.at(-1)?.[1].slice(1)).toEqual(['overlay', [true]]);
    const calls = send.mock.calls.length;
    expect(await port.request('toolbarOverlay', [true, 4])).toBe(false);
    expect(send.mock.calls).toHaveLength(calls);
    await port.request('overlay', [false]);
    expect(send.mock.calls.at(-1)?.[1].slice(1)).toEqual(['overlay', [false]]);
  });
  it('delivers native shortcuts and stops after unsubscribe', () => {
    const { window, port } = boot();
    const callback = vi.fn();
    const off = port.subscribe('onShortcut', callback);
    window.auxHostEvent('onShortcut', { key: 'l', meta: true });
    expect(callback).toHaveBeenCalledWith({ key: 'l', meta: true });
    off();
    window.auxHostEvent('onShortcut', { key: 'k', meta: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
