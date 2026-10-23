#!/usr/bin/env python3
"""One disposable pure filesystem fixture, no browser/profile service activation."""
import argparse,hashlib,json,pathlib,subprocess
H=pathlib.Path(__file__).resolve().parent;P=H.parents[1]/'profile-isolation-next/browser-roots'
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve();O.mkdir(mode=0o700)
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk'
compiler='/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++'
inputs=[H/'test.py',H/'tests/path-policy.cc',H/'source/chrome/browser/aux/AuxBrowserNetworkPaths.cc',H/'source/chrome/browser/aux/AuxBrowserNetworkPaths.h',P/'source/AuxBrowserPrivateRoots.h',P/'source/AuxBrowserPrivateRoots.cc']
pins={str(v):sha(v) for v in inputs}
command=[compiler,'-std=c++20','-Wall','-Wextra','-Werror','-isysroot',sdk,'-I',str(H/'source'),'-I',str(P/'source'),str(H/'tests/path-policy.cc'),str(P/'source/AuxBrowserPrivateRoots.cc'),'-o',str(O/'path-policy')]
build=subprocess.run(command,capture_output=True,text=True);(O/'build.log').write_text(build.stdout+build.stderr)
run=subprocess.run([str(O/'path-policy')],capture_output=True,text=True) if build.returncode==0 else None
if run:(O/'test.log').write_text(run.stdout+run.stderr)
report={'format':'aux.browser-network-paths.pure-fixture.v1','passed':build.returncode==0 and run is not None and run.returncode==0,'command':command,'compileExit':build.returncode,'testExit':None if run is None else run.returncode,'sourceHashes':pins,'inputsUnchanged':all(sha(k)==v for k,v in pins.items()),'syntheticFilesystemOnly':True,'nativeCaptureStubAlwaysRefuses':True,'browserOrDaemonExecuted':False,'nativeOwnerAdmissionProven':False,'policySymlinkRaceClosureProven':False}
(O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
if not report['passed'] or not report['inputsUnchanged']:raise SystemExit(1)
