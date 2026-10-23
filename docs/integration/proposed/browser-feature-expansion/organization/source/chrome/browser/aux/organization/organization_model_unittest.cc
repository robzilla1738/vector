// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/organization/organization_model.h"
#include <limits>
#include "testing/gtest/include/gtest/gtest.h"

namespace aux::organization {
namespace {
constexpr char kSpace[] = "00000000-0000-4000-8000-000000000001";
constexpr char kFolder[] = "00000000-0000-4000-8000-000000000002";
constexpr char kTab[] = "00000000-0000-4000-8000-000000000003";
constexpr char kOther[] = "00000000-0000-4000-8000-000000000004";
std::string Operation(unsigned n) {
  return "10000000-0000-4000-8000-0000000000" +
         std::string(n < 10 ? "0" : "") + std::to_string(n);
}
Snapshot Initial() {
  Snapshot snapshot;
  snapshot.profile_id = "profile-one";
  snapshot.spaces.emplace(kSpace, Space{kSpace, "Main", "", 0});
  return snapshot;
}
Mutation Run(const Snapshot& snapshot, Command command, unsigned op = 1) {
  return Apply(snapshot, {snapshot.profile_id, "native-generation",
                         snapshot.revision, Operation(op)}, command);
}
Command Create(Action action, std::string id, std::string parent = "",
               std::string space = kSpace) {
  Command command;
  command.action = action; command.id = std::move(id);
  command.space_id = std::move(space); command.parent_id = std::move(parent);
  command.title = "Entry"; command.url = "https://example.test/same";
  return command;
}
TEST(OrganizationModel, SameUrlTabsKeepDistinctIds) {
  auto first = Run(Initial(), Create(Action::kCreateTab, kTab));
  ASSERT_EQ(first.error, Error::kNone);
  auto second = Run(first.snapshot, Create(Action::kCreateTab, kOther), 2);
  ASSERT_EQ(second.error, Error::kNone);
  EXPECT_EQ(second.snapshot.entries.size(), 2u);
  EXPECT_EQ(second.snapshot.entries.at(kTab).launch_url,
            second.snapshot.entries.at(kOther).launch_url);
}
TEST(OrganizationModel, GlobalPinCannotArchiveAndCloseOnlyUnloads) {
  auto pin = Run(Initial(), Create(Action::kCreateTab, kTab, "", ""));
  ASSERT_EQ(pin.error, Error::kNone);
  EXPECT_EQ(GetCloseDisposition(pin.snapshot.entries.at(kTab)),
            CloseDisposition::kUnloadView);
  Command close; close.action = Action::kArchive; close.id = kTab;
  EXPECT_EQ(Run(pin.snapshot, close, 2).error, Error::kProtectedPin);
}
TEST(OrganizationModel, ReparentRejectsCycleAndMovesWholeScope) {
  auto folder = Run(Initial(), Create(Action::kCreateFolder, kFolder));
  ASSERT_EQ(folder.error, Error::kNone);
  auto nested = Run(folder.snapshot, Create(Action::kCreateFolder, kOther, kFolder), 2);
  ASSERT_EQ(nested.error, Error::kNone);
  Command move; move.action = Action::kMoveEntry; move.id = kFolder;
  move.parent_id = kOther; move.space_id = kSpace;
  EXPECT_EQ(Run(nested.snapshot, move, 3).error, Error::kCycle);
  move.parent_id.clear(); move.space_id.clear();
  auto pinned = Run(nested.snapshot, move, 3);
  ASSERT_EQ(pinned.error, Error::kNone);
  EXPECT_TRUE(IsGlobalPin(pinned.snapshot.entries.at(kOther)));
}
TEST(OrganizationModel, ReplayIsExactAndStaleForeignWritesRefuse) {
  auto command = Create(Action::kCreateTab, kTab);
  Context context{"profile-one", "native-generation", 0, Operation(1)};
  auto first = Apply(Initial(), context, command);
  ASSERT_EQ(first.error, Error::kNone);
  EXPECT_EQ(Apply(first.snapshot, context, command).error, Error::kReplay);
  command.title = "different";
  EXPECT_EQ(Apply(first.snapshot, context, command).error, Error::kOperationConflict);
  context.operation_id = Operation(2);
  EXPECT_EQ(Apply(first.snapshot, context, command).error, Error::kStaleRevision);
  context.profile_id = "profile-two";
  EXPECT_EQ(Apply(first.snapshot, context, command).error, Error::kForeignProfile);
}
TEST(OrganizationModel, RestoreFolderDoesNotRevivePreviouslyArchivedChild) {
  auto folder = Run(Initial(), Create(Action::kCreateFolder, kFolder));
  auto tab = Run(folder.snapshot, Create(Action::kCreateTab, kTab, kFolder), 2);
  ASSERT_EQ(tab.error, Error::kNone);
  Command archive; archive.action = Action::kArchive; archive.id = kTab;
  auto child_archived = Run(tab.snapshot, archive, 3);
  archive.id = kFolder;
  auto parent_archived = Run(child_archived.snapshot, archive, 4);
  ASSERT_EQ(parent_archived.error, Error::kNone);
  archive.action = Action::kRestore;
  auto restored = Run(parent_archived.snapshot, archive, 5);
  ASSERT_EQ(restored.error, Error::kNone);
  EXPECT_FALSE(restored.snapshot.entries.at(kFolder).archived);
  EXPECT_TRUE(restored.snapshot.entries.at(kTab).archived);
}
TEST(OrganizationModel, LaunchUrlSurvivesNavigationAndUndoPreservesReplay) {
  const auto initial = Initial();
  auto tab = Run(initial, Create(Action::kCreateTab, kTab));
  Command navigate; navigate.action = Action::kUpdateTabUrl; navigate.id = kTab;
  navigate.url = "https://example.test/next";
  auto changed = Run(tab.snapshot, navigate, 2);
  ASSERT_EQ(changed.error, Error::kNone);
  EXPECT_NE(changed.snapshot.entries.at(kTab).launch_url,
            changed.snapshot.entries.at(kTab).current_url);
  auto undo = ApplyUndo(changed.snapshot, tab.snapshot,
      {"profile-one", "native-generation", 2, Operation(3)}, kOther);
  ASSERT_EQ(undo.error, Error::kNone);
  EXPECT_EQ(undo.snapshot.revision, 3u);
  EXPECT_EQ(undo.snapshot.replay.size(), 3u);
  EXPECT_EQ(undo.snapshot.entries.at(kTab).current_url,
            tab.snapshot.entries.at(kTab).current_url);
}
TEST(OrganizationModel, OverflowAndUnknownSchemaRefuseWithoutMutation) {
  Snapshot snapshot = Initial();
  snapshot.revision = std::numeric_limits<uint64_t>::max();
  EXPECT_EQ(Run(snapshot, Create(Action::kCreateTab, kTab)).error, Error::kOverflow);
  snapshot = Initial(); snapshot.schema_version = 2;
  EXPECT_EQ(Run(snapshot, Create(Action::kCreateTab, kTab)).error, Error::kInvalid);
}
TEST(OrganizationModel, InvalidParentAndLastSpaceRemovalRefuse) {
  EXPECT_EQ(Run(Initial(), Create(Action::kCreateTab, kTab, kOther)).error,
            Error::kMissing);
  Command remove; remove.action = Action::kRemoveEmptySpace; remove.id = kSpace;
  EXPECT_EQ(Run(Initial(), remove).error, Error::kNotEmpty);
}
}  // namespace
}  // namespace aux::organization
