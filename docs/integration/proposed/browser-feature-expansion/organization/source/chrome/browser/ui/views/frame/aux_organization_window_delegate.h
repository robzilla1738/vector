// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_WINDOW_DELEGATE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_WINDOW_DELEGATE_H_
#include <string>
#include "base/callback_list.h"
#include "base/functional/callback.h"
namespace aux {
// Implemented by the actual browser-window owner. Spaces and selected views
// remain window-local; the profile organization service owns logical records.
class OrganizationWindowDelegate {
 public:
  virtual ~OrganizationWindowDelegate() = default;
  virtual std::string ActiveSpaceId() const = 0;
  virtual std::string SelectedLogicalTabId() const = 0;
  virtual bool SelectSpace(const std::string& id) = 0;
  virtual void OpenLogicalTab(const std::string& id,
                              base::OnceCallback<void(bool)> reply) = 0;
  // This is an unload request, never authority to discard protected work.
  virtual void UnloadLogicalTab(const std::string& id,
                                base::OnceCallback<void(bool)> reply) = 0;
  virtual void ArchiveLogicalEntry(const std::string& id,
                                   base::OnceCallback<void(bool)> reply) = 0;
  virtual base::CallbackListSubscription ObserveWindowState(
      base::RepeatingClosure callback) = 0;
};
}  // namespace aux
#endif
