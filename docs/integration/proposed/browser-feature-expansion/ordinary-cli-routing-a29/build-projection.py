from pathlib import Path
import json,hashlib,difflib
n=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');r=Path(__file__).parent
rules={}
h='chrome/browser/aux/cli/AuxCliOpenArguments.h'
rules[h]=[('#include <span>','#include <span>\n#include <optional>\n#include <string_view>'),('''OpenArguments ParseNativeOpenArguments(std::span<const std::string>);
}''','''OpenArguments ParseNativeOpenArguments(std::span<const std::string>);
// Bounded data-only ordinary URL envelope. The receiving native OS receipt,
// actual Profile and normal routing owner provide authority, never these bytes.
std::optional<std::string> EncodeNativeOpenEnvelope(const OpenArguments&);
OpenArguments ParseNativeOpenEnvelope(std::string_view);
}''')]
cc='chrome/browser/aux/cli/AuxCliOpenArguments.cc'
b=(n/cc).read_text();assert b.endswith('\n}\n')
extra='''
namespace {
bool ProfileText(std::string_view text) {
  if (text.size() > 256) return false;
  for (const unsigned char c : text)
    if (c < 0x20 || c == 0x7f || c == '/' || c == '\\\\') return false;
  return true;
}
bool HttpText(std::string_view text) {
  if (text.empty() || text.size() > 8192) return false;
  const auto colon = text.find("://");
  if (colon == std::string_view::npos) return false;
  std::string scheme(text.substr(0, colon));
  for (char& c : scheme) if (c >= 'A' && c <= 'Z') c += 'a' - 'A';
  if (scheme != "http" && scheme != "https") return false;
  const auto rest = text.substr(colon + 3);
  const auto authority = rest.substr(0, rest.find_first_of("/?#"));
  if (authority.empty() || authority.find('@') != std::string_view::npos) return false;
  for (const unsigned char c : text) if (c <= 0x20 || c == 0x7f) return false;
  return true;
}
std::string EncodeField(std::string_view input) {
  constexpr std::string_view hex = "0123456789ABCDEF";
  std::string output;
  for (const unsigned char c : input) {
    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
        (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~') {
      output.push_back(static_cast<char>(c));
    } else {
      output.push_back('%'); output.push_back(hex.at(c >> 4));
      output.push_back(hex.at(c & 15));
    }
  }
  return output;
}
int Hex(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}
std::optional<std::string> DecodeField(std::string_view input, size_t limit) {
  std::string output;
  while (!input.empty()) {
    char c = input.front(); input.remove_prefix(1);
    if (c == '+') return std::nullopt;  // Literal plus must be percent-encoded.
    if (c == '%') {
      if (input.size() < 2) return std::nullopt;
      const int high = Hex(input.front()); input.remove_prefix(1);
      const int low = Hex(input.front()); input.remove_prefix(1);
      if (high < 0 || low < 0) return std::nullopt;
      c = static_cast<char>(high * 16 + low);
    }
    if (!c || output.size() == limit) return std::nullopt;
    output.push_back(c);
  }
  return output;
}
}  // namespace
std::optional<std::string> EncodeNativeOpenEnvelope(const OpenArguments& args) {
  if (args.status != OpenParseStatus::accepted || !HttpText(args.url) ||
      !ProfileText(args.profile)) return std::nullopt;
  std::string result = "aux://open?url=" + EncodeField(args.url);
  if (!args.profile.empty()) result += "&profile=" + EncodeField(args.profile);
  return result.size() <= 32768 ? std::make_optional(std::move(result)) : std::nullopt;
}
OpenArguments ParseNativeOpenEnvelope(std::string_view envelope) {
  if (envelope.empty() || envelope.size() > 32768 ||
      envelope.find('#') != std::string_view::npos) return {};
  if (envelope.starts_with("aux://open?")) envelope.remove_prefix(11);
  else if (envelope.starts_with("aux://open/?")) envelope.remove_prefix(12);
  else return {};
  OpenArguments result;
  bool url_seen = false, profile_seen = false;
  for (;;) {
    const auto separator = envelope.find('&');
    const auto field = envelope.substr(0, separator);
    const auto equal = field.find('=');
    if (equal == std::string_view::npos) return {};
    const auto key = field.substr(0, equal);
    if (key == "url" && !url_seen) {
      auto value = DecodeField(field.substr(equal + 1), 8192);
      if (!value || !HttpText(*value)) return {};
      result.url = std::move(*value); url_seen = true;
    } else if (key == "profile" && !profile_seen) {
      auto value = DecodeField(field.substr(equal + 1), 256);
      if (!value || value->empty() || !ProfileText(*value)) return {};
      result.profile = std::move(*value); profile_seen = true;
    } else return {};
    if (separator == std::string_view::npos) break;
    envelope.remove_prefix(separator + 1);
    if (envelope.empty()) return {};
  }
  if (!url_seen) return {};
  result.status = OpenParseStatus::accepted;
  return result;
}
'''
rules[cc]=[(b,(b[:-2]+extra+'}\n').replace('#include \"AuxCliOpenArguments.h\"', '#include \"AuxCliOpenArguments.h\"\n#include <utility>', 1))]
frontend='chrome/browser/aux/cli/AuxNativeCliFrontend.mm'
rules[frontend]=[('#include <vector>','#include <vector>\n#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)\n#import <AppKit/AppKit.h>\n#include <atomic>\n#include <memory>\n#endif'),('''int main(int argc,char* argv[]){''','''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
namespace {
int DispatchOrdinaryOpen(const std::string& root, const aux::cli::OpenArguments& parsed) {
  const auto envelope = aux::cli::EncodeNativeOpenEnvelope(parsed);
  constexpr std::string_view suffix = "/Contents/Resources/aux";
  if (!envelope || !root.ends_with(suffix) || root.size() <= suffix.size()) {
    std::cerr << "Aux open requires one HTTP(S) URL and an optional exact profile name or ID\\n";
    return 64;
  }
  const std::string app = root.substr(0, root.size() - suffix.size());
  NSString* app_path = [[NSString alloc] initWithBytes:app.data() length:app.size()
                                           encoding:NSUTF8StringEncoding];
  NSString* request = [[NSString alloc] initWithBytes:envelope->data() length:envelope->size()
                                           encoding:NSUTF8StringEncoding];
  NSURL* app_url = app_path ? [NSURL fileURLWithPath:app_path isDirectory:YES] : nil;
  NSURL* url = request ? [NSURL URLWithString:request] : nil;
  if (!app_url || !url) return 64;
  auto status = std::make_shared<std::atomic_int>(-1);
  NSWorkspaceOpenConfiguration* config = [NSWorkspaceOpenConfiguration configuration];
  config.activates = YES;
  config.createsNewApplicationInstance = NO;
  [[NSWorkspace sharedWorkspace] openURLs:@[url] withApplicationAtURL:app_url
      configuration:config completionHandler:^(NSRunningApplication* application, NSError* error) {
        status->store(application && !error ? 0 : 69);
      }];
  NSDate* deadline = [NSDate dateWithTimeIntervalSinceNow:10];
  while (status->load() < 0 && deadline.timeIntervalSinceNow > 0) {
    [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode
                           beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
  }
  const int code = status->load();
  if (code == 0) {
    std::cout << "Aux queued the URL for browser destination validation.\\n";
    return 0;
  }
  std::cerr << (code < 0 ? "Aux OS dispatch result is unknown; the request may still arrive.\\n"
                        : "Aux could not dispatch this request to its browser app.\\n");
  return code < 0 ? 75 : code;
}
}  // namespace
#endif
int main(int argc,char* argv[]){'''),(''' return aux::cli::ForwardTerminalInvocation(argc,argv);''','''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
 // An OS URL receipt is ordinary external navigation only. It does not grant
 // task execution, installation ownership or privileged CLI peer admission.
 return DispatchOrdinaryOpen(root,parsed);
#else
 return aux::cli::ForwardTerminalInvocation(argc,argv);
#endif''')]
ingress='chrome/browser/aux/routing/external_routing_ingress.cc'
rules[ingress]=[('#include "chrome/browser/aux/routing/routing_service.h"','#include "chrome/browser/aux/routing/routing_service.h"\n#include "chrome/browser/aux/cli/AuxCliOpenArguments.h"\n#include "base/strings/string_util.h"'),('''  return tab.aux_native_external_receipt && tab.url.SchemeIsHTTPOrHTTPS();''','''  return tab.aux_native_external_receipt &&
      (tab.url.SchemeIsHTTPOrHTTPS() || tab.url.SchemeIs("aux"));'''),('''    Intent intent{.url = tab.url, .authority = Authority::kExternal};
    // Open repeats''','''    Intent intent{.url = tab.url, .authority = Authority::kExternal};
    auto fallback_tab = tab;
    if (tab.url.SchemeIs("aux")) {
      const auto parsed = cli::ParseNativeOpenEnvelope(tab.url.spec());
      const GURL inner(parsed.url);
      if (parsed.status != cli::OpenParseStatus::accepted ||
          !base::IsStringUTF8(parsed.profile) || !inner.is_valid() ||
          !inner.SchemeIsHTTPOrHTTPS() || inner.has_username() || inner.has_password() ||
          inner.spec().size() > 8192) {
        ++refused_;
        Continue();
        return;
      }
      intent.url = inner;
      intent.profile = parsed.profile;
      fallback_tab.url = inner;
    }
    // Open repeats'''),('''         base::BindOnce(&ExternalBatch::Opened, base::RetainedRef(this)));''','''         base::BindOnce(&ExternalBatch::Opened, base::RetainedRef(this),
                        std::move(fallback_tab)));'''),('''  void Opened(base::DictValue result) {''','''  void Opened(StartupTab fallback_tab, base::DictValue result) {'''),('''      NativeFallback(tabs_[index_ - 1]);''','''      NativeFallback(fallback_tab);'''),('''      !Local() || !Local()->FindPreference(kRulesPref) ||
      Local()->GetDict(kRulesPref).empty()) return false;
  bool handled = false;''','''      !Local() || !Local()->FindPreference(kRulesPref)) return false;
  bool has_native_envelope = false;
  for (const auto& tab : tabs)
    has_native_envelope |= tab.aux_native_external_receipt && tab.url.SchemeIs("aux");
  if (Local()->GetDict(kRulesPref).empty() && !has_native_envelope) return false;
  bool handled = false;'''),('''    if (!Eligible(tab)) continue;
    const auto result = Resolve(profile,''','''    if (!Eligible(tab)) continue;
    // Consume even malformed native Aux envelopes; never fall through to a
    // different handler/profile or derive authority from inner query fields.
    if (tab.url.SchemeIs("aux")) { handled = true; continue; }
    const auto result = Resolve(profile,''')]
m={'format':'aux.native.counted-projection.v1','purpose':'Ordinary OS-receipted local CLI URL/profile routing with exact native destination resolution','nativeRoot':str(n),'files':[],'rootRegistrationRequired':{'target':'//chrome/browser/aux:native_cli_open','defines':['AUX_BROWSER_ONLY_NATIVE_STARTUP=1'],'frameworksAdd':['AppKit.framework']}}
patch=[]
for rel,edits in rules.items():
 b=(n/rel).read_text();s=b;a=[]
 for old,new in edits:
  assert s.count(old)==1,(rel,old[:55],s.count(old));s=s.replace(old,new,1);a.append({'before':old,'after':new,'expectedCount':1})
 o=r/'source'/rel;o.parent.mkdir(parents=True,exist_ok=True);o.write_text(s)
 sha=lambda s:hashlib.sha256(s.encode()).hexdigest();m['files'].append({'path':rel,'inputSha256':sha(b),'outputSha256':sha(s),'source':str(o),'anchors':a});patch.extend(difflib.unified_diff(b.splitlines(True),s.splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0))
(r/'source-plan.json').write_text(json.dumps(m,indent=2)+'\n');(r/'ordinary-cli-routing-a29.patch').write_text(''.join(patch));print(json.dumps([{k:f[k] for k in ['path','inputSha256','outputSha256']} for f in m['files']],indent=2))
