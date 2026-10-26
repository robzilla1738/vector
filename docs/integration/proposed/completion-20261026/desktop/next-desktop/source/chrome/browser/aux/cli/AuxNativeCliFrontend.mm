// Proposed native terminal frontend. This does not admit the existing SEA.
#include "AuxCliIngress.h"
#include "AuxCliOpenArguments.h"
#include <vector>
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
#import <AppKit/AppKit.h>
#include <atomic>
#include <memory>
#endif
#include "AuxNativeEndpointDelivery.h"
#include "packaged-identity-admission.h"
#include <mach-o/dyld.h>
#include <mach/mach.h>
#include <climits>
#include <cstdio>
#include <iostream>
#include <string_view>
#include <cstring>
#include <cstdlib>
#include <string>
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
namespace {
int DispatchOrdinaryOpen(const std::string& root, const aux::cli::OpenArguments& parsed) {
  const auto envelope = aux::cli::EncodeNativeOpenEnvelope(parsed);
  constexpr std::string_view suffix = "/Contents/Resources/aux";
  if (!envelope || !root.ends_with(suffix) || root.size() <= suffix.size()) {
    std::cerr << "Aux open requires one HTTP(S) URL, optional --profile, and --space only with --profile\n";
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
    std::cout << "Aux queued the URL for browser destination validation.\n";
    return 0;
  }
  std::cerr << (code < 0 ? "Aux OS dispatch result is unknown; the request may still arrive.\n"
                        : "Aux could not dispatch this request to its browser app.\n");
  return code < 0 ? 75 : code;
}
}  // namespace
#endif
int main(int argc,char* argv[]){
 @autoreleasepool {
 char executable[PATH_MAX];uint32_t length=sizeof(executable);if(_NSGetExecutablePath(executable,&length))return 78;
 char resolved[PATH_MAX];if(!realpath(executable,resolved))return 78;
 const std::string self(resolved),suffix="/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli";
 if(!self.ends_with(suffix)||self.size()<=suffix.size())return 78;
 const auto root=self.substr(0,self.size()-suffix.size());
 const auto endpoint=AuxTakeNativeParentEndpointForBootstrap();
 if(endpoint!=MACH_PORT_NULL){
  mach_port_deallocate(mach_task_self(),endpoint);
  // A browser-owned Node/installation role remains unsupported regardless of
  // immutable marker contents. No marker creates an installation owner.
  if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
   std::cerr << std::string_view("Aux packaged state identity is unsupported or unaccepted\n");return 78;
  }
  // Explicit until the real typed proxy owner, role image graph and sealed
  // Node entry are joined. Never recursively forward a browser-owned child.
  std::cerr << std::string_view("Aux CLI retained runtime join is not paired\n");return 78;
 }
 std::vector<std::string> arguments;
 if(!aux::cli::CopyNativeMainArguments(argc,argv,&arguments))return 64;
 const auto parsed=aux::cli::ParseNativeOpenArguments(arguments);
 if(parsed.status==aux::cli::OpenParseStatus::help){
  std::cout << std::string_view("Usage: aux open <https://URL> [--profile <native profile ID or unique name> [--space <Space ID or unique name>]]\n");return 0;
 }
 if(parsed.status!=aux::cli::OpenParseStatus::accepted){
  // Keep the old installation/account marker refusal in that unsupported role.
  // The narrow native browser command never reads a mutable home or starts Node.
  if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
   std::cerr << std::string_view("Aux packaged state identity is unsupported or unaccepted\n");return 78;
  }
  std::cerr << std::string_view("Aux currently supports native open only; installation/account CLI commands remain unavailable\n");return 64;
 }
 // Native open is admitted only by the exact browser peer, its genuine native
 // startup/Profile binding and actual one-shot OS approval. Markers grant none.
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
 // An OS URL receipt is ordinary external navigation only. It does not grant
 // task execution, installation ownership or privileged CLI peer admission.
 return DispatchOrdinaryOpen(root,parsed);
#else
 return aux::cli::ForwardTerminalInvocation(argc,argv);
#endif
 }
}
