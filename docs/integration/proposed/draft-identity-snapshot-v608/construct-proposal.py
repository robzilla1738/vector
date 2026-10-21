from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent
patches={
'chrome/browser/sessions/session_service_base.cc':[
('#include "chrome/browser/buildflags.h"','#include "chrome/browser/buildflags.h"\n#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)\n#include "chrome/browser/ui/aux/page_identity.h"\n#endif'),
('''  SetTabWindow(session_tab_helper->window_id(),
               session_tab_helper->session_id());''','''  SetTabWindow(session_tab_helper->window_id(),
               session_tab_helper->session_id());
#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)
  // A page may have acquired its draft identity before its window was tracked.
  // Re-emit the live identity on tracked insertion/move, independent of the
  // PageIdentity incremental-write cache.
  if (const auto* identity = aux::PageIdentity::FromWebContents(contents)) {
    ScheduleCommand(sessions::CreateAddTabExtraDataCommand(
        session_tab_helper->session_id(), "aux.page_id", identity->id()));
  }
#endif'''),
('''  command_storage_manager()->AppendRebuildCommand(
      sessions::CreateSetTabWindowCommand(window_id, session_id));''','''  command_storage_manager()->AppendRebuildCommand(
      sessions::CreateSetTabWindowCommand(window_id, session_id));
#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)
  // A snapshot reset clears incremental commands. Serialize the actual live
  // identity into the rebuilt session instead of relying on Persist() again.
  if (const auto* identity = aux::PageIdentity::FromWebContents(tab)) {
    command_storage_manager()->AppendRebuildCommand(
        sessions::CreateAddTabExtraDataCommand(
            session_id, "aux.page_id", identity->id()));
  }
#endif''')],
'chrome/browser/sessions/BUILD.gn':[
('''  if (enable_aux_browser && is_mac) {
    deps += [ "//chrome/browser/ui/tabs:aux_bookmark_tab_representation" ]
  }''','''  if (enable_aux_browser && is_mac) {
    deps += [ "//chrome/browser/ui/tabs:aux_bookmark_tab_representation" ]
  }
  if (enable_aux_browser || enable_aux_shell) {
    deps += [ "//chrome/browser/aux:page_identity" ]
  }''')]
}
patches['chrome/browser/ui/browser_live_tab_context.cc'] = [
 ('#include "chrome/browser/buildflags.h"', '#include "chrome/browser/buildflags.h"\n#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)\n#include "chrome/browser/ui/aux/page_identity.h"\n#endif'),
 ('  std::map<std::string, std::string> extra_data;\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)', '  std::map<std::string, std::string> extra_data;\n#if BUILDFLAG(ENABLE_AUX_BROWSER) || BUILDFLAG(ENABLE_AUX_SHELL)\n  if (const auto* identity = aux::PageIdentity::FromWebContents(\n          tab_strip_model_->GetWebContentsAt(index))) {\n    extra_data["aux.page_id"] = identity->id();\n  }\n#endif\n#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)')]
records=[];diff=[]
for rel,edits in patches.items():
 s=(root/rel).read_text();t=s
 for a,b in edits:
  assert t.count(a)==1,(rel,a,t.count(a));t=t.replace(a,b)
 p=out/'sources'/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t)
 records.append({'path':rel,'baselineSha256':hashlib.sha256(s.encode()).hexdigest(),'outputSha256':hashlib.sha256(t.encode()).hexdigest(),'anchors':[{'count':1,'findSha256':hashlib.sha256(a.encode()).hexdigest()} for a,b in edits]})
 diff+=list(difflib.unified_diff(s.splitlines(True),t.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel))
(out/'files.json').write_text(json.dumps({'baseComposition':'v608-final','files':records},indent=2)+'\n');(out/'native.patch').write_text(''.join(diff))
