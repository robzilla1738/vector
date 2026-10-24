// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ROUTING_ROUTING_SERVICE_H_
#define CHROME_BROWSER_AUX_ROUTING_ROUTING_SERVICE_H_
#include <string>
#include "base/functional/callback.h"
#include "base/values.h"
#include "url/gurl.h"
class Profile;
namespace aux::routing {
inline constexpr char kRulesPref[] = "aux.routing.rules";
inline constexpr char kProfileIndexPref[] = "aux.routing.profile_index";
// Local State dictionaries, never syncable. Native startup calls RememberProfile
// only after ordinary profile admission. No renderer can provide a filesystem path.
void RememberProfile(Profile*);
base::DictValue GetState(Profile*);
base::DictValue ReplaceRules(Profile*, const std::string& expected_revision,
                            const base::DictValue& configuration);
// CLI calls use kCurrentProfile: the authenticated bridge has authority only for
// its bound profile. Native external receipt uses kExternal; never use it from JS.
enum class Authority { kCurrentProfile, kExternal };
struct Intent {
  GURL url;
  std::string profile;  // Exact UUID or unambiguous native display name.
  std::string space;    // Exact UUID or unambiguous name in the selected profile.
  Authority authority = Authority::kCurrentProfile;
};
base::DictValue Resolve(Profile*, const Intent&);
// No match => handled:false, original native opener continues. Any matched but
// refused target => handled:true, ok:false: caller displays error and MUST NOT
// fall through to opening the URL in another profile. Open never retries an
// issued navigation. Profiles/windows are created only through native APIs.
void Open(Profile*, Intent, base::OnceCallback<void(base::DictValue)>);
}  // namespace aux::routing
#endif
