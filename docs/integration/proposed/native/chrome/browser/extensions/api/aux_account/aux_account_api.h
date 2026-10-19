// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_ACCOUNT_AUX_ACCOUNT_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_ACCOUNT_AUX_ACCOUNT_API_H_
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/values.h"
#include "chrome/browser/extensions/api/aux_common/aux_api.h"
#include "url/gurl.h"
namespace extensions {
base::ListValue ReadAuxProfileSecurity(base::FilePath home,
                                       base::ListValue profiles);
void FetchAuxProfileSecurity(base::FilePath home, base::ListValue profiles,
                            base::OnceCallback<void(base::ListValue)> done);
class AuxAccountFunction : public AuxFunction {
 protected:
  ~AuxAccountFunction() override = default;
  ResponseAction RunAux() override;

 private:
  void DidReadProfiles(base::ListValue profiles);
  void DidSign(std::optional<std::string> signature);
  void DidCheckRoute(base::FilePath path, GURL url, base::ListValue profiles);
};
#define AUX_ACCOUNT_FUNCTION(Class, Method, Histogram) \
  class Class final : public AuxAccountFunction {      \
   public:                                             \
    DECLARE_EXTENSION_FUNCTION(Method, Histogram)      \
   protected:                                          \
    ~Class() override = default;                       \
  };
AUX_ACCOUNT_FUNCTION(AuxAccountGetProfileContextFunction,
                     "auxAccount.getProfileContext",
                     AUXACCOUNT_GETPROFILECONTEXT)
AUX_ACCOUNT_FUNCTION(AuxAccountGetProfilesFunction,
                     "auxAccount.getProfiles",
                     AUXACCOUNT_GETPROFILES)
AUX_ACCOUNT_FUNCTION(AuxAccountOpenProfileRouteFunction,
                     "auxAccount.openProfileRoute",
                     AUXACCOUNT_OPENPROFILEROUTE)
AUX_ACCOUNT_FUNCTION(AuxAccountSignDaemonAuthChallengeFunction,
                     "auxAccount.signDaemonAuthChallenge",
                     AUXACCOUNT_SIGNDAEMONAUTHCHALLENGE)
#undef AUX_ACCOUNT_FUNCTION
}  // namespace extensions
#endif
