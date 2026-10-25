// Focused pure-data cases for the actual proposed AuxCliOpenArguments.cc.
// No browser, provider, owner-profile, OS dispatch or task execution.
#include "chrome/browser/aux/cli/AuxCliOpenArguments.h"
#include <cassert>
#include <string>
#include <vector>
using aux::cli::OpenArguments;
using aux::cli::OpenParseStatus;
int main() {
  const OpenArguments original{OpenParseStatus::accepted,
      "https://example.test/p?q=a+b&x=1#part", "Work + é"};
  const auto wire = aux::cli::EncodeNativeOpenEnvelope(original);
  assert(wire && wire->find("%2B") != std::string::npos);
  const auto decoded = aux::cli::ParseNativeOpenEnvelope(*wire);
  assert(decoded.status == OpenParseStatus::accepted);
  assert(decoded.url == original.url && decoded.profile == original.profile);
  for (const auto& invalid : std::vector<std::string>{
      "aux://open?profile=Work", "aux://open?url=https%3A%2F%2Fx&url=https%3A%2F%2Fy",
      "aux://open?url=https%3A%2F%2Fx&profile=W&profile=P",
      "aux://open?url=https%3A%2F%2Fx&window=new", "aux://open?%75rl=https%3A%2F%2Fx",
      "aux://u@open?url=https%3A%2F%2Fx", "aux://open:80?url=https%3A%2F%2Fx",
      "aux://open?url=https%3A%2F%2Fx#fragment", "other://open?url=https%3A%2F%2Fx",
      "aux://open?url=javascript%3Aalert%281%29", "aux://open?url=https%3A%2F%2Fu%40x",
      "aux://open?url=https%3A%2F%2Fx&profile=%00", "aux://open?url=https%3A%2F%2Fx&profile=%5C",
      "aux://open?url=https%3A%2F%2Fx&profile=a+b", "aux://open?url=https%3A%2F%2Fx&",
      "aux://open?url=https%3A%2F%2Fx%GG"}) {
    assert(aux::cli::ParseNativeOpenEnvelope(invalid).status != OpenParseStatus::accepted);
  }
  assert(!aux::cli::EncodeNativeOpenEnvelope(
      {OpenParseStatus::accepted, "https://x/" + std::string(8192, 'x'), {}}));
  assert(!aux::cli::EncodeNativeOpenEnvelope(
      {OpenParseStatus::accepted, "https://x/", std::string(257, 'x')}));
  assert(aux::cli::ParseNativeOpenEnvelope("aux://open/?url=HTTPS%3A%2F%2Fx").status ==
         OpenParseStatus::accepted);
  assert(aux::cli::ParseNativeOpenArguments(
      std::vector<std::string>{"open", "https://x/", "--profile", "Work"}).profile == "Work");
}
