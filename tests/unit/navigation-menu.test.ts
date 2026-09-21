import {beforeEach,expect,it,vi} from "vitest";
const menu=vi.hoisted(()=>({buildFromTemplate:vi.fn((_items:unknown)=>({popup:vi.fn()}))}));
vi.mock("../../apps/desktop/node_modules/electron",()=>({Menu:menu}));
import type {WebContents} from "electron";
import {showNavigationMenu} from "../../apps/desktop/main/navigation-menu.js";
beforeEach(()=>vi.clearAllMocks());
it("shows nearest history first and jumps to the original entry",()=>{
  const entries=[{url:"https://one.example",title:"One"},{url:"https://two.example",title:"Two"},{url:"https://three.example",title:"Three"}];
  const goToIndex=vi.fn();
  const contents={isDestroyed:()=>false,navigationHistory:{getActiveIndex:()=>2,getAllEntries:()=>entries,goToIndex}} as unknown as WebContents;
  expect(showNavigationMenu(contents,"back")).toBe(true);
  const items=menu.buildFromTemplate.mock.calls[0]![0] as unknown as {label:string;click:()=>void}[];
  expect(items.map(item=>item.label)).toEqual(["Two","One"]);
  items[1]!.click();expect(goToIndex).toHaveBeenCalledWith(0);
});
it("does not apply a selected index after the page's history changes",()=>{
  let entries=[{url:"https://one.example",title:"One"},{url:"https://two.example",title:"Two"}];
  const goToIndex=vi.fn();
  const contents={isDestroyed:()=>false,navigationHistory:{getActiveIndex:()=>1,getAllEntries:()=>entries,goToIndex}} as unknown as WebContents;
  showNavigationMenu(contents,"back");
  const items=menu.buildFromTemplate.mock.calls[0]![0] as unknown as {click:()=>void}[];
  entries=[{url:"https://different.example",title:"Different"},entries[1]!];
  items[0]!.click();expect(goToIndex).not.toHaveBeenCalled();
});
