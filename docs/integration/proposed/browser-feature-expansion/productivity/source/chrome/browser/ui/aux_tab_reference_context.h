#ifndef CHROME_BROWSER_UI_AUX_TAB_REFERENCE_CONTEXT_H_
#define CHROME_BROWSER_UI_AUX_TAB_REFERENCE_CONTEXT_H_

#include "base/values.h"
#include "base/functional/callback.h"
#include <string_view>

class Profile;
namespace content { class WebContents; class DevToolsAgentHost; }

// Caller must restrict access to the installed Aux extension. Neither a profile
// identifier nor a target ID supplied by a renderer establishes authority.
base::DictValue CaptureAuxTabReferences(content::WebContents* sender,
                                        const base::ListValue& references);
base::DictValue ValidateAuxTabReferences(content::WebContents* sender,
                                         const base::ListValue& references);

// Used only by the authenticated installed-Agent bridge. The capability still
// belongs to the original live composer document, not to this service worker.
base::DictValue ValidateAuxTabReferencesForProfile(Profile* profile,
                                                   const base::ListValue& references);
// Called on the UI sequence by the authenticated CDP session immediately before
// dispatch and again before returning data. No renderer-controlled profile ID.
base::RepeatingCallback<bool()> GetAuxTabDocumentGuard(
    content::DevToolsAgentHost* actual_target, std::string_view capability);

#endif
