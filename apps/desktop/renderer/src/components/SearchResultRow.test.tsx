// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SearchResultRow } from './SearchResultRow';
import { TabCardCaption } from './TabCardCaption';
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
it('highlights literal query text without changing option identity or interpreting source markup', async () => {
  const select = vi.fn(), hover = vi.fn();
  await act(async () => root.render(<SearchResultRow id="result-1" title={'Docs <img> [aux]'} detail="example.com" query="[aux]" icon="D" selected onSelect={select} onHover={hover} />));
  const option = host.querySelector('[role="option"]')!;
  expect(option.id).toBe('result-1');
  expect(option.getAttribute('aria-selected')).toBe('true');
  expect(host.querySelector('mark')?.textContent).toBe('[aux]');
  expect(host.querySelector('img')).toBeNull();
  expect(option.textContent).toContain('Docs <img> [aux]');
  await act(async () => { option.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); option.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  expect(hover).toHaveBeenCalledOnce(); expect(select).toHaveBeenCalledOnce();
});
it('shows recorded page identity and prioritizes crash status over loading in both preview consumers', async () => {
  const page = { pageId: 'p', title: 'Project', url: 'https://example.com/path', loading: true, viewStatus: 'crashed' } as const;
  await act(async () => root.render(<TabCardCaption page={page as never} space="Personal" pinned />));
  expect(host.textContent).toContain('Project'); expect(host.textContent).toContain('example.com · Personal');
  expect(host.textContent).toContain('Page stopped responding'); expect(host.textContent).not.toContain('Loading');
  expect(host.querySelector('[aria-label="Pinned"]')).not.toBeNull();
  await act(async () => root.render(<TabCardCaption page={{ ...page, title: '', url: 'about:blank', loading: false, viewStatus: 'live' } as never} />));
  expect(host.textContent).toBe('New TabNew Tab');
  expect(host.querySelector('[aria-label="Pinned"]')).toBeNull();
});
