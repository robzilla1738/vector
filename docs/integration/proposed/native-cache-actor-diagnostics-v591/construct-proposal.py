from pathlib import Path
import hashlib,json,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent;out.mkdir(parents=True,exist_ok=True)
files={};edits=[]
def edit(p,a,b):
 if p not in files: files[p]=[(root/p).read_text(),(root/p).read_text()]
 old=files[p][1];assert old.count(a)==1,(p,a[:100],old.count(a));files[p][1]=old.replace(a,b);edits.append({'path':p,'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
def guard_method(p,name,marker,exprs,truth=True):
 # Wrap original operands, keeping exact left-to-right short-circuit order.
 s=files[p][1] if p in files else (root/p).read_text();start=s.index(marker);end=s.index('\n}',start)+2;old=s[start:end];new=old
 local='''
  const auto aux_guard = [](bool value, const char* name, unsigned int count = 0) {
    if (VALUE) {
      LOG(ERROR) << "Aux actor admission NAME." << name << " failed=1 count=" << count;
    }
    return value;
  };'''.replace('VALUE','!value' if truth else 'value').replace('NAME',name)
 new=new.replace('{','{'+local,1)
 for a,label,count in exprs:
  assert new.count(a)==1,(name,a,new.count(a));new=new.replace(a,'aux_guard('+a+', "'+label+'"'+(', '+count if count else '')+')',1)
 edit(p,old,new)
 return
p='chrome/browser/actor/ui/actor_ui_window_controller.cc'
guard_method(p,'container','bool ActorUiContentsContainerController::IsColdForAuxProfileSwitch() const {',[
 ('aux_profile_switch_prepared_','prepared',''),('aux_callback_depth_','callback-depth','aux_callback_depth_'),('aux_pending_notifications_','pending-notifications','aux_pending_notifications_'),('(overlay_ && !overlay_->CanRebindForAuxProfileSwitch())','overlay',''),('(handoff_button_controller_ &&\n       !handoff_button_controller_->IsColdForAuxProfileSwitch())','handoff',''),('contents != web_contents()','contents-observer-mismatch',''),('actual && actual->IsColdForAuxProfileSwitch()','tab-owner-or-state','')],False)
# Last container operand returns true for success, unlike rejecting branch operands.
a='return aux_guard(actual && actual->IsColdForAuxProfileSwitch(), "tab-owner-or-state");'
b='if (!actual) {\n      LOG(ERROR) << "Aux actor admission container.tab-owner-missing";\n      return false;\n    }\n    return actual->IsColdForAuxProfileSwitch();'
edit(p,a,b)
guard_method(p,'window','bool ActorUiWindowController::CanRebindForAuxProfileSwitch() const {',[
 ('aux_profile_switch_prepared_','prepared',''),('aux_callback_depth_','callback-depth','aux_callback_depth_'),('aux_pending_notifications_','pending-notifications','aux_pending_notifications_'),('is_omnibox_popup_open_','omnibox-open',''),('From(browser_window_interface_) != this','owner-mismatch',''),('browser_window_interface_->GetType() != BrowserWindowInterface::TYPE_NORMAL','window-type',''),('!browser_window_interface_->GetProfile()->IsRegularProfile()','nonregular-profile',''),('!model','model-missing',''),('model->profile() != browser_window_interface_->GetProfile()','model-profile-mismatch',''),('service && service->GetTaskFromTab(*tab)','tab-task',''),('!actual || !actual->IsColdForAuxProfileSwitch()','tab-owner-or-state','')],False)
p='chrome/browser/actor/ui/actor_ui_tab_controller.cc'
guard_method(p,'tab','bool ActorUiTabController::IsColdForAuxProfileSwitch() const {',[
 ('!aux_callback_depth_','callback-depth','aux_callback_depth_'),('!aux_pending_ui_work_','pending-ui-work','aux_pending_ui_work_'),('!update_scrim_background_debounce_timer_.IsRunning()','scrim-timer',''),('!is_overlay_hovered_','overlay-hover',''),('!should_show_scrim_background_','scrim-background',''),('current_ui_tab_state_ == UiTabState()','nondefault-state',''),('(!actor_keyed_service_ || !actor_keyed_service_->GetTaskFromTab(*tab_))','task','')])
p='chrome/browser/actor/ui/actor_overlay_web_view.cc'
guard_method(p,'overlay','bool ActorOverlayWebView::CanRebindForAuxProfileSwitch() const {',[
 ('!aux_callback_depth_','callback-depth','aux_callback_depth_'),('!web_contents()','web-contents',''),('!GetVisible()','visible',''),('!scoped_ignore_input_events_','input-blocker',''),('pending_webui_init_callbacks_.empty()','init-callbacks','static_cast<unsigned int>(pending_webui_init_callbacks_.size())')])
p='chrome/browser/actor/ui/handoff_button_controller.cc'
guard_method(p,'handoff','bool HandoffButtonController::IsColdForAuxProfileSwitch() const {',[
 ('!aux_callback_depth_','callback-depth','aux_callback_depth_'),('!widget_','widget',''),('!delegate_','delegate',''),('!button_view_','button-view',''),('!is_hovering_','hover',''),('!is_focused_','focus',''),('!view_observer_.IsObserving()','view-observation','')])
p='chrome/browser/ui/browser_window/internal/browser_window_features_aux_profile_switch.cc'
edit(p,'LOG(ERROR) << "Aux profile transition rejected: bindings.cache-actor.02";', 'LOG(ERROR) << "Aux profile transition rejected: bindings.cache-actor.02"\n                 << " cache=" << (cache == &previous_cache ? "source" : "target");')
for p in list(files):
 s=files[p][1]
 if '#include "base/logging.h"' not in s:
  pos=s.index('#include ');end=s.index('\n',pos)
  edit(p,s[pos:end],s[pos:end]+'\n#include "base/logging.h"')
patch='';metadata=[]
for p,(old,new) in files.items():
 target=out/'sources'/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(new)
 patch+=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+p,tofile='b/'+p))
 metadata.append({'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()})
(out/'native.patch').write_text(patch);(out/'files.json').write_text(json.dumps({'baseComposition':'v591','files':metadata,'edits':edits},indent=2)+'\n')
print(len(files),len(edits))
