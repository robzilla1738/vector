#!/usr/bin/env python3
"""Additional cold-only provenance projection before Local State read; no apply."""
from pathlib import Path
import hashlib,difflib,json,re
H=Path(__file__).resolve().parent;N=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');patch='';pins={}
def add(path,before,after):
 global patch
 pins[str(path)]=hashlib.sha256(before.encode()).hexdigest()
 patch+=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+str(path),tofile='b/'+str(path),n=3))
p=Path('chrome/browser/metrics/chrome_feature_list_creator.cc');before=(N/p).read_text();after=before
needle='#include "chrome/browser/buildflags.h"';assert after.count(needle)==1
after=after.replace(needle,needle+'\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)\n#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"\n#endif')
needle='void ChromeFeatureListCreator::CreatePrefService() {\n  base::FilePath local_state_file;';assert after.count(needle)==1
after=after.replace(needle,'''void ChromeFeatureListCreator::CreatePrefService() {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  // Genuine root provenance before FILE_LOCAL_STATE resolution/read. This is
  // not writer custody or native owner admission for this earlier browser IO.
  CHECK(aux::peer::CaptureActualChromiumBrowserRoots() ||
        aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO());
#endif
  base::FilePath local_state_file;''')
(H/'early-source/chrome_feature_list_creator.cc').write_text(after);add(p,before,after)
# The following hunk applies AFTER native.patch, without rewriting that receipt.
p=Path('chrome/browser/chrome_browser_main.cc');original=(N/p).read_text();before=original.replace('#include "chrome/browser/aux/AuxNativeParentColdLaunch.h"','#include "chrome/browser/aux/AuxNativeParentColdLaunch.h"\n#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"')
needle='  for (auto& chrome_extra_part : chrome_extra_parts_) {\n    chrome_extra_part->PreEarlyInitialization();'
before=before.replace(needle,'''#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  // Native-selected held roots precede BrowserMainParts profile services. This
  // does not retroactively guard FeatureListCreator's earlier Local State IO.
  if (!aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO())
    return CHROME_RESULT_CODE_MISSING_DATA;
#endif
  for (auto& chrome_extra_part : chrome_extra_parts_) {
    chrome_extra_part->PreEarlyInitialization();''')
needle='  // Create desktop/profile observers after bundled component validation.\n  PreProfileInit();';before=before.replace(needle,'''#if BUILDFLAG(ENABLE_AUX_BROWSER) && defined(AUX_SEALED_NATIVE_COLD_ENTRY)
  if (!aux::peer::CaptureActualChromiumBrowserRoots())
    return CHROME_RESULT_CODE_MISSING_DATA;
#endif
  // Create desktop/profile observers after bundled component validation.
  PreProfileInit();''')
needle='  // Native-selected held roots precede BrowserMainParts profile services. This\n  // does not retroactively guard FeatureListCreator\'s earlier Local State IO.\n  if (!aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO())';assert before.count(needle)==1
after=before.replace(needle,'''  // Reuse/revalidate the actual capture from before Local State, or prepare it
  // if that path was not taken. A failed capture is never reset or adopted.
  if (!aux::peer::CaptureActualChromiumBrowserRoots() &&
      !aux::peer::PrepareBrowserPrivateRootsBeforeProfileIO())''');add(p,before,after)
p=Path('chrome/browser/metrics/BUILD.gn');before=(N/p).read_text();after=before
needle='import("//components/metrics/generate_expired_histograms_array.gni")';assert after.count(needle)==1
after=after.replace(needle,'import("//chrome/browser/buildflags.gni")\n'+needle)
start=after.index('source_set("impl") {');depth=0;end=None
# The relevant GN file has no brace-containing string literals in this target.
for i in range(after.index('{',start),len(after)):
 if after[i]=='{':depth+=1
 if after[i]=='}':
  depth-=1
  if depth==0:end=i;break
assert end
addition='''  if (is_mac && enable_aux_browser) {
    # Finite native root producer; aux:platform has no browser/metrics dependency.
    deps += [ "//chrome/browser/aux:platform" ]
  }
'''
after=after[:end]+addition+after[end:];add(p,before,after)
(H/'early-local-state.patch').write_text(patch)
(H/'early-inputs.json').write_text(json.dumps({'format':'aux.browser-roots.early-provenance.v1','applyAfter':'native.patch','baselineFiles':pins,'patchSha256':hashlib.sha256(patch.encode()).hexdigest(),'ordinaryColdFlagEnabled':False,'rootProvenanceBeforeReadPrefs':True,'nativeOwnerAdmissionBeforeReadPrefs':False,'sharedTreeApplied':False},indent=2)+'\n')
