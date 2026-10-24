// Focused provider-free codec boundary cases. Not registered or run by this lane.
#include "chrome/browser/aux/ui_storage_migration_journal_protocol.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace aux::ui_journal {
namespace {
const Uuid kInventoryID{0x12,0x34,0x56,0x78,0x12,0x34,0x4a,0xbc,
                        0x8d,0xef,0x12,0x34,0x56,0x78,0x90,0xab};
void AppendWord(std::vector<uint8_t>& bytes, uint32_t word) {
  bytes.push_back(word & 0xff); bytes.push_back((word >> 8) & 0xff);
  bytes.push_back((word >> 16) & 0xff); bytes.push_back((word >> 24) & 0xff);
}
std::vector<uint8_t> InventoryWire(uint8_t count, uint8_t status = 0,
                                    uint8_t first = 64, uint8_t present = 0) {
  std::vector<uint8_t> bytes{13,0};
  bytes.insert(bytes.end(), kInventoryID.begin(), kInventoryID.end());
  bytes.insert(bytes.end(), {1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0});
  AppendWord(bytes, count); AppendWord(bytes, first);
  bytes.push_back(status); bytes.push_back(present);
  for (uint8_t ordinal = 0; ordinal < count; ++ordinal) {
    AppendWord(bytes, ordinal); bytes.push_back(ordinal == 0 ? 1 : 2);
    bytes.insert(bytes.end(), 32, 0x11); bytes.insert(bytes.end(), 32, 0x22);
  }
  return bytes;
}
TEST(AuxUiJournalProtocol, PrefixTailGeometryAndExactSizes) {
  auto empty = ParseInventoryReply(InventoryWire(0));
  ASSERT_TRUE(empty); EXPECT_FALSE(empty->firstUncertain); EXPECT_FALSE(empty->tailPresent);
  auto partial = ParseInventoryReply(InventoryWire(1,1,1,1));
  ASSERT_TRUE(partial); EXPECT_EQ(partial->records.size(), 1u);
  EXPECT_EQ(partial->firstUncertain, 1u); EXPECT_EQ(partial->tailStatus, TailStatus::kPartial);
  EXPECT_FALSE(ParseInventoryReply(InventoryWire(1,1,0,1)));
  EXPECT_FALSE(ParseInventoryReply(InventoryWire(63,2,63,1)));
  EXPECT_FALSE(ParseInventoryReply(InventoryWire(65)));
  auto extra = InventoryWire(1); extra.push_back(0);
  EXPECT_FALSE(ParseInventoryReply(extra));
  auto wrong_kind = InventoryWire(2);
  base::span(wrong_kind).subspan(kInventoryHeaderBytes + kRecordSummaryBytes + 4, 1).front() = 1;
  EXPECT_FALSE(ParseInventoryReply(wrong_kind));
}
TEST(AuxUiJournalProtocol, SelectedReceiptMustMatchCapturedHashAndBytes) {
  auto inventory = ParseInventoryReply(InventoryWire(1)); ASSERT_TRUE(inventory);
  const std::string receipt = "{\"data\":1}";
  const auto digest = crypto::hash::Sha256(receipt);
  inventory->records.front().receiptSHA = digest;
  std::vector<uint8_t> bytes{13,1};
  bytes.insert(bytes.end(), kInventoryID.begin(), kInventoryID.end());
  AppendWord(bytes, 0); AppendWord(bytes, 8); bytes.push_back(1);
  bytes.insert(bytes.end(), digest.begin(), digest.end()); AppendWord(bytes, receipt.size());
  bytes.insert(bytes.end(), receipt.begin(), receipt.end());
  auto selected = ParseSelectedReply(bytes, *inventory, 0);
  ASSERT_TRUE(selected); EXPECT_EQ(selected->receiptJSON, receipt); EXPECT_EQ(selected->payloadBytes, 8u);
  bytes.back() ^= 1; EXPECT_FALSE(ParseSelectedReply(bytes, *inventory, 0));
  EXPECT_FALSE(ParseSelectedReply(bytes, *inventory, 1));
}
TEST(AuxUiJournalProtocol, BuildersPreserveLittleEndianAndRejectOverflow) {
  const Uuid journal{1};
  auto inventory = ParseInventoryReply(InventoryWire(1)); ASSERT_TRUE(inventory);
  auto select = MakeSelectRequest(journal, *inventory, 0); ASSERT_TRUE(select);
  EXPECT_EQ(select->size(), 37u);
  EXPECT_FALSE(MakeSelectRequest(journal, *inventory, 1));
  auto read = MakePayloadReadRequest(journal, 0, 0x01020304, 1, kMaxPayloadBytes);
  ASSERT_TRUE(read); EXPECT_EQ(read->size(), 29u);
  const std::array<uint8_t, 8> expected{4,3,2,1,1,0,0,0};
  EXPECT_TRUE(std::ranges::equal(base::span(*read).last<8>(), expected));
  EXPECT_FALSE(MakePayloadReadRequest(journal, 0, 0xffffffff, 1, kMaxPayloadBytes));
  EXPECT_FALSE(MakePayloadReadRequest(journal, 0, 0, 0, kMaxPayloadBytes));
  EXPECT_FALSE(MakePayloadReadRequest(journal, 0, 0, 8192, kMaxPayloadBytes));
}
}  // namespace
}  // namespace aux::ui_journal
