// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/split_tabs/split_pane_tree.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace split_tabs {
TEST(SplitPaneTreeTest, MixedBranchesRetainOtherPaneIdentitiesOnRemoval) {
  auto tree = SplitPaneTree::Pair(SplitPaneTree::Axis::kHorizontal);
  ASSERT_TRUE(tree.SplitLeaf(2, 3, SplitPaneTree::Axis::kVertical, false));
  ASSERT_TRUE(tree.SplitLeaf(1, 4, SplitPaneTree::Axis::kVertical, true));
  EXPECT_EQ(tree.pane_slots(), (std::vector<uint32_t>{4, 1, 2, 3}));
  auto layout = tree.Layout({0, 0, 1000, 800}, 10, 100);
  ASSERT_EQ(layout.size(), 7u);
  EXPECT_EQ(layout.front().slot, 4u);
  EXPECT_EQ(layout.back().slot, 3u);
  const auto original_right = layout.back().bounds;
  ASSERT_TRUE(tree.RemoveLeaf(4));
  EXPECT_EQ(tree.pane_slots(), (std::vector<uint32_t>{1, 2, 3}));
  EXPECT_EQ(tree.Layout({0, 0, 1000, 800}, 10, 100).back().bounds,
            original_right);
  EXPECT_TRUE(tree.IsValid());
}

TEST(SplitPaneTreeTest, InvalidGraphAndSlotMappingAreRefused) {
  auto tree = SplitPaneTree::Pair(SplitPaneTree::Axis::kHorizontal);
  auto nodes = tree.nodes();
  nodes.front().first = tree.root();
  EXPECT_FALSE(SplitPaneTree::Decode(tree.root(), nodes, tree.pane_slots()));
  EXPECT_FALSE(SplitPaneTree::Decode(tree.root(), tree.nodes(), {1, 1}));
  const auto before = tree;
  EXPECT_FALSE(tree.SplitLeaf(1, 2, SplitPaneTree::Axis::kVertical, false));
  EXPECT_FALSE(tree.ResizeBranch(tree.root(), 1.0));
  EXPECT_EQ(tree, before);
}

TEST(SplitPaneTreeTest, ConstrainedLayoutNeverProducesNegativeDimensions) {
  auto tree = SplitPaneTree::Pair(SplitPaneTree::Axis::kVertical);
  for (uint32_t slot = 3; slot <= 8; ++slot) {
    ASSERT_TRUE(tree.SplitLeaf(slot - 1, slot,
        slot % 2 ? SplitPaneTree::Axis::kHorizontal
                 : SplitPaneTree::Axis::kVertical, false));
  }
  EXPECT_FALSE(tree.SplitLeaf(8, 9, SplitPaneTree::Axis::kHorizontal, false));
  for (const auto& item : tree.Layout({0, 0, 25, 21}, 10, 200)) {
    EXPECT_GE(item.bounds.width, 0);
    EXPECT_GE(item.bounds.height, 0);
    EXPECT_LE(item.bounds.x + item.bounds.width, 25);
    EXPECT_LE(item.bounds.y + item.bounds.height, 21);
  }
}
}  // namespace split_tabs
