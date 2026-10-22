// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/installation_auth.h"

#include "base/command_line.h"
#include "base/functional/bind.h"
#include "base/process/launch.h"
#include "base/task/thread_pool.h"
#include "base/test/task_environment.h"
#include "base/threading/thread_restrictions.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
TEST(InstallationCarrierLifecycle, CloseBeforeActualLaunchDoesNotCreateChild) {
  InstallationCarrierCustody custody;
  auto call = custody.BeginCall();
  ASSERT_TRUE(call);
  EXPECT_FALSE(custody.CloseAdmission().drained());
  bool invoked = false;
  EXPECT_FALSE(call->LaunchIfAdmitted([&] {
    invoked = true;
    return true;
  }));
  EXPECT_FALSE(invoked);
  call.reset();
  EXPECT_TRUE(custody.Inspect().drained());
}

TEST(InstallationCarrierLifecycle, RealOwnedChildReaperKeepsPendingUntilWait) {
  base::test::TaskEnvironment environment(
      base::test::TaskEnvironment::ThreadPoolExecutionMode::QUEUED);
  InstallationCarrierCustody custody;
  auto call = custody.BeginCall();
  ASSERT_TRUE(call);
  base::Process child;
  ASSERT_TRUE(call->LaunchIfAdmitted([&] {
    base::CommandLine command(base::FilePath(FILE_PATH_LITERAL("/bin/sh")));
    command.AppendArg("-c");
    command.AppendArg("exit 23");
    child = base::LaunchProcess(command, base::LaunchOptions());
    return child.IsValid();
  }));
  // Queue the exact production timeout cleanup, not a copied test reaper.
  ASSERT_TRUE(base::ThreadPool::PostTask(
      FROM_HERE, {base::MayBlock()},
      base::BindOnce(&internal::WaitForInstallationCarrierExit,
                     std::move(child), call)));
  call.reset();
  EXPECT_FALSE(custody.CloseAdmission().drained());
  EXPECT_EQ(custody.Inspect().active_calls, 1u);
  environment.RunUntilIdle();
  EXPECT_TRUE(custody.Inspect().drained());
  EXPECT_EQ(custody.Inspect().unresolved_children, 0u);
}
}  // namespace aux
