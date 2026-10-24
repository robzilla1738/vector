// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_TREE_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_ORGANIZATION_TREE_VIEW_H_
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>
#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/aux/organization/organization_model.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/view.h"
class BrowserWindowInterface;
namespace views { class Label; class LabelButton; class MenuRunner; }
namespace aux {
class OrganizationWindowDelegate;
class OrganizationTreeRow;
// Logical records use existing bookmark row metrics/glyphs; no BookmarkModel
// nodes are invented and no inactive window's WebContents is borrowed.
class AuxOrganizationTreeView final : public views::View,
                                      public ui::SimpleMenuModel::Delegate {
  METADATA_HEADER(AuxOrganizationTreeView, views::View)
 public:
  enum class Scope { kActiveSpace, kPinnedFolders };
  AuxOrganizationTreeView(BrowserWindowInterface&, OrganizationWindowDelegate&, Scope);
  ~AuxOrganizationTreeView() override;
  void Refresh();
  bool ready() const { return ready_; }
  void SetReadyChangedCallback(base::RepeatingCallback<void(bool)>);
  void NewFolder();
  void ExecuteCommand(int command_id, int event_flags) override;
  bool IsCommandIdEnabled(int command_id) const override;
  bool IsCommandIdChecked(int command_id) const override;
 private:
  friend class OrganizationTreeRow;
  void Bind();
  void QueueRefresh();
  void Activate(const std::string&);
  void ContextMenu(const std::string&, const gfx::Point& screen_point);
  bool Key(const std::string&, const ui::KeyEvent&);
  void BeginDrag(const std::string&, const gfx::Point&);
  void ContinueDrag(const gfx::Point&);
  void FinishDrag();
  void CancelDrag();
  void Rename(const std::string&, bool create_child);
  void Move(const std::string&, const std::string& space, const std::string& parent,
            uint64_t index, std::optional<organization::Context> captured = {});
  void Apply(organization::Command, std::optional<organization::Context> captured = {});
  void Status(std::u16string);
  const organization::Snapshot* Snapshot() const;
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ref<OrganizationWindowDelegate> window_;
  const Scope scope_;
  raw_ptr<views::View> rows_ = nullptr;
  raw_ptr<views::Label> status_ = nullptr;
  raw_ptr<views::LabelButton> archive_toggle_ = nullptr;
  bool archive_mode_ = false;
  std::map<std::string, raw_ptr<OrganizationTreeRow>> row_by_id_;
  std::vector<std::string> visible_;
  base::CallbackListSubscription ready_subscription_, changes_, window_changes_;
  base::RepeatingCallback<void(bool)> ready_changed_;
  bool ready_ = false;
  bool refresh_queued_ = false;
  struct Drag {
    std::string id, target;
    gfx::Point origin;
    organization::Context context;
    bool moved = false;
    bool after = false;
  };
  std::optional<Drag> drag_;
  std::string menu_entry_;
  std::optional<organization::Context> menu_context_;
  std::vector<std::pair<std::string, std::string>> move_targets_;
  std::unique_ptr<ui::SimpleMenuModel> menu_, move_menu_;
  std::unique_ptr<views::MenuRunner> runner_;
  std::string undo_token_;
  base::WeakPtrFactory<AuxOrganizationTreeView> weak_{this};
};
}  // namespace aux
#endif
