#include "chrome/browser/aux/cli/AuxCliOpenArguments.h"
#include "chrome/browser/aux/cli/AuxCliWire.h"
#include <cassert>
#include <string>
#include <vector>

int main() {
  using namespace aux::cli;
  const auto listing=ParseNativeReadOnlyQuery(std::vector<std::string>{"list"});
  assert(listing&&listing->kind==ReadOnlyQueryKind::list&&listing->destination.profile.empty());
  const auto selected=ParseNativeReadOnlyQuery(std::vector<std::string>{"list","--profile=Work + é"});
  assert(selected&&selected->destination.profile=="Work + é");
  const auto resolved=ParseNativeReadOnlyQuery(std::vector<std::string>{"resolve","https://example.test/p?q=x+y#part","--profile","Work","--space","Notes / α"});
  assert(resolved&&resolved->kind==ReadOnlyQueryKind::resolve&&resolved->destination.space=="Notes / α");
  for(const auto& invalid:std::vector<std::vector<std::string>>{
      {"exec","echo"},{"open","https://example.test/"},{"list","--profile"},
      {"list","--profile="},{"list","--profile","Work","--profile","Personal"},
      {"list","--space=Research"},{"list","--profile=Work\nOther"},
      {"resolve","javascript:alert(1)"},{"resolve","https://user@example.test/"},
      {"resolve","https://example.test/","--space=Research"},
      {"resolve","https://example.test/","--profile=Work","--space=Notes","--space=Other"}})
    assert(!ParseNativeReadOnlyQuery(invalid));
  Arguments input;input.argv={"resolve","https://example.test/p?q=x+y#part","--profile=Work","--space=Notes / α"};
  std::vector<uint8_t> wire;assert(Encode(input,&wire));
  Arguments output;assert(Decode(wire,&output)&&output.environment.empty());
  const auto restored=ParseNativeReadOnlyQuery(output.argv);
  assert(restored&&restored->destination.url==input.argv[1]&&restored->destination.space=="Notes / α");
  assert(ReadOnlyRequestBytes(0)==offsetof(ReadOnlyRequest,payload));
  assert(ReadOnlyCompletionBytes(1)==((offsetof(ReadOnlyCompletion,payload)+4)&~size_t{3}));
  assert(ReadOnlyRequestBytes(kPayloadLimit)<=sizeof(Request));
  assert(ReadOnlyCompletionBytes(kPayloadLimit)<=sizeof(Request));
  assert(!ReadOnlyRequestBytes(kPayloadLimit+1)&&!ReadOnlyCompletionBytes(kPayloadLimit+1));
  wire.push_back(0);assert(!Decode(wire,&output));
}
