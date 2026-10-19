// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_DEVTOOLS_PROTOCOL_BROWSER_HANDLER_H_
#define CHROME_BROWSER_DEVTOOLS_PROTOCOL_BROWSER_HANDLER_H_

#include "base/containers/flat_set.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/devtools/protocol/browser.h"

class BrowserHandler : public protocol::Browser::Backend {
 public:
  BrowserHandler(protocol::UberDispatcher* dispatcher,
                 const std::string& target_id,
                 bool authenticated_remote_debugging = false);

  BrowserHandler(const BrowserHandler&) = delete;
  BrowserHandler& operator=(const BrowserHandler&) = delete;

  ~BrowserHandler() override;

  // Browser::Backend:
  void EnsureProfile(int profile_index, std::optional<bool> should_focus,
                     std::optional<std::string> url,
                     std::unique_ptr<EnsureProfileCallback> callback) override;
  protocol::Response GetWindowForTarget(
      std::optional<std::string> target_id,
      int* out_window_id,
      std::unique_ptr<protocol::Browser::Bounds>* out_bounds) override;
  protocol::Response GetWindowBounds(
      int window_id,
      std::unique_ptr<protocol::Browser::Bounds>* out_bounds) override;
  protocol::Response Close() override;
  protocol::Response SetWindowBounds(
      int window_id,
      std::unique_ptr<protocol::Browser::Bounds> window_bounds) override;
  protocol::Response SetContentsSize(int window_id,
                                     std::optional<int> width,
                                     std::optional<int> height) override;
  protocol::Response SetDockTile(
      std::optional<std::string> label,
      std::optional<protocol::Binary> image) override;
  protocol::Response ExecuteBrowserCommand(
      const protocol::Browser::BrowserCommandId& command_id) override;
  protocol::Response AddPrivacySandboxEnrollmentOverride(
      const std::string& in_url) override;

 private:
  base::flat_set<std::string> contexts_with_overridden_permissions_;
  std::string target_id_;
  const bool authenticated_remote_debugging_;
  base::WeakPtrFactory<BrowserHandler> weak_factory_{this};
};

#endif  // CHROME_BROWSER_DEVTOOLS_PROTOCOL_BROWSER_HANDLER_H_
