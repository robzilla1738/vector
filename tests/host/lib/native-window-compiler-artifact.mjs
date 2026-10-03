import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, openSync, closeSync, fstatSync, lstatSync, readSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodeNativeWindowCompiler } from './native-window-compiler-protocol.mjs';
import { readStartupMachO } from './startup-helper-manifest.mjs';
const admitted = new WeakSet();
const freezeDocument = value => {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freezeDocument(child); Object.freeze(value); }
  return value;
};
const parserPath = fileURLToPath(new URL('./startup-helper-manifest.mjs', import.meta.url));
const same = (a,b) => ['dev','ino','size','mtimeMs','ctimeMs','mode','uid'].every(key=>a[key]===b[key]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function bytes(fd, size) {
  const result=Buffer.alloc(size); let offset=0;
  while(offset<size) { const count=readSync(fd,result,offset,size-offset,offset); assert.ok(count>0,'Original artifact truncated');offset+=count; }
  return result;
}
/** Retain only externally approved original documents and their fixed compiler
 * evidence. No compilation, native execution, process discovery or credential
 * source is performed. Release belongs after original helper cleanup. */
export function retainNativeWindowCompiler(admission) {
  const held=[]; let retired=false;
  const hold=(path, expected, maximum, { system=false, symbolic=false, mode, size }={})=>{
    const named=lstatSync(path),resolved=realpathSync(path);
    assert.ok(symbolic || !named.isSymbolicLink(),'Symlink original artifact');
    const fd=openSync(resolved,constants.O_RDONLY|constants.O_NOFOLLOW);
    const initial=fstatSync(fd); const item={path,resolved,fd,initial,named,expected};held.push(item);
    assert.ok(initial.isFile() && (initial.uid===process.getuid() || (system && initial.uid===0)) &&
      !(initial.mode&0o6022) && initial.size>=0 && initial.size<=maximum,'Unsafe original artifact');
    if(mode!==undefined) assert.equal(initial.mode&0o7777,mode);
    if(size!==undefined) assert.equal(initial.size,size);
    const original=bytes(fd,initial.size);
    if(expected!==undefined) assert.equal(digest(original),expected,'Original artifact digest changed');
    item.expected=expected??digest(original);return original;
  };
  const validate=()=>{
    assert.equal(retired,false,'Retired input-helper artifact lease');
    for(const item of held) {
      assert.equal(realpathSync(item.path),item.resolved,'Original artifact resolution changed');
      assert.ok(same(item.initial,fstatSync(item.fd))&&same(item.named,lstatSync(item.path)),'Original artifact replaced');
      assert.equal(digest(bytes(item.fd,item.initial.size)),item.expected,'Original artifact bytes changed');
    }
  };
  try {
    const manifestRaw=hold(admission.manifestPath,admission.manifestSha256,65536).toString('utf8');
    const auditRaw=hold(admission.auditPath,admission.auditSha256,65536).toString('utf8');
    const decoded=freezeDocument(decodeNativeWindowCompiler(manifestRaw,auditRaw,admission)),m=decoded.manifest;
    hold(m.source.path,m.source.sha256,4*1024*1024,{mode:m.source.mode,size:m.source.bytes});
    const binary=hold(m.output.path,m.output.sha256,64*1024*1024,{mode:m.output.mode,size:m.output.bytes});
    for(const tool of [m.compiler.launcher,m.compiler.frontend]) hold(tool.path,tool.sha256,512*1024*1024,{system:true});
    assert.equal(realpathSync(m.compiler.swiftc.path),m.compiler.swiftc.resolvedPath);
    hold(m.compiler.swiftc.path,m.compiler.swiftc.sha256,512*1024*1024,{system:true,symbolic:true});
    hold(m.sdk.settingsPath,m.sdk.settingsSha256,4*1024*1024,{system:true});
    assert.equal(realpathSync(m.sdk.path),m.sdk.resolvedPath);
    for(const streams of [m.compiler.version,m.sdk.selection,m.compile]) {
      hold(streams.stdoutPath,streams.stdoutSha256,4*1024*1024);
      hold(streams.stderrPath,streams.stderrSha256,4*1024*1024);
    }
    hold(m.readback.readerPath,m.readback.readerSha256,4*1024*1024);
    // The parser actually imported by this harness must match the original
    // independently audited readback reader, not merely its recorded path.
    hold(parserPath,m.readback.readerSha256,4*1024*1024);
    const originalReadback=hold(m.readback.stdoutPath,m.readback.stdoutSha256,65536).toString('utf8');
    const image=Object.freeze(readStartupMachO(binary));
    assert.equal(image.architecture,'arm64');assert.equal(image.imageUuid,m.output.uuid);
    assert.equal(image.minimumOS,m.output.minimumOS);assert.equal(image.sdkVersion,m.output.sdkVersion);
    assert.deepEqual(JSON.parse(originalReadback),image,'Original Mach-O readback differs');
    validate();
    const lease = Object.freeze({ decoded,image,sourcePath:m.source.path,executablePath:m.output.path,
      artifact:Object.freeze({binarySha256:m.output.sha256,sourceSha256:m.source.sha256,imageUuid:image.imageUuid}),
      validate,
      matchOriginalClient(ax) {
        validate(); assert.equal(realpathSync(ax.helperExecutable),realpathSync(m.output.path));
        if (!held.some(item=>item.path===ax.helperSource))
          hold(ax.helperSource,m.source.sha256,4*1024*1024,{mode:m.source.mode,size:m.source.bytes});
        validate();
      },
      release(){if(retired)return;retired=true;for(const item of held)closeSync(item.fd);},
      loadedHelperProven:false,performanceQualified:false });
    admitted.add(lease); return lease;
  } catch(error) {retired=true;for(const item of held)closeSync(item.fd);throw error;}
}

/** Internal branded admission for the actual client; no supplied path can select
 * an executable and no missing artifact may fall through to compilation. */
export function readNativeWindowCompilerExecutable(lease, sourcePath) {
  assert.ok(admitted.has(lease), 'Foreign input-helper compiler artifact');
  lease.matchOriginalClient({helperExecutable:lease.executablePath,helperSource:sourcePath});
  return lease.executablePath;
}
