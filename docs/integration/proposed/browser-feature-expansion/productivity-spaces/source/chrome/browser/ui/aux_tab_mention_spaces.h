#ifndef CHROME_BROWSER_UI_AUX_TAB_MENTION_SPACES_H_
#define CHROME_BROWSER_UI_AUX_TAB_MENTION_SPACES_H_
#include "base/values.h"
namespace content { class WebContents; }
// Installed-Agent primary-document caller and admitted Profile are additionally
// enforced by the extension wrapper. Metadata only; never opens unloaded pages.
base::DictValue GetAuxTabMentionSpaces(content::WebContents* sender);
base::DictValue CaptureAuxTabMentionSpace(content::WebContents* sender,
                                         const base::DictValue& request);
#endif
