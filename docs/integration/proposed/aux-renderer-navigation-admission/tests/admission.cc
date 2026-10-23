#include "content/browser/renderer_host/aux_renderer_navigation_admission.h"
#include <cassert>

using namespace content::aux_migration;
int main() {
  int renderer, abandoned, in_process, request, denied_request;
  assert(!InspectRendererNavigationAdmissionForMigration().closed);
  {
    ScopedRendererInitAdmission actual_init;
    assert(actual_init.admitted());
    ObserveRendererLaunchStarted(&renderer, false);
    {
      ScopedNavigationAdmission begin(&request, true);
      ScopedNavigationAdmission resumed(&request, false);
      assert(begin.admitted() && resumed.admitted());
      auto before = InspectRendererNavigationAdmissionForMigration();
      assert(before.active_renderer_init_calls == 1);
      assert(before.pending_renderer_launches == 1);
      assert(before.active_navigation_dispatches == 2 && before.live_navigation_requests == 1);
      CloseRendererNavigationAdmissionForMigration();
      ScopedRendererInitAdmission blocked_reuse;
      ScopedNavigationAdmission blocked_new(&denied_request, true);
      ScopedNavigationAdmission blocked_resume(&request, false);
      assert(!blocked_reuse.admitted() && !blocked_new.admitted() && !blocked_resume.admitted());
      {
        ScopedRendererLaunchCallback actual_late_callback(&renderer);
        auto during = InspectRendererNavigationAdmissionForMigration();
        assert(during.pending_renderer_launches == 1 && during.late_renderer_launch_callbacks == 1);
      }
      assert(InspectRendererNavigationAdmissionForMigration().pending_renderer_launches == 0);
      ObserveNavigationDestruction(&request);
      auto cleanup = InspectRendererNavigationAdmissionForMigration();
      assert(cleanup.active_navigation_dispatches == 2 && cleanup.live_navigation_requests == 0);
      assert(cleanup.unresolved_navigation_cleanups == 1);
    }
    // Captured operations already admitted before closure may report later.
    ObserveRendererLaunchStarted(&abandoned, false);
    ObserveRendererHostDestruction(&abandoned);
    assert(InspectRendererNavigationAdmissionForMigration().unresolved_renderer_launches == 1);
    ObserveRendererLaunchStarted(&in_process, true);
    { ScopedRendererLaunchCallback synthetic_in_process_callback(&in_process); }
    assert(InspectRendererNavigationAdmissionForMigration().unresolved_renderer_launches == 2);
    ObserveUnsupportedNavigationCancellation();
  }
  CloseRendererNavigationAdmissionForMigration();
  const auto end = InspectRendererNavigationAdmissionForMigration();
  assert(end.closed && end.generation == 2 && end.active_renderer_init_calls == 0);
  assert(end.active_navigation_dispatches == 0 && end.pending_renderer_launches == 0);
  assert(end.unresolved_renderer_launches == 2 && end.unresolved_navigation_cleanups == 1);
  assert(end.unsupported_navigation_cancellations == 1);
}
