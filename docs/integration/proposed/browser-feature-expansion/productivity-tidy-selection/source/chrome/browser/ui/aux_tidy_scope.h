#ifndef CHROME_BROWSER_UI_AUX_TIDY_SCOPE_H_
#define CHROME_BROWSER_UI_AUX_TIDY_SCOPE_H_
#include <cstddef>
#include <string>
#include "base/values.h"
class BrowserWindowInterface;
class Profile;
bool CanCreateAuxTidyScope(BrowserWindowInterface* browser);
size_t GetAuxTidySelectedCount(BrowserWindowInterface* browser);
std::string CreateAuxTidyScope(BrowserWindowInterface* browser, bool selected);
BrowserWindowInterface* GetAuxTidyScopeBrowser(Profile* profile, const std::string& token);
base::DictValue ConstrainAuxTidySnapshot(Profile* profile, const std::string& token,
                                        base::DictValue snapshot);
#endif
