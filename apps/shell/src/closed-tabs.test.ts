import {expect,it} from 'vitest';
import {CLOSED_TAB_MAX_AGE,readClosedTabs} from './closed-tabs';
const now=1_800_000_000_000;
const tab=(overrides={})=>({pageId:'page',url:'https://example.test',title:'Example',spaceId:'personal',index:2,closedAt:now,...overrides});
it('restores only bounded recent closed-tab metadata',()=>{
 const items=[tab({pageId:'old',closedAt:now-CLOSED_TAB_MAX_AGE-1}),tab({pageId:'blank',url:'about:blank'}),tab({pageId:'bad',index:-1}),...Array.from({length:25},(_,index)=>tab({pageId:`page-${index}`,index}))];
 const restored=readClosedTabs({getItem:()=>JSON.stringify(items)},'closed',now);expect(restored).toHaveLength(20);expect(restored[0]?.pageId).toBe('page-5');expect(restored.at(-1)?.pageId).toBe('page-24');
});
it('fails closed for damaged storage',()=>{expect(readClosedTabs({getItem:()=>'{'},'closed',now)).toEqual([]);expect(readClosedTabs({getItem:()=>{throw Error('no storage');}},'closed',now)).toEqual([]);});
