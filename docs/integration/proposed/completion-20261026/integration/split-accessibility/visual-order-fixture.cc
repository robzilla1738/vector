#include "components/split_tabs/split_pane_tree.h"

#include <cassert>
#include <initializer_list>
#include <vector>

using Tree = split_tabs::SplitPaneTree;
void Expect(const Tree& tree, std::initializer_list<uint32_t> expected) {
  assert(tree.IsValid());
  assert(tree.VisualPaneSlots() == std::vector<uint32_t>(expected));
}
int main() {
  auto pair = Tree::Pair(Tree::Axis::kHorizontal);
  Expect(pair, {1, 2});
  assert(pair.SwapBranch(pair.root()));
  Expect(pair, {2, 1});
  // The collection still binds palette to slot 1, window-two to slot 2.
  // Its first tab must therefore receive Right view after this real swap.
  assert((pair.pane_slots() == std::vector<uint32_t>{1, 2}));
  assert(pair.SetBranchAxis(pair.root(), Tree::Axis::kVertical));
  Expect(pair, {2, 1});

  auto three = Tree::Pair(Tree::Axis::kHorizontal);
  assert(three.SplitLeaf(1, 3, Tree::Axis::kVertical, false));
  Expect(three, {1, 2, 3});
  // Reordering tab collection membership does not move actual visual slots.
  assert(three.SetPaneOrder({3, 1, 2}));
  Expect(three, {1, 2, 3});

  auto four = Tree::Pair(Tree::Axis::kHorizontal);
  assert(four.SplitLeaf(1, 3, Tree::Axis::kVertical, false));
  assert(four.SplitLeaf(2, 4, Tree::Axis::kVertical, false));
  Expect(four, {1, 2, 3, 4});
  assert(four.SwapBranch(four.Find(four.root())->first));
  Expect(four, {3, 2, 1, 4});
  assert(four.RemoveLeaf(2));
  Expect(four, {3, 4, 1});
  assert(four.RemoveLeaf(4));
  Expect(four, {3, 1});
  assert(four.Find(four.root())->axis == Tree::Axis::kVertical);
}
