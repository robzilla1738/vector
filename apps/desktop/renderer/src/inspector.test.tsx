// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { bridge } from './bridge';
import { useStore } from './store';
import { Inspector } from './components/Inspector';
import { ObservationPanel } from './components/ObservationPanel';
const observation = (pageId: string, text = `# ${pageId}\n## Headings\n${pageId} content`) => ({ pageId, title: pageId, url: `https://${pageId}.example/`, documentEpoch: 1, revision: 1, text, refs: [] });
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });
it('rejects late observations from a previous page and preserves a historical snapshot without another read', async () => {
  const pending = new Map<string, (value: unknown) => void>();
  const invoke = vi.spyOn(bridge, 'invoke').mockImplementation((_method, params) => new Promise(resolve => pending.set((params as {pageId:string}).pageId, resolve)) as never);
  useStore.setState({ activePageId: 'first', inspectorObs: null, pages: ['first','second'].map(pageId => ({pageId, title:pageId, url:`https://${pageId}.example/`})) } as never);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<Inspector />));
    await act(async () => useStore.setState({ activePageId: 'second' }));
    await act(async () => pending.get('second')!({observation: observation('second')}));
    expect(host.textContent).toContain('second content');
    await act(async () => pending.get('first')!({observation: observation('first')}));
    expect(host.textContent).not.toContain('first content');
    expect(host.textContent).toContain('second content');
    await act(async () => useStore.setState({ inspectorObs: observation('historic') }));
    expect(host.textContent).toContain('historic content');
    expect(host.textContent).toContain('Recorded snapshot');
    expect(invoke).toHaveBeenCalledTimes(2);
    expect(host.querySelector('details')?.open).toBe(false);
  } finally { await act(async () => root.unmount()); }
});
it('keeps observation lines after the first 80 available on demand', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    const obs = observation('many', '# many\n## Headings\n'+Array.from({length:81},(_,i)=>`Heading ${i+1}`).join('\n'));
    await act(async () => root.render(<ObservationPanel obs={obs} />));
    expect(host.textContent).not.toContain('Heading 81');
    const more = [...host.querySelectorAll('button')].find(button => button.textContent?.startsWith('Show 1 more'))!;
    await act(async () => more.click());
    expect(host.textContent).toContain('Heading 81');
  } finally { await act(async () => root.unmount()); }
});
