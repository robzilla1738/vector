// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef BASE_TEST_SCOPED_STANDALONE_MOCK_TIME_H_
#define BASE_TEST_SCOPED_STANDALONE_MOCK_TIME_H_

#include "base/memory/scoped_refptr.h"
#include "base/test/scoped_mock_clock_override.h"
#include "base/test/test_mock_time_task_runner.h"
#include "base/time/time.h"

namespace base::test {

// For suites that already own a RunLoop delegate. AdvanceClock advances the
// global clock and this scope's timer clock without executing queued tasks.
class ScopedStandaloneMockTime {
 public:
  ScopedStandaloneMockTime();
  ScopedStandaloneMockTime(const ScopedStandaloneMockTime&) = delete;
  ScopedStandaloneMockTime& operator=(const ScopedStandaloneMockTime&) = delete;
  ~ScopedStandaloneMockTime();

  void AdvanceClock(TimeDelta delta);

 private:
  // Restore the original current task runner before runner/clock teardown.
  ScopedMockClockOverride clock_;
  scoped_refptr<TestMockTimeTaskRunner> runner_;
  TestMockTimeTaskRunner::ScopedContext context_;
};

}  // namespace base::test

#endif  // BASE_TEST_SCOPED_STANDALONE_MOCK_TIME_H_
