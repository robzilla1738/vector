#!/usr/bin/env python3
"""Reuse existing signed static Rust build tools only after source-input checks."""
import hashlib,json,pathlib,shutil,os
A=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');O=pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023');B=O/'src';R=O/'host-tool-reuse';R.mkdir(exist_ok=False)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();results=[]
for name in ['compiler_builtins_compiler_builtins_vunknown_build_script','libc_libc_vunknown_build_script']:
 q=pathlib.Path('out/AuxFast/clang_arm64_for_rust_host_build_tools/obj/build/rust/std/rules')/(name+'.rustflags.json');a=json.loads((A/q).read_text());b=json.loads((B/q).read_text());b['rustflags'].remove('-Clink-arg=-Wl,-no_adhoc_codesign');assert a==b
 rsp=q.with_name(name+'.rsp.rust');assert h(A/rsp)==h(B/rsp)
 root=pathlib.Path('out/AuxFast')/next(x for x in a['rustflags'] if x.endswith('/build.rs'));root=(A/root).resolve().parent.relative_to(A);inputs=[]
 for f in sorted((A/root).rglob('*')):
  if f.is_file():rel=f.relative_to(A);assert h(f)==h(B/rel),str(rel);inputs.append({'path':str(rel),'sha256':h(f)})
 for arg in a['rustflags']:
  if arg.startswith('-Clink-arg=') and arg.endswith('.rlib'):
   rel=pathlib.Path('out/AuxFast')/arg.removeprefix('-Clink-arg=');assert h(A/rel)==h(B/rel);inputs.append({'path':str(rel),'sha256':h(A/rel)})
 rel=pathlib.Path('out/AuxFast/clang_arm64_for_rust_host_build_tools')/name;artifact=A/rel;output=B/rel
 record={'name':name,'existingSignedArtifactPath':str(artifact),'artifactSha256':h(artifact),'unsignedCompiledSha256':h(output),'sourceAndLibraryInputs':inputs,'flagsEqualExceptNoAdhoc':True,'rspSha256':h(A/rsp),'newSigningPerformed':False,'productObjectReused':False}
 shutil.copy2(output,R/(name+'.unsigned'));shutil.copyfile(artifact,output);shutil.copymode(artifact,output);assert h(output)==record['artifactSha256'];results.append(record)
(R/'receipt.json').write_text(json.dumps(results,indent=2)+'\n');print('Reused two existing build tools; no product objects or new signing')
