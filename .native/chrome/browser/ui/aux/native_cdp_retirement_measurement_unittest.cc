// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_cdp_retirement_measurement.h"
#include <memory>
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
class NativeCdpRetirementMeasurementTest : public testing::Test {
 protected:
  std::unique_ptr<NativeCdpRetirementMeasurement> Arm(
      NativeCdpRetirementMeasurement::Mode mode = NativeCdpRetirementMeasurement::Mode::kStop) {
    std::map<std::string, NativeCdpRetirementMeasurement::OriginalPage> pages;
    pages.emplace("page", NativeCdpRetirementMeasurement::OriginalPage{Lease(), 1});
    return std::make_unique<NativeCdpRetirementMeasurement>(mode, "run", "host", 1,
        std::vector<std::string>{"run"}, std::move(pages));
  }
  base::DictValue Lease() {
    return base::DictValue().Set("leaseId", "lease").Set("tabId", "page")
        .Set("runId", "run").Set("documentToken", "document").Set("expiresAt", 500.0);
  }
  void DispatchAndRetire(NativeCdpRetirementMeasurement& witness, bool clock = true) {
    environment_.FastForwardBy(base::Milliseconds(1));
    last_ = base::TimeTicks::Now();
    witness.ApprovedDispatch("page", Lease(), last_, 2);
    environment_.FastForwardBy(base::Milliseconds(1));
    event_ = base::TimeTicks::Now();
    environment_.FastForwardBy(base::Milliseconds(3));
    admitted_ = base::TimeTicks::Now();
    witness.RetiredPage("page", Lease(), base::DictValue().Set("documentToken", "document")
        .Set("retiredControlGeneration", "retired"), event_, admitted_, last_, 2, clock);
    environment_.FastForwardBy(base::Milliseconds(1));
  }
  base::test::TaskEnvironment environment_{base::test::TaskEnvironment::TimeSource::MOCK_TIME};
  base::TimeTicks last_, event_, admitted_;
};
TEST_F(NativeCdpRetirementMeasurementTest, PreservesOriginalClocksAndOneUseCompletion) {
  auto witness = Arm();
  const auto arm = witness->ArmedRecord();
  EXPECT_FALSE(witness->HasFreshDispatches());
  DispatchAndRetire(*witness);
  auto row = witness->Complete(true);
  ASSERT_EQ(*row.FindString("status"), "sampled");
  EXPECT_EQ(*row.FindString("nonce"), *arm.FindString("nonce"));
  const auto& page = row.FindList("pages")->front().GetDict();
  EXPECT_EQ(*page.FindString("observedCount"), "2");
  EXPECT_NE(*page.FindString("eventUs"), *page.FindString("admittedUs"));
  EXPECT_NE(*page.FindString("eventUs"), *page.FindString("lastDispatchUs"));
  EXPECT_EQ(*witness->Complete(true).FindString("status"), "refused");
}
TEST_F(NativeCdpRetirementMeasurementTest, ReadinessRequiresActualNewFinalDispatch) {
  auto witness = Arm();
  EXPECT_FALSE(witness->HasFreshDispatches());
  environment_.FastForwardBy(base::Milliseconds(1));
  witness->ApprovedDispatch("page", Lease(), base::TimeTicks::Now(), 2);
  EXPECT_TRUE(witness->HasFreshDispatches());
  environment_.FastForwardBy(base::Seconds(5));
  EXPECT_FALSE(witness->HasFreshDispatches());
}
TEST_F(NativeCdpRetirementMeasurementTest, DispatchAfterRetirementCannotQualify) {
  auto witness = Arm(); DispatchAndRetire(*witness);
  witness->ApprovedDispatch("page", Lease(), base::TimeTicks::Now(), 3);
  EXPECT_EQ(*witness->Complete(true).FindString("status"), "refused");
}
TEST_F(NativeCdpRetirementMeasurementTest, ReplacementLeaseCannotQualify) {
  auto witness = Arm(); auto replacement = Lease(); replacement.Set("documentToken", "other");
  witness->ApprovedDispatch("page", replacement, base::TimeTicks::Now(), 2);
  EXPECT_EQ(*witness->Complete(true).FindString("status"), "refused");
}
TEST_F(NativeCdpRetirementMeasurementTest, UnprovenPhysicalClockCannotQualify) {
  auto witness = Arm(); DispatchAndRetire(*witness, false);
  EXPECT_EQ(*witness->Complete(true).FindString("status"), "refused");
}
TEST_F(NativeCdpRetirementMeasurementTest, GenuineDestructionIsRetainedOnlyAfterStop) {
  auto witness = Arm(); DispatchAndRetire(*witness);
  witness->DocumentDestroyed("page", base::TimeTicks::Now());
  environment_.FastForwardBy(base::Milliseconds(1));
  auto row = witness->Complete(true);
  ASSERT_EQ(*row.FindString("status"), "sampled");
  EXPECT_EQ(*row.FindList("pages")->front().GetDict().FindString("documentState"), "destroyed");
  auto takeover = Arm(NativeCdpRetirementMeasurement::Mode::kTakeover);
  DispatchAndRetire(*takeover); takeover->DocumentDestroyed("page", base::TimeTicks::Now());
  EXPECT_EQ(*takeover->Complete(true).FindString("status"), "refused");
}
TEST_F(NativeCdpRetirementMeasurementTest, OriginalDeadlineAndFamilyRemainMandatory) {
  auto witness = Arm(); DispatchAndRetire(*witness);
  environment_.FastForwardBy(witness->deadline() - base::TimeTicks::Now());
  EXPECT_FALSE(witness->current());
  EXPECT_EQ(*witness->Complete(true).FindString("status"), "refused");
  auto replaced = Arm(); DispatchAndRetire(*replaced);
  EXPECT_EQ(*replaced->Complete(false).FindString("status"), "refused");
}
}  // namespace
}  // namespace aux
