// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/feature_store/feature_write_participant.h"
#include "base/functional/bind.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux::features {
// Admission closure is intentionally process-wide and irreversible. Keep this
// scenario together; no reset API is exposed to production or test callers.
TEST(NativeFeatureWriteParticipantTest, LateSettlementSurvivesReceiverAndRetainsUncertainty) {
  base::test::TaskEnvironment tasks;
  const base::FilePath profile(FILE_PATH_LITERAL("/synthetic/aux-profile"));
  auto authorization = std::make_shared<std::atomic_bool>(true);
  auto first = BeginNativeFeatureIo(profile, NativeFeatureIoKind::kFeatureState);
  auto receiver = BeginNativeFeatureIo(profile, NativeFeatureIoKind::kDownloadTransaction, authorization);
  ASSERT_TRUE(first); ASSERT_TRUE(receiver);
  EXPECT_FALSE(BeginNativeFeatureIo(profile, NativeFeatureIoKind::kFeatureState));
  auto worker = receiver;
  receiver.reset();
  EXPECT_EQ(InspectNativeFeatureWrites().pending, 2u);
  bool replied = false;
  NativeFeatureWriteObservation reply;
  CloseNativeFeatureWritesForMigration(base::BindOnce(
      [](bool* replied, NativeFeatureWriteObservation* reply, NativeFeatureWriteObservation value) {
        *replied = true; *reply = value;
      }, &replied, &reply));
  EXPECT_FALSE(authorization->load());
  EXPECT_TRUE(worker->IsCancelled());
  EXPECT_FALSE(BeginNativeFeatureIo(profile, NativeFeatureIoKind::kOrganization));
  tasks.RunUntilIdle(); EXPECT_FALSE(replied);
  first->Settle(NativeFeatureIoOutcome::kRefused);
  EXPECT_TRUE(IsNativeFeatureIoPendingForProfilePath(profile));
  tasks.RunUntilIdle(); EXPECT_FALSE(replied);
  worker->Settle(NativeFeatureIoOutcome::kUncertain);
  tasks.RunUntilIdle();
  EXPECT_TRUE(replied);
  EXPECT_TRUE(reply.admission_closed);
  EXPECT_EQ(reply.pending, 0u);
  EXPECT_EQ(reply.uncertain, 1u);
  EXPECT_EQ(reply.refused, 1u);
  EXPECT_EQ(reply.settled, 2u);
  EXPECT_FALSE(IsNativeFeatureIoPendingForProfilePath(profile));
}
}  // namespace aux::features
