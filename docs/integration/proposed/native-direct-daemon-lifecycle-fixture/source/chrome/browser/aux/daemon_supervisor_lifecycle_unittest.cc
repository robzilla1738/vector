// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/daemon_supervisor.h"

#include "base/command_line.h"
#include "base/files/scoped_temp_dir.h"
#include "base/functional/bind.h"
#include "base/process/launch.h"
#include "base/test/task_environment.h"
#include "base/test/test_future.h"
#include "base/threading/thread_restrictions.h"
#include "build/build_config.h"
#include "services/network/test/test_url_loader_factory.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux {
#if BUILDFLAG(IS_POSIX)
// Friend fixture only. No public launch/ownership bypass is added to the product.
class DaemonSupervisorLifecycleTest : public testing::Test {
 protected:
  using Result = DirectDaemonQuiesceResult;
  using Outcome = Result::Outcome;

  void SetUp() override {
    ASSERT_TRUE(root_.CreateUniqueTempDir());
    BundlePaths paths;
    paths.root = root_.GetPath();
    // This factory satisfies the private graceful-shutdown request without
    // opening sockets or contacting any real daemon.
    factory_.AddResponse("http://127.0.0.1:21520/shutdown", "{}");
    supervisor_ = std::make_unique<DaemonSupervisor>(
        std::move(paths), root_.GetPath(), 21520, factory_.GetSafeWeakWrapper(),
        base::BindRepeating([](DaemonSupervisor::State, std::string) {}));
  }

  void TearDown() override {
    // Only this test's retained directly launched child can be cleaned up.
    // Never enumerate processes, inspect a port owner or signal an adopted PID.
    base::ScopedAllowBlockingForTesting allow_blocking;
    if (cleanup_.IsValid() &&
        !cleanup_.WaitForExitWithTimeout(base::TimeDelta(), nullptr)) {
      ASSERT_FALSE(cleanup_created_.is_null());
      ASSERT_EQ(cleanup_.CreationTime(), cleanup_created_);
      EXPECT_TRUE(cleanup_.Terminate(0, false));
      EXPECT_TRUE(cleanup_.WaitForExitWithTimeout(base::Seconds(5), nullptr));
    }
    task_environment_.RunUntilIdle();
    supervisor_.reset();
  }

  base::Process SyntheticChild(bool long_lived) {
    base::CommandLine command(base::FilePath(
        long_lived ? FILE_PATH_LITERAL("/bin/sleep")
                   : FILE_PATH_LITERAL("/bin/sh")));
    if (long_lived) {
      command.AppendArg("30");
    } else {
      command.AppendArg("-c");
      command.AppendArg("exit 23");
    }
    auto process = base::LaunchProcess(command, base::LaunchOptions());
    if (process.IsValid()) {
      cleanup_ = process.Duplicate();
      cleanup_created_ = process.CreationTime();
    }
    return process;
  }

  void Quiesce(base::test::TestFuture<Result>& future) {
    supervisor_->QuiesceDirectDaemonForMigration(future.GetCallback());
  }
  uint64_t MarkLaunchPending() {
    supervisor_->launch_pending_ = true;
    return supervisor_->launch_generation_;
  }
  base::Process Admit(uint64_t generation,
                      base::OnceCallback<base::Process()> launch) {
    return DaemonSupervisor::RunAdmittedLaunch(
        supervisor_->launch_admission_, generation, std::move(launch));
  }
  void Deliver(uint64_t generation, base::Process child) {
    supervisor_->DidLaunch(generation, std::move(child));
  }
  void Own(base::Process child) {
    supervisor_->process_ = std::move(child);
    supervisor_->process_created_ = supervisor_->process_.CreationTime();
    supervisor_->state_ = DaemonSupervisor::State::kReady;
  }
  bool HasOwnedHandle() const { return supervisor_->process_.IsValid(); }
  bool LaunchPending() const { return supervisor_->launch_pending_; }
  void Start() { supervisor_->Start(); }
  DaemonSupervisor::State State() const { return supervisor_->state(); }

  base::test::TaskEnvironment task_environment_;
  network::TestURLLoaderFactory factory_;
  base::ScopedTempDir root_;
  std::unique_ptr<DaemonSupervisor> supervisor_;
  base::Process cleanup_;
  base::Time cleanup_created_;
};

TEST_F(DaemonSupervisorLifecycleTest, NoOwnedProcessPostsNarrowTerminalResult) {
  base::test::TestFuture<Result> done;
  Quiesce(done);
  EXPECT_FALSE(done.IsReady());
  Start();
  EXPECT_FALSE(LaunchPending());
  const auto result = done.Take();
  EXPECT_EQ(result.scope, Result::Scope::kOwnedDirectDaemonOnly);
  EXPECT_EQ(result.outcome, Outcome::kNoOwnedProcess);
  EXPECT_FALSE(result.exit_code.has_value());
  EXPECT_EQ(State(), DaemonSupervisor::State::kStopped);
}

TEST_F(DaemonSupervisorLifecycleTest, QueuedLaunchCannotEnterAfterQuiesce) {
  const auto generation = MarkLaunchPending();
  base::test::TestFuture<Result> done;
  Quiesce(done);
  EXPECT_FALSE(done.IsReady());
  bool entered = false;
  auto child = Admit(generation, base::BindOnce([&entered]() {
    entered = true;
    return base::Process();
  }));
  EXPECT_FALSE(entered);
  EXPECT_FALSE(child.IsValid());
  // Actual production reply, including pending-launch drain completion.
  Deliver(generation, std::move(child));
  EXPECT_EQ(done.Take().outcome, Outcome::kNoOwnedProcess);
  Start();
  EXPECT_FALSE(LaunchPending());
}

TEST_F(DaemonSupervisorLifecycleTest, AdmittedChildReplyDrainsBeforeAcknowledgement) {
  const auto generation = MarkLaunchPending();
  auto child = Admit(generation, base::BindOnce([this]() { return SyntheticChild(false); }));
  ASSERT_TRUE(child.IsValid());
  base::test::TestFuture<Result> done;
  Quiesce(done);
  // Spawn was admitted, but ownership has not reached the UI reply yet.
  EXPECT_FALSE(done.IsReady());
  Deliver(generation, std::move(child));
  const auto result = done.Take();
  EXPECT_EQ(result.scope, Result::Scope::kOwnedDirectDaemonOnly);
  EXPECT_EQ(result.outcome, Outcome::kExited);
  ASSERT_TRUE(result.exit_code.has_value());
  EXPECT_EQ(*result.exit_code, 23);
  EXPECT_FALSE(HasOwnedHandle());
  EXPECT_EQ(State(), DaemonSupervisor::State::kStopped);
}

TEST_F(DaemonSupervisorLifecycleTest, FailedOwnershipDrainRetainsHandleAndFailure) {
  auto child = SyntheticChild(true);
  ASSERT_TRUE(child.IsValid());
  // /bin/sleep is deliberately outside this test's resource root. Production
  // ownership validation must refuse to terminate it after its bounded wait.
  Own(std::move(child));
  base::test::TestFuture<Result> done;
  Quiesce(done);
  const auto result = done.Take();
  EXPECT_EQ(result.outcome, Outcome::kDrainFailed);
  EXPECT_FALSE(result.exit_code.has_value());
  EXPECT_TRUE(HasOwnedHandle());
  EXPECT_EQ(State(), DaemonSupervisor::State::kFailed);
  EXPECT_FALSE(cleanup_.WaitForExitWithTimeout(base::TimeDelta(), nullptr));
  Start();
  EXPECT_FALSE(LaunchPending());
  base::test::TestFuture<Result> repeated;
  Quiesce(repeated);
  EXPECT_FALSE(repeated.IsReady());
  EXPECT_EQ(repeated.Take().outcome, Outcome::kDrainFailed);
}
#endif  // BUILDFLAG(IS_POSIX)
}  // namespace aux
