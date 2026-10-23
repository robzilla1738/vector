#include "chrome/browser/ui/aux_session_writer_participant.h"
#include <cassert>

int main() {
  aux::SessionWriterParticipantObservation result;
  result.loaded_profile_count = 1;
  result.profiles.resize(1);
  auto& profile = result.profiles[0];
  profile.outcome = aux::ProfileSessionWriterOutcome::kServiceObserved;
  profile.app_session.outcome = aux::ProfileSessionWriterOutcome::kServiceOwnerLost;
  sessions::SessionWriteCompletion browser_write;
  browser_write.captured_batch_had_commands = true;
  browser_write.backend_outcomes.push_back(sessions::SessionBackendWriteOutcome::kWritten);
  profile.write = browser_write;
  sessions::SessionWriteCompletion app_write;
  app_write.captured_batch_had_commands = true;
  app_write.backend_outcomes.push_back(sessions::SessionBackendWriteOutcome::kFileWriteError);
  profile.app_session.write = app_write;
  assert(profile.write->captured_writes_completed());
  assert(!profile.app_session.write->captured_writes_completed());
  assert(!profile.app_session.close.has_value());
  assert(profile.outcome != profile.app_session.outcome);
  aux::SessionWriterSubmissionWindow writes;
  writes.Begin();
  // Inline browser callback must not advance before the app operation submits.
  assert(!writes.CanAdvance(0));
  assert(!writes.CanAdvance(1));
  writes.Finish();
  assert(!writes.CanAdvance(1));
  assert(writes.CanAdvance(0));
  aux::SessionWriterSubmissionWindow closes;
  closes.Begin();
  assert(!closes.CanAdvance(0));
  closes.Finish();
  assert(closes.CanAdvance(0));
}
