import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost, type BrowserProfile } from "../bridge";
import { errToast } from "../store";
import { orderedProfiles } from "../features/profiles/profile-order";
import { SPACE_COLORS } from "../workspace";
import { useConfirm } from "../ui/confirm";
import { shellIconBookmark, shellIconChromeSm, shellIconCode, shellIconFolder, shellIconGlobe, shellIconPerson } from "./icons";
import { Menu } from "../ui/dialog";
import "./ProfileSwitcher.css";
import { HostMethods } from "@aux/contracts";
import { executeCommand } from "../commands";
import { commandResult } from "../features/profiles/command-result";
import { subscribeProfileMoves } from "../features/profiles/move-request";
export function ProfileMoveConfirmation() {
  const { confirm, confirmation } = useConfirm();
  useEffect(() => {
    let live = true;
    const listener: Parameters<typeof subscribeProfileMoves>[0] = (request, done) => {
      void (async()=>{
        try {
          if (request.kind === "delete") {
            const profile=(await bridge.browserProfiles()).find(item=>item.id===request.profileId);
            if (!live || !profile) {done(false);return;}
            done(await confirm({title:`Delete “${profile.name}”?`,description:"This permanently removes its sign-ins, tabs, history, chats, memory and connections on this Mac. This cannot be undone.",confirmLabel:"Delete permanently",cancelLabel:"Keep Profile",danger:true}));
          } else {
            const accepted=await confirm({ title: "Open this URL in another Profile?", description: "Only the URL moves. The page opens with the destination Profile’s sign-ins. Unsaved changes and page state are not copied; the original tab closes after the new tab opens.", confirmLabel: "Move URL", cancelLabel: "Keep tab here" });
            if(!accepted||!live){done(false);return;}
            if(!await bridge.moveTabToProfile(request.pageId,request.profileId))throw new Error("This URL could not be moved to that Profile.");
            done(true);
          }
        } catch(error){done(false,live?error:undefined);}
      })();
    };
    const unsubscribe = subscribeProfileMoves(listener);
    return () => { live = false; unsubscribe(); };
  }, [confirm]);
  return confirmation;
}
export function ProfileSwitcher() {
  const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
  const [open, setOpen] = useState(false);
  const focusRequest=useRef({value:0});
  const alive=useRef(false);
  useEffect(()=>{const counter=focusRequest.current;alive.current=true;return()=>{alive.current=false;++counter.value;};},[]);
  const chip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!inNativeHost || bridge.privateMode) return;
    let live = true;
    let generation=0;
    const refresh = () => { const request=++generation;void bridge.browserProfiles().then(items => { if (live&&request===generation) setProfiles(orderedProfiles(items)); }).catch(error=>{if(live&&request===generation)errToast(error);}); };
    refresh(); window.addEventListener("focus", refresh);
    return () => { live = false; window.removeEventListener("focus", refresh); };
  }, [open]);
  if (!inNativeHost || bridge.privateMode) return null;
  const current = profiles.find(profile => profile.current);
  const focus = (profileId: string, spaceId: string | null) => {
    const request=++focusRequest.current.value;
    void commandResult("focus-profile-space",HostMethods.focusBrowserProfileSpace.result,{profileId,spaceId}).then(ok=>{if(!alive.current||request!==focusRequest.current.value)return;if(!ok)throw new Error("The Profile or Space is no longer available.");setOpen(false);}).catch(error=>{if(alive.current&&request===focusRequest.current.value)errToast(error);});
  };
  return <div className="profile-switcher" data-space={current?.color ?? SPACE_COLORS[0]}>
    <div className="profile-color-stripe" aria-hidden="true" />
    <button ref={chip} className="profile-chip" aria-expanded={open} aria-label="Choose Profile and Space" onClick={() => setOpen(value => !value)}><span aria-hidden="true">{current?.name.slice(0,1).toLocaleUpperCase() ?? "P"}</span>{current?.name ?? "Profile"}</button>
    {open && <Menu className="profile-menu" label="Profiles and Spaces" anchor={chip} returnFocus={chip} onClose={()=>setOpen(false)}>
      {profiles.map(profile => <div key={profile.id} className="profile-menu-group">
        <button className="profile-menu-profile" aria-current={profile.current ? "true" : undefined} data-space={profile.color ?? "blue"} onClick={() => focus(profile.id, null)}>{profile.icon === "code" ? shellIconCode : profile.icon === "travel" ? shellIconGlobe : profile.icon === "work" ? shellIconChromeSm : profile.icon === "study" ? shellIconBookmark : profile.icon === "home" ? shellIconFolder : shellIconPerson} {profile.name}</button>
        {profile.spaces?.map(space => <button className="profile-menu-space" data-space={space.color} key={space.id} onClick={() => focus(profile.id, space.id)}><span className="space-dot" aria-hidden="true" />{space.name}</button>)}
      </div>)}
      <button onClick={() => { const request=++focusRequest.current.value;void executeCommand("show-profiles").then(()=>{if(alive.current&&request===focusRequest.current.value)setOpen(false);}).catch(error=>{if(alive.current&&request===focusRequest.current.value)errToast(error);}); }}>Manage Profiles…</button>
      <button onClick={() => setOpen(false)}>Close menu</button>
    </Menu>}
  </div>;
}

export function ProfileFooterStripe() {
  const [profile,setProfile] = useState<BrowserProfile>();
  useEffect(()=>{if(!inNativeHost||bridge.privateMode)return;let live=true,generation=0;const refresh=()=>{const request=++generation;void bridge.browserProfiles().then(items=>{if(live&&request===generation)setProfile(items.find(item=>item.current));}).catch(error=>{if(live&&request===generation)errToast(error);});};refresh();window.addEventListener("focus",refresh);return()=>{live=false;window.removeEventListener("focus",refresh);};},[]);
  if(!profile)return null;
  return <div className="profile-footer-stripe" data-space={profile.color??"blue"} aria-hidden="true"/>;
}
