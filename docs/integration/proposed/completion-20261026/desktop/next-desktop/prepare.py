from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CLI = 'chrome/browser/aux/cli/'
files = [CLI + 'AuxCliOpenArguments.h', CLI + 'AuxCliOpenArguments.cc', CLI + 'AuxNativeCliFrontend.mm', CLI + 'AuxCliOpenCommand.mm', 'chrome/browser/aux/routing/external_routing_ingress.cc']
records, patch = [], []
for path in files:
    original = (ROOT / path).read_text()
    text = original
    anchors = []
    def edit(name, before, after):
        global text
        if text.count(before) != 1:
            raise ValueError((name, text.count(before)))
        text = text.replace(before, after)
        anchors.append(dict(name=name, before=before, after=after, expectedCount=1))
    if path.endswith('AuxCliOpenArguments.h'):
        edit('Space selector belongs to the same bounded data envelope', 'std::string url, profile;', 'std::string url, profile, space;')
    elif path.endswith('AuxCliOpenArguments.cc'):
        edit('unsupported aggregate includes Space', 'return {OpenParseStatus::unsupported,{},{}};', 'return {OpenParseStatus::unsupported,{},{},{}};')
        edit('help aggregate includes Space', 'return {OpenParseStatus::help,{},{}};', 'return {OpenParseStatus::help,{},{},{}};')
        edit('reject repeated Space selectors', 'bool literal=false, profile_seen=false;', 'bool literal=false, profile_seen=false, space_seen=false;')
        edit('parse an explicit Space without shell interpolation', '''    if ((!literal && item.front()=='-') || !parsed.url.empty() || item.size()>8192) return {};''', '''    if (!literal && (item=="--space" || item.starts_with("--space="))) {
      if (space_seen) return {};
      space_seen=true;
      if (item=="--space") { if (++i==args.size()) return {}; parsed.space=args[i]; }
      else parsed.space=item.substr(8);
      if (parsed.space.empty() || parsed.space.size()>256) return {};
      for (const unsigned char c : parsed.space) if (c < 0x20 || c == 0x7f) return {};
      continue;
    }
    if ((!literal && item.front()=='-') || !parsed.url.empty() || item.size()>8192) return {};''')
        edit('Space selectors require an explicit profile', '  if (parsed.url.empty()) return {};', '  if (parsed.url.empty() || (!parsed.space.empty() && parsed.profile.empty())) return {};')
        edit('Space display names are data, including slash and Unicode', 'bool HttpText(std::string_view text) {', '''bool SpaceText(std::string_view text) {
  if (text.size() > 256) return false;
  for (const unsigned char c : text) if (c < 0x20 || c == 0x7f) return false;
  return true;
}
bool HttpText(std::string_view text) {''')
        edit('encoding validates the complete destination', '      !ProfileText(args.profile)) return std::nullopt;', '      !ProfileText(args.profile) || !SpaceText(args.space) ||\n      (!args.space.empty() && args.profile.empty())) return std::nullopt;')
        edit('percent encode Space exactly once', '  if (!args.profile.empty()) result += "&profile=" + EncodeField(args.profile);', '  if (!args.profile.empty()) result += "&profile=" + EncodeField(args.profile);\n  if (!args.space.empty()) result += "&space=" + EncodeField(args.space);')
        edit('one use envelope Space field', '  bool url_seen = false, profile_seen = false;', '  bool url_seen = false, profile_seen = false, space_seen = false;')
        edit('decode and bound Space without alternate destinations', '''      result.profile = std::move(*value); profile_seen = true;
    } else return {};''', '''      result.profile = std::move(*value); profile_seen = true;
    } else if (key == "space" && !space_seen) {
      auto value = DecodeField(field.substr(equal + 1), 256);
      if (!value || value->empty() || !SpaceText(*value)) return {};
      result.space = std::move(*value); space_seen = true;
    } else return {};''')
        edit('receiver requires an explicit profile for Space', '  if (!url_seen) return {};', '  if (!url_seen || (space_seen && !profile_seen)) return {};')
    elif path.endswith('AuxNativeCliFrontend.mm'):
        edit('actionable CLI dispatch failure', 'Aux open requires one HTTP(S) URL and an optional exact profile name or ID\\n', 'Aux open requires one HTTP(S) URL, optional --profile, and --space only with --profile\\n')
        edit('native help advertises exact supported Space syntax', 'Usage: aux open <https://URL> [--profile <native profile ID or unique name>]\\n', 'Usage: aux open <https://URL> [--profile <native profile ID or unique name> [--space <Space ID or unique name>]]\\n')
    elif path.endswith('AuxCliOpenCommand.mm'):
        edit('inactive retained peer must not silently drop Space', '       arguments.status!=OpenParseStatus::accepted || !url.is_valid() ||', '       arguments.status!=OpenParseStatus::accepted || !arguments.space.empty() || !url.is_valid() ||')
    else:
        edit('validate complete native envelope destination UTF8', '          !base::IsStringUTF8(parsed.profile) || !inner.is_valid() ||', '          !base::IsStringUTF8(parsed.profile) || !base::IsStringUTF8(parsed.space) || !inner.is_valid() ||')
        edit('feed explicit destination through existing resolver', '      intent.profile = parsed.profile;', '      intent.profile = parsed.profile;\n      intent.space = parsed.space;')
    output = HERE / 'source' / path
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    records.append(dict(path=path, inputSha256=hashlib.sha256(original.encode()).hexdigest(), outputSha256=hashlib.sha256(text.encode()).hexdigest(), anchors=anchors))
    patch.extend(difflib.unified_diff(original.splitlines(True), text.splitlines(True), fromfile='a/' + path, tofile='b/' + path))
(HERE / 'native.patch').write_text(''.join(patch))
(HERE / 'source-plan.json').write_text(json.dumps(dict(format='aux.native.counted-projection.v1',nativeRoot=str(ROOT),files=records),indent=2)+'\n')
print(json.dumps([dict(path=r['path'], anchors=len(r['anchors'])) for r in records]))
