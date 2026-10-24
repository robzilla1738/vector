#include "AuxCliWire.h"
#include <algorithm>
#include <cstring>
#include <limits>
#include <set>
namespace aux::cli {
namespace {
constexpr std::string_view kEnvironment[] = {
    "PATH","HOME","TMPDIR","TZ","LANG","LC_CTYPE","LC_MESSAGES","TERM",
    "TERM_PROGRAM","AUX_API_TOKEN","DAEMON_AUTH_JWT","DAEMON_BASE_URL",
    "AUX_RELEASE_BASE_URL","AUX_CLI_INSTALL_URL","AUX_CLI_LATEST_URL",
    "AUX_CLI_UPDATE_CHECK","AUX_MCP_DEBUG","CLAUDE_CONFIG_DIR","CODEX_HOME",
    "XDG_CONFIG_HOME","NO_COLOR","FORCE_COLOR","CLICOLOR_FORCE",
    "AUX_CLI_AUTH_PATH","AUX_CLI_INSTALL_DIR"};
void U32(std::vector<uint8_t>& out, uint32_t n) {
  for (int shift : {24,16,8,0}) out.push_back(static_cast<uint8_t>(n >> shift));
}
bool Text(std::vector<uint8_t>& out, std::string_view text) {
  if (text.size() > kArgumentBytes || text.find('\0') != std::string_view::npos ||
      out.size() + text.size() + 4 > kPayloadLimit) return false;
  U32(out, static_cast<uint32_t>(text.size()));
  out.insert(out.end(), text.begin(), text.end()); return true;
}
class Reader {
 public:
  explicit Reader(std::span<const uint8_t> bytes) : bytes_(bytes) {}
  bool U32(uint32_t& n) {
    if (bytes_.size() - offset_ < 4) return false;
    n=0; for (size_t i=0;i<4;++i) n=(n<<8)|bytes_[offset_++]; return true;
  }
  bool Text(std::string& text) {
    uint32_t size=0; if(!U32(size)||size>kArgumentBytes||bytes_.size()-offset_<size) return false;
    text.assign(reinterpret_cast<const char*>(bytes_.data()+offset_),size);offset_+=size;
    return text.find('\0')==std::string::npos;
  }
  bool Done() const { return offset_==bytes_.size(); }
 private: std::span<const uint8_t> bytes_; size_t offset_=0;
};
}
bool IsCliEnvironmentName(std::string_view name) {
  return std::find(std::begin(kEnvironment),std::end(kEnvironment),name)!=std::end(kEnvironment);
}
bool Encode(const Arguments& args, std::vector<uint8_t>* result) {
  if(!result||args.argv.size()>kArgumentLimit||args.environment.size()>kEnvironmentLimit)return false;
  std::vector<uint8_t> bytes;U32(bytes,static_cast<uint32_t>(args.argv.size()));
  for(const auto& arg:args.argv)if(!Text(bytes,arg))return false;
  U32(bytes,static_cast<uint32_t>(args.environment.size()));std::set<std::string> seen;
  for(const auto& [name,value]:args.environment)
    if(!IsCliEnvironmentName(name)||!seen.insert(name).second||!Text(bytes,name)||!Text(bytes,value))return false;
  if(bytes.size()>kPayloadLimit)return false;*result=std::move(bytes);return true;
}
bool Decode(std::span<const uint8_t> bytes, Arguments* result) {
  if(!result||bytes.size()>kPayloadLimit)return false;Reader reader(bytes);uint32_t argc=0,envc=0;
  if(!reader.U32(argc)||argc>kArgumentLimit)return false;Arguments args;args.argv.resize(argc);
  for(auto& arg:args.argv)if(!reader.Text(arg))return false;
  if(!reader.U32(envc)||envc>kEnvironmentLimit)return false;std::set<std::string> seen;
  for(uint32_t i=0;i<envc;++i){std::string name,value;if(!reader.Text(name)||!reader.Text(value)||!IsCliEnvironmentName(name)||!seen.insert(name).second)return false;args.environment.emplace_back(std::move(name),std::move(value));}
  if(!reader.Done())return false;*result=std::move(args);return true;
}
size_t RequestBytes(uint32_t payload_bytes) {
  return payload_bytes<=kPayloadLimit?(offsetof(Request,payload)+payload_bytes+3)&~size_t{3}:0;
}
}
