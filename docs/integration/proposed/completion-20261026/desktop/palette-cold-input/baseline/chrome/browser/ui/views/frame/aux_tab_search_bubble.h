// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_

#include "base/functional/callback.h"
#include "base/values.h"
#include <optional>
#include <string_view>
class BrowserWindowInterface;
namespace content { class WebContents; }
namespace views {
class View;
class Widget;
}

// Original BrowserView45b63c0/45b64b0: actual installed Agent selects its
// persistent native search owner; absent Agent uses the stock search host.
// Anchor does not replace the original centered browser-window geometry.
void ToggleAuxProfileSearch(BrowserWindowInterface* browser, views::View* anchor);
void CloseAuxProfileSearch(BrowserWindowInterface* browser);
// The existing search surface owns all modes. Merely showing it creates no tab.
enum class AuxCommandBarMode { kSearchTabs, kNewTab, kNavigate, kCommands, kTidy };
bool ShowAuxCommandBar(BrowserWindowInterface* browser, AuxCommandBarMode mode);
// Only the actual current search WebContents may use these methods. Context
// tokens expire on hide, navigation, active-view/profile change or replacement.
base::DictValue GetAuxCommandContext(content::WebContents* sender);
void CommitAuxCommandAsync(content::WebContents* sender, const base::DictValue& request,
                           base::OnceCallback<void(base::DictValue)> reply);
// Caller validates current native organization owner/revision/account before show.
bool ShowAuxOrganizationProposal(BrowserWindowInterface* browser,
                                 base::DictValue proposal);
std::optional<base::DictValue> GetAuxOrganizationProposal(
    content::WebContents* sender, std::string_view proposal_id);
bool ConsumeAuxOrganizationProposal(content::WebContents* sender,
                                    std::string_view proposal_id);
base::DictValue CommitAuxCommand(content::WebContents* sender,
                                const base::DictValue& request);
// Original search WebContents user data retains a weak actual window. It does
// not infer another window by profile or fabricate a tab association.
BrowserWindowInterface* GetAuxProfileSearchBrowser(content::WebContents* contents);

// Historical caller API, now opens the SAME real owner without a replacement
// Checking/Unlock page. on_closed runs on actual hide, not synthetic success.
views::Widget* ShowAuxTabSearchBubble(BrowserWindowInterface* browser,
                                     views::View* anchor,
                                     base::OnceClosure on_closed);
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_
