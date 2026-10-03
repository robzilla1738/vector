// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "base/test/scoped_standalone_mock_time.h"

#include "base/check_op.h"
#include "base/memory/ref_counted.h"

namespace base::test {

ScopedStandaloneMockTime::ScopedStandaloneMockTime()
    : runner_(MakeRefCounted<TestMockTimeTaskRunner>(
          Time::Now(), TimeTicks::Now(),
          TestMockTimeTaskRunner::Type::kStandalone)),
      context_(runner_) {}

ScopedStandaloneMockTime::~ScopedStandaloneMockTime() = default;

void ScopedStandaloneMockTime::AdvanceClock(TimeDelta delta) {
  DCHECK_GE(delta, TimeDelta());
  if (delta.is_positive()) {
    clock_.Advance(delta);
  }
  runner_->AdvanceMockTickClock(delta);
}

}  // namespace base::test
