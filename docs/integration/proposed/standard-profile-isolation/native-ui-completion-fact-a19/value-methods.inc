UiStorageMigrationOwnerAck::UiStorageMigrationOwnerAck(uint64_t generation,
    std::string fingerprint, base::RepeatingCallback<bool()> current)
    : native_generation_(generation), terminal_fingerprint_(std::move(fingerprint)), owner_current_(std::move(current)) {}
UiStorageMigrationOwnerAck::UiStorageMigrationOwnerAck(UiStorageMigrationOwnerAck&&) = default;
UiStorageMigrationOwnerAck& UiStorageMigrationOwnerAck::operator=(UiStorageMigrationOwnerAck&&) = default;
UiStorageMigrationOwnerAck::~UiStorageMigrationOwnerAck() = default;
bool UiStorageMigrationOwnerAck::IsCurrent() const {
  return native_generation_ && terminal_fingerprint_.size() == 64 && owner_current_ && owner_current_.Run();
}
bool UiStorageMigrationOwnerAck::Matches(uint64_t generation, std::string_view fingerprint) const {
  return generation == native_generation_ && fingerprint == terminal_fingerprint_ && IsCurrent();
}
UiStorageMigrationCompletion::UiStorageMigrationCompletion(uint64_t generation, std::string fingerprint,
    std::vector<uint8_t> frame, std::vector<uint8_t> reply, base::RepeatingCallback<bool()> current)
    : native_generation_(generation), terminal_fingerprint_(std::move(fingerprint)), read_frame_(std::move(frame)),
      expected_reply_(std::move(reply)), actual_current_(std::move(current)) {}
UiStorageMigrationCompletion::UiStorageMigrationCompletion(UiStorageMigrationCompletion&&) = default;
UiStorageMigrationCompletion& UiStorageMigrationCompletion::operator=(UiStorageMigrationCompletion&&) = default;
UiStorageMigrationCompletion::~UiStorageMigrationCompletion() = default;
uint64_t UiStorageMigrationCompletion::native_generation() const { return native_generation_; }
std::string_view UiStorageMigrationCompletion::terminal_fingerprint() const { return terminal_fingerprint_; }
bool UiStorageMigrationCompletion::IsCurrent() const {
  return native_generation_ && terminal_fingerprint_.size() == 64 && actual_current_ && actual_current_.Run();
}
std::vector<uint8_t> UiStorageMigrationCompletion::TerminalReadFrame() const {
  return IsCurrent() ? read_frame_ : std::vector<uint8_t>();
}
bool UiStorageMigrationCompletion::MatchesTerminalReply(base::span<const uint8_t> reply) const {
  return IsCurrent() && std::ranges::equal(reply, expected_reply_);
}
