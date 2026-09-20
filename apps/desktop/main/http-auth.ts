import { app, ipcMain, type IpcMainInvokeEvent, type WebContents } from 'electron';
import { randomUUID } from 'node:crypto';

/** Human-only HTTP authentication; credentials never enter runtime events or storage. */
export function installHttpAuth(options: {
  isPage(contents: WebContents): boolean;
  requireShell(event: IpcMainInvokeEvent): void;
  changed(): void;
}) {
  const requests = new Map<string, {
    prompt: {id:string;origin:string;proxy:boolean;realm:string;retry:boolean};
    finish(credentials?: {username:string;password:string}): void;
  }>();
  app.on('login', (event, contents, details, info, callback) => {
    event.preventDefault();
    if (!contents || contents.isDestroyed() || !options.isPage(contents) || requests.size >= 8) { callback(); return; }
    let origin: string;
    try { const url=new URL(details.url); if(!['http:','https:'].includes(url.protocol))throw new Error(); origin=url.origin; }
    catch { callback(); return; }
    const id=randomUUID();
    const prompt={id,origin:info.isProxy?`${info.host}:${info.port}`:origin,proxy:info.isProxy,realm:info.realm.slice(0,256),retry:!details.firstAuthAttempt};
    const finish=(credentials?:{username:string;password:string})=>{
      if (!requests.delete(id)) return;
      clearTimeout(timer);
      contents.removeListener('destroyed',cancel);
      contents.removeListener('did-start-navigation',navigated);
      options.changed();
      if(credentials)callback(credentials.username,credentials.password);else callback();
    };
    const cancel=()=>finish();
    const navigated=(_event:unknown,_url:string,_inPlace:boolean,mainFrame:boolean)=>{if(mainFrame)cancel();};
    const timer=setTimeout(cancel,120_000);
    requests.set(id,{prompt,finish});
    contents.once('destroyed',cancel);
    contents.on('did-start-navigation',navigated);
    options.changed();
  });
  ipcMain.handle('ui.httpAuthRequests',event=>{options.requireShell(event);return [...requests.values()].map(entry=>entry.prompt);});
  ipcMain.handle('ui.respondHttpAuth',(event,id:unknown,credentials:unknown)=>{
    options.requireShell(event);
    if(typeof id!=='string'||!requests.has(id))throw new Error('This sign-in request has ended.');
    if(credentials!==null){
      const value=credentials as {username?:unknown;password?:unknown};
      if(!value||typeof value.username!=='string'||typeof value.password!=='string'||value.username.length>4096||value.password.length>4096)throw new Error('Invalid sign-in response.');
      requests.get(id)!.finish({username:value.username,password:value.password});
    } else requests.get(id)!.finish();
    return true;
  });
  app.on('before-quit',()=>{for(const entry of requests.values())entry.finish();});
}
