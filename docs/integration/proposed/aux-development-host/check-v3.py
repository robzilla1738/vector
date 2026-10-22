import pathlib,subprocess,re,tempfile
repo=pathlib.Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip());proposal=repo/'docs/integration/proposed';base=proposal/'aux-development-host'
with tempfile.TemporaryDirectory(prefix='aux-host-v3-') as d:
 out=pathlib.Path(d);subprocess.run(['xcrun','clang++','-std=c++20','-arch','arm64','-mmacosx-version-min=13.0','-c',str(proposal/'aux-clean-host-preflight/source/AuxCleanHostImports.cc'),'-o',str(out/'imports.o')],check=True)
 files=list(dict.fromkeys(re.findall(r'"\$proposal/([^"\n]+\.swift)"',(base/'build.sh').read_text())));files=[str(proposal/f) for f in files if '/tests/' not in f]
 subprocess.run(['xcrun','swiftc','-target','arm64-apple-macos13.0','-module-cache-path',str(out/'cache'),'-D','AUX_MINIMAL_RUNTIME_DISPATCH','-D','AUX_SCOPED_SECURE_STORE_DISPATCH','-D','AUX_MACOS_UTILITY_DISPATCH','-framework','AppKit','-framework','QuickLookThumbnailing','-framework','ImageIO',*files,str(base/'tests/v3/main.swift'),str(out/'imports.o'),'-o',str(out/'fixture')],check=True)
 subprocess.run([str(out/'fixture')],check=True)
 print('PASS: current actual production Swift graph compiled with1real C++ import TU; only changed policy fixture executed; no51/149/43 suites repeated')
