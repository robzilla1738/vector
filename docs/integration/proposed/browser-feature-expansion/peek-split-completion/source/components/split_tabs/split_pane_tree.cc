// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/split_tabs/split_pane_tree.h"

#include <algorithm>
#include <cmath>
#include <functional>
#include <limits>
#include <set>
#include <utility>

namespace split_tabs {
namespace {
bool ValidRatio(double ratio) {
  return std::isfinite(ratio) && ratio >= 0.05 && ratio <= 0.95;
}
}  // namespace

SplitPaneTree::SplitPaneTree() = default;
SplitPaneTree::~SplitPaneTree() = default;
SplitPaneTree::SplitPaneTree(const SplitPaneTree&) = default;
SplitPaneTree& SplitPaneTree::operator=(const SplitPaneTree&) = default;
SplitPaneTree::SplitPaneTree(SplitPaneTree&&) noexcept = default;
SplitPaneTree& SplitPaneTree::operator=(SplitPaneTree&&) noexcept = default;

SplitPaneTree SplitPaneTree::Pair(Axis axis, double ratio) {
  SplitPaneTree tree;
  tree.root_ = 1;
  tree.nodes_ = {{1, 0, axis, 2, 3, ValidRatio(ratio) ? ratio : 0.5},
                 {2, 1}, {3, 2}};
  tree.pane_slots_ = {1, 2};
  return tree;
}

std::optional<SplitPaneTree> SplitPaneTree::Decode(
    uint32_t root, std::vector<Node> nodes,
    std::vector<uint32_t> pane_slots) {
  SplitPaneTree tree;
  tree.root_ = root;
  tree.nodes_ = std::move(nodes);
  tree.pane_slots_ = std::move(pane_slots);
  if (!tree.IsValid()) {
    return std::nullopt;
  }
  return tree;
}

const SplitPaneTree::Node* SplitPaneTree::Find(uint32_t id) const {
  auto found = std::ranges::find(nodes_, id, &Node::id);
  return found == nodes_.end() ? nullptr : &*found;
}

bool SplitPaneTree::IsValid() const {
  if (pane_slots_.empty() || pane_slots_.size() > kMaxPanes ||
      nodes_.size() != pane_slots_.size() * 2 - 1 || !root_) {
    return false;
  }
  std::set<uint32_t> ids;
  for (const Node& node : nodes_) {
    if (!node.id || !ids.insert(node.id).second || !std::isfinite(node.ratio) ||
        (node.axis != Axis::kHorizontal && node.axis != Axis::kVertical)) {
      return false;
    }
  }
  std::set<uint32_t> visited;
  std::set<uint32_t> slots;
  std::function<bool(uint32_t)> visit = [&](uint32_t id) {
    const Node* node = Find(id);
    if (!node || !visited.insert(id).second) {
      return false;
    }
    if (node->slot) {
      return !node->first && !node->second &&
             slots.insert(node->slot).second;
    }
    return ValidRatio(node->ratio) && node->first && node->second &&
           visit(node->first) && visit(node->second);
  };
  if (!visit(root_) || visited.size() != nodes_.size()) {
    return false;
  }
  const std::set<uint32_t> ordered(pane_slots_.begin(), pane_slots_.end());
  return ordered.size() == pane_slots_.size() && ordered == slots;
}

bool SplitPaneTree::SplitLeaf(uint32_t slot, uint32_t new_slot,
                              Axis axis, bool before) {
  if (!slot || !IsValid() || pane_slots_.size() == kMaxPanes || !new_slot ||
      std::ranges::find(pane_slots_, new_slot) != pane_slots_.end() ||
      (axis != Axis::kHorizontal && axis != Axis::kVertical)) {
    return false;
  }
  auto leaf = std::ranges::find(nodes_, slot, &Node::slot);
  if (leaf == nodes_.end()) {
    return false;
  }
  uint32_t next_id = 0;
  for (const Node& node : nodes_) {
    next_id = std::max(next_id, node.id);
  }
  if (next_id > std::numeric_limits<uint32_t>::max() - 2) {
    return false;
  }
  const uint32_t old_leaf = next_id + 1;
  const uint32_t new_leaf = next_id + 2;
  *leaf = {leaf->id, 0, axis, before ? new_leaf : old_leaf,
            before ? old_leaf : new_leaf, 0.5};
  nodes_.push_back({old_leaf, slot});
  nodes_.push_back({new_leaf, new_slot});
  auto position = std::ranges::find(pane_slots_, slot);
  pane_slots_.insert(before ? position : std::next(position), new_slot);
  return true;
}

bool SplitPaneTree::RemoveLeaf(uint32_t slot) {
  if (!slot || !IsValid() || pane_slots_.size() == 1) {
    return false;
  }
  const auto leaf = std::ranges::find(nodes_, slot, &Node::slot);
  if (leaf == nodes_.end()) {
    return false;
  }
  const uint32_t leaf_id = leaf->id;
  const auto parent = std::ranges::find_if(nodes_, [leaf_id](const Node& node) {
    return node.first == leaf_id || node.second == leaf_id;
  });
  if (parent == nodes_.end()) {
    return false;
  }
  const uint32_t parent_id = parent->id;
  const uint32_t sibling = parent->first == leaf_id ? parent->second : parent->first;
  for (Node& node : nodes_) {
    if (node.first == parent_id) node.first = sibling;
    if (node.second == parent_id) node.second = sibling;
  }
  if (root_ == parent_id) root_ = sibling;
  std::erase_if(nodes_, [leaf_id, parent_id](const Node& node) {
    return node.id == leaf_id || node.id == parent_id;
  });
  std::erase(pane_slots_, slot);
  return true;
}

bool SplitPaneTree::ResizeBranch(uint32_t id, double ratio) {
  if (!ValidRatio(ratio)) return false;
  auto node = std::ranges::find(nodes_, id, &Node::id);
  if (node == nodes_.end() || node->slot) return false;
  node->ratio = ratio;
  return true;
}

bool SplitPaneTree::SwapBranch(uint32_t id) {
  auto node = std::ranges::find(nodes_, id, &Node::id);
  if (node == nodes_.end() || node->slot) return false;
  std::swap(node->first, node->second);
  node->ratio = 1.0 - node->ratio;
  return true;
}

bool SplitPaneTree::SetBranchAxis(uint32_t id, Axis axis) {
  if (axis != Axis::kHorizontal && axis != Axis::kVertical) return false;
  auto node = std::ranges::find(nodes_, id, &Node::id);
  if (node == nodes_.end() || node->slot) return false;
  node->axis = axis;
  return true;
}

bool SplitPaneTree::SetPaneOrder(std::vector<uint32_t> order) {
  const std::set<uint32_t> previous(pane_slots_.begin(), pane_slots_.end());
  const std::set<uint32_t> proposed(order.begin(), order.end());
  if (order.size() != pane_slots_.size() || proposed != previous) return false;
  pane_slots_ = std::move(order);
  return true;
}

SplitPaneTree::Rect SplitPaneTree::MinimumBounds(int divider, int minimum) const {
  if (!IsValid()) return {};
  divider = std::clamp(divider, 0, 64);
  minimum = std::clamp(minimum, 0, 10000);
  std::function<Rect(uint32_t)> measure = [&](uint32_t id) -> Rect {
    const Node& node = *Find(id);
    if (node.slot) return {0, 0, minimum, minimum};
    const auto first = measure(node.first);
    const auto second = measure(node.second);
    return node.axis == Axis::kHorizontal
        ? Rect{0, 0, first.width + second.width + divider,
               std::max(first.height, second.height)}
        : Rect{0, 0, std::max(first.width, second.width),
               first.height + second.height + divider};
  };
  return measure(root_);
}

std::vector<SplitPaneTree::Placement> SplitPaneTree::Layout(
    Rect bounds, int divider, int minimum) const {
  std::vector<Placement> result;
  if (!IsValid() || bounds.width < 0 || bounds.height < 0) return result;
  divider = std::clamp(divider, 0, 64);
  minimum = std::clamp(minimum, 0, 10000);
  std::function<std::pair<int, int>(uint32_t)> min_size = [&](uint32_t id) {
    const Node& node = *Find(id);
    if (node.slot) return std::pair(minimum, minimum);
    auto first = min_size(node.first);
    auto second = min_size(node.second);
    return node.axis == Axis::kHorizontal
      ? std::pair(first.first + second.first + divider, std::max(first.second, second.second))
      : std::pair(std::max(first.first, second.first), first.second + second.second + divider);
  };
  std::function<void(uint32_t, Rect)> layout = [&](uint32_t id, Rect rect) {
    const Node& node = *Find(id);
    if (node.slot) {
      result.push_back({id, node.slot, node.axis, rect, rect});
      return;
    }
    const bool horizontal = node.axis == Axis::kHorizontal;
    const int extent = horizontal ? rect.width : rect.height;
    const int gap = std::min(extent, divider);
    const int usable = extent - gap;
    const auto first_min = min_size(node.first);
    const auto second_min = min_size(node.second);
    int low = horizontal ? first_min.first : first_min.second;
    int high = horizontal ? second_min.first : second_min.second;
    if (low + high > usable) {
      low = low + high == 0 ? 0 : static_cast<int>(
          static_cast<int64_t>(usable) * low / (low + high));
      high = usable - low;
    }
    const int first_size = std::clamp(static_cast<int>(std::round(usable * node.ratio)), low, usable - high);
    Rect first = rect;
    Rect handle = rect;
    Rect second = rect;
    if (horizontal) {
      first.width = first_size;
      handle.x += first_size; handle.width = gap;
      second.x += first_size + gap; second.width = usable - first_size;
    } else {
      first.height = first_size;
      handle.y += first_size; handle.height = gap;
      second.y += first_size + gap; second.height = usable - first_size;
    }
    layout(node.first, first);
    result.push_back({id, 0, node.axis, handle, rect});
    layout(node.second, second);
  };
  layout(root_, bounds);
  return result;
}
}  // namespace split_tabs
