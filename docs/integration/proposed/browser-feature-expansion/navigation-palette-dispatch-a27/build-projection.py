from pathlib import Path
import hashlib,json,difflib
n=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');r=Path(__file__).parent
rules={
'chrome/browser/ui/views/frame/aux_tab_search_bubble.cc':[
('#include "base/check.h"','#include "base/check.h"\n#include "base/logging.h"'),
('''    if (!browser || !parent_ || parent_->IsClosed() || !AgentInstalled(profile))
      return false;''','''    const bool agent_enabled = AgentInstalled(profile);
    if (!browser || !parent_ || parent_->IsClosed() || !agent_enabled) {
      LOG(ERROR) << "Aux command palette refused: owner-source"
                 << " browser=" << !!browser << " parent=" << !!parent_
                 << " parent_closed=" << (parent_ && parent_->IsClosed())
                 << " agent_enabled=" << agent_enabled;
      return false;
    }'''),
('''      if (!alive)
        return false;
      widget_ = widget->GetWeakPtr();''','''      if (!alive) {
        LOG(ERROR) << "Aux command palette refused: owner-retired-during-create";
        return false;
      }
      widget_ = widget->GetWeakPtr();'''),
('''    if (!contents || !widget_)
      return false;
    contents->BeginInvocation(mode, std::move(proposal));''','''    if (!contents || !widget_) {
      LOG(ERROR) << "Aux command palette refused: created-view"
                 << " contents=" << !!contents << " widget=" << !!widget_;
      return false;
    }
    LOG(ERROR) << "Aux command palette: show mode=" << static_cast<int>(mode);
    contents->BeginInvocation(mode, std::move(proposal));'''),
('''  if (!parent || parent->IsClosed())
    return nullptr;
  auto* owner = parent->GetProperty(kAuxProfileSearchOwner);''','''  if (!parent || parent->IsClosed()) {
    LOG(ERROR) << "Aux command palette refused: browser-widget"
               << " browser=" << !!browser << " view=" << !!view
               << " parent=" << !!parent;
    return nullptr;
  }
  auto* owner = parent->GetProperty(kAuxProfileSearchOwner);''')],
'chrome/browser/ui/browser_command_controller.cc':[(
'''    case IDC_NEW_TAB: {
#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (ShowAuxCommandBar(browser_, AuxCommandBarMode::kNewTab)) break;
#endif''','''    case IDC_NEW_TAB: {
#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (browser_->GetType() == BrowserWindowInterface::TYPE_NORMAL) {
        // Cmd+T is a transient intent in Aux. A refused palette must not
        // silently create a durable blank tab before the user commits.
        if (!ShowAuxCommandBar(browser_, AuxCommandBarMode::kNewTab))
          LOG(ERROR) << "Aux new-tab command: palette unavailable; no tab created";
        break;
      }
#endif'''),(
'''#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (ShowAuxCommandBar(browser_, AuxCommandBarMode::kNavigate)) break;
#endif''','''#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (ShowAuxCommandBar(browser_, AuxCommandBarMode::kNavigate)) break;
      LOG(ERROR) << "Aux URL command: palette unavailable; trusted location fallback";
#endif'''),(
'''#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (ShowAuxCommandBar(browser_, AuxCommandBarMode::kCommands)) break;
#endif''','''#if BUILDFLAG(ENABLE_AUX_BROWSER)
      if (ShowAuxCommandBar(browser_, AuxCommandBarMode::kCommands)) break;
      LOG(ERROR) << "Aux search command: palette unavailable; trusted search fallback";
#endif''')]
}
m={'format':'aux.native.counted-projection.v1','purpose':'Trace genuine centered palette refusal and preserve no-tab-before-commit CmdT semantics','nativeRoot':str(n),'files':[]};patch=[]
for rel,edits in rules.items():
 b=(n/rel).read_text();s=b;anchors=[]
 for old,new in edits:
  assert s.count(old)==1,(rel,old[:50],s.count(old));s=s.replace(old,new,1);anchors.append({'before':old,'after':new,'expectedCount':1})
 o=r/'source'/rel;o.parent.mkdir(parents=True,exist_ok=True);o.write_text(s)
 sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
 m['files'].append({'path':rel,'inputSha256':sha(b),'outputSha256':sha(s),'source':str(o),'anchors':anchors})
 patch.extend(difflib.unified_diff(b.splitlines(True),s.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0))
(r/'source-plan.json').write_text(json.dumps(m,indent=2)+'\n');(r/'navigation-palette-dispatch-a27.patch').write_text(''.join(patch));print(json.dumps([{k:f[k] for k in ['path','inputSha256','outputSha256']} for f in m['files']],indent=2))
