import {it,expect} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDb,Repo} from '@aux/runtime';
import {retrySource,canResumePartialDownload} from '../../apps/desktop/main/download-retry.js';
it('retains retry URLs with download records after restart without inventing sources for older records',()=>{
 const root=mkdtempSync(join(tmpdir(),'aux-download-retry-'));let db=openDb(join(root,'state.sqlite'));
 try{
  const record={id:'download',filename:'file.txt',path:'/fixture/file.txt',state:'started',size:0,startedAt:1};
  new Repo(db).saveDownload({...record,sourceUrl:'https://example.test/file?ticket=synthetic'});
  new Repo(db).saveDownload({...record,state:'cancelled'});
  new Repo(db).saveDownload({...record,id:'legacy',state:'interrupted'});
  db.close();db=openDb(join(root,'state.sqlite'));const downloads=new Repo(db).listDownloads();
  expect(downloads.find(d=>d.id==='download')?.sourceUrl).toBe('https://example.test/file?ticket=synthetic');
  expect(downloads.find(d=>d.id==='legacy')?.sourceUrl).toBeUndefined();
 }finally{db.close();rmSync(root,{recursive:true,force:true});}
});
it('offers only HTTP(S) sources without embedded credentials',()=>{
 expect(retrySource('https://example.test/file')).toBe('https://example.test/file');
 for(const value of [undefined,'not a URL','file:///tmp/private','blob:https://example.test/id','javascript:alert(1)','https://user:password@example.test/file'])expect(retrySource(value)).toBeUndefined();
});
it('treats a retry after restart as a new transfer, not a byte-range resume',()=>{
 expect(retrySource('https://example.test/file?part=2')).toBe('https://example.test/file?part=2');
 expect(canResumePartialDownload()).toBe(false);
});
