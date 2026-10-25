// Focused actual model fixture: no browser/profile/storage operations.
#include "chrome/browser/aux/organization/organization_model.h"
#include <cassert>
#include <iostream>
using namespace aux::organization;
constexpr char kMain[] = "00000000-0000-4000-8000-000000000001";
constexpr char kTab[] = "00000000-0000-4000-8000-000000000002";
constexpr char kSpace[] = "00000000-0000-4000-8000-000000000003";
constexpr char kFolder[] = "00000000-0000-4000-8000-000000000004";
constexpr char kNested[] = "00000000-0000-4000-8000-000000000005";
Context Current(const Snapshot& s, unsigned n) {
  auto id = "10000000-0000-4000-8000-0000000000" + std::string(n < 10 ? "0" : "") + std::to_string(n);
  return {s.profile_id, "native-epoch", s.revision, id};
}
Command Create(Action action, const char* id, std::string parent = "") {
  Command c; c.action = action; c.id = id; c.space_id = kMain; c.parent_id = parent;
  c.title = "Entry"; c.url = "https://example.test/"; return c;
}
int main() {
  Snapshot s; s.profile_id = "disposable-fixture";
  s.spaces.emplace(kMain, Space{kMain, "Main", "", 0});
  auto tab = Apply(s, Current(s, 1), Create(Action::kCreateTab, kTab));
  assert(tab.error == Error::kNone); s = tab.snapshot;
  // A native maintenance write can complete while the real modal is open.
  const auto before_dialog = Current(s, 2);
  Command activity; activity.action = Action::kMarkTabActive; activity.id = kTab; activity.index = 2000;
  auto active = Apply(s, Current(s, 3), activity); assert(active.error == Error::kNone);
  Command space; space.action = Action::kCreateSpace; space.id = kSpace;
  space.title = "Aux Feature Check"; space.icon = "◆";
  assert(Apply(active.snapshot, before_dialog, space).error == Error::kStaleRevision);
  auto saved = Apply(active.snapshot, Current(active.snapshot, 2), space);
  assert(saved.error == Error::kNone && saved.snapshot.spaces.contains(kSpace));
  assert(saved.snapshot.entries.at(kTab).last_active_unix_ms == 2000);
  // Folder edits rebase against the current revision without losing existing
  // entries; native model still rejects stale, foreign or invalid destinations.
  auto folder = Apply(saved.snapshot, Current(saved.snapshot, 4), Create(Action::kCreateFolder, kFolder));
  assert(folder.error == Error::kNone);
  auto nested = Apply(folder.snapshot, Current(folder.snapshot, 5), Create(Action::kCreateFolder, kNested, kFolder));
  assert(nested.error == Error::kNone);
  Command cycle; cycle.action = Action::kMoveEntry; cycle.id = kFolder;
  cycle.space_id = kMain; cycle.parent_id = kNested;
  assert(Apply(nested.snapshot, Current(nested.snapshot, 6), cycle).error == Error::kCycle);
  auto foreign = Current(nested.snapshot, 6); foreign.profile_id = "other-profile";
  assert(Apply(nested.snapshot, foreign, space).error == Error::kForeignProfile);
  Command pin; pin.action = Action::kMoveEntry; pin.id = kFolder;
  auto pinned = Apply(nested.snapshot, Current(nested.snapshot, 6), pin);
  assert(pinned.error == Error::kNone && HasRetention(pinned.snapshot, kNested));
  Command archive; archive.action = Action::kArchive; archive.id = kNested;
  assert(Apply(pinned.snapshot, Current(pinned.snapshot, 7), archive).error == Error::kProtectedPin);
  std::cout << "PASS: actual stale-dialog reproduction, fresh revision preserves native activity, nested cycle/foreign/pin guards remain\n";
}
