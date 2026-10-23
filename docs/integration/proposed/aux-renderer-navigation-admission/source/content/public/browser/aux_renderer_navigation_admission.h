#ifndef CONTENT_PUBLIC_BROWSER_AUX_RENDERER_NAVIGATION_ADMISSION_H_
#define CONTENT_PUBLIC_BROWSER_AUX_RENDERER_NAVIGATION_ADMISSION_H_

#include <cstddef>
#include <cstdint>
#include "content/common/content_export.h"

namespace content::aux_migration {

// Process-local component observations, never renderer exit/storage drain proof.
struct RendererNavigationAdmissionSnapshot {
  uint64_t generation;  // 1 open -> 2 permanently closed.
  bool closed;
  size_t active_renderer_init_calls;
  size_t pending_renderer_launches;
  size_t unresolved_renderer_launches;
  size_t late_renderer_launch_callbacks;
  size_t active_navigation_dispatches;
  size_t live_navigation_requests;
  size_t unresolved_navigation_cleanups;
  size_t unsupported_navigation_cancellations;
};

// Permanent native close. No reset, scope selector, environment or JS grant.
CONTENT_EXPORT void CloseRendererNavigationAdmissionForMigration();
CONTENT_EXPORT RendererNavigationAdmissionSnapshot
InspectRendererNavigationAdmissionForMigration();

}  // namespace content::aux_migration
#endif
