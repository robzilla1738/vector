// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import type { PageTarget } from '@vector/contracts';
import { bridge } from './bridge';
import { useStore } from './store';
import { emptyLayout } from './workspace';
afterEach(() => vi.restoreAllMocks());
function setup() {
  const pages = ['first','middle','last','other'].map(pageId => ({ pageId, title: pageId, url: `https://example.test/${pageId}`, ownedByRuntime: false, viewStatus: 'visible' } as PageTarget));
  const layout = { ...emptyLayout(), spaces: [{id:'work',name:'Work',color:'slate' as const},{id:'personal',name:'Personal',color:'slate' as const}], activeSpaceId:'work', order:pages.map(page=>page.pageId), tabSpace:{first:'work',middle:'work',last:'work',other:'personal'}, folders:[{id:'research',spaceId:'work',name:'Research',collapsed:false}], tabFolder:{middle:'research'} };
  useStore.setState({ pages, layout, activePageId:'middle', closedTabs:[], reopeningTab:false });
  vi.spyOn(bridge,'overlay').mockResolvedValue(true);
  return {pages,layout};
}
function close(pageId: string) { useStore.getState().applyEvent({seq:Date.now(),type:'page.removed',ts:Date.now(),payload:{pageId}}); }
it('restores space, folder and position without consuming the entry on an open failure', async () => {
  setup();
  const invoke = vi.spyOn(bridge,'invoke').mockResolvedValue({} as never);
  close('middle');
  expect(useStore.getState().activePageId).toBe('last');
  useStore.getState().switchSpace('personal');
  invoke.mockRejectedValueOnce(new Error('Synthetic open failure'));
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().closedTabs).toHaveLength(1);
  invoke.mockResolvedValueOnce({pageId:'restored',title:'middle',url:'https://example.test/middle'} as never);
  await useStore.getState().reopenClosedTab();
  const state=useStore.getState();
  expect(state.closedTabs).toEqual([]);
  expect(state.layout.activeSpaceId).toBe('work');
  expect(state.layout.tabFolder.restored).toBe('research');
  expect(state.layout.order).toEqual(['first','restored','last','other']);
  expect(state.activePageId).toBe('restored');
});
it('does not focus a different space or recover invisible agent pages', () => {
  const {pages,layout}=setup();
  vi.spyOn(bridge,'invoke').mockResolvedValue({} as never);
  useStore.setState({pages:[pages[0]!,pages[3]!,{...pages[1]!,ownedByRuntime:true}],layout:{...layout,order:['first','other','middle']},activePageId:'first'});
  close('first');
  expect(useStore.getState().activePageId).toBeNull();
  close('middle');
  expect(useStore.getState().closedTabs.map(tab=>tab.pageId)).toEqual(['first']);
});
it('falls back to the current space if the original space was removed', async () => {
  setup();
  const invoke=vi.spyOn(bridge,'invoke').mockResolvedValue({} as never);
  close('middle');
  useStore.getState().deleteSpace('work');
  useStore.getState().deleteFolder('research');
  invoke.mockResolvedValueOnce({pageId:'restored',title:'middle',url:'https://example.test/middle'} as never);
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().layout.tabSpace.restored).toBe('personal');
  expect(useStore.getState().layout.tabFolder.restored).toBeUndefined();
});
it('does not overwrite later selection or live metadata when opening finishes', async () => {
  setup();
  let finish!: (page: PageTarget) => void;
  vi.spyOn(bridge,'invoke').mockImplementation(async method => method === 'pages.open' ? new Promise<PageTarget>(resolve => { finish = resolve; }) : {});
  const opening = useStore.getState().newTab('https://example.test/slow');
  const added = {pageId:'slow',title:'Live title',url:'https://example.test/redirected',ownedByRuntime:false,viewStatus:'visible'} as PageTarget;
  useStore.getState().applyEvent({seq:Date.now(),type:'page.added',ts:Date.now(),payload:{page:added}});
  useStore.getState().applyEvent({seq:Date.now()+1,type:'page.updated',ts:Date.now(),payload:{pageId:'slow',activePageId:'slow'}});
  await useStore.getState().activate('first');
  finish({...added,title:'Stale title',url:'https://example.test/slow'});
  await opening;
  expect(useStore.getState().activePageId).toBe('first');
  expect(useStore.getState().pages.find(page=>page.pageId==='slow')?.title).toBe('Live title');
});
it('does not resurrect a tab closed before its open response arrives', async () => {
  setup();
  let finish!: (page: PageTarget) => void;
  vi.spyOn(bridge,'invoke').mockImplementation(async method => method === 'pages.open' ? new Promise<PageTarget>(resolve => { finish = resolve; }) : {});
  const opening = useStore.getState().newTab('https://example.test/slow');
  const added = {pageId:'closing',title:'Closing',url:'https://example.test/slow',ownedByRuntime:false,viewStatus:'visible'} as PageTarget;
  useStore.getState().applyEvent({seq:Date.now(),type:'page.added',ts:Date.now(),payload:{page:added}});
  close('closing');
  finish(added); await opening;
  expect(useStore.getState().pages.some(page=>page.pageId==='closing')).toBe(false);
  expect(useStore.getState().activePageId).toBe('middle');
});
