// Proposed native terminal frontend. This does not admit the existing SEA.
#include "AuxCliIngress.h"
#include "AuxCliOpenArguments.h"
#include <vector>
#include "AuxNativeEndpointDelivery.h"
#include "packaged-identity-admission.h"
#include <mach-o/dyld.h>
#include <mach/mach.h>
#include <climits>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <string>
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
   std::fputs("Aux packaged state identity is unsupported or unaccepted\n",stderr);return 78;
  }
  // Explicit until the real typed proxy owner, role image graph and sealed
  // Node entry are joined. Never recursively forward a browser-owned child.
  std::fputs("Aux CLI retained runtime join is not paired\n",stderr);return 78;
 }
 std::vector<std::string> arguments;
 if(argc<1||argc>257||!argv)return 64;
 for(int i=1;i<argc;++i){if(!argv[i]||strnlen(argv[i],8193)>8192)return 64;arguments.emplace_back(argv[i]);}
 const auto parsed=aux::cli::ParseNativeOpenArguments(arguments);
 if(parsed.status==aux::cli::OpenParseStatus::help){
  std::fputs("Usage: aux open <https://URL> [--profile <native profile ID or unique name>]\n",stdout);return 0;
 }
 if(parsed.status!=aux::cli::OpenParseStatus::accepted){
  // Keep the old installation/account marker refusal in that unsupported role.
  // The narrow native browser command never reads a mutable home or starts Node.
  if(!aux::packaged_identity::MarkerAllowedAt(root+"/bundle.json")){
   std::fputs("Aux packaged state identity is unsupported or unaccepted\n",stderr);return 78;
  }
  std::fputs("Aux currently supports native open only; installation/account CLI commands remain unavailable\n",stderr);return 64;
 }
 // Native open is admitted only by the exact browser peer, its genuine native
 // startup/Profile binding and actual one-shot OS approval. Markers grant none.
 return aux::cli::ForwardTerminalInvocation(argc,argv);
 }
}
