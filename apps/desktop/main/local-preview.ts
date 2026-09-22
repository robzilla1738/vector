import {request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import type {LocalPreviewCheck} from '@aux/contracts';

export function normalizeLocalPreviewUrl(input:string){
  if(typeof input!=='string'||input.length>2048)throw new Error('Enter a local preview URL up to 2,048 characters.');
  let url:URL;try{url=new URL(input);}catch{throw new Error('Enter a complete HTTP or HTTPS localhost URL.');}
  if(!['http:','https:'].includes(url.protocol)||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password)throw new Error('Use an HTTP or HTTPS localhost URL without credentials.');
  url.hash='';return url;
}

/** A user-requested loopback GET. No browser cookies, credentials, proxy, or redirects. */
export async function checkLocalPreview(input:string,timeoutMs=5000):Promise<LocalPreviewCheck>{
  const url=normalizeLocalPreviewUrl(input);
  return new Promise(resolve=>{
    let done=false;
    const finish=(result:Omit<LocalPreviewCheck,'url'|'checkedAt'>)=>{if(done)return;done=true;clearTimeout(timer);resolve({...result,url:url.href,checkedAt:Date.now()});};
    const request=(url.protocol==='https:'?httpsRequest:httpRequest)({
      protocol:url.protocol,hostname:url.hostname==='[::1]'?'::1':'127.0.0.1',port:url.port||undefined,
      path:url.pathname+url.search,method:'GET',agent:false,
      // Pin localhost resolution to loopback instead of relying on DNS or hosts.
      ...(url.protocol==='https:'&&url.hostname==='localhost'?{servername:'localhost'}:{}),
      headers:{Host:url.host,'User-Agent':'Aux local preview check','Connection':'close'},
    },response=>{
      const statusCode=response.statusCode??0;
      finish({state:statusCode>=200&&statusCode<300?'responding':'http_error',statusCode,
        message:statusCode>=200&&statusCode<300?'Received a successful HTTP response.':statusCode>=300&&statusCode<400?'The server redirected the request; redirects are not followed.':`The server returned HTTP ${statusCode}.`});
      response.destroy();request.destroy();
    });
    const timer=setTimeout(()=>{finish({state:'unreachable',message:'No response within five seconds. Check the server logs and port.'});request.destroy();},timeoutMs);
    request.on('error',(error:NodeJS.ErrnoException)=>finish({state:'unreachable',message:error.code==='ECONNREFUSED'?'Connection refused. Start the server or check its port.':`Could not connect (${error.code??'network error'}). HTTPS certificates must be trusted.`}));
    request.end();
  });
}
