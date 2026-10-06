import { bridge } from "../../bridge";
import type { CommandContext, CommandInvocation } from "../registry";
import { canClaim } from "../../tab-window-transfer";
const target = (state: CommandContext, invocation: CommandInvocation) => {
  if (invocation.payload && !("pageId" in invocation.payload))
    throw new Error("Choose a tab to use this command.");
  const id =
    invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
  const page = state.pages.find((item) => item.pageId === id);
  if (!page) throw new Error("This tab is no longer available.");
  return page;
};
export async function claimTab(state: CommandContext, invocation: CommandInvocation) {
  const page = target(state, invocation);
  if (!canClaim(page))
    throw new Error("Aux is working in this tab. Show its window and take control before moving it.");
  await state.activate(page.pageId);
}
export async function showTabWindow(state: CommandContext, invocation: CommandInvocation) {
  const page = target(state, invocation);
  if (!(await bridge.showTabWindow(page.pageId)))
    throw new Error("This tab's window is no longer available.");
}
