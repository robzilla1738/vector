#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_CLONE_PHOTO_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_CLONE_PHOTO_H_
class Profile;
class ProfileAttributesEntry;
namespace aux_import {
struct ChromiumClonePhoto;
// Original4257a48..4257c7c: actual NSImage decode and profile/attribute prefs.
void ApplyChromiumClonePhoto(Profile& profile, ProfileAttributesEntry& entry,
                             const ChromiumClonePhoto& photo);
}  // namespace aux_import
#endif
