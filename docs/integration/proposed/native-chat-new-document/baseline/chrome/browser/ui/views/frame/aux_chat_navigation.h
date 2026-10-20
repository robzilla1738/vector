// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_NAVIGATION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_NAVIGATION_H_
class BrowserWindowInterface;
class Profile;
namespace aux {
// Original nonnegative account pref, then stored display-order profile index,
// then zero. This route selection is not an authorization or Vault bypass.
int ChatAccountForProfile(Profile& profile);
bool CanOpenNewChat(BrowserWindowInterface& browser);
void OpenNewChat(BrowserWindowInterface& browser);
}  // namespace aux
#endif
