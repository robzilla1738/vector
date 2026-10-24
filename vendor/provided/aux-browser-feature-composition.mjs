// Count-checked additions to the supplied owners after identity adaptation.
import { transformAuxNavigation } from './aux-navigation-command-bar.mjs';
import { transformAuxProductivityUi, transformAuxProductivityDaemon } from './aux-productivity-integration.mjs';
import { transformAuxTidySelection } from './aux-productivity-tidy-selection.mjs';
import { transformAuxTabContext } from './aux-productivity-tab-context.mjs';
import { transformAuxMentionSpaces } from './aux-productivity-spaces.mjs';
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
    let replayed = text;
    const appended = [];
    for (const anchor of result.anchors) {
      if (typeof anchor.append === 'string') { appended.push(anchor); continue; }
      if (!anchor.find || typeof anchor.replace !== 'string' ||
          !Number.isSafeInteger(anchor.count) || anchor.count < 1 ||
          replayed.split(anchor.find).length - 1 !== anchor.count)
        throw Error(`Invalid feature edit: ${input.relative ?? input.component}/${anchor.kind}`);
      replayed = replayed.split(anchor.find).join(anchor.replace);
      anchors.push({...anchor, name: anchor.name ?? anchor.kind, kind: 'integration'});
    }
    if (!result.text.startsWith(replayed))
      throw Error(`Unreported feature mutation: ${input.relative ?? input.component}`);
    let suffix = result.text.slice(replayed.length);
    const actualAppend = suffix;
    for (const anchor of appended) {
      const body = suffix.startsWith(`\n${anchor.append}\n`)
        ? `\n${anchor.append}\n` : anchor.append;
      if (!suffix.startsWith(body)) throw Error(`Unreported feature append: ${anchor.kind}`);
      suffix = suffix.slice(body.length);
    }
    if (suffix) throw Error(`Unreported feature suffix: ${input.relative ?? input.component}`);
    if (actualAppend) {
      let size = Math.min(512, replayed.length), tail;
      do {
        tail = replayed.slice(-size);
        if (tail && replayed.split(tail).length - 1 === 1) break;
        size = Math.min(replayed.length, size * 2);
      } while (size < replayed.length);
      tail = replayed.slice(-size);
      if (!tail || replayed.split(tail).length - 1 !== 1) throw Error('No unique feature append anchor');
      anchors.push({kind: 'integration', name: appended.map(a => a.kind).join(','),
        find: tail, replace: tail + actualAppend, count: 1});
    }
    text = result.text;
  }
  return {text, anchors};
}
export function transformAuxBrowserFeatureUi(input) {
  return compose(input, [transformAuxNavigation, transformAuxProductivityUi, transformAuxTidySelection,
    transformAuxTabContext, transformAuxMentionSpaces, transformAuxContextReadUi, transformAuxThemeEditor,
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
