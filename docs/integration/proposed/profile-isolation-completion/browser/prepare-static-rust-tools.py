#!/usr/bin/env python3
"""Pin existing Rust build executables separately from graph-owned outputs."""
import pathlib,json,hashlib,re,shutil,os
A=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');O=pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023');B=O/'src';AB=A/'out/AuxFast';BB=B/'out/AuxFast';T=O/'verified-rust-host-tools';T.mkdir(exist_ok=False)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
commands=(O/'unsigned-custody-streamed-build/commands.log').read_text(errors='replace');names=sorted(set(re.findall(r'--build-script (\S+)',commands)));flags=list((AB/'clang_arm64_for_rust_host_build_tools/obj').rglob('*.rustflags.json'));result={}
for rel in names:
 name=pathlib.Path(rel).name;q=next(p for p in flags if p.name==name+'.rustflags.json');qr=q.relative_to(AB);a=json.loads(q.read_text());b=json.loads((BB/qr).read_text());b['rustflags']=[x for x in b['rustflags'] if x!='-Clink-arg=-Wl,-no_adhoc_codesign'];assert a==b,name
 rsp=qr.with_name(name+'.rsp.rust');assert h(AB/rsp)==h(BB/rsp),name
 source=next(x for x in a['rustflags'] if x.endswith('.rs') and not x.startswith('-'));root=(AB/source).resolve().parent;inputs={}
 for p in sorted(root.rglob('*')):
  if p.is_file():r=p.relative_to(A);assert h(p)==h(B/r),str(r);inputs[str(r)]=h(p)
 for x in a['rustflags']:
  if x.startswith('-Clink-arg=') and x.endswith('.rlib'):
   r=pathlib.Path('out/AuxFast')/x.removeprefix('-Clink-arg=');assert h(A/r)==h(B/r),str(r);inputs[str(r)]=h(A/r)
 dst=T/name;shutil.copy2(AB/rel,dst);os.chmod(dst,0o500)
 result[rel]={'artifact':str(dst),'sha256':h(dst),'original':str(AB/rel),'inputs':inputs,'flagsPath':str(qr),'flags':a,'rspPath':str(rsp),'rspSha256':h(AB/rsp)}
 print(name,len(inputs),flush=True)
(T/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
runner=B/'build/rust/gni_impl/run_build_script.py';before=runner.read_text();assert before==(A/'build/rust/gni_impl/run_build_script.py').read_text()
insert='''        # Local unsigned build: selected static tools are explicit, source-pinned inputs.
        import hashlib, json, pathlib
        aux_manifest = pathlib.Path(MANIFEST)
        aux_tools = json.loads(aux_manifest.read_text())
        aux_tool = aux_tools.get(args.build_script)
        if aux_tool is not None:
            aux_root = pathlib.Path(ROOT)
            aux_build = aux_root / "out/AuxFast"
            aux_sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
            assert all(aux_sha(aux_root / p) == digest for p, digest in aux_tool["inputs"].items())
            aux_flags = json.loads((aux_build / aux_tool["flagsPath"]).read_text())
            aux_flags["rustflags"] = [x for x in aux_flags["rustflags"] if x != "-Clink-arg=-Wl,-no_adhoc_codesign"]
            assert aux_flags == aux_tool["flags"]
            assert aux_sha(aux_build / aux_tool["rspPath"]) == aux_tool["rspSha256"]
            assert aux_sha(pathlib.Path(aux_tool["artifact"])) == aux_tool["sha256"]
            args.build_script = aux_tool["artifact"]

'''.replace('MANIFEST',repr(str(T/'manifest.json'))).replace('ROOT',repr(str(B)))
needle='        proc = subprocess.run(\n';assert before.count(needle)==1;runner.write_text(before.replace(needle,insert+needle));(T/'runner-before.py').write_text(before);(T/'runner-after.py').write_text(runner.read_text());print('Prepared explicit mapping',len(result),flush=True)
