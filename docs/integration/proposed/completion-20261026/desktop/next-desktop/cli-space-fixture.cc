#include "chrome/browser/aux/cli/AuxCliOpenArguments.h"
#include <cassert>
#include <string>
#include <vector>

using aux::cli::OpenParseStatus;
int main() {
  const std::vector<std::string> arguments{
      "open", "https://example.test/p?a=x+y&b=2#part", "--profile", "Work + é",
      "--space", "Research / α + planning"};
  const auto parsed = aux::cli::ParseNativeOpenArguments(arguments);
  assert(parsed.status == OpenParseStatus::accepted);
  assert(parsed.profile == "Work + é" && parsed.space == "Research / α + planning");
  const auto envelope = aux::cli::EncodeNativeOpenEnvelope(parsed);
  assert(envelope && envelope->find("%2B") != std::string::npos);
  const auto restored = aux::cli::ParseNativeOpenEnvelope(*envelope);
  assert(restored.status == OpenParseStatus::accepted);
  assert(restored.url == parsed.url && restored.profile == parsed.profile && restored.space == parsed.space);
  const auto equals = aux::cli::ParseNativeOpenArguments(std::vector<std::string>{
      "open", "--space=Research", "--profile=Work", "https://example.test/"});
  assert(equals.status == OpenParseStatus::accepted && equals.space == "Research");
  for (const auto& invalid : std::vector<std::vector<std::string>>{
      {"open", "https://example.test/", "--space", "Research"},
      {"open", "https://example.test/", "--profile=Work", "--space"},
      {"open", "https://example.test/", "--profile=Work", "--space="},
      {"open", "https://example.test/", "--profile=Work", "--space=A", "--space=B"},
      {"open", "https://example.test/", "--profile=Work", "--space", std::string(257, 'x')},
      {"open", "https://example.test/", "--profile=Work", "--space=A\nB"}}) {
    assert(aux::cli::ParseNativeOpenArguments(invalid).status != OpenParseStatus::accepted);
  }
  const std::string prefix = "aux://open?url=https%3A%2F%2Fexample.test%2F";
  for (const auto& invalid : std::vector<std::string>{
      prefix + "&space=A", prefix + "&profile=Work&space=A&space=B",
      prefix + "&profile=Work&space=", prefix + "&profile=Work&space=A+B",
      prefix + "&profile=Work&space=%00", prefix + "&profile=Work&space=%0A",
      prefix + "&profile=Work&space=%GG", prefix + "&profile=Work&space=A&window=new"}) {
    assert(aux::cli::ParseNativeOpenEnvelope(invalid).status != OpenParseStatus::accepted);
  }
  const auto original = aux::cli::ParseNativeOpenArguments(std::vector<std::string>{
      "open", "https://example.test/", "--profile=Work"});
  const auto original_envelope = aux::cli::EncodeNativeOpenEnvelope(original);
  assert(original_envelope && original_envelope->find("&space=") == std::string::npos);
}
