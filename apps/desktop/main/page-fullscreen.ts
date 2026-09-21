import type { BaseWindow, WebContents } from "electron";

type Host = { window: BaseWindow; canEnter(): boolean; changed(): void };
type FullscreenPage = { contents: WebContents; leave(): void };
const active = new WeakMap<BaseWindow, FullscreenPage>();

export function fullscreenContents(window: BaseWindow) {
  return active.get(window)?.contents;
}

/** Exit the document before exposing browser UI, and restore the user's window mode. */
export function exitPageFullscreen(window: BaseWindow) {
  const page=active.get(window);
  if(!page)return;
  page.leave();
  if(!page.contents.isDestroyed()) {
    void page.contents.executeJavaScriptInIsolatedWorld(997,[{code:'if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});'}]).catch(()=>{});
  }
}

export function wirePageFullscreen(contents: WebContents, host: () => Host | undefined) {
  let leave: (() => void) | undefined;
  contents.on("enter-html-full-screen",()=>{
    const target=host();
    if(!target||target.window.isDestroyed()||!target.canEnter()) {
      void contents.executeJavaScriptInIsolatedWorld(997,[{code:'if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});'}]).catch(()=>{});
      return;
    }
    if(active.get(target.window)?.contents===contents)return;
    exitPageFullscreen(target.window);
    const wasFullscreen=target.window.isFullScreen();
    const navigated=(_event:unknown,_url:string,inPlace:boolean,mainFrame:boolean)=>{if(mainFrame&&!inPlace)exitPageFullscreen(target.window);};
    const windowLeft=()=>exitPageFullscreen(target.window);
    const finish=()=>{
      if(active.get(target.window)?.contents!==contents)return;
      active.delete(target.window);leave=undefined;
      contents.removeListener("did-start-navigation",navigated);
      target.window.removeListener("leave-full-screen",windowLeft);
      if(!target.window.isDestroyed()) {
        if(!wasFullscreen&&target.window.isFullScreen())target.window.setFullScreen(false);
        target.changed();
      }
    };
    leave=finish;
    active.set(target.window,{contents,leave:finish});
    contents.on("did-start-navigation",navigated);
    target.window.on("leave-full-screen",windowLeft);
    if(!wasFullscreen)target.window.setFullScreen(true);
    target.changed();
  });
  contents.on("leave-html-full-screen",()=>leave?.());
  contents.on("render-process-gone",()=>leave?.());
  contents.once("destroyed",()=>leave?.());
}
