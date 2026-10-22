// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/notifications/aux_notification_inbox.h"

#include <utility>
#include "base/base64.h"
#include "base/check.h"
#include "base/containers/span.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "base/time/time.h"
#include "base/unguessable_token.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "components/content_settings/core/browser/host_content_settings_map.h"
#include "components/content_settings/core/common/content_settings.h"
#include "components/content_settings/core/common/content_settings_types.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
#include "crypto/aead.h"
#include "crypto/random.h"
#include "extensions/browser/api/messaging/channel_endpoint.h"
#include "extensions/browser/api/messaging/message_port.h"
#include "extensions/browser/api/messaging/message_service.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/api/messaging/message.h"
#include "extensions/common/api/messaging/messaging_endpoint.h"
#include "extensions/common/api/messaging/port_context.h"
#include "extensions/common/api/messaging/port_id.h"
#include "extensions/common/mojom/message_port.mojom.h"
#include "sql/database.h"
#include "sql/statement.h"
#include "third_party/blink/public/common/notifications/platform_notification_data.h"
#include "ui/gfx/codec/png_codec.h"
#include "url/gurl.h"
#include "url/origin.h"

namespace aux {
namespace {
constexpr char kInboxMessage[] = "aside.inboxNotification";
constexpr char kDeliveryModes[] =
    "persistent_notifications.ai_delivery_mode_by_origin";
constexpr char kCreateTable[] =
    "CREATE TABLE IF NOT EXISTS inbox_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, "
    "created_at INTEGER NOT NULL, site_url TEXT NOT NULL, encrypted_payload BLOB NOT NULL, "
    "is_persistent INTEGER NOT NULL)";
constexpr char kInsert[] =
    "INSERT INTO inbox_entries (created_at, site_url, encrypted_payload, is_persistent) "
    "VALUES (?, ?, ?, ?)";

// Original e1aafa8 is an immediately closed native sendMessage opener: no
// response callback, acknowledgement or Tidy's unrelated 15-second timer.
class InboxMessagePort final : public extensions::MessagePort {
 public:
  InboxMessagePort(base::WeakPtr<ChannelDelegate> delegate,
                   const extensions::PortId& id)
      : MessagePort(std::move(delegate), id) {}
  ~InboxMessagePort() override = default;
  bool IsValidPort() override { return true; }
  void DispatchOnMessage(extensions::Message message) override {}
};

void Dispatch(Profile& profile, const char* message_type, base::DictValue payload) {
  auto* registry = extensions::ExtensionRegistry::Get(&profile);
  if (!registry ||
      !registry->enabled_extensions().GetByID(kAgentExtensionId)) return;
  auto* service = extensions::MessageService::Get(&profile);
  if (!service) return;
  payload.Set("type", message_type);
  std::string serialized;
  if (!base::JSONWriter::Write(payload, &serialized)) return;
  const extensions::PortId id(base::UnguessableToken::Create(), 1, true,
      extensions::mojom::SerializationFormat::kJson);
  auto delegate = service->GetChannelDelegate();
  auto port = std::make_unique<InboxMessagePort>(delegate, id);
  service->OpenChannelToExtension(extensions::ChannelEndpoint(&profile), id,
      extensions::MessagingEndpoint::ForNativeApp(message_type), std::move(port),
      kAgentExtensionId, GURL(), extensions::mojom::ChannelType::kSendMessage,
      std::string());
  if (delegate) {
    delegate->PostMessage(id, extensions::Message(std::move(serialized), false, false));
  }
  if (delegate) {
    delegate->ClosePort(id, -1, extensions::PortContext::ForNativeHost(), true,
                        std::string());
  }
}

// 40f7e38: no plaintext database fallback. Failure is represented in the
// eventual Agent message, not converted to an invented successful row.
std::optional<int64_t> SaveEntry(const base::FilePath& path,
                                const base::DictValue& payload,
                                bool persistent) {
  sql::Database database("PermissionAuditingLogs");
  if (!database.Open(path) || !database.Execute(kCreateTable)) return std::nullopt;
  std::string serialized;
  if (!base::JSONWriter::Write(payload, &serialized)) return std::nullopt;
  auto key = LoadAgentInboxMasterKey(StateHome());
  if (!key) return std::nullopt;
  crypto::Aead aead(crypto::Aead::AES_256_GCM, *key);
  std::string nonce(aead.NonceLength(), '\0');
  crypto::RandBytes(base::as_writable_byte_span(nonce));
  std::string ciphertext;
  if (!aead.Seal(serialized, nonce, std::string_view(), &ciphertext))
    return std::nullopt;
  std::string encrypted = "ASIDEAI1";
  encrypted.append(nonce);
  encrypted.append(ciphertext);
  sql::Statement statement(database.GetCachedStatement(SQL_FROM_HERE, kInsert));
  statement.BindTime(0, base::Time::Now());
  const auto* site = payload.FindString("site_url");
  statement.BindString(1, site ? *site : std::string());
  statement.BindBlob(2, std::move(encrypted));
  statement.BindBool(3, persistent);
  if (!statement.Run()) return std::nullopt;
  return database.GetLastInsertRowId();
}
std::optional<std::string> PermissionOrigin(const GURL& url) {
  if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS()) return std::nullopt;
  return url::Origin::Create(url).Serialize();
}
std::optional<std::string> PermissionOrigin(
    const ContentSettingsPattern& pattern) {
  if (!pattern.IsValid() || pattern == ContentSettingsPattern::Wildcard())
    return std::nullopt;
  return PermissionOrigin(GURL(pattern.ToString()));
}
}  // namespace

NotificationInbox::NotificationInbox(Profile& profile)
    : profile_(profile.GetWeakPtr()) {
  permission_prefs_.Init(profile.GetPrefs());
  permission_prefs_.Add(kDeliveryModes,
      base::BindRepeating(&NotificationInbox::OnDeliveryModesChanged,
                          weak_.GetWeakPtr()));
  // Original constructor seeds without replaying historical notifications or
  // permission-change events to the Agent.
  for (const auto& origin : CollectPermissionOrigins()) {
    std::string state = ReadPermission(GURL(origin));
    if (state != "default") permission_snapshot_.emplace(origin, std::move(state));
  }
}
NotificationInbox::~NotificationInbox() = default;
void NotificationInbox::Shutdown() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  permission_prefs_.RemoveAll();
  weak_.InvalidateWeakPtrs();
  profile_.reset();
}
bool NotificationInbox::IsAiOnly(const GURL& origin) const {
  if (!profile_) return false;
  return profile_->GetPrefs()->GetDict(kDeliveryModes).FindInt(
      origin.DeprecatedGetOriginAsURL().spec()) == 1;
}
void NotificationInbox::SaveAndDispatch(const std::string& notification_id,
    const GURL& origin, const GURL& context_url,
    const blink::PlatformNotificationData& data, const SkBitmap& image,
    bool persistent) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile_) return;
  base::DictValue payload;
  payload.Set("notification_id", notification_id);
  payload.Set("site_url", origin.DeprecatedGetOriginAsURL().spec());
  payload.Set("title", base::UTF16ToUTF8(data.title));
  payload.Set("body", base::UTF16ToUTF8(data.body));
  payload.Set("is_persistent", persistent);
  if (context_url.is_valid()) payload.Set("context_url", context_url.spec());
  payload.Set("click_payload_base64", base::Base64Encode(base::as_byte_span(data.data)));
  if (data.data_json) payload.Set("click_payload_json", *data.data_json);
  auto worker_payload = payload.Clone();
  base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE,
      {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
      base::BindOnce(&NotificationInbox::Save, profile_->GetPath(),
                     std::move(worker_payload), image, persistent),
      base::BindOnce(&NotificationInbox::DidSave, weak_.GetWeakPtr(),
                     std::move(payload)));
}
NotificationInbox::SaveResult NotificationInbox::Save(
    const base::FilePath& profile_path, base::DictValue payload,
    SkBitmap image, bool persistent) {
  SaveResult result;
  if (!image.drawsNothing()) {
    if (auto png = gfx::PNGCodec::EncodeBGRASkBitmap(image, false)) {
      result.image_base64 = base::Base64Encode(*png);
      payload.Set("image_png_base64", *result.image_base64);
    }
  }
  const base::FilePath path = profile_path.AppendASCII("AuxInbox");
  auto id = SaveEntry(path, payload, persistent);
  // Original 40f8478 retries with a fresh DB object at the identical path.
  if (!id) id = SaveEntry(path, payload, persistent);
  if (id) {
    result.entry_id = *id;
    result.success = true;
  }
  return result;
}
void NotificationInbox::DidSave(base::DictValue payload, SaveResult result) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile_) return;
  if (result.success) {
    payload.Set("inbox_entry_id", base::NumberToString(result.entry_id));
  } else {
    payload.Set("inbox_save_failed", true);
  }
  if (result.image_base64) payload.Set("image_png_base64", *result.image_base64);
  Dispatch(*profile_, kInboxMessage, std::move(payload));
}
std::set<std::string> NotificationInbox::CollectPermissionOrigins() const {
  std::set<std::string> origins;
  if (!profile_) return origins;
  auto* settings = HostContentSettingsMapFactory::GetForProfile(profile_.get());
  for (const auto& rule : settings->GetSettingsForOneType(
           ContentSettingsType::NOTIFICATIONS)) {
    if (auto origin = PermissionOrigin(rule.primary_pattern)) origins.insert(*origin);
  }
  for (const auto entry : profile_->GetPrefs()->GetDict(kDeliveryModes)) {
    if (auto origin = PermissionOrigin(GURL(entry.first))) origins.insert(*origin);
  }
  return origins;
}
std::string NotificationInbox::ReadPermission(const GURL& origin) const {
  if (!profile_ || !origin.is_valid() || !origin.SchemeIsHTTPOrHTTPS())
    return "default";
  const GURL canonical = origin.DeprecatedGetOriginAsURL();
  const ContentSetting setting =
      HostContentSettingsMapFactory::GetForProfile(profile_.get())->GetContentSetting(
          canonical, canonical, ContentSettingsType::NOTIFICATIONS);
  if (setting == CONTENT_SETTING_BLOCK) return "deny";
  if (setting != CONTENT_SETTING_ALLOW) return "default";
  return IsAiOnly(canonical) ? "allow_for_ai" : "allow";
}
void NotificationInbox::OnDeliveryModesChanged() {
  RefreshPermissionOrigins(CollectPermissionOrigins(), "api");
}
void NotificationInbox::OnContentSettingChanged(
    const ContentSettingsPattern& primary,
    const ContentSettingsPattern& secondary) {
  if (!profile_) return;
  std::set<std::string> origins;
  if (auto origin = PermissionOrigin(primary)) origins.insert(*origin);
  if (auto origin = PermissionOrigin(secondary)) origins.insert(*origin);
  if (origins.empty()) origins = CollectPermissionOrigins();
  RefreshPermissionOrigins(origins, "native_ui");
}
void NotificationInbox::RefreshPermissionOrigins(
    const std::set<std::string>& origins, const char* source) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto self = weak_.GetWeakPtr();
  for (const auto& origin : origins) {
    if (!profile_) return;
    const GURL url(origin);
    const std::string state = ReadPermission(url);
    const auto previous = permission_snapshot_.find(origin);
    const std::string old_state = previous == permission_snapshot_.end()
        ? "default" : previous->second;
    if (state == old_state) continue;
    // Update before SetDict: its genuine synchronous pref callback can reenter.
    if (state == "default") permission_snapshot_.erase(origin);
    else permission_snapshot_.insert_or_assign(origin, state);
    if (state == "default" || state == "deny") {
      auto* settings = HostContentSettingsMapFactory::GetForProfile(profile_.get());
      const GURL canonical = url.DeprecatedGetOriginAsURL();
      if (settings->GetContentSetting(canonical, canonical,
              ContentSettingsType::NOTIFICATIONS) != CONTENT_SETTING_ALLOW) {
        base::DictValue modes = profile_->GetPrefs()->GetDict(kDeliveryModes).Clone();
        if (modes.Remove(canonical.spec())) {
          profile_->GetPrefs()->SetDict(kDeliveryModes, std::move(modes));
          if (!self || !self->profile_) return;
        }
      }
    }
    base::DictValue payload;
    payload.Set("origin", origin);
    payload.Set("permission", state);
    payload.Set("source", source);
    payload.Set("timestamp", base::Time::Now().InMillisecondsFSinceUnixEpoch());
    Dispatch(*profile_, "aside.notificationPermissionChanged", std::move(payload));
    if (!self) return;
  }
}
}  // namespace aux
