#!/usr/bin/env python3
"""Deferred focused target recipe. Requires root-owned source/GN integration first."""
import argparse, hashlib, json, pathlib, subprocess, time
HERE=pathlib.Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=pathlib.Path,required=True)
    args=parser.parse_args()
    pins=json.loads((HERE/'inputs.json').read_text())
    repo=HERE.parents[3];native=pathlib.Path(pins['nativeRoot']);build=native/pins['buildDirectory']
    output=args.output.resolve()
    if output.exists() or native==output or native in output.parents or output in native.parents:raise ValueError('Fresh output outside native checkout required')
    for rel,h in pins['repositoryFiles'].items():assert sha(repo/rel)==h,rel
    for rel,h in pins['nativeAPIs'].items():assert sha(native/rel)==h,rel
    # No application or GN generation here. Root must integrate these exact
    # sources and the optional root group before authorizing this small target.
    for rel,h in pins['appliedFiles'].items():assert sha(native/rel)==h,rel
    ninja=build/'obj/chrome/browser/aux/inbox_v2_fixture/aux_inbox_v2_codec_fixture.ninja'
    assert ninja.is_file(),'Optional GN target not yet integrated/generated'
    output.mkdir(parents=True)
    receipt={'status':'started','inputPins':pins,'targetNinjaSha256':sha(ninja),'protectedExecution':False,'ownerStateAccess':False}
    command=[str(native/'third_party/depot_tools/autoninja'),'-C',str(build),'-j2','aux_inbox_v2_codec_fixture']
    start=time.monotonic();r=subprocess.run(command,cwd=native,capture_output=True,text=True)
    (output/'build.log').write_text(r.stdout+r.stderr)
    receipt.update(buildCommand=command,buildExitCode=r.returncode,seconds=time.monotonic()-start)
    (output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if r.returncode:raise SystemExit(r.returncode)
    binary=build/'aux_inbox_v2_codec_fixture'
    receipt.update(binarySha256=sha(binary),binaryBytes=binary.stat().st_size)
    r=subprocess.run([str(binary)],cwd=output,capture_output=True,text=True)
    (output/'fixture.log').write_text(r.stdout+r.stderr)
    receipt.update(fixtureExitCode=r.returncode,status='passed' if r.returncode==0 else 'failed')
    for rel,h in pins['appliedFiles'].items():assert sha(native/rel)==h,rel
    (output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(r.stdout,end='')
    raise SystemExit(r.returncode)
if __name__=='__main__':main()
