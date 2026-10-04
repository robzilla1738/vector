// @vitest-environment jsdom
import { act, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { deferNamedSurface } from './DeferredSurface';
vi.mock('../store', () => ({ useStore: { getState: () => ({ setOverlay: vi.fn(), setMode: vi.fn() }) } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('preserves actual named component props/state through shared pending prefetch and loaded rerenders', async () => {
  let resolve!: (value: { Actual: typeof Actual }) => void;
  const load = vi.fn(() => new Promise<{ Actual: typeof Actual }>(done => { resolve = done; }));
  const mounts = vi.fn();
  function Actual({ label }: { label: string }) { const [count, setCount] = useState(0); useEffect(mounts, []); return <button onClick={() => setCount(value => value + 1)}>{label}:{count}</button>; }
  const Surface = deferNamedSurface(load, 'Actual', 'Original', true);
  expect(load).not.toHaveBeenCalled(); Surface.preload(); Surface.preload(); expect(load).toHaveBeenCalledOnce();
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => { resolve({ Actual }); });
    await act(async () => root.render(<Surface label="First" />));
    const button = host.querySelector('button')!;
    await act(async () => button.click()); expect(button.textContent).toBe('First:1');
    Surface.preload(); await act(async () => root.render(<Surface label="Second" />));
    expect(host.querySelector('button')).toBe(button); expect(button.textContent).toBe('Second:1');
    expect(mounts).toHaveBeenCalledOnce(); expect(load).toHaveBeenCalledOnce(); expect(host.textContent).not.toContain('Opening');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
it('preserves synchronous original import failure and actual retry without remounting surrounding draft', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const failure = new Error('Original named import failed'); let calls = 0;
  const load = vi.fn(() => { if (++calls === 1) throw failure; return Promise.resolve({ Actual: () => <p>Actual module ready</p> }); });
  const Surface = deferNamedSurface(load, 'Actual', 'Original', true);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<><input defaultValue="Original retained draft" /><Surface /></>));
    const input = host.querySelector('input')!;
    expect(host.textContent).toContain(failure.message); expect(host.textContent).toContain('Original couldn’t open');
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Try again')!.click());
    expect(host.textContent).toContain('Actual module ready'); expect(host.querySelector('input')).toBe(input); expect(input.value).toBe('Original retained draft');
    expect(load).toHaveBeenCalledTimes(2);
  } finally { await act(async () => root.unmount()); host.remove(); errors.mockRestore(); }
});
it('keeps original quiet loading and selected getter timing', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  let resolve!: (module: { Actual: () => React.JSX.Element }) => void; const selected = vi.fn(() => () => <p>Selected actual export</p>);
  const load = vi.fn(() => new Promise<{ Actual: () => React.JSX.Element }>(done => { resolve = done; }));
  const Surface = deferNamedSurface(load, 'Actual', 'Quiet', true, true);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<Surface />)); expect(host.textContent).toBe(''); expect(load).toHaveBeenCalledOnce(); expect(selected).not.toHaveBeenCalled();
    await act(async () => resolve(Object.defineProperty({}, 'Actual', { get: selected }) as { Actual: () => React.JSX.Element }));
    expect(selected).toHaveBeenCalledOnce(); expect(host.textContent).toBe('Selected actual export');
  } finally { await act(async () => root.unmount()); host.remove(); errors.mockRestore(); }
});

it('retains original pane and explicit close callback both while loading and after rejection', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {}); const close = vi.fn();
  let reject!: (failure: Error) => void;
  const load = () => new Promise<{ Actual: () => React.JSX.Element }>((_, fail) => { reject = fail; });
  const Surface = deferNamedSurface(load, 'Actual', 'Original pane', true, false, close);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<Surface />)); expect(host.querySelector('[role="dialog"]')).toBeNull(); expect(host.querySelector('[role="region"]')).not.toBeNull();
    await act(async () => host.querySelector('button')!.click()); expect(close).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error('Original module rejection'))); expect(host.textContent).toContain('Original module rejection');
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Close')!.click()); expect(close).toHaveBeenCalledTimes(2);
  } finally { await act(async () => root.unmount()); host.remove(); errors.mockRestore(); }
});
