from pathlib import Path
import json,hashlib,difflib
here=Path(__file__).resolve().parent
root=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
rel='chrome/browser/ui/browser_actions.cc'
s=(root/rel).read_text();original=s
edits=[
 ('palette header', '#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"', '#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"\n#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"'),
 ('actual new-tab action uses transient palette', '                chrome::NewTab(bwi, NewTabTypes::kNewTabCommand);', '''#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
                if (bwi->GetType() == BrowserWindowInterface::TYPE_NORMAL) {
                  // The modern ActionItem is the real Cmd+T dispatch owner.
                  // A refused transient intent must not create a durable tab.
                  if (!ShowAuxCommandBar(bwi, AuxCommandBarMode::kNewTab))
                    LOG(ERROR) << "Aux new-tab action: palette unavailable; no tab created";
                  return;
                }
#endif
                chrome::NewTab(bwi, NewTabTypes::kNewTabCommand);'''),
 ('actual location action uses centered trusted URL context', '''                if (!BrowserWindow::FromBrowser(bwi)->IsLocationBarVisible()) {
                  return;
                }
                chrome::FocusLocationBar(bwi);''', '''#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
                if (ShowAuxCommandBar(bwi, AuxCommandBarMode::kNavigate))
                  return;
                LOG(ERROR) << "Aux URL action: palette unavailable; trusted location fallback";
#endif
                if (!BrowserWindow::FromBrowser(bwi)->IsLocationBarVisible()) {
                  return;
                }
                chrome::FocusLocationBar(bwi);'''),
 ('actual search action uses centered commands', '                chrome::FocusSearch(bwi);', '''#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
                if (ShowAuxCommandBar(bwi, AuxCommandBarMode::kCommands))
                  return;
                LOG(ERROR) << "Aux search action: palette unavailable; trusted search fallback";
#endif
                chrome::FocusSearch(bwi);''')]
anchors=[]
for name,before,after in edits:
 assert s.count(before)==1,(name,s.count(before));s=s.replace(before,after);anchors.append({'name':name,'before':before,'after':after,'expectedCount':1})
sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
out=here/'source'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
(here/'source-plan.json').write_text(json.dumps({'format':'aux.native.counted-projection.v1','purpose':'Route the actual modern NewTab/Location/Search ActionItems to the existing centered palette','nativeRoot':str(root),'files':[{'path':rel,'inputSha256':sha(original),'outputSha256':sha(s),'source':str(out),'anchors':anchors}]},indent=2)+'\n')
(here/'native.patch').write_text(''.join(difflib.unified_diff(original.splitlines(True),s.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel)))
print(json.dumps({'file':rel,'inputSha256':sha(original),'outputSha256':sha(s),'anchors':len(anchors)}))
