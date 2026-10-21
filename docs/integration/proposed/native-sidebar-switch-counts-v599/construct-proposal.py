from pathlib import Path
import json,hashlib,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');out=Path(__file__).resolve().parent;out.mkdir(parents=True,exist_ok=True)
p='chrome/browser/ui/views/frame/aux_sidebar_body.cc';old=(root/p).read_text();s=old;edits=[]
def edit(a,b):
 global s
 assert s.count(a)==1,(a[:80],s.count(a));s=s.replace(a,b);edits.append({'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
edit('#include "base/check.h"','#include "base/check.h"\n#include "base/logging.h"\n#include "base/task/single_thread_task_runner.h"\n#include "chrome/browser/ui/views/tabs/common/tab_collection_node.h"\n#include "chrome/browser/ui/tabs/aux_chat_tab_owner.h"\n#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"')
edit('''  if (strip_ && !body_) Build();
}
void AuxSidebarBody::Changed()''','''  if (strip_ && !body_) Build();
  const auto diagnose = [](base::WeakPtr<AuxSidebarBody> self,
                           uint64_t expected_generation, int phase) {
    if (!self || self->paused_ || self->retiring_ || !self->body_ ||
        !self->strip_ || expected_generation != self->generation_) return;
    auto* model = self->browser_->GetTabStripModel();
    auto* root = self->strip_->collection_node();
    if (!model || !root) return;
    int nodes = 0, views = 0, visible = 0, drawn = 0, positive_height = 0;
    const auto visit = [&](const auto& recurse, const TabCollectionNode& node) -> void {
      if (node.type() == TabCollectionNode::Type::TAB) {
        ++nodes;
        if (auto* view = node.view()) {
          ++views;
          visible += view->GetVisible();
          drawn += view->IsDrawn();
          positive_height += view->height() > 0;
        }
      }
      for (const auto& child : node.children()) recurse(recurse, *child);
    };
    visit(visit, *root);
    int pin_excluded = 0, new_chat_excluded = 0, bookmark_excluded = 0;
    int chat_excluded = 0, agent_excluded = 0, ordinary = 0;
    auto& tasks = self->chats_->tabs();
    auto* prefs = self->browser_->GetProfile()->GetPrefs();
    constexpr char bookmark_pref[] = "aside.vertical_tabs.bookmarks_section_enabled";
    const bool bookmarks_enabled = !prefs->FindPreference(bookmark_pref) ||
        prefs->GetBoolean(bookmark_pref);
    for (int i = 0; i < model->count(); ++i) {
      auto* tab = model->GetTabAtIndex(i);
      const auto handle = tab->GetHandle();
      const bool associated = tasks.Association(handle).has_value();
      // Match the actual first-exclusion order, read-only; no URL inference.
      if (self->saved_->RepresentsTab(*tab)) { ++pin_excluded; continue; }
      if (!associated && tasks.represented_new_chat() == handle) {
        ++new_chat_excluded; continue;
      }
      if (bookmarks_enabled && !tab->IsPinned() && !tab->GetSplit() &&
          !tasks.split_handles().contains(handle) && !associated &&
          self->associations_->entries().contains(handle)) {
        ++bookmark_excluded; continue;
      }
      if (!tab->IsPinned() && !tab->GetSplit() && self->chats_->agent_installed() &&
          !tasks.split_handles().contains(handle) &&
          !tasks.ordinary_chat_tab_handles().contains(handle) && associated) {
        ++chat_excluded; continue;
      }
      if (self->agent_->RepresentsTab(*tab)) { ++agent_excluded; continue; }
      ++ordinary;
    }
    auto* active = model->GetActiveTab();
    auto* active_node = active ? root->GetNodeForHandle(active->GetHandle()) : nullptr;
    auto* active_view = active_node ? active_node->view() : nullptr;
    LOG(ERROR) << "Aux sidebar switch counts phase=" << phase
               << " model=" << model->count() << " nodes=" << nodes
               << " views=" << views << " visible=" << visible
               << " drawn=" << drawn << " positive-height=" << positive_height
               << " active-node=" << bool(active_node)
               << " active-visible=" << (active_view && active_view->GetVisible())
               << " active-drawn=" << (active_view && active_view->IsDrawn())
               << " active-height=" << (active_view ? active_view->height() : -1)
               << " strip-height=" << self->strip_->height()
               << " body-height=" << self->body_->height()
               << " excluded-pin=" << pin_excluded
               << " excluded-new-chat=" << new_chat_excluded
               << " excluded-bookmark=" << bookmark_excluded
               << " excluded-chat=" << chat_excluded
               << " excluded-agent=" << agent_excluded
               << " ordinary=" << ordinary;
  };
  diagnose(weak_.GetWeakPtr(), generation, 0);
  // Observe the queued state without forcing layout or repaint. Phase1 is not
  // a claim that animation/layout has completed; it is one bounded snapshot.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(diagnose, weak_.GetWeakPtr(), generation, 1));
}
void AuxSidebarBody::Changed()''')
dest=out/'sources'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(s)
(out/'native.patch').write_text(''.join(difflib.unified_diff(old.splitlines(True),s.splitlines(True),fromfile='a/'+p,tofile='b/'+p)))
(out/'files.json').write_text(json.dumps({'baseComposition':'v599','files':[{'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(s.encode()).hexdigest()}],'edits':edits},indent=2)+'\n')
