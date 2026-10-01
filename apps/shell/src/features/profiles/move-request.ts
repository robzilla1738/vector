export type ProfileDecision = {kind:"move";pageId:string;profileId:string} | {kind:"delete";profileId:string};
type Listener = (request:ProfileDecision, done:(ok:boolean,error?:unknown)=>void) => void;
let listener:Listener|undefined;
let pending:((ok:boolean)=>void)|undefined;
export function subscribeProfileMoves(next:Listener) {
  if(listener)throw new Error("The Profile confirmation is already mounted.");
  listener=next;
  return ()=>{if(listener===next){listener=undefined;pending?.(false);}};
}
function requestDecision(request:ProfileDecision) {
  if(!listener)return Promise.reject(new Error("The Profile confirmation is still loading. Try again."));
  if(pending)return Promise.resolve(false);
  return new Promise<boolean>((resolve,reject)=>{
    let settled=false;
    const finish=(ok:boolean,error?:unknown)=>{if(settled)return;settled=true;pending=undefined;if(error!==undefined)reject(error);else resolve(ok);};
    pending=finish;
    try{listener!(request,finish);}catch(error){settled=true;pending=undefined;reject(error);}
  });
}
export const requestProfileMove = (pageId:string,profileId:string)=>requestDecision({kind:"move",pageId,profileId});
export const requestProfileDelete = (profileId:string)=>requestDecision({kind:"delete",profileId});
