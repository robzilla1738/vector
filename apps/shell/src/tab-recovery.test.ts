// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import type { PageTarget, TabCommand, TabCommandAck } from '@aux/contracts';
import { bridge } from './bridge';
import { useStore } from './store';
import { emptyLayout } from './workspace';
afterEach(() => vi.restoreAllMocks());
const applied = (command: TabCommand, pageId?: string): TabCommandAck =>
  ({ commandId: '', status: 'applied', catalogVersion: 0, pageId: pageId ?? ('pageId' in command ? command.pageId : undefined) });
function setup() {
  const pages = ['first','middle','last','other'].map(pageId => ({ pageId, title: pageId, url: `https://example.test/${pageId}`, ownedByRuntime: false, viewStatus: 'visible' } as PageTarget));
  const layout = { ...emptyLayout(), spaces: [{id:'work',name:'Work',color:'slate' as const,grain:0},{id:'personal',name:'Personal',color:'slate' as const,grain:0}], activeSpaceId:'work', order:pages.map(page=>page.pageId), tabSpace:{first:'work',middle:'work',last:'work',other:'personal'}, folders:[{id:'research',spaceId:'work',name:'Research',collapsed:false}], tabFolder:{middle:'research'} };
  useStore.setState({ pages, layout, activePageId:'middle', closedTabs:[], reopeningTab:false });
  vi.spyOn(bridge,'overlay').mockResolvedValue(true);
  vi.spyOn(bridge,'invoke').mockResolvedValue({} as never);
  vi.spyOn(bridge,'bindTabSpace').mockImplementation(async (_pageId, spaceId) => ({ spaceId, workspaceId: `workspace:${spaceId}` }));
  return {pages,layout};
}
function close(pageId: string) { useStore.getState().applyEvent({seq:Date.now(),type:'page.removed',ts:Date.now(),payload:{pageId}}); }
it('restores space, folder and position without consuming the entry on an open failure', async () => {
  setup();
  const tabCommand = vi.spyOn(bridge,'tabCommand').mockImplementation(async command => applied(command));
  close('middle');
  expect(useStore.getState().activePageId).toBe('last');
  useStore.getState().switchSpace('personal');
  tabCommand.mockImplementationOnce(async () => { throw new Error('Synthetic open failure'); });
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().closedTabs).toHaveLength(1);
  tabCommand.mockImplementationOnce(async () => applied({kind:'open',url:'https://example.test/middle',activate:true},'restored'));
  await useStore.getState().reopenClosedTab();
  const state=useStore.getState();
  expect(state.closedTabs).toEqual([]);
  expect(state.layout.activeSpaceId).toBe('work');
  expect(state.layout.tabFolder.restored).toBe('research');
  expect(state.layout.order).toEqual(['first','restored','last','other']);
  expect(state.activePageId).toBe('restored');
});
it('reuses the closed tab id so main can restore its navigation history', async () => {
  setup();
  const tabCommand = vi.spyOn(bridge,'tabCommand').mockImplementation(async command => applied(command));
  close('middle');
  await useStore.getState().reopenClosedTab();
  expect(tabCommand.mock.calls.map(([command]) => command)).toContainEqual(expect.objectContaining({kind:'open',pageId:'middle'}));
  expect(useStore.getState().pages.some(page=>page.pageId==='middle')).toBe(true);
});
it('does not focus a different space or recover invisible agent pages', () => {
  const {pages,layout}=setup();
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command => applied(command));
  useStore.setState({pages:[pages[0]!,pages[3]!,{...pages[1]!,ownedByRuntime:true}],layout:{...layout,order:['first','other','middle']},activePageId:'first'});
  close('first');
  expect(useStore.getState().activePageId).toBeNull();
  close('middle');
  expect(useStore.getState().closedTabs.map(tab=>tab.pageId)).toEqual(['first']);
});
it('falls back to the current space if the original space was removed', async () => {
  setup();
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command => applied(command,'restored'));
  close('middle');
  useStore.setState(state => ({ layout: { ...state.layout, spaces: state.layout.spaces.filter(space => space.id !== 'work'), activeSpaceId: 'personal' } }));
  useStore.getState().deleteFolder('research');
  await useStore.getState().reopenClosedTab();
  expect(useStore.getState().layout.tabSpace.restored).toBe('personal');
  expect(useStore.getState().layout.tabFolder.restored).toBeUndefined();
});
it('can reopen an older chosen tab without consuming the most recent one', async () => {
  setup();
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command => applied(command,'restored'));
  close('middle'); close('last');
  await useStore.getState().reopenClosedTab('middle');
  expect(useStore.getState().closedTabs.map(tab => tab.pageId)).toEqual(['last']);
  expect(useStore.getState().layout.tabFolder.restored).toBe('research');
});
it('restores placement without replacing a newer user selection', async () => {
  setup();
  let finish!: (ack: TabCommandAck) => void;
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command =>
    command.kind === 'open' ? new Promise<TabCommandAck>(resolve => { finish = resolve; }) : applied(command));
  close('middle');
  const opening = useStore.getState().reopenClosedTab();
  const restored = {pageId:'restored',title:'Middle',url:'https://example.test/middle',ownedByRuntime:false,viewStatus:'visible'} as PageTarget;
  useStore.getState().applyEvent({seq:Date.now(),type:'page.added',ts:Date.now(),payload:{page:restored}});
  useStore.getState().applyEvent({seq:Date.now()+1,type:'page.updated',ts:Date.now(),payload:{pageId:'restored',activePageId:'restored'}});
  await useStore.getState().activate('first');
  finish(applied({kind:'open',url:'https://example.test/middle',activate:true},'restored')); await opening;
  expect(useStore.getState().activePageId).toBe('first');
  expect(useStore.getState().layout.tabFolder.restored).toBe('research');
  expect(useStore.getState().closedTabs).toEqual([]);
});
it('does not overwrite later selection or live metadata when opening finishes', async () => {
  setup();
  let finish!: (ack: TabCommandAck) => void;
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command =>
    command.kind === 'open' ? new Promise<TabCommandAck>(resolve => { finish = resolve; }) : applied(command));
  const opening = useStore.getState().newTab('https://example.test/slow');
  const added = {pageId:'slow',title:'Live title',url:'https://example.test/redirected',ownedByRuntime:false,viewStatus:'visible'} as PageTarget;
  useStore.getState().applyEvent({seq:Date.now(),type:'page.added',ts:Date.now(),payload:{page:added}});
  useStore.getState().applyEvent({seq:Date.now()+1,type:'page.updated',ts:Date.now(),payload:{pageId:'slow',activePageId:'slow'}});
  await useStore.getState().activate('first');
  finish(applied({kind:'open',url:'https://example.test/slow',activate:true},'slow'));
  await opening;
  expect(useStore.getState().activePageId).toBe('first');
  expect(useStore.getState().pages.find(page=>page.pageId==='slow')?.title).toBe('Live title');
});
it('does not resurrect a tab closed before its open response arrives', async () => {
  setup();
  let finish!: (ack: TabCommandAck) => void;
  vi.spyOn(bridge,'tabCommand').mockImplementation(async command =>
    command.kind === 'open' ? new Promise<TabCommandAck>(resolve => { finish = resolve; }) : applied(command));
  const opening = useStore.getState().newTab('https://example.test/slow');
  const added = {pageId:'closing',title:'Closing',url:'https://example.test/slow',ownedByRuntime:false,viewStatus:'visible'} as PageTarget;
  useStore.getState().applyEvent({seq:Date.now(),type:'page.added',ts:Date.now(),payload:{page:added}});
  close('closing');
  finish(applied({kind:'open',url:'https://example.test/slow',activate:true},'closing')); await opening;
  expect(useStore.getState().pages.some(page=>page.pageId==='closing')).toBe(false);
  expect(useStore.getState().activePageId).toBe('middle');
});
