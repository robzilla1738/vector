#!/usr/bin/env python3
"""Review-only exact native patch; never applies shared source."""
from pathlib import Path
import difflib,hashlib,json
H=Path(__file__).resolve().parent;N=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');patch='';pins={}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def add(path,content):
 global patch
 original=(N/path).read_text() if (N/path).exists() else ''
 if original:pins[str(path)]=sha(N/path)
 patch+=''.join(difflib.unified_diff(original.splitlines(True),content.splitlines(True),fromfile='a/'+str(path) if original else '/dev/null',tofile='b/'+str(path),n=3))
for f in ['AuxBrowserPrivateRoots.h','AuxBrowserPrivateRoots.cc','AuxChromiumBrowserRootProducer.cc','AuxNativePeerTransport.h','AuxNativePeerTransport.cc','AuxNativePeerWire.h','AuxOwnedNativePeerChild.cc']:
 add(Path('chrome/browser/aux')/f,(H/'source'/f).read_text())
p=Path('chrome/browser/aux/BUILD.gn');s=(N/p).read_text();needle='      "AuxNativePeerTransport.cc",';assert s.count(needle)==1
s=s.replace(needle,'      "AuxBrowserPrivateRoots.cc",\n      "AuxBrowserPrivateRoots.h",\n      "AuxChromiumBrowserRootProducer.cc",\n'+needle);add(p,s)
p=Path('chrome/browser/chrome_browser_main.cc');s=(N/p).read_text();needle='#include "chrome/browser/aux/AuxNativeParentColdLaunch.h"';assert s.count(needle)==1
s=s.replace(needle,needle+'\n#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"')
needle='  for (auto& chrome_extra_part : chrome_extra_parts_) {\n    chrome_extra_part->PreEarlyInitialization();';assert s.count(needle)==1
s=s.replace(needle,'''#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  // Native-selected held roots precede BrowserMainParts profile services. This
  // does not retroactively guard FeatureListCreator's earlier Local State IO.
  if (!aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO())
    return CHROME_RESULT_CODE_MISSING_DATA;
#endif
  for (auto& chrome_extra_part : chrome_extra_parts_) {
    chrome_extra_part->PreEarlyInitialization();''')
needle='  // Create desktop/profile observers after bundled component validation.\n  PreProfileInit();';assert s.count(needle)==1
s=s.replace(needle,'''#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  if (!aux::peer::CaptureActualChromiumBrowserRoots())
    return CHROME_RESULT_CODE_MISSING_DATA;
#endif
  // Create desktop/profile observers after bundled component validation.
  PreProfileInit();''');add(p,s)
(H/'native.patch').write_text(patch)
(H/'native-inputs.json').write_text(json.dumps({'format':'aux.authenticated-browser-roots.native-proposal.v1','sourceRoot':str(N),'baselineFiles':pins,'defaultOffColdHookUnchanged':True,'earlierFeatureListLocalStateProtected':False,'sharedTreeApplied':False,'patchSha256':hashlib.sha256(patch.encode()).hexdigest()},indent=2)+'\n')
