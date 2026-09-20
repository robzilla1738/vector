import {it,expect} from 'vitest';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {DownloadLocation} from '../../apps/desktop/main/download-location.js';
it('retains folder selection, refuses unavailable/replaced folders and damaged preferences without silent fallback',()=>{
 const root=mkdtempSync(join(tmpdir(),'aux-download-location-'));
 try{
  const data=join(root,'data'),chosen=join(root,'chosen');mkdirSync(data);mkdirSync(chosen);
  let location=new DownloadLocation(data);
  expect(dirname(location.destination('../file.txt'))).toBe(join(data,'downloads'));
  location.choose(chosen);location=new DownloadLocation(data);expect(location.status().custom).toBe(true);
  const first=location.destination('same.txt'),second=location.destination('same.txt');expect(first).not.toBe(second);expect(second.endsWith('same (1).txt')).toBe(true);expect(location.destination('SAME.txt').endsWith('SAME (2).txt')).toBe(true);
  writeFileSync(first,'Keep');expect(readFileSync(first,'utf8')).toBe('Keep');
  expect(Buffer.byteLength(location.destination('😀'.repeat(100)).split('/').at(-1)!)).toBeLessThan(256);
  rmSync(chosen,{recursive:true});expect(location.status().error).toContain('unavailable');expect(()=>location.destination('file')).toThrow('unavailable');
  symlinkSync(join(data,'downloads'),chosen);expect(()=>location.destination('file')).toThrow('unavailable');
  location.choose(null);expect(location.status().custom).toBe(false);
  writeFileSync(join(data,'download-location.json'),'damaged');location=new DownloadLocation(data);
  expect(()=>location.destination('file')).toThrow('could not be read');location.choose(null);expect(location.status().error).toBeUndefined();
 }finally{rmSync(root,{recursive:true,force:true});}
});
