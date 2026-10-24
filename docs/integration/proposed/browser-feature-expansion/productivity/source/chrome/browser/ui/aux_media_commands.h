#ifndef CHROME_BROWSER_UI_AUX_MEDIA_COMMANDS_H_
#define CHROME_BROWSER_UI_AUX_MEDIA_COMMANDS_H_
#include "base/values.h"
namespace content { class WebContents; }
base::DictValue GetAuxVideoPictureInPictureState(content::WebContents* contents);
base::DictValue ToggleAuxVideoPictureInPicture(content::WebContents* contents);
#endif
