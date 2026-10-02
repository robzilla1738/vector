// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "content/browser/child_process_task_port_provider_mac.h"

#include <mach/mach.h>
#include <unistd.h>

#include <vector>

#include "base/apple/scoped_mach_port.h"
#include "base/clang_profiling_buildflags.h"
#include "base/functional/callback.h"
#include "base/task/sequenced_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/test/task_environment.h"
#include "base/test/test_timeouts.h"
#include "content/common/child_process.mojom.h"
#include "mojo/public/cpp/system/platform_handle.h"
#include "testing/gmock/include/gmock/gmock.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace content {

using testing::_;
using testing::WithArgs;

class MockChildProcess : public mojom::ChildProcess {
 public:
  MOCK_METHOD0(ProcessShutdown, void());
  MOCK_METHOD1(GetTaskPort, void(GetTaskPortCallback));
#if BUILDFLAG(CLANG_PROFILING_INSIDE_SANDBOX)
  MOCK_METHOD1(SetProfilingFile, void(base::File));
  MOCK_METHOD1(WriteClangProfilingProfile,
               void(WriteClangProfilingProfileCallback));
#endif
  MOCK_METHOD1(GetBackgroundTracingAgentProvider,
               void(mojo::PendingReceiver<
                    tracing::mojom::BackgroundTracingAgentProvider>));
  MOCK_METHOD0(CrashHungProcess, void());
  MOCK_METHOD1(BindServiceInterface,
               void(mojo::GenericPendingReceiver receiver));
  MOCK_METHOD1(BindReceiver, void(mojo::GenericPendingReceiver receiver));
  MOCK_METHOD1(EnableSystemTracingService,
               void(mojo::PendingRemote<tracing::mojom::SystemTracingService>));
  MOCK_METHOD1(SetPseudonymizationSalt, void(uint32_t salt));
  MOCK_METHOD1(OnMemoryPressure, void(base::MemoryPressureLevel));
  MOCK_METHOD1(SetBatterySaverMode, void(bool battery_saver_mode_enabled));
};

class ChildProcessTaskPortProviderTest : public testing::Test,
                                         public base::PortProvider::Observer {
 public:
  ChildProcessTaskPortProviderTest() { provider_.AddObserver(this); }
  ~ChildProcessTaskPortProviderTest() override {
    provider_.RemoveObserver(this);
  }

  void WaitForTaskPort() {
    base::RunLoop run_loop;
    quit_closure_ = run_loop.QuitClosure();
    run_loop.Run();
  }

  // There is no observer callback for when a process dies, so spin the run loop
  // until the desired exit |condition| is met.
  void WaitForCondition(base::RepeatingCallback<bool(void)> condition) {
    base::TimeTicks start = base::TimeTicks::Now();
    do {
      base::RunLoop().RunUntilIdle();
      if (condition.Run())
        break;
    } while ((base::TimeTicks::Now() - start) < TestTimeouts::action_timeout());
  }

  mach_port_urefs_t GetSendRightRefCount(mach_port_t send_right) {
    mach_port_urefs_t refs;
    EXPECT_EQ(KERN_SUCCESS, mach_port_get_refs(mach_task_self(), send_right,
                                               MACH_PORT_RIGHT_SEND, &refs));
    return refs;
  }

  mach_port_urefs_t GetDeadNameRefCount(mach_port_t send_right) {
    mach_port_urefs_t refs;
    EXPECT_EQ(KERN_SUCCESS,
              mach_port_get_refs(mach_task_self(), send_right,
                                 MACH_PORT_RIGHT_DEAD_NAME, &refs));
    return refs;
  }

  // base::PortProvider::Observer:
  void OnReceivedTaskPort(base::ProcessHandle process) override {
    DCHECK(quit_closure_);
    received_processes_.push_back(process);
    std::move(quit_closure_).Run();
  }

  ChildProcessTaskPortProvider* provider() { return &provider_; }

  const std::vector<base::ProcessHandle>& received_processes() {
    return received_processes_;
  }

 private:
  base::test::TaskEnvironment task_environment_;
  ChildProcessTaskPortProvider provider_;
  base::OnceClosure quit_closure_;
  std::vector<base::ProcessHandle> received_processes_;
};

static constexpr mach_port_t kMachPortNull = MACH_PORT_NULL;

TEST_F(ChildProcessTaskPortProviderTest, InvalidProcess) {
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(99));
}

TEST_F(ChildProcessTaskPortProviderTest, ChildLifecycle) {
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(99));

  // Create a fake task port for the fake process.
  base::apple::ScopedMachReceiveRight receive_right;
  base::apple::ScopedMachSendRight send_right;
  ASSERT_TRUE(base::apple::CreateMachPort(&receive_right, &send_right));

  EXPECT_EQ(1u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right.get()));

  // Return it when the ChildProcess interface is called.
  MockChildProcess child_process;
  EXPECT_CALL(child_process, GetTaskPort(_))
      .WillOnce(WithArgs<0>(
          [&send_right](mojom::ChildProcess::GetTaskPortCallback callback) {
            std::move(callback).Run(mojo::PlatformHandle(
                base::apple::RetainMachSendRight(send_right.get())));
          }));

  provider()->OnChildProcessLaunched(99, &child_process);

  // Verify that the task-for-handle association is established.
  WaitForTaskPort();
  EXPECT_EQ(std::vector<base::ProcessHandle>{99}, received_processes());
  EXPECT_EQ(receive_right.get(), provider()->TaskForHandle(99));

  // References owned by |send_right| and the map.
  EXPECT_EQ(2u, GetSendRightRefCount(provider()->TaskForHandle(99)));
  EXPECT_EQ(0u, GetDeadNameRefCount(provider()->TaskForHandle(99)));

  // "Kill" the process and verify that the association is deleted.
  receive_right.reset();

  WaitForCondition(base::BindRepeating(
      [](ChildProcessTaskPortProvider* provider) -> bool {
        return provider->TaskForHandle(99) == MACH_PORT_NULL;
      },
      base::Unretained(provider())));

  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(99));

  // Send rights turned into a dead name right, which is owned by |send_right|.
  EXPECT_EQ(0u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(1u, GetDeadNameRefCount(send_right.get()));
}

TEST_F(ChildProcessTaskPortProviderTest, DeadTaskPort) {
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(6));

  // Create a fake task port for the fake process.
  base::apple::ScopedMachReceiveRight receive_right;
  base::apple::ScopedMachSendRight send_right;
  ASSERT_TRUE(base::apple::CreateMachPort(&receive_right, &send_right));

  scoped_refptr<base::SequencedTaskRunner> task_runner =
      base::ThreadPool::CreateSequencedTaskRunner({});

  MockChildProcess child_process;
  EXPECT_CALL(child_process, GetTaskPort(_))
      .WillOnce(
          WithArgs<0>([&task_runner, &receive_right, &send_right](
                          mojom::ChildProcess::GetTaskPortCallback callback) {
            mojo::PlatformHandle mach_handle(
                base::apple::RetainMachSendRight(send_right.get()));

            // Destroy the receive right.
            task_runner->PostTask(
                FROM_HERE,
                base::BindOnce(&base::apple::ScopedMachReceiveRight::reset,
                               base::Unretained(&receive_right),
                               kMachPortNull));
            // And then return a send right to the now-dead name.
            task_runner->PostTask(
                FROM_HERE,
                base::BindOnce(std::move(callback), std::move(mach_handle)));
          }));

  provider()->OnChildProcessLaunched(6, &child_process);

  // Create a second fake process.
  base::apple::ScopedMachReceiveRight receive_right2;
  base::apple::ScopedMachSendRight send_right2;
  ASSERT_TRUE(base::apple::CreateMachPort(&receive_right2, &send_right2));

  MockChildProcess child_contol2;
  EXPECT_CALL(child_contol2, GetTaskPort(_))
      .WillOnce(
          WithArgs<0>([&task_runner, &send_right2](
                          mojom::ChildProcess::GetTaskPortCallback callback) {
            task_runner->PostTask(
                FROM_HERE,
                base::BindOnce(
                    std::move(callback),
                    mojo::PlatformHandle(
                        base::apple::RetainMachSendRight(send_right2.get()))));
          }));

  provider()->OnChildProcessLaunched(123, &child_contol2);

  WaitForTaskPort();

  // Verify that the dead name does not register for the process.
  EXPECT_EQ(std::vector<base::ProcessHandle>{123}, received_processes());
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(6));
  EXPECT_EQ(receive_right2.get(), provider()->TaskForHandle(123));

  // Clean up the second receive right.
  receive_right2.reset();
  WaitForCondition(base::BindRepeating(
      [](ChildProcessTaskPortProvider* provider) -> bool {
        return provider->TaskForHandle(123) == MACH_PORT_NULL;
      },
      base::Unretained(provider())));
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(123));
}

TEST_F(ChildProcessTaskPortProviderTest, ReplacePort) {
  EXPECT_EQ(kMachPortNull, provider()->TaskForHandle(42));

  // Create a fake task port for the fake process.
  base::apple::ScopedMachReceiveRight receive_right;
  base::apple::ScopedMachSendRight send_right;
  ASSERT_TRUE(base::apple::CreateMachPort(&receive_right, &send_right));

  EXPECT_EQ(1u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right.get()));

  // Return it when the ChildProcess interface is called.
  MockChildProcess child_process;
  EXPECT_CALL(child_process, GetTaskPort(_))
      .Times(2)
      .WillRepeatedly(WithArgs<0>(
          [&receive_right](mojom::ChildProcess::GetTaskPortCallback callback) {
            std::move(callback).Run(mojo::PlatformHandle(
                base::apple::RetainMachSendRight(receive_right.get())));
          }));

  provider()->OnChildProcessLaunched(42, &child_process);
  WaitForTaskPort();

  EXPECT_EQ(2u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right.get()));

  provider()->OnChildProcessLaunched(42, &child_process);
  WaitForTaskPort();

  EXPECT_EQ(2u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right.get()));

  // Verify that the task-for-handle association is established.
  std::vector<base::ProcessHandle> expected_receive{42, 42};
  EXPECT_EQ(expected_receive, received_processes());
  EXPECT_EQ(receive_right.get(), provider()->TaskForHandle(42));

  // Now simulate handle reuse by replacing the task port with a new one.
  base::apple::ScopedMachReceiveRight receive_right2;
  base::apple::ScopedMachSendRight send_right2;
  ASSERT_TRUE(base::apple::CreateMachPort(&receive_right2, &send_right2));
  EXPECT_EQ(1u, GetSendRightRefCount(send_right2.get()));

  MockChildProcess child_process2;
  EXPECT_CALL(child_process2, GetTaskPort(_))
      .WillOnce(
          [&send_right2](mojom::ChildProcess::GetTaskPortCallback callback) {
            std::move(callback).Run(mojo::PlatformHandle(
                base::apple::RetainMachSendRight(send_right2.get())));
          });

  provider()->OnChildProcessLaunched(42, &child_process2);
  WaitForTaskPort();

  // Reference to |send_right| is dropped from the map and is solely owned
  // by |send_right|.
  EXPECT_EQ(1u, GetSendRightRefCount(send_right.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right.get()));

  EXPECT_EQ(2u, GetSendRightRefCount(send_right2.get()));
  EXPECT_EQ(0u, GetDeadNameRefCount(send_right2.get()));

  expected_receive.push_back(42);
  EXPECT_EQ(expected_receive, received_processes());
  EXPECT_EQ(receive_right2.get(), provider()->TaskForHandle(42));
}

TEST_F(ChildProcessTaskPortProviderTest, OwnedAuditUsesRealKernelTaskAndExactHost) {
  const auto pid = getpid();
  const ChildProcessTaskHost owner{
      ChildProcessTaskHostKind::kRenderer, 901};
  MockChildProcess child;
  EXPECT_CALL(child, GetTaskPort(_)).WillOnce([](auto callback) {
    std::move(callback).Run(mojo::PlatformHandle(
        base::apple::RetainMachSendRight(mach_task_self())));
  });
  provider()->OnChildProcessLaunched(pid, &child, owner);
  WaitForTaskPort();
  const auto audit = provider()->ReadOwnedTaskIdentity(pid, owner);
  ASSERT_TRUE(audit);
  EXPECT_GT(audit->pid_version, 0);
  EXPECT_EQ(audit->host, owner);
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid,
      {ChildProcessTaskHostKind::kBrowserChild, 901}));
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid,
      {ChildProcessTaskHostKind::kRenderer, 902}));
  EXPECT_EQ(provider()->TaskForHandle(pid), mach_task_self());
}

TEST_F(ChildProcessTaskPortProviderTest, LatePortReplyCannotRelabelNewHost) {
  const auto pid = getpid();
  const ChildProcessTaskHost old_owner{
      ChildProcessTaskHostKind::kRenderer, 911};
  const ChildProcessTaskHost new_owner{
      ChildProcessTaskHostKind::kRenderer, 912};
  mojom::ChildProcess::GetTaskPortCallback old_reply, new_reply;
  MockChildProcess old_child, new_child;
  EXPECT_CALL(old_child, GetTaskPort(_)).WillOnce([&old_reply](auto callback) { old_reply = std::move(callback); });
  EXPECT_CALL(new_child, GetTaskPort(_)).WillOnce([&new_reply](auto callback) { new_reply = std::move(callback); });
  provider()->OnChildProcessLaunched(pid, &old_child, old_owner);
  provider()->OnChildProcessLaunched(pid, &new_child, new_owner);
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid, old_owner));
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid, new_owner));
  std::move(new_reply).Run(mojo::PlatformHandle(base::apple::RetainMachSendRight(mach_task_self())));
  WaitForTaskPort();
  const auto current = provider()->ReadOwnedTaskIdentity(pid, new_owner);
  ASSERT_TRUE(current);
  std::move(old_reply).Run(mojo::PlatformHandle(base::apple::RetainMachSendRight(mach_task_self())));
  EXPECT_EQ(provider()->ReadOwnedTaskIdentity(pid, new_owner), current);
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid, old_owner));
}

TEST_F(ChildProcessTaskPortProviderTest, GenericAndNonTaskPortsNeverMintOwnedAudit) {
  const auto pid = getpid();
  const ChildProcessTaskHost owner{
      ChildProcessTaskHostKind::kRenderer, 921};
  MockChildProcess generic;
  EXPECT_CALL(generic, GetTaskPort(_)).WillOnce([](auto callback) {
    std::move(callback).Run(mojo::PlatformHandle(base::apple::RetainMachSendRight(mach_task_self())));
  });
  provider()->OnChildProcessLaunched(pid, &generic);
  WaitForTaskPort();
  EXPECT_EQ(provider()->TaskForHandle(pid), mach_task_self());
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid, owner));
  // A kernel-serviced thread port is non-task; a user receive port would
  // have no server to answer the actual synchronous task_info request.
  base::apple::ScopedMachSendRight send(mach_thread_self());
  ASSERT_TRUE(send.is_valid());
  MockChildProcess owned;
  EXPECT_CALL(owned, GetTaskPort(_)).WillOnce([&send](auto callback) {
    std::move(callback).Run(mojo::PlatformHandle(base::apple::RetainMachSendRight(send.get())));
  });
  provider()->OnChildProcessLaunched(pid, &owned, owner);
  WaitForTaskPort();
  EXPECT_FALSE(provider()->ReadOwnedTaskIdentity(pid, owner));
  EXPECT_EQ(provider()->TaskForHandle(pid), send.get());
}

TEST_F(ChildProcessTaskPortProviderTest, PublicOwnedIdentityRejectsInvalidNativeIdentity) {
  EXPECT_FALSE(ReadOwnedChildProcessTaskIdentity(-1, {ChildProcessTaskHostKind::kRenderer, 901}));
  EXPECT_FALSE(ReadOwnedChildProcessTaskIdentity(base::GetCurrentProcId(), {ChildProcessTaskHostKind::kRenderer, 0}));
}
}  // namespace content
