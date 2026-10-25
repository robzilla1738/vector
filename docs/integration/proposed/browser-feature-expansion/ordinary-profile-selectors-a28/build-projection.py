from pathlib import Path
import hashlib,json,difflib
n=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');r=Path(__file__).parent
rules={}
request='chrome/browser/ui/views/frame/aux_profile_switch_request.cc'
rules[request]=[('#include "chrome/browser/aux/profile_identity.h"','#include "chrome/browser/aux/profile_identity.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"'),('''  const uint64_t generation = state->BeginAuxProfileSwitchRequest();
  const auto source_weak = profile->GetWeakPtr();''','''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  const auto source_weak = profile->GetWeakPtr();
  const auto epoch = GetProfileCookieBindingEpoch(profile);
  if (epoch.empty() || IsProfileCookieRestorePending(profile) ||
      !CurrentSwitchWindow(sender_weak, source_weak)) {
    if (completion) std::move(completion).Run(nullptr);
    return;
  }
  // All ordinary selectors use the real isolated native-window path. Never
  // enter workspace capture or retarget this source's live profile services.
  profiles::SwitchToProfile(target, /*always_create=*/false,
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
          [](base::WeakPtr<BrowserWindowInterface> source_window,
             base::WeakPtr<Profile> source_profile, std::string source_epoch,
             base::FilePath selected_path, Completion done,
             BrowserWindowInterface* selected_window) {
            auto* result = static_cast<Browser*>(nullptr);
            const auto* selected_state = selected_window
                ? BrowserInitState::From(selected_window) : nullptr;
            if (CurrentSwitchWindow(source_window, source_profile) &&
                GetProfileCookieBindingEpoch(source_profile.get()) == source_epoch &&
                selected_window && selected_state &&
                !selected_state->is_aux_profile_switch_cache() &&
                selected_window->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
                selected_window->GetProfile() &&
                selected_window->GetProfile()->IsRegularProfile() &&
                !selected_window->GetProfile()->IsOffTheRecord() &&
                selected_window->GetProfile()->GetPath() == selected_path &&
                CurrentSwitchWindow(selected_window->GetWeakPtr(),
                    selected_window->GetProfile()->GetWeakPtr())) {
              result = static_cast<Browser*>(selected_window);
            }
            if (done) std::move(done).Run(result);
          }, sender_weak, source_weak, epoch, target, std::move(completion)),
          static_cast<BrowserWindowInterface*>(nullptr)));
  return;
#else
  const uint64_t generation = state->BeginAuxProfileSwitchRequest();
  const auto source_weak = profile->GetWeakPtr();'''),('''          static_cast<Profile*>(nullptr)));
}

void ProfileSwitchRequest::Complete''','''          static_cast<Profile*>(nullptr)));
#endif
}

void ProfileSwitchRequest::Complete''')]
preview='chrome/browser/ui/views/frame/aux_profile_preview_input.cc'
s=(n/preview).read_text();st=s.index('bool ProfilePreviewInput::Commit(');en=s.index('\nvoid ProfilePreviewInput::OnCommitted',st);old=s[st:en]
# Preserve the original algorithm verbatim in the supervised branch.
new=old.replace('''  auto alive = weak_factory_.GetWeakPtr();
  if (target != bound_target_) {''','''  auto alive = weak_factory_.GetWeakPtr();
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
  // Retire genuine borrowed views before selecting a separate native window.
  // Direct dots must not create a hidden in-place-switch workspace first.
  preview_->Cancel();
  if (!alive || !ValidSource()) return false;
  crossfading_ = false;
  ApplyContents(ContentsEffect::kClear);
  if (!alive || !ValidSource()) return false;
  committing_ = true;
  ProfileSwitchRequest::Dispatch(browser_, target, base::BindOnce(
      &ProfilePreviewInput::OnCommitted, weak_factory_.GetWeakPtr()));
  return true;
#else
  if (target != bound_target_) {''',1)
assert new.endswith('  return true;\n}');new=new[:-2]+'\n#endif\n}'
rules[preview]=[('#include "chrome/browser/browser_process.h"','#include "chrome/browser/browser_process.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"\n#include "chrome/browser/ui/views/frame/aux_profile_switch_request.h"'),(old,new)]
collection='chrome/browser/ui/browser_window/internal/profile_browser_collection.cc'
rules[collection]=[('#include "chrome/browser/profiles/profile.h"','#include "chrome/browser/profiles/profile.h"\n#include "chrome/browser/buildflags.h"\n#if BUILDFLAG(ENABLE_AUX_BROWSER)\n#include "chrome/browser/ui/browser_init_state.h"\n#endif'),('''    if (original && browser->GetProfile()->GetOriginalProfile() != original) {''','''#if BUILDFLAG(ENABLE_AUX_BROWSER)
    // Internal borrowed-view workspaces are not user-visible profile windows.
    const auto* state = BrowserInitState::From(browser);
    if (state && state->is_aux_profile_switch_cache()) return true;
#endif
    if (original && browser->GetProfile()->GetOriginalProfile() != original) {''')]
m={'format':'aux.native.counted-projection.v1','purpose':'Unify ordinary direct/profile/preview selectors on real isolated native windows, preserving source work','nativeRoot':str(n),'files':[]};patch=[]
for rel,edits in rules.items():
 b=(n/rel).read_text();s=b;a=[]
 for old,new in edits:
  assert s.count(old)==1,(rel,old[:50],s.count(old));s=s.replace(old,new,1);a.append({'before':old,'after':new,'expectedCount':1})
 o=r/'source'/rel;o.parent.mkdir(parents=True,exist_ok=True);o.write_text(s)
 sha=lambda s:hashlib.sha256(s.encode()).hexdigest();m['files'].append({'path':rel,'inputSha256':sha(b),'outputSha256':sha(s),'source':str(o),'anchors':a});patch.extend(difflib.unified_diff(b.splitlines(True),s.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0))
(r/'source-plan.json').write_text(json.dumps(m,indent=2)+'\n');(r/'ordinary-profile-selectors-a28.patch').write_text(''.join(patch));print(json.dumps([{k:f[k] for k in ['path','inputSha256','outputSha256']} for f in m['files']],indent=2))
