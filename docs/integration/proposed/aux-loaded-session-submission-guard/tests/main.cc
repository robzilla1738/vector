#include <cassert>
#include <iostream>
#include "chrome/browser/ui/aux_session_writer_participant.h"

int main() {
  int checks = 0;
  // Both actual actor transition predicates use this production state class.
  for (int phase = 0; phase < 2; ++phase) {
    aux::SessionWriterSubmissionWindow submission;
    size_t pending = 0;
    submission.Begin();
    ++pending;  // Profile 0 submitted.
    --pending;  // Its callback runs in a nested loop before profile 1 submission.
    assert(!submission.CanAdvance(pending)); ++checks;
    ++pending;  // Profile 1 is still submitted by the outer loop.
    assert(!submission.CanAdvance(pending)); ++checks;
    submission.Finish();
    assert(!submission.CanAdvance(pending)); ++checks;
    --pending;
    assert(submission.CanAdvance(pending)); ++checks;
    // Zero-service inventory is only complete after the loop has closed.
    submission.Begin();
    assert(!submission.CanAdvance(0)); ++checks;
    submission.Finish();
    assert(submission.CanAdvance(0)); ++checks;
  }
  std::cout << "PASS:" << checks << " production submission-window checks\n";
}
