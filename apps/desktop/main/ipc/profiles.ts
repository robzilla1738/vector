import { app } from "electron";
import { spawn as spawnProcess } from "node:child_process";
import { browserProfiles, profile } from "../app/services.js";
import { openProfileSourceUrl } from "../app/external-urls.js";
import { focusedRegularWindow, handleShell, regularWindows } from "../windows/registry.js";
import { updateWindowTitle } from "../windows/stage.js";

export const profileLaunches=new Map<string,Promise<void>>();

export function wireProfilesIpc() {
  handleShell("ui.openBrowserProfileUrl", (_, id:string, url:string) => openProfileSourceUrl(id, url));
  handleShell("ui.browserProfiles", () => {const profiles=browserProfiles.list();const current=profiles.find(profile=>profile.current);if(current){profile.name=current.name;for(const state of regularWindows.values())updateWindowTitle(state);}return profiles;});

  handleShell("ui.archiveBrowserProfile", (_, id:string,archived:boolean) => browserProfiles.archive(id,archived));
  handleShell("ui.deleteBrowserProfile", (_, id:string) => browserProfiles.delete(id));
  handleShell("ui.createBrowserProfile", (_, name:unknown) => browserProfiles.create(name));
  handleShell("ui.renameBrowserProfile", (_, id:string,name:unknown) => {const profiles=browserProfiles.rename(id,name);if(id===browserProfiles.currentId){profile.name=browserProfiles.read(id).name;for(const state of regularWindows.values())updateWindowTitle(state);}return profiles;});
  handleShell("ui.openBrowserProfile", async(_, id:string) => {
    const env=browserProfiles.environment(id,process.env);
    if(id===browserProfiles.currentId){const state=focusedRegularWindow();state?.win.show();state?.win.focus();return true;}
    let launch=profileLaunches.get(id);
    if(!launch){
      launch=new Promise<void>((resolve,reject)=>{
        const child=spawnProcess(process.execPath,app.isPackaged?[]:[app.getAppPath()],{env,detached:true,stdio:["ignore","ignore","ignore","ipc"]});
        let settled=false;
        const finish=(error?:Error)=>{
          if(settled)return;settled=true;clearTimeout(timeout);
          if(child.connected)child.disconnect();child.unref();
          if(error)reject(error);else resolve();
        };
        const timeout=setTimeout(()=>finish(new Error("This profile is taking longer to start. Check its window before trying again.")),60_000);
        child.once("error",error=>finish(error));
        child.on("message",message=>{
          if(message&&typeof message==="object"&&"type" in message&&message.type==="aux-profile-ready"&&"profileId" in message&&message.profileId===id)finish();
        });
        // A clean early exit hands the request to that profile's existing instance.
        child.once("exit",code=>finish(code===0?undefined:new Error("The profile could not start. Its browsing data has been kept; try opening it again.")));
      }).finally(()=>profileLaunches.delete(id));
      profileLaunches.set(id,launch);
    }
    await launch;
    return true;
  });
}
