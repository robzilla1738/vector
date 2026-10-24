#ifndef CHROME_BROWSER_UI_AUX_TAB_REFERENCE_CONTEXT_H_
#define CHROME_BROWSER_UI_AUX_TAB_REFERENCE_CONTEXT_H_

#include "base/values.h"

namespace content { class WebContents; }

// Caller must restrict access to the installed Aux extension. Neither a profile
// identifier nor a target ID supplied by a renderer establishes authority.
base::DictValue CaptureAuxTabReferences(content::WebContents* sender,
                                        const base::ListValue& references);
base::DictValue ValidateAuxTabReferences(content::WebContents* sender,
                                         const base::ListValue& references);

#endif
