import {Menu,type WebContents} from "electron";

/** Keep history inside its owning page; never export private entries to the runtime. */
export function showNavigationMenu(contents:WebContents,direction:"back"|"forward"){
  if(contents.isDestroyed())return false;
  const history=contents.navigationHistory;
  const active=history.getActiveIndex();
  const entries=history.getAllEntries();
  const candidates=entries.map((entry,index)=>({entry,index})).filter(({index})=>direction==="back"?index<active:index>active);
  if(direction==="back")candidates.reverse();
  if(!candidates.length)return false;
  Menu.buildFromTemplate(candidates.map(({entry,index})=>({
    label:(entry.url==="about:blank"?"New tab":entry.title||entry.url||"New tab").replace(/[\r\n\t]+/g," ").slice(0,150),
    click:()=>{
      if(contents.isDestroyed())return;
      // A page can navigate while its menu is open. Never apply an old index to
      // a changed history stack, even when two entries happen to share a URL.
      const current=history.getAllEntries();
      if(history.getActiveIndex()!==active||current.length!==entries.length||current.some((item,i)=>item.url!==entries[i]?.url))return;
      history.goToIndex(index);
    },
  }))).popup();
  return true;
}
