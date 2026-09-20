/** Retry is a new GET in the browser session, never a replay of a form body. */
export function retrySource(value:string|undefined):string|undefined{
 if(!value||value.length>16384)return;
 try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return;return url.href;}catch{return;}
}
