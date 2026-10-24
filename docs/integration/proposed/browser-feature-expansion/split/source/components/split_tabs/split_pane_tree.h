// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef COMPONENTS_SPLIT_TABS_SPLIT_PANE_TREE_H_
#define COMPONENTS_SPLIT_TABS_SPLIT_PANE_TREE_H_

#include <cstddef>
#include <cstdint>
#include <optional>
#include <vector>

namespace split_tabs {

// Native tab collections bind their ordering to pane_slots. Slot identities
// survive branch edits; they are not current tab indexes or URLs.
class SplitPaneTree {
 public:
  static constexpr size_t kMaxPanes = 8;
  enum class Axis { kHorizontal, kVertical };
  struct Node {
    uint32_t id = 0;
    uint32_t slot = 0;  // Nonzero only for leaves.
    Axis axis = Axis::kHorizontal;
    uint32_t first = 0;
    uint32_t second = 0;
    double ratio = 0.5;
    friend bool operator==(const Node&, const Node&) = default;
  };
  struct Rect {
    int x = 0;
    int y = 0;
    int width = 0;
    int height = 0;
    friend bool operator==(const Rect&, const Rect&) = default;
  };
  struct Placement {
    uint32_t node = 0;
    uint32_t slot = 0;  // Zero indicates a divider.
    Axis axis = Axis::kHorizontal;
    Rect bounds;
    Rect region;  // Parent branch bounds for divider movement.
  };

  static SplitPaneTree Pair(Axis axis, double ratio = 0.5);
  // Decoding is transactional. Invalid or unknown representations must not
  // replace a caller's previous accepted visual state.
  static std::optional<SplitPaneTree> Decode(
      uint32_t root, std::vector<Node> nodes,
      std::vector<uint32_t> pane_slots);

  bool IsValid() const;
  // Caller adds the corresponding genuine tab at the matching slot position
  // only after validation. Neither operation creates or destroys WebContents.
  bool SplitLeaf(uint32_t slot, uint32_t new_slot, Axis axis, bool before);
  bool RemoveLeaf(uint32_t slot);
  bool ResizeBranch(uint32_t node, double ratio);
  bool SwapBranch(uint32_t node);
  bool SetBranchAxis(uint32_t node, Axis axis);
  bool SetPaneOrder(std::vector<uint32_t> pane_slots);
  std::vector<Placement> Layout(Rect bounds, int divider, int minimum) const;
  const Node* Find(uint32_t node) const;
  const std::vector<Node>& nodes() const { return nodes_; }
  const std::vector<uint32_t>& pane_slots() const { return pane_slots_; }
  uint32_t root() const { return root_; }
  friend bool operator==(const SplitPaneTree&, const SplitPaneTree&) = default;

 private:
  uint32_t root_ = 0;
  std::vector<Node> nodes_;
  std::vector<uint32_t> pane_slots_;
};

}  // namespace split_tabs
#endif  // COMPONENTS_SPLIT_TABS_SPLIT_PANE_TREE_H_
