// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_TABS_AUX_CHAT_TAB_ASSOCIATION_H_
#define CHROME_BROWSER_UI_TABS_AUX_CHAT_TAB_ASSOCIATION_H_
#include <optional>
#include <string>
#include "url/gurl.h"
namespace content { class WebContents; }
namespace aux {
// Original4637814/4637f20. Association for actual native Chats selection only;
// this does not confer agent-created ownership or authorize arbitrary tab close.
std::optional<std::string> ChatIdFromURL(const GURL& url, int account_id);
std::optional<std::string> ChatIdFromWebContents(content::WebContents& contents,
                                               int account_id);
GURL ChatURL(int account_id, const std::string& session_id);
}  // namespace aux
#endif
