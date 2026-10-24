// Count-checked additions to the supplied owners after identity adaptation.
import { transformAuxNavigation } from './aux-navigation-command-bar.mjs';
import { transformAuxProductivityUi, transformAuxProductivityDaemon } from './aux-productivity-integration.mjs';
import { transformAuxTabContext } from './aux-productivity-tab-context.mjs';
import { transformAuxContextReadUi, transformAuxContextReadDaemon } from './aux-productivity-context-read.mjs';
import { transformAuxThemeEditor } from './aux-theme-editor.mjs';
import { transformAuxFilesUi, transformAuxFilesDaemon } from './aux-productivity-files.mjs';
import { transformAuxMediaUi } from './aux-productivity-media.mjs';
import { applyAuxBrowserRouting, transformAuxRoutingSettings } from './aux-browser-routing.mjs';
import { transformAuxBrowserFeatureSettings } from './aux-browser-feature-settings.mjs';
import { transformAuxShortcutProfiles } from './aux-shortcut-profiles.mjs';
import { transformAuxCaptureUi, transformAuxCaptureDaemon } from './aux-productivity-capture.mjs';
import { transformAuxDeveloperUi } from './aux-productivity-developer.mjs';
function compose(input, transforms) {
  let text = input.text;
  const anchors = [];
  for (const transform of transforms) {
    const result = transform({...input, text});
    text = result.text;
    anchors.push(...result.anchors);
  }
  return {text, anchors};
}
export function transformAuxBrowserFeatureUi(input) {
  return compose(input, [transformAuxNavigation, transformAuxProductivityUi,
    transformAuxTabContext, transformAuxContextReadUi, transformAuxThemeEditor,
    transformAuxFilesUi, transformAuxMediaUi, transformAuxRoutingSettings,
    transformAuxDeveloperUi, transformAuxCaptureUi,
    transformAuxBrowserFeatureSettings, transformAuxShortcutProfiles,
    value => value.relative === 'background.js'
      ? applyAuxBrowserRouting({...value, component:'agent'}) : {text:value.text, anchors:[]}]);
}
export function transformAuxBrowserFeatureDaemon(input) {
  return compose(input, [transformAuxProductivityDaemon, transformAuxContextReadDaemon,
    transformAuxFilesDaemon, transformAuxCaptureDaemon, value => applyAuxBrowserRouting({...value, component:'daemon'})]);
}
