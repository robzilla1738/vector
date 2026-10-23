#include "components/sessions/core/session_writer_admission.h"
#include "components/sessions/core/session_write_completion.h"
#include <cassert>
#include <iostream>
#include <memory>

int main() {
  unsigned checks = 0;
  auto check = [&](bool value) { assert(value); ++checks; };
  sessions::SessionWriterAdmission admission;
  check(!admission.closed());
  check(admission.Admit() && admission.Admit());
  check(admission.refused() == 0);
  admission.ObserveFailedWrite();
  check(admission.failed_writes() == 1);
  admission.Close();
  check(admission.closed());
  check(!admission.Admit());
  check(admission.refused() == 1 && admission.failed_writes() == 1);
  admission.Close();
  check(!admission.Admit());
  check(admission.closed() && admission.refused() == 2);
  admission.ObserveFailedWrite();
  check(admission.failed_writes() == 2 && !admission.unknown());
  sessions::SessionBackendCloseObservation absent;
  check(!absent.admission_closed && !absent.owning_sequence_observed &&
        !absent.owned_file_object_released);
  sessions::SessionManagerCloseObservation incomplete;
  incomplete.unsubmitted_commands = 3;
  incomplete.deferred_encryption_operations = 2;
  incomplete.unsubmitted_reset = true;
  check(incomplete.unsubmitted_commands == 3 &&
        incomplete.deferred_encryption_operations == 2 &&
        incomplete.unsubmitted_reset);
  sessions::SessionWriteCompletion refused;
  refused.captured_batch_had_commands = true;
  refused.backend_outcomes = {sessions::SessionBackendWriteOutcome::kAdmissionClosed};
  check(!refused.captured_writes_completed());
  std::vector<std::unique_ptr<int>> pending;
  std::vector<std::unique_ptr<int>> running;
  pending.push_back(std::make_unique<int>(7));
  running.push_back(nullptr);  // the already-invoked current closure
  running.push_back(std::make_unique<int>(11));
  running.push_back(std::make_unique<int>(13));
  auto* second = running[1].get();
  auto* third = running[2].get();
  sessions::RetainUnrunSessionOperations(pending, running, 1);
  check(pending.size() == 3 && *pending[0] == 7);
  check(pending[1].get() == second && pending[2].get() == third);
  check(!running[1] && !running[2]);
  sessions::RetainUnrunSessionOperations(pending, running, running.size());
  check(pending.size() == 3);
  std::cout << "PASS " << checks << " production admission/result checks\n";
}
