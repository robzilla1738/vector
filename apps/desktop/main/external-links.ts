import { dialog, shell, type BaseWindow, type WebContents } from "electron";

const applications = new Map([
  ["mailto:", "email app"],
  ["tel:", "calling app"],
  ["webcal:", "calendar app"],
  ["webcals:", "calendar app"],
]);
const pending = new WeakSet<WebContents>();

/** Only known document/contact protocols can leave the browser, with human review. */
export function offerExternalLink(contents: WebContents, owner: BaseWindow | undefined, value: string): boolean {
  let url: URL;
  try { url=new URL(value); } catch { return false; }
  const application=applications.get(url.protocol);
  if(!application)return false;
  if(!owner||owner.isDestroyed()||contents.isDestroyed()||pending.has(contents))return true;
  if(value.length>8192||/[\u0000-\u001f\u007f]/.test(value)||url.username||url.password)return true;
  const document=contents.getURL();
  pending.add(contents);
  void dialog.showMessageBox(owner,{
    type:"question",title:"Open another app?",message:`Open this link in your ${application}?`,
    detail:`${value}\n\nThe link will be passed to the app configured on your Mac.`,
    buttons:["Cancel","Open app"],defaultId:0,cancelId:0,noLink:true,
  }).then(async result=>{
    if(result.response!==1||contents.isDestroyed()||contents.getURL()!==document||owner.isDestroyed())return;
    try { await shell.openExternal(url.href); }
    catch { if(!owner.isDestroyed())await dialog.showMessageBox(owner,{type:"error",message:"This link couldn’t be opened.",detail:"Check that an app is installed for this type of link, then try again.",buttons:["OK"]}); }
  }).catch(()=>{}).finally(()=>pending.delete(contents));
  return true;
}
