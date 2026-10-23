// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef EXTENSIONS_BROWSER_SERVICE_WORKER_SERVICE_WORKER_START_ADMISSION_H_
#define EXTENSIONS_BROWSER_SERVICE_WORKER_SERVICE_WORKER_START_ADMISSION_H_
#include <cstdint>
namespace extensions {
// Native process-owner state. Access is restricted by the queue to the browser
// UI sequence. No reopen/reset path: existing and future queues share it.
class ServiceWorkerStartAdmission {
 public:
  uint64_t generation() const { return generation_; }
  bool open() const { return open_; }
  bool Accepts(uint64_t captured_generation) const {
    return open_ && captured_generation == generation_;
  }
  void Close() {
    if (open_) {
      open_ = false;
      ++generation_;  // Exactly one transition, never a caller-supplied epoch.
    }
  }
 private:
  bool open_ = true;
  uint64_t generation_ = 1;
};
}  // namespace extensions
#endif
