export const CLOSED_TAB_LIMIT=20;
export const CLOSED_TAB_MAX_AGE=30*24*60*60*1000;
export type ClosedTab={pageId:string;url:string;title:string;spaceId:string;folderId?:string;index:number;closedAt:number;groupId?:string;wasActive?:boolean};
export function readClosedTabs(storage:Pick<Storage,"getItem">|null,key:string,now=Date.now()):ClosedTab[]{
  try{
    const value:unknown=JSON.parse(storage?.getItem(key)??"[]");if(!Array.isArray(value))return [];
    return value.filter((item):item is ClosedTab=>{
      if(!item||typeof item!=="object")return false;const tab=item as Partial<ClosedTab>;
      return (tab.groupId===undefined||(typeof tab.groupId==="string"&&tab.groupId.length<=200))&&(tab.wasActive===undefined||typeof tab.wasActive==="boolean")&&typeof tab.pageId==="string"&&tab.pageId.length<=200&&typeof tab.url==="string"&&tab.url.length<=8192&&tab.url!=="about:blank"&&typeof tab.title==="string"&&tab.title.length<=1000&&typeof tab.spaceId==="string"&&tab.spaceId.length<=200&&(tab.folderId===undefined||(typeof tab.folderId==="string"&&tab.folderId.length<=200))&&typeof tab.index==="number"&&Number.isInteger(tab.index)&&tab.index>=0&&tab.index<=10000&&typeof tab.closedAt==="number"&&tab.closedAt<=now&&now-tab.closedAt<=CLOSED_TAB_MAX_AGE;
    }).slice(-CLOSED_TAB_LIMIT);
  }catch{return [];}
}
