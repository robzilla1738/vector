#!/usr/bin/env python3
"""Compose reviewed proposals in a fresh disposable copy, never the native checkout."""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

repository = Path(__file__).resolve().parents[1]
proposals = repository / 'docs/integration/proposed'
sha = lambda raw: hashlib.sha256(raw).hexdigest()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('native_root', type=Path)
parser.add_argument('--output', type=Path, default=repository / 'out/native-reuse-composition')
parser.add_argument('--through', help='Replay through this exact proposal, inclusive')
options = parser.parse_args()
native = options.native_root.resolve()
output = options.output.resolve()
if output.exists() or output == native or native in output.parents or output in native.parents:
    raise ValueError('Composition needs a fresh output outside the native checkout')

steps = [
    ('native-provided-entrypoints.patch', 'native-provided-entrypoints.json'),
    ('native-provided-profile-security.patch', 'native-provided-profile-security.json'),
    ('local-vault-bootstrap/local-vault-bootstrap.patch', 'local-vault-bootstrap/manifest.json'),
    ('local-profile-binding/local-profile-binding.patch', 'local-profile-binding/manifest.json'),
    ('browser-profile-window/binding-index-followup.patch', 'browser-profile-window/binding-index-source.json'),
    ('browser-profile-window/browser-profile-window.patch', 'browser-profile-window/source-sha256.json'),
    ('native-provided-supervisor.patch', 'native-provided-supervisor.json'),
    ('native-provided-capture-launch.patch', 'native-provided-capture-launch.json'),
    ('provided-native-auth/provided-native-auth.patch', 'provided-native-auth/source-sha256.json'),
    ('node-native-boundary/daemon-environment.patch', 'node-native-boundary/source-sha256.json'),
    ('node-native-boundary/remove-obsolete-importer-env.patch', None),
    ('cdp-startup-contract/fixed-discovery-env.patch', None),
    ('retired-passkey-broker/disable-independent-provider.patch', 'retired-passkey-broker/source-and-anchor.json'),
] + [(f'native-provided-{name}.patch', f'native-provided-{name}.json') for name in
     ['preference-results', 'dock-results', 'import-results', 'import-consent', 'omnibox-results']]
steps.append(('native-about-results/native-about-results.patch', 'native-about-results/manifest.json'))
steps.extend((f'native-provided-{name}.patch', f'native-provided-{name}.json') for name in ['contextual-model', 'contextual-binding'])
steps.append(('native-surface-routes/native-surface-routes.patch', 'native-surface-routes/manifest.json'))
steps.append(('native-task-feed/native-task-feed.patch', 'native-task-feed/manifest.json'))
steps.append(('native-agent-tabs/native-agent-tabs.patch', 'native-agent-tabs/manifest.json'))
steps.extend((f'native-compile-fixes/{name}/fix.patch', f'native-compile-fixes/{name}/manifest.json') for name in [
    '001-omnibox-callback', '002-event-enum-arrays',
    '003-task-popover-shadow', '003-platform-boundaries',
])
steps.append(('native-preference-effects/native.patch', 'native-preference-effects/manifest.json'))
steps.append(('native-window-vibrancy/native.patch', 'native-window-vibrancy/manifest.json'))
steps.append(('native-horizontal-shrink/native.patch', 'native-horizontal-shrink/manifest.json'))
steps.append(('native-vertical-navigation/native.patch', 'native-vertical-navigation/manifest.json'))
steps.append(('native-compile-fixes/004-horizontal-boundaries/fix.patch', 'native-compile-fixes/004-horizontal-boundaries/manifest.json'))
steps.append(('native-preference-consumers/native.patch', 'native-preference-consumers/manifest.json'))
steps.append(('native-ntp-preloader/port-native.patch', 'native-ntp-preloader/port-manifest.json'))
steps.append(('native-ntp-preloader/content-recovery.patch', 'native-ntp-preloader/content-recovery-manifest.json'))
steps.append(('native-ntp-compile-fixes/fix.patch', 'native-ntp-compile-fixes/manifest.json'))
steps.append(('native-ntp-background/native.patch', 'native-ntp-background/manifest.json'))
steps.append(('native-agent-background-target/native.patch', 'native-agent-background-target/manifest.json'))
steps.append(('native-carrier-profile-layout/fix.patch', 'native-carrier-profile-layout/manifest.json'))
steps.append(('native-ntp-final-guards/native.patch', 'native-ntp-final-guards/manifest.json'))
steps.append(('native-ntp-build-fixes/fix.patch', 'native-ntp-build-fixes/manifest.json'))
# Source-faithful same-window workspace transaction, staged in dependency order.
steps.extend([
    ('native-profile-switch-overlay/native.patch', 'native-profile-switch-overlay/manifest.json'),
    ('native-profile-switch-owner/owner-primitives.patch', 'native-profile-switch-owner/owner-primitives-manifest.json'),
    ('native-profile-switch-workspace/native.patch', 'native-profile-switch-workspace/manifest.json'),
    ('native-profile-switch-workspace/factory.patch', 'native-profile-switch-workspace/factory-manifest.json'),
    ('native-profile-switch-owner/transaction-map/ownership.patch', 'native-profile-switch-owner/transaction-map/ownership-manifest.json'),
    ('native-profile-switch-owner/transaction-map/commands.patch', 'native-profile-switch-owner/transaction-map/commands-manifest.json'),
    ('native-profile-switch-owner/transaction-map/session-rebuild.patch', 'native-profile-switch-owner/transaction-map/session-rebuild-manifest.json'),
    ('native-profile-switch-owner/transaction-map/session-helper.patch', 'native-profile-switch-owner/transaction-map/session-helper-manifest.json'),
    ('native-profile-switch-owner/transaction-map/stable-controllers.patch', 'native-profile-switch-owner/transaction-map/stable-controllers-manifest.json'),
    ('native-profile-switch-owner/transaction-map/vertical-controller.patch', 'native-profile-switch-owner/transaction-map/vertical-controller-manifest.json'),
    ('native-profile-switch-identity/native.patch', 'native-profile-switch-identity/manifest.json'),
    ('native-profile-switch-collections/native.patch', 'native-profile-switch-collections/manifest.json'),
    ('native-profile-switch-owner/transaction-map/bookmark-views.patch', 'native-profile-switch-owner/transaction-map/bookmark-views-manifest.json'),
    ('native-profile-switch-build-registration/native.patch', 'native-profile-switch-build-registration/manifest.json'),
    ('native-mini-popup-options/native-mini-popup-options.patch', 'native-mini-popup-options/manifest.json'),
    ('native-profile-switch-build-fixes/native.patch', 'native-profile-switch-build-fixes/manifest.json'),
    ('native-profile-switch-init-profile/rebased-v48.patch', 'native-profile-switch-init-profile/rebased-v48-manifest.json'),
    ('native-profile-switch-owner/transaction-map/session-cache-policy.patch', 'native-profile-switch-owner/transaction-map/session-cache-policy-manifest.json'),
    ('native-profile-switch-owner/transaction-map/profile-features.patch', 'native-profile-switch-owner/transaction-map/profile-features-manifest.json'),
    ('native-profile-switch-owner/transaction-map/cookie-page-action.patch', 'native-profile-switch-owner/transaction-map/cookie-page-action-manifest.json'),
    ('native-profile-switch-transaction/native.patch', 'native-profile-switch-transaction/manifest.json'),
    ('native-profile-switch-transaction/build-registration/native.patch', 'native-profile-switch-transaction/build-registration/manifest.json'),
    ('native-mini-popup-position-focus/native-mini-popup-position-focus.patch', 'native-mini-popup-position-focus/manifest.json'),
    ('native-profile-switch-close/native.patch', 'native-profile-switch-close/manifest.json'),
    ('native-mini-popup-transparency/native-mini-popup-transparency.patch', 'native-mini-popup-transparency/manifest.json'),
    ('native-sidebar-profile-rebind/native.patch', 'native-sidebar-profile-rebind/manifest.json'),
    ('native-profile-switch-dialogs/native.patch', 'native-profile-switch-dialogs/manifest.json'),
    ('native-profile-switch-sidebar-owner/native.patch', 'native-profile-switch-sidebar-owner/manifest.json'),
    ('native-profile-switch-dialogs/build-registration/native.patch', 'native-profile-switch-dialogs/build-registration/manifest.json'),
    ('native-sidebar-profile-rebind/abort-state.patch', 'native-sidebar-profile-rebind/abort-state-manifest.json'),
    ('native-profile-switch-owner/transaction-map/side-panel-manager.patch', 'native-profile-switch-owner/transaction-map/side-panel-manager-manifest.json'),
    ('native-profile-switch-owner/transaction-map/side-panel-pinning.patch', 'native-profile-switch-owner/transaction-map/side-panel-pinning-manifest.json'),
    ('native-profile-switch-owner/transaction-map/side-panel-build-registration/native.patch', 'native-profile-switch-owner/transaction-map/side-panel-build-registration/manifest.json'),
    ('native-popup-background-override/native-popup-background-override.patch', 'native-popup-background-override/manifest.json'),
    ('native-profile-switch-file-dialog/native.patch', 'native-profile-switch-file-dialog/manifest.json'),
    ('native-profile-switch-omnibox-core/native.patch', 'native-profile-switch-omnibox-core/manifest.json'),
    ('native-profile-switch-omnibox-core/build-registration/native.patch', 'native-profile-switch-omnibox-core/build-registration/manifest.json'),
    ('native-profile-switch-location-bar/native.patch', 'native-profile-switch-location-bar/manifest.json'),
    ('native-profile-switch-location-bar/build-registration/native.patch', 'native-profile-switch-location-bar/build-registration/manifest.json'),
    ('native-profile-switch-omnibox-saved-state/native.patch', 'native-profile-switch-omnibox-saved-state/manifest.json'),
    ('native-profile-switch-owner/transaction-map/toolbar-owned-actions.patch', 'native-profile-switch-owner/transaction-map/toolbar-owned-actions-manifest.json'),
    ('native-popup-material/native.patch', 'native-popup-material/manifest.json'),
    ('native-profile-switch-toolbar-status/native.patch', 'native-profile-switch-toolbar-status/manifest.json'),
    ('native-profile-switch-owner/transaction-map/avatar-state-manager.patch', 'native-profile-switch-owner/transaction-map/avatar-state-manager-manifest.json'),
    ('native-profile-switch-toolbar-build-registration/native.patch', 'native-profile-switch-toolbar-build-registration/manifest.json'),
    ('native-profile-switch-user-education/native.patch', 'native-profile-switch-user-education/manifest.json'),
    ('native-profile-switch-owner/transaction-map/reload-metrics-profile.patch', 'native-profile-switch-owner/transaction-map/reload-metrics-profile-manifest.json'),
    ('native-profile-switch-user-education/build-registration/native.patch', 'native-profile-switch-user-education/build-registration/manifest.json'),
    ('native-profile-switch-browser-view-prefs/native.patch', 'native-profile-switch-browser-view-prefs/manifest.json'),
    ('native-popup-resize-animation/native.patch', 'native-popup-resize-animation/manifest.json'),
    ('native-profile-switch-bookmark-ipc/native.patch', 'native-profile-switch-bookmark-ipc/manifest.json'),
    ('native-profile-switch-stock-panels/native.patch', 'native-profile-switch-stock-panels/manifest.json'),
    ('native-profile-switch-browser-actions/native.patch', 'native-profile-switch-browser-actions/manifest.json'),
    ('native-profile-switch-owner/transaction-map/standard-services-profile.patch', 'native-profile-switch-owner/transaction-map/standard-services-profile-manifest.json'),
    ('native-popup-reopen/native.patch', 'native-popup-reopen/manifest.json'),
    ('native-popup-profile-ownership/native.patch', 'native-popup-profile-ownership/manifest.json'),
    ('native-profile-switch-live-context/native.patch', 'native-profile-switch-live-context/manifest.json'),
    ('native-profile-switch-action-service-build-registration/native.patch', 'native-profile-switch-action-service-build-registration/manifest.json'),
    ('native-profile-switch-live-context/const-query-fix/native.patch', 'native-profile-switch-live-context/const-query-fix/manifest.json'),
    ('native-profile-switch-focus/native.patch', 'native-profile-switch-focus/manifest.json'),
    ('native-profile-switch-owner/transaction-map/lens-entry-profile.patch', 'native-profile-switch-owner/transaction-map/lens-entry-profile-manifest.json'),
    ('native-profile-switch-install-watcher/native.patch', 'native-profile-switch-install-watcher/manifest.json'),
    ('native-profile-switch-owner/transaction-map/lens-build-registration/native.patch', 'native-profile-switch-owner/transaction-map/lens-build-registration/manifest.json'),
    ('native-profile-switch-focus/platform-header-fix/native.patch', 'native-profile-switch-focus/platform-header-fix/manifest.json'),
    ('native-profile-switch-private-services/native.patch', 'native-profile-switch-private-services/manifest.json'),
    ('native-profile-switch-owner/transaction-map/download-profile-owners.patch', 'native-profile-switch-owner/transaction-map/download-profile-owners-manifest.json'),
    ('native-popup-picker-lifecycle/native.patch', 'native-popup-picker-lifecycle/manifest.json'),
    ('native-profile-switch-extension-helper-abort/native.patch', 'native-profile-switch-extension-helper-abort/manifest.json'),
    ('native-profile-switch-lens-abort/native.patch', 'native-profile-switch-lens-abort/manifest.json'),
    ('native-profile-switch-private-services/build-registration/native.patch', 'native-profile-switch-private-services/build-registration/manifest.json'),
    ('native-profile-switch-owner/transaction-map/cookie-profile-owners.patch', 'native-profile-switch-owner/transaction-map/cookie-profile-owners-manifest.json'),
    ('native-profile-switch-browser-actions/source-abort/native.patch', 'native-profile-switch-browser-actions/source-abort/manifest.json'),
    ('native-popup-retirement/native.patch', 'native-popup-retirement/manifest.json'),
    ('native-profile-switch-agent-tabs-ownership/native.patch', 'native-profile-switch-agent-tabs-ownership/manifest.json'),
    ('native-profile-switch-owner/transaction-map/source-rollback-owners.patch', 'native-profile-switch-owner/transaction-map/source-rollback-owners-manifest.json'),
    ('native-profile-switch-owner/transaction-map/context-highlight-profile.patch', 'native-profile-switch-owner/transaction-map/context-highlight-profile-manifest.json'),
    ('native-profile-switch-owner/transaction-map/tab-strip-profile-guard.patch', 'native-profile-switch-owner/transaction-map/tab-strip-profile-guard-manifest.json'),
    ('native-profile-switch-provider/native.patch', 'native-profile-switch-provider/manifest.json'),
    ('native-profile-switch-provider/build-registration/native.patch', 'native-profile-switch-provider/build-registration/manifest.json'),
    ('native-profile-switch-cast/native.patch', 'native-profile-switch-cast/manifest.json'),
    ('native-profile-switch-owner/transaction-map/skills-toast-profile.patch', 'native-profile-switch-owner/transaction-map/skills-toast-profile-manifest.json'),
    ('native-popup-startup/native.patch', 'native-popup-startup/manifest.json'),
    ('native-popup-keepalive/native.patch', 'native-popup-keepalive/manifest.json'),
    ('native-profile-switch-provider-readiness/native.patch', 'native-profile-switch-provider-readiness/manifest.json'),
    ('native-profile-switch-owner/transaction-map/weak-profile-mutation-scopes.patch', 'native-profile-switch-owner/transaction-map/weak-profile-mutation-scopes-manifest.json'),
    ('native-profile-switch-chrome-labs/native.patch', 'native-profile-switch-chrome-labs/manifest.json'),
    ('native-popup-focus-transfer/native.patch', 'native-popup-focus-transfer/manifest.json'),
    ('native-fidelity-integration-build-registration/native.patch', 'native-fidelity-integration-build-registration/manifest.json'),
    ('native-profile-switch-provider/buildflag-import/native.patch', 'native-profile-switch-provider/buildflag-import/manifest.json'),
    ('native-profile-switch-target-eligibility/native.patch', 'native-profile-switch-target-eligibility/manifest.json'),
    ('native-profile-switch-findbar/native.patch', 'native-profile-switch-findbar/manifest.json'),
    ('native-agent-tabs-counterpart/native.patch', 'native-agent-tabs-counterpart/manifest.json'),
    ('native-profile-switch-owner/transaction-map/shared-tab-profile-lifecycle.patch', 'native-profile-switch-owner/transaction-map/shared-tab-profile-lifecycle-manifest.json'),
    ('native-profile-switch-owner/transaction-map/sync-model-profile-transfer.patch', 'native-profile-switch-owner/transaction-map/sync-model-profile-transfer-manifest.json'),
    ('native-profile-switch-owner/transaction-map/sync-cohort-validation.patch', 'native-profile-switch-owner/transaction-map/sync-cohort-validation-manifest.json'),
    ('native-profile-switch-data-protection/native.patch', 'native-profile-switch-data-protection/manifest.json'),
    ('native-agent-tabs-layout/native.patch', 'native-agent-tabs-layout/manifest.json'),
    ('native-profile-switch-sync-provider/native.patch', 'native-profile-switch-sync-provider/manifest.json'),
    ('native-profile-switch-cache-metadata/native.patch', 'native-profile-switch-cache-metadata/manifest.json'),
    ('native-agent-tabs-horizontal/native.patch', 'native-agent-tabs-horizontal/manifest.json'),
    ('native-profile-switch-close-deferral/native.patch', 'native-profile-switch-close-deferral/manifest.json'),
    ('native-profile-switch-provider-weak/native.patch', 'native-profile-switch-provider-weak/manifest.json'),
    ('native-profile-switch-close-deferral/browser-type-include/native.patch', 'native-profile-switch-close-deferral/browser-type-include/manifest.json'),
    ('native-profile-switch-owner/transaction-map/ai-mode-private-profile-owner.patch', 'native-profile-switch-owner/transaction-map/ai-mode-private-profile-owner-manifest.json'),
    ('native-profile-switch-owner/transaction-map/actor-profile-lifecycle.patch', 'native-profile-switch-owner/transaction-map/actor-profile-lifecycle-manifest.json'),
    ('native-profile-switch-actor-ai-provider/native.patch', 'native-profile-switch-actor-ai-provider/manifest.json'),
    ('native-agent-tabs-secure-page/native.patch', 'native-agent-tabs-secure-page/manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-iph-profile-lifecycle.patch', 'native-profile-switch-owner/transaction-map/glic-iph-profile-lifecycle-manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-dormant-bubble-profile.patch', 'native-profile-switch-owner/transaction-map/glic-dormant-bubble-profile-manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-button-profile-lifecycle.patch', 'native-profile-switch-owner/transaction-map/glic-button-profile-lifecycle-manifest.json'),
    ('native-profile-switch-glic-iph-provider/native.patch', 'native-profile-switch-glic-iph-provider/manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-private-graph-profile.patch', 'native-profile-switch-owner/transaction-map/glic-private-graph-profile-manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-split-profile-lifecycle.patch', 'native-profile-switch-owner/transaction-map/glic-split-profile-lifecycle-manifest.json'),
    ('native-profile-switch-owner/transaction-map/glic-check-op-dependencies.patch', 'native-profile-switch-owner/transaction-map/glic-check-op-dependencies-manifest.json'),
    ('native-profile-switch-glic-split-provider/native.patch', 'native-profile-switch-glic-split-provider/manifest.json'),
    ('native-agent-group-model/native.patch', 'native-agent-group-model/manifest.json'),
    ('native-agent-group-model/build-registration/native.patch', 'native-agent-group-model/build-registration/manifest.json'),
    ('native-profile-switch-async-owner/native.patch', 'native-profile-switch-async-owner/manifest.json'),
    ('native-profile-switch-async-owner/build-registration/native.patch', 'native-profile-switch-async-owner/build-registration/manifest.json'),
    ('native-agent-tabs-native-ui/native.patch', 'native-agent-tabs-native-ui/manifest.json'),
    ('native-agent-tabs-native-ui/vertical-visibility/native.patch', 'native-agent-tabs-native-ui/vertical-visibility/manifest.json'),
    ('native-profile-switch-direct-dispatch/native.patch', 'native-profile-switch-direct-dispatch/manifest.json'),
    ('native-profile-switch-menu-forwarding/native.patch', 'native-profile-switch-menu-forwarding/manifest.json'),
    ('native-daemon-startup-budget/native.patch', 'native-daemon-startup-budget/manifest.json'),
    ('native-agent-tabs-paint/native.patch', 'native-agent-tabs-paint/manifest.json'),
    ('native-profile-switch-glic-weak-order/native.patch', 'native-profile-switch-glic-weak-order/manifest.json'),
    ('native-agent-tabs-api155/native.patch', 'native-agent-tabs-api155/manifest.json'),
    ('native-provided-node-development/native.patch', 'native-provided-node-development/manifest.json'),
    ('native-profile-menu-rows/native.patch', 'native-profile-menu-rows/manifest.json'),
    ('native-profile-preview-presentation/native.patch', 'native-profile-preview-presentation/manifest.json'),
    ('native-profile-preview-presentation/build-registration/native.patch', 'native-profile-preview-presentation/build-registration/manifest.json'),
    ('native-profile-menu-panel/native.patch', 'native-profile-menu-panel/manifest.json'),
    ('native-agent-group-muted-info/native.patch', 'native-agent-group-muted-info/manifest.json'),
    ('native-profile-monogram-avatar/native.patch', 'native-profile-monogram-avatar/manifest.json'),
    ('native-profile-monogram-avatar/build-registration/native.patch', 'native-profile-monogram-avatar/build-registration/manifest.json'),
    ('native-profile-preview-coordinates/native.patch', 'native-profile-preview-coordinates/manifest.json'),
    ('native-profile-preview-api155/native.patch', 'native-profile-preview-api155/manifest.json'),
    ('native-pinned-tab-entry-model/native.patch', 'native-pinned-tab-entry-model/manifest.json'),
    ('native-profile-search-button/native.patch', 'native-profile-search-button/manifest.json'),
    ('native-profile-reuse-dependency-registration/native.patch', 'native-profile-reuse-dependency-registration/manifest.json'),
    ('native-pinned-tab-entry-registration/native.patch', 'native-pinned-tab-entry-registration/manifest.json'),
    ('native-profile-display-label/native.patch', 'native-profile-display-label/manifest.json'),
    ('native-profile-label-registration/native.patch', 'native-profile-label-registration/manifest.json'),
    ('native-original-startup-readiness/native.patch', 'native-original-startup-readiness/manifest.json'),
    ('native-profile-display-pref/registration/native.patch', 'native-profile-display-pref/registration/manifest.json'),
    ('native-pinned-tab-registration-owner/native.patch', 'native-pinned-tab-registration-owner/manifest.json'),
    ('native-pinned-tab-entry-actions/native.patch', 'native-pinned-tab-entry-actions/manifest.json'),
    ('native-pinned-tab-entry-view/native.patch', 'native-pinned-tab-entry-view/manifest.json'),
    ('native-profile-switch-owner/transaction-map/vertical-scroll-view.patch', 'native-profile-switch-owner/transaction-map/vertical-scroll-view-manifest.json'),
    ('native-profile-switch-owner/transaction-map/vertical-scroll-layout.patch', 'native-profile-switch-owner/transaction-map/vertical-scroll-layout-manifest.json'),
    ('native-profile-preview-scroll-mount/native.patch', 'native-profile-preview-scroll-mount/manifest.json'),
    ('native-profile-preview-page/native.patch', 'native-profile-preview-page/manifest.json'),
    ('native-profile-preview-data/native.patch', 'native-profile-preview-data/manifest.json'),
    ('native-sidebar-preview-registration/native.patch', 'native-sidebar-preview-registration/manifest.json'),
    ('native-profile-preview-page-admission/native.patch', 'native-profile-preview-page-admission/manifest.json'),
    ('native-preview-scroll-api155/native.patch', 'native-preview-scroll-api155/manifest.json'),
    ('native-scroll-layout-passkey/native.patch', 'native-scroll-layout-passkey/manifest.json'),
    ('native-pinned-tab-entry-service/native.patch', 'native-pinned-tab-entry-service/manifest.json'),
    ('native-pinned-tab-shared-registration/native.patch', 'native-pinned-tab-shared-registration/manifest.json'),
    ('native-profile-preview-roles/native.patch', 'native-profile-preview-roles/manifest.json'),
    ('native-profile-preview-region-owner/native.patch', 'native-profile-preview-region-owner/manifest.json'),
    ('native-profile-preview-fallback-progress/native.patch', 'native-profile-preview-fallback-progress/manifest.json'),
    ('native-profile-preview-owner-registration/native.patch', 'native-profile-preview-owner-registration/manifest.json'),
    ('native-profile-preview-pinned-service/native.patch', 'native-profile-preview-pinned-service/manifest.json'),
    ('native-pinned-tab-entry-context-menu/native.patch', 'native-pinned-tab-entry-context-menu/manifest.json'),
    ('native-profile-preview-prewarm/native.patch', 'native-profile-preview-prewarm/manifest.json'),
    ('native-pinned-tab-buildflag-import/native.patch', 'native-pinned-tab-buildflag-import/manifest.json'),
    ('native-preview-pin-api155/native.patch', 'native-preview-pin-api155/manifest.json'),
    ('native-horizontal-scroll-initialization/native.patch', 'native-horizontal-scroll-initialization/manifest.json'),
    ('native-pinned-reconciliation-api155/native.patch', 'native-pinned-reconciliation-api155/manifest.json'),
    ('native-profile-preview-image-cache/native.patch', 'native-profile-preview-image-cache/manifest.json'),
    ('native-preview-cache-reconciliation-registration/native.patch', 'native-preview-cache-reconciliation-registration/manifest.json'),
    ('native-pinned-session-restore-api155/native.patch', 'native-pinned-session-restore-api155/manifest.json'),
    ('native-profile-preview-input/native.patch', 'native-profile-preview-input/manifest.json'),
    ('native-profile-preview-input-registration/native.patch', 'native-profile-preview-input-registration/manifest.json'),
    ('native-profile-preview-immediate-overlay/native.patch', 'native-profile-preview-immediate-overlay/manifest.json'),
    ('native-sidebar-profile-button/native.patch', 'native-sidebar-profile-button/manifest.json'),
    ('native-sidebar-input-renderer-registration/native.patch', 'native-sidebar-input-renderer-registration/manifest.json'),
    ('native-sidebar-profile-controller/native.patch', 'native-sidebar-profile-controller/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-gate-popup/native.patch', 'native-profile-switch-owner/transaction-map/account-gate-popup/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-bootstrap-state/native.patch', 'native-profile-switch-owner/transaction-map/account-bootstrap-state/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-gate-policy/native.patch', 'native-profile-switch-owner/transaction-map/account-gate-policy/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-gate-continuation/native.patch', 'native-profile-switch-owner/transaction-map/account-gate-continuation/manifest.json'),
    ('native-profile-switch-owner/transaction-map/profile-identity/native.patch', 'native-profile-switch-owner/transaction-map/profile-identity/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-profile-list/native.patch', 'native-profile-switch-owner/transaction-map/account-profile-list/manifest.json'),
    ('native-profile-switch-owner/transaction-map/profile-identity-optional-pref/native.patch', 'native-profile-switch-owner/transaction-map/profile-identity-optional-pref/manifest.json'),
    ('native-profile-preview-admission/native.patch', 'native-profile-preview-admission/manifest.json'),
    ('native-profile-switch-owner/transaction-map/account-gate-source-ownership/native.patch', 'native-profile-switch-owner/transaction-map/account-gate-source-ownership/manifest.json'),
    ('native-profile-source-registration/native.patch', 'native-profile-source-registration/manifest.json'),
    ('native-profile-preview-region-hover/native.patch', 'native-profile-preview-region-hover/manifest.json'),
    ('native-profile-page-indicator/native.patch', 'native-profile-page-indicator/manifest.json'),
    ('native-profile-pager-registration/native.patch', 'native-profile-pager-registration/manifest.json'),
    ('native-profile-prefs-api155/native.patch', 'native-profile-prefs-api155/manifest.json'),
    ('native-account-profile-prefs-api155/native.patch', 'native-account-profile-prefs-api155/manifest.json'),
    ('native-profile-compile-api155-v231/native.patch', 'native-profile-compile-api155-v231/manifest.json'),
    ('native-account-profile-prefs-registration/native.patch', 'native-account-profile-prefs-registration/manifest.json'),
])

if options.through:
    matches = [index for index, (path, _) in enumerate(steps) if path == options.through]
    if len(matches) != 1:
        raise ValueError('Replay boundary must name one exact proposal')
    steps = steps[:matches[0] + 1]

def safe(path):
    value = Path(path)
    if value.is_absolute() or '..' in value.parts or not value.parts:
        raise ValueError('Unsafe proposal path')
    return value

def metadata_pins(path):
    data = json.loads(path.read_text())
    if isinstance(data, dict) and 'nativeSourceSha256' in data and 'edit' in data:
        target = data['edit']['path']
        return {target: data['nativeSourceSha256'][target]}
    if isinstance(data, dict) and 'files' in data:
        data = data['files']
    if isinstance(data, dict) and 'path' in data:
        data = [data]
    if isinstance(data, dict):
        return {key: value for key, value in data.items() if isinstance(value, str)}
    return {item['path']: item.get('originalNativeSha256', item.get('sourceSha256')) for item in data if 'originalNativeSha256' in item or 'sourceSha256' in item}

baseline = {}
patches = []
for patch_path, metadata in steps:
    patch = (proposals / patch_path).read_bytes()
    paths = {safe(path) for path in re.findall(r'^\+\+\+ b/(.+)$', patch.decode(), re.M)}
    prior_paths = set(baseline)
    for path in paths:
        if path not in baseline:
            source = native / path
            baseline[path] = source.read_bytes() if source.exists() else None
    if metadata:
        for path, expected in metadata_pins(proposals / metadata).items():
            if safe(path) in prior_paths:
                continue  # Ordered input hashes below validate dependent edits.
            actual = baseline[safe(path)]
            if (sha(actual) if actual is not None else None) != expected:
                raise ValueError(f'Pinned native baseline drift: {path}')
    patches.append((patch_path, patch, metadata))
    if metadata:
        data = json.loads((proposals / metadata).read_text())
        for item in data.get('newFiles', []) if isinstance(data, dict) else []:
            path = safe(item['path'])
            if path in baseline or (native / path).exists():
                raise ValueError(f'New proposal source already exists: {path}')
            baseline[path] = None

def restore_owned_wire_contracts(copy, report):
    # Historical proposals precede these bytes; later compiler fixes pin them.
    wire_edits = {
        'chrome/browser/aux/daemon_supervisor.cc': [
            ('"aux-daemon"', '"aside-daemon"', 1),
            ('"AuxDaemonSessionToken"', '"AsideDaemonSessionToken"', 1),
            ('"AuxDaemonSessionToken "', '"AsideDaemonSessionToken "', 1)],
        'chrome/browser/aux/installation_auth.cc': [
            ('std::string("Aux Daemon Auth v1\\0", 19)', 'std::string("Aside Daemon Auth v1\\0", 21)', 1)],
        'chrome/browser/aux/auth_scheme_probe.cc': [
            ('std::string("Aux Daemon Auth v1\\0", 19)', 'std::string("Aside Daemon Auth v1\\0", 21)', 1)],
        'chrome/browser/devtools/aux_cdp_authority.cc': [
            ('"AuxSessionToken"', '"AsideSessionToken"', 1),
            ('"AuxSessionToken "', '"AsideSessionToken "', 1)],
    }
    for path, edits in wire_edits.items():
        target = copy / path
        text = target.read_text()
        for find, replace, count in edits:
            if text.count(find) != count:
                raise ValueError(f'Wire correction anchor drift: {path}: {find}')
            text = text.replace(find, replace)
            report['wireEdits'].append({'path': path, 'find': find, 'replace': replace, 'count': count})
        target.write_text(text)


def apply_runtime_cache(copy, report):
    if report.get('runtimeCacheEdits'):
        return
    # Tools mutate npm/pip caches and bytecode. The bundled runtime is a seed;
    # the supplied lazy installer provisions the owned mutable home cache.
    target = copy / 'chrome/browser/aux/daemon_supervisor.cc'
    text = target.read_text()
    report['runtimeCacheEdits'] = []
    for find, replace in [
        ('// Supplied agent runtime supports this explicit immutable bundle root.', '// Supplied lazy installer provisions the private mutable runtime cache.'),
        ('paths.root.AppendASCII("agent-runtime").value();', 'canonical_home.AppendASCII("runtime").value();'),
        ('const base::FilePath runtime = paths.root.AppendASCII("agent-runtime");', 'const base::FilePath runtime = canonical_home.AppendASCII("runtime");'),
    ]:
        if text.count(find) != 1:
            raise ValueError('Mutable runtime supervisor anchor drift')
        text = text.replace(find, replace)
        report['runtimeCacheEdits'].append({'path': 'chrome/browser/aux/daemon_supervisor.cc', 'find': find, 'replace': replace, 'count': 1})
    target.write_text(text)


brand_manifest = json.loads((proposals / 'native-branding-assets/manifest.json').read_text())
if sha((repository / 'assets/brand/arch-mark.svg').read_bytes()) != brand_manifest['canonicalSvgSha256']:
    raise ValueError('Canonical branding changed after native replacements were proposed')
for item in brand_manifest['entries']:
    if sha((native / safe(item['target'])).read_bytes()) != item['baselineSha256'] or sha((repository / safe(item['replacement'])).read_bytes()) != item['replacementSha256']:
        raise ValueError(f'Native artwork baseline/replacement drift: {item["target"]}')
report = {'version': 1, 'compiled': False, 'appliedToNative': False, 'sourceRoot': str(native),
          'steps': [], 'files': [], 'wireEdits': [],
          'binaryAssets': brand_manifest['entries'],
          'excluded': ['Experimental disabled canary webview proposal']}
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='aux-native-compose-') as directory:
    copy = Path(directory)
    for path, raw in baseline.items():
        if raw is not None:
            (copy / path).parent.mkdir(parents=True, exist_ok=True)
            (copy / path).write_bytes(raw)
    environment = dict(os.environ, GIT_CEILING_DIRECTORIES=str(copy.parent))
    def add_generated_key_probe():
        if 'generatedKeyProbeTarget' in report:
            return
        gn = copy / 'chrome/browser/aux/BUILD.gn'
        gn.write_text(gn.read_text() + '\nexecutable("auth_scheme_probe") {\n  testonly = true\n  sources = [ "auth_scheme_probe.cc" ]\n  deps = [ ":platform", "//base", "//crypto", "//net" ]\n}\n')
        report['generatedKeyProbeTarget'] = '//chrome/browser/aux:auth_scheme_probe'

    for name, patch, metadata in patches:
        if name == 'native-daemon-startup-budget/native.patch':
            apply_runtime_cache(copy, report)
        # Follow-ups pin the applied v24 GN file, including this probe target.
        # Historical patches pin the earlier file without it.
        if name == 'native-preference-consumers/native.patch':
            add_generated_key_probe()
        if name.startswith('native-compile-fixes/') and not report['wireEdits']:
            restore_owned_wire_contracts(copy, report)
        data = json.loads((proposals / metadata).read_text()) if metadata else None
        items = data.get('files', data) if isinstance(data, dict) else data if isinstance(data, list) else []
        if isinstance(items, dict):
            items = [dict(value, path=path) for path, value in items.items() if isinstance(value, dict) and 'beforeSha256' in value]
        for item in items:
            expected_key = next((key for key in ['baselineSha256', 'expectedInputSha256', 'sourceSha256', 'beforeSha256'] if key in item), None)
            if expected_key:
                target = copy / safe(item['path'])
                actual = sha(target.read_bytes()) if target.exists() else None
                if actual != item[expected_key]:
                    raise ValueError(f'Ordered proposal input drift: {name}: {item["path"]}')
        if name == 'cdp-startup-contract/fixed-discovery-env.patch':
            # Its surrounding env lines overlap the independent boundary patch;
            # replay the reviewed unique anchor, not stale diff context.
            edit = json.loads((proposals / 'cdp-startup-contract/source-and-anchor.json').read_text())['edit']
            target = copy / safe(edit['path'])
            text = target.read_text()
            if text.count(edit['find']) != edit['count']:
                raise ValueError('Owned discovery environment anchor drift')
            target.write_text(text.replace(edit['find'], edit['replace']))
            report['steps'].append({'patch': name, 'sha256': sha(patch), 'application': 'exact-counted-anchor', 'edit': edit})
        else:
            subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=copy, env=environment, check=True)
            subprocess.run(['git', 'apply', '-'], input=patch, cwd=copy, env=environment, check=True)
            report['steps'].append({'patch': name, 'sha256': sha(patch)})
        for item in items:
            expected = item.get('outputSha256', item.get('proposedSha256', item.get('afterSha256')))
            if expected and sha((copy / safe(item['path'])).read_bytes()) != expected:
                raise ValueError(f'Ordered proposal output drift: {name}: {item["path"]}')
        for item in data.get('newFiles', []) if isinstance(data, dict) else []:
            path = safe(item['path'])
            raw = (proposals / 'contextual-omnibox' / path).read_bytes()
            if sha(raw) != item['sha256'] or (copy / path).exists():
                raise ValueError(f'New proposal source drift: {path}')
            (copy / path).parent.mkdir(parents=True, exist_ok=True)
            (copy / path).write_bytes(raw)

    if not report['wireEdits']:
        restore_owned_wire_contracts(copy, report)
    apply_runtime_cache(copy, report)
    add_generated_key_probe()
    combined = []
    for path, before in sorted(baseline.items()):
        after = (copy / path).read_bytes()
        combined.extend(difflib.unified_diff((before or b'').decode().splitlines(True), after.decode().splitlines(True),
                       fromfile=f'a/{path}' if before is not None else '/dev/null', tofile=f'b/{path}'))
        report['files'].append({'path': str(path), 'sourceSha256': sha(before) if before is not None else None, 'outputSha256': sha(after)})
    raw_patch = ''.join(combined).encode()
    report['combinedPatchSha256'] = sha(raw_patch)
    # Verify the exact combined result independently from its individual steps.
    with tempfile.TemporaryDirectory(prefix='aux-native-replay-') as replay_dir:
        replay = Path(replay_dir)
        for path, raw in baseline.items():
            if raw is not None:
                (replay / path).parent.mkdir(parents=True, exist_ok=True)
                (replay / path).write_bytes(raw)
        subprocess.run(['git', 'apply', '-'], input=raw_patch, cwd=replay, env=dict(environment, GIT_CEILING_DIRECTORIES=str(replay.parent)), check=True)
        for item in report['files']:
            if sha((replay / item['path']).read_bytes()) != item['outputSha256']:
                raise ValueError('Combined replay differs from proposal composition')
    output.mkdir()
    (output / 'combined.patch').write_bytes(raw_patch)
    (output / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'output': str(output), 'steps': len(report['steps']), 'files': len(report['files']), 'compiled': False, 'appliedToNative': False}))
