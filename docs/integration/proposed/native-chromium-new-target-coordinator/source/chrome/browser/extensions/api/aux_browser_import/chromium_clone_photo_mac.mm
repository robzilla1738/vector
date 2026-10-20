#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_photo.h"
#import <AppKit/AppKit.h>
#include <utility>
#include "chrome/browser/browser_process.h"
#include "chrome/browser/extensions/api/aux_browser_import/chromium_clone_worker.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "ui/gfx/image/image.h"

namespace aux_import {
void ApplyChromiumClonePhoto(Profile& profile, ProfileAttributesEntry& entry,
                             const ChromiumClonePhoto& photo) {
  if (photo.bytes.empty())
    return;
  // Original accepts NSImage-supported bytes, not only an inferred PNG codec.
  NSData* data = [NSData dataWithBytes:photo.bytes.data()
                              length:photo.bytes.size()];
  NSImage* native_image = [[NSImage alloc] initWithData:data];
  if (!native_image)
    return;
  gfx::Image image(native_image);
  if (image.IsEmpty())
    return;
  entry.SetLastDownloadedGAIAPictureUrlWithSize(photo.url);
  entry.SetGAIAPicture(photo.url, std::move(image));
  // These true values are the supplied producer, not inferred from names.
  entry.SetIsUsingDefaultAvatar(true);
  entry.SetIsUsingGAIAPicture(true);
  profile.GetPrefs()->SetBoolean(prefs::kProfileUsingDefaultAvatar, true);
  profile.GetPrefs()->SetBoolean(prefs::kProfileUsingGAIAAvatar, true);
  if (g_browser_process->local_state())
    g_browser_process->local_state()->CommitPendingWrite();
  profile.GetPrefs()->CommitPendingWrite();
}
}  // namespace aux_import
