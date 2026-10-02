// Copyright 2026 The Aux Authors
// Actual worker response handler fixtures; no native performance qualification.
#include "chrome/browser/ui/aux/runtime_host.h"
#include "base/functional/bind.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
class AuxRuntimeHostPerformanceTestPeer {
 public:
  static void Response(AuxRuntimeHost::Worker& worker, const base::DictValue& reply) {
    worker.HandleResponse(reply);
  }
  static std::unique_ptr<AuxRuntimeHost::Worker> Worker() {
    return std::make_unique<AuxRuntimeHost::Worker>(base::FilePath(), "synthetic",
        base::SequencedTaskRunner::GetCurrentDefault(), base::WeakPtr<AuxRuntimeHost>());
  }
  static void Pending(AuxRuntimeHost::Worker& worker, int id, std::string folder,
      AuxRuntimeHost::ResponseCallback callback) {
    worker.pending_requests_.emplace(id, AuxRuntimeHost::Worker::PendingRequest{
        base::TimeTicks::Now() + base::Seconds(1), std::move(callback), std::move(folder)});
  }
  static uint64_t Sequence(AuxRuntimeHost::Worker& worker) { return worker.live_refresh_sequence_; }
  static std::string Folder(AuxRuntimeHost::Worker& worker) { return worker.live_folder_id_; }
  static unsigned Units(AuxRuntimeHost::Worker& worker) { return worker.live_folder_units_; }
  static bool ConnectedIdentity(AuxRuntimeHost::Worker& worker) {
    return worker.ReadPerformanceProcessIdentity().has_value();
  }
};
namespace {
base::DictValue Refresh(int id, const char* folder = "fixture-folder", unsigned count = 2) {
  base::ListValue rows;
  for (unsigned i = 0; i < count; ++i) rows.Append(base::DictValue().Set("id", static_cast<int>(i)));
  return base::DictValue().Set("id", id).Set("result", base::DictValue().Set("folderId", folder)
      .Set("refreshedAt", 1700000000000.0).Set("items", std::move(rows)));
}
class NativeOrganizationRuntimeTest : public testing::Test {
 protected:
  base::test::TaskEnvironment environment_;
};
TEST_F(NativeOrganizationRuntimeTest, ExactSuccessfulPendingRefreshCountsOnce) {
  auto worker = AuxRuntimeHostPerformanceTestPeer::Worker();
  bool succeeded = false;
  AuxRuntimeHostPerformanceTestPeer::Pending(*worker, 1, "fixture-folder",
      base::BindOnce([](bool* success, AuxRuntimeHost::Response response) {
        *success = response.ok;
      }, &succeeded));
  auto reply = Refresh(1);
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, reply);
  ASSERT_TRUE(succeeded);
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Sequence(*worker), 1u);
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Folder(*worker), "fixture-folder");
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Units(*worker), 2u);
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, reply);
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Sequence(*worker), 1u);
  // Synthetic wire fixtures never establish a real authenticated process.
  EXPECT_FALSE(AuxRuntimeHostPerformanceTestPeer::ConnectedIdentity(*worker));
}
TEST_F(NativeOrganizationRuntimeTest, OrdinaryOtherFolderAndEmptyResponsesCannotClaimFreshWork) {
  auto worker = AuxRuntimeHostPerformanceTestPeer::Worker();
  for (int id = 1; id <= 3; ++id) {
    AuxRuntimeHostPerformanceTestPeer::Pending(*worker, id, id == 1 ? "" : "fixture-folder",
        base::BindOnce([](AuxRuntimeHost::Response response) { EXPECT_TRUE(response.ok); }));
  }
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, Refresh(1));
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, Refresh(2, "other-folder"));
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, Refresh(3, "fixture-folder", 0));
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Sequence(*worker), 0u);
}
TEST_F(NativeOrganizationRuntimeTest, FaultAndCachedErrorCannotClaimSourceRefresh) {
  auto worker = AuxRuntimeHostPerformanceTestPeer::Worker();
  AuxRuntimeHostPerformanceTestPeer::Pending(*worker, 1, "fixture-folder",
      base::BindOnce([](AuxRuntimeHost::Response response) { EXPECT_FALSE(response.ok); }));
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, base::DictValue().Set("id", 1)
      .Set("error", base::DictValue().Set("code", "backend_unavailable").Set("message", "Synthetic source refused")));
  AuxRuntimeHostPerformanceTestPeer::Pending(*worker, 2, "fixture-folder",
      base::BindOnce([](AuxRuntimeHost::Response response) { EXPECT_TRUE(response.ok); }));
  auto cached = Refresh(2); cached.FindDict("result")->Set("error", "Source unavailable; cached rows");
  AuxRuntimeHostPerformanceTestPeer::Response(*worker, cached);
  EXPECT_EQ(AuxRuntimeHostPerformanceTestPeer::Sequence(*worker), 0u);
}
}  // namespace
