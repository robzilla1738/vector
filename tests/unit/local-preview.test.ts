import {it,expect} from 'vitest';
import {createServer} from 'node:http';
import type {AddressInfo} from 'node:net';
import {checkLocalPreview} from '../../apps/desktop/main/local-preview.js';
it('checks only loopback, reports HTTP/failure states, and sends no credentials or redirected requests',async()=>{
 let targetRequests=0;
 const server=createServer((request,response)=>{
  expect(request.headers.cookie).toBeUndefined();expect(request.headers.authorization).toBeUndefined();
  if(request.url==='/redirect'){response.writeHead(302,{Location:'/target'});response.end();}
  else if(request.url==='/target'){targetRequests++;response.end('target');}
  else if(request.url==='/error'){response.writeHead(503);response.end('unavailable');}
  else if(request.url==='/hang'){}
  else response.end('ready');
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as AddressInfo).port;
 const base=`http://localhost:${port}`;
 try{
  expect((await checkLocalPreview(base)).state).toBe('responding');
  const redirect=await checkLocalPreview(base+'/redirect');expect(redirect.state).toBe('http_error');expect(redirect.statusCode).toBe(302);expect(targetRequests).toBe(0);
  expect((await checkLocalPreview(base+'/error')).statusCode).toBe(503);
  expect((await checkLocalPreview(base+'/hang',30)).state).toBe('unreachable');
  for(const url of ['https://example.com','http://user:password@localhost','file:///tmp/test','http://localhost.example.com'])await expect(checkLocalPreview(url)).rejects.toThrow();
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
 expect((await checkLocalPreview(base)).message).toContain('refused');
});
