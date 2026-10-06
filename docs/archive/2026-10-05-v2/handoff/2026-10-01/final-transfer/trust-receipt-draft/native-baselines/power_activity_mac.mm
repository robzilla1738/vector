#include "chrome/browser/ui/aux/power_activity_mac.h"
#import <Foundation/Foundation.h>
#import <ServiceManagement/ServiceManagement.h>
#include <IOKit/ps/IOPowerSources.h>
#include <IOKit/ps/IOPSKeys.h>
#include "base/apple/scoped_cftyperef.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/strings/sys_string_conversions.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/profile_prefs.h"
#include "components/prefs/pref_service.h"
#include "components/prefs/pref_change_registrar.h"
namespace aux {
namespace {
bool OnAC() {
  base::apple::ScopedCFTypeRef<CFTypeRef> info(IOPSCopyPowerSourcesInfo());
  if (!info) return false;
  CFStringRef source = IOPSGetProvidingPowerSourceType(info.get());
  return source && CFEqual(source, CFSTR(kIOPSACPowerValue));
}
}
struct PowerActivityMac::Impl {
  explicit Impl(Profile* value) : profile(value) {
    preferences.Init(profile->GetPrefs());
    preferences.Add(kKeepRuntimeInBackgroundPref, base::BindRepeating(&Impl::Check, base::Unretained(this)));
    power_source.reset(IOPSNotificationCreateRunLoopSource([](void* context) {
      static_cast<Impl*>(context)->Check();
    }, this));
    if (power_source) CFRunLoopAddSource(CFRunLoopGetMain(), power_source.get(), kCFRunLoopCommonModes);
  }
  ~Impl() {
    if (power_source) CFRunLoopRemoveSource(CFRunLoopGetMain(), power_source.get(), kCFRunLoopCommonModes);
    preferences.RemoveAll(); End();
  }
  void Check() {
    if (!OnAC() || profile->IsOffTheRecord() || !profile->GetPrefs()->GetBoolean(kKeepRuntimeInBackgroundPref)) End();
  }
  void End() {
    timer.Stop();
    if (activity) [[NSProcessInfo processInfo] endActivity:activity];
    activity = nil;
  }
  raw_ptr<Profile> profile;
  id<NSObject> __strong activity = nil;
  base::OneShotTimer timer;
  PrefChangeRegistrar preferences;
  base::apple::ScopedCFTypeRef<CFRunLoopSourceRef> power_source;
};
PowerActivityMac::PowerActivityMac(Profile* profile) : impl_(std::make_unique<Impl>(profile)) {}
PowerActivityMac::~PowerActivityMac() = default;
void PowerActivityMac::End() { impl_->End(); }
base::DictValue PowerActivityMac::Status() const {
  impl_->Check();
  base::DictValue result;
  result.Set("onAC", OnAC());
  result.Set("backgroundEnabled", !impl_->profile->IsOffTheRecord() && impl_->profile->GetPrefs()->GetBoolean(kKeepRuntimeInBackgroundPref));
  result.Set("active", impl_->activity != nil);
  std::string login_status = "unavailable";
  if (@available(macOS 13.0, *)) {
    switch ([SMAppService mainAppService].status) {
      case SMAppServiceStatusNotRegistered: login_status = "not_registered"; break;
      case SMAppServiceStatusEnabled: login_status = "enabled"; break;
      case SMAppServiceStatusRequiresApproval: login_status = "requires_approval"; break;
      case SMAppServiceStatusNotFound: login_status = "not_found"; break;
    }
  }
  result.Set("loginItem", login_status);
  return result;
}
base::DictValue PowerActivityMac::Begin(const std::string& reason, int duration_sec) {
  base::DictValue result;
  if (impl_->profile->IsOffTheRecord() || !impl_->profile->GetPrefs()->GetBoolean(kKeepRuntimeInBackgroundPref) || !OnAC()) {
    impl_->End(); result.Set("active", false); result.Set("reason", "Night shift requires AC power and this Profile's background mode."); return result;
  }
  impl_->End();
  impl_->activity = [[NSProcessInfo processInfo] beginActivityWithOptions:NSActivityIdleSystemSleepDisabled reason:base::SysUTF8ToNSString(reason)];
  if (impl_->activity) impl_->timer.Start(FROM_HERE, base::Seconds(duration_sec), base::BindOnce(&Impl::End, base::Unretained(impl_.get())));
  result.Set("active", impl_->activity != nil);
  return result;
}
}
