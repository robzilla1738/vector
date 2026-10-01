import type { FeatureMount, CommandContext, CommandInvocation } from "../registry";
import type { ShellCommandId } from "@aux/contracts";
import { useStore, errToast } from "../../store";
import { bridge } from "../../bridge";
import { ProfileSidebar, ProfileConfirmation, ProfileFooter } from "./slots";
import { requestProfileMove, requestProfileDelete } from "./move-request";
import { orderedProfiles, orderedProfileSpaces } from "./profile-order";
const commands: NonNullable<FeatureMount["commands"]> = {};
for (let ordinal = 1; ordinal <= 9; ordinal++) {
  commands[`profile-${ordinal}` as ShellCommandId] = async () => {
    const profile = orderedProfiles(await bridge.browserProfiles())[ordinal - 1];
    if (!profile) throw new Error(`There is no Profile ${ordinal}. Create one in Settings › Profiles.`);
    if (!await bridge.focusBrowserProfileSpace(profile.id, null)) throw new Error("The Profile window could not be opened.");
  };
  commands[`space-${ordinal}` as ShellCommandId] = async () => {
    const space = orderedProfileSpaces(await bridge.browserProfiles())[ordinal - 1];
    if (!space) throw new Error(`There is no Space ${ordinal}. Create one in the Profile menu.`);
    if (!await bridge.focusBrowserProfileSpace(space.profileId, space.spaceId)) throw new Error("The Profile Space could not be opened.");
  };
}
commands["focus-profile-space"] = async (_state: CommandContext, invocation: CommandInvocation) => {
  const payload = invocation.payload;
  if (!payload || !("profileId" in payload) || !("spaceId" in payload)) throw new Error("Choose a Profile and Space.");
  if (!await bridge.focusBrowserProfileSpace(payload.profileId, payload.spaceId)) throw new Error("The Profile Space could not be opened.");
  return true;
};
commands["move-tab-to-profile"] = async (_state: CommandContext, invocation: CommandInvocation) => {
  const payload = invocation.payload;
  if (!payload || !("pageId" in payload) || !("profileId" in payload)) throw new Error("Choose a tab and destination Profile.");
  return requestProfileMove(payload.pageId, payload.profileId);
};
commands["show-profiles"] = () => { useStore.setState({overlay:"settings",settingsCategory:"Profiles",railOpen:true}); };
commands["refresh-browser-profiles"] = () => bridge.browserProfiles();
commands["create-browser-profile"] = (_state, {payload}) => {
  if (!payload || !("name" in payload)) throw new Error("Enter a Profile name.");
  return bridge.createBrowserProfile(payload.name);
};
commands["open-browser-profile"] = (_state, {payload}) => {
  if (!payload || !("profileId" in payload)) throw new Error("Choose a Profile.");
  return bridge.openBrowserProfile(payload.profileId);
};
commands["rename-browser-profile"] = (_state, {payload}) => {
  if (!payload || !("profileId" in payload) || !("name" in payload)) throw new Error("Choose a Profile and name.");
  return bridge.renameBrowserProfile(payload.profileId,payload.name);
};
commands["archive-browser-profile"] = (_state, {payload}) => {
  if (!payload || !("profileId" in payload) || !("archived" in payload)) throw new Error("Choose a Profile archive state.");
  return bridge.archiveBrowserProfile(payload.profileId,payload.archived);
};
commands["delete-browser-profile"] = async (_state, {payload}) => {
  if (!payload || !("profileId" in payload)) throw new Error("Choose a Profile.");
  if(!await requestProfileDelete(payload.profileId))return false;
  return bridge.deleteBrowserProfile(payload.profileId);
};
commands["set-profile-appearance"] = (_state, {payload}) => {
  if (!payload || !("profileId" in payload) || !("color" in payload) || !("icon" in payload)) throw new Error("Choose a Profile appearance.");
  return bridge.setBrowserProfileAppearance(payload.profileId,{color:payload.color,icon:payload.icon});
};
export const mount: FeatureMount = { feature: "profiles", commands, sidebarItems: [ProfileSidebar], sidebarFooterItems: [ProfileFooter], overlays: [ProfileConfirmation], boot: () => {
  let live=true,generation=0;
  const off=bridge.onFocusSpace(({spaceId,windowId})=>{
    if(windowId!==bridge.windowId||!spaceId)return;
    const request=++generation;
    const valid=()=>live&&request===generation;
    void useStore.getState().refreshSpaces(valid).then(()=>{if(valid())useStore.getState().switchSpace(spaceId);}).catch(error=>{if(valid())errToast(error);});
  });
  return()=>{live=false;++generation;off();};
} };
