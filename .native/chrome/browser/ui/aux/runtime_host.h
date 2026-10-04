// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_AUX_RUNTIME_HOST_H_
#define CHROME_BROWSER_UI_AUX_RUNTIME_HOST_H_

#include <atomic>
#include <cstdint>
#include <memory>
#include <optional>
#include <map>
#include <string>
#include <set>

#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/ui/aux/native_startup_runtime_hello.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/native_disposable_credential_grant.h"
#include "chrome/browser/ui/aux/native_disposable_credential_profile.h"
#endif
#include "base/callback_list.h"
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/process/process.h"
#include "base/supports_user_data.h"
#include "base/task/sequenced_task_runner.h"
#include "base/threading/sequence_bound.h"
#include "base/threading/thread.h"
#include "base/values.h"
#include "base/unguessable_token.h"
#include "base/time/time.h"
#include "chrome/browser/ui/aux/native_process_footprint.h"
#include "chrome/browser/ui/aux/native_runtime_peer_identity.h"

class Profile;
namespace device_reauth {
class DeviceAuthenticator;
}
namespace aux {
class EgressController;
class PowerActivityMac;
class CdpBroker;
class ProfileLibrary;
class NativeFind;
class NativeRecorderController;
class NativePersonObserverController;
class NativePersonCaptureController;
class CredentialFill;
class NativeOrganizationWorkFixture;
class NativeProcessMemorySampler;
class NativeStopInputEndpoint;
class NativeStopInputReceipt;
}  // namespace aux

// One authenticated runtime connection per regular Chromium Profile. The
// blocking Unix-domain protocol runs on a sequenced worker; WebUI and browser
// controls remain on the UI sequence.
class AuxRuntimeHost final : public base::SupportsUserData::Data {
 public:
  struct Response {
    bool ok = false;
    std::string result_json;
    std::string error_code;
    std::string error_message;
  };
  using ResponseCallback = base::OnceCallback<void(Response)>;

  static AuxRuntimeHost* ForProfile(Profile* profile);
  ~AuxRuntimeHost() override;
  base::WeakPtr<AuxRuntimeHost> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }

  void CallApi(std::string method,
               std::string params_json,
               ResponseCallback callback);
  // Authenticated host-only RPC, never exposed to WebUI or agents.
  void CallInternal(std::string method,
                    std::string params_json,
                    ResponseCallback callback);
  base::CallbackListSubscription ObserveEvents(
      base::RepeatingCallback<void(const std::string&, const std::string&)>
          callback);
  void NotifyNavigationError(const std::string& page_id,
                             const base::DictValue* error);
  // User-initiated shell fill shares the guarded Chromium password handoff.
  // The callback contains only a status, never a credential or account ID.
  void FillSavedPasswordForUser(
      const std::string& page_id,
      const std::string& expected_url,
      base::OnceCallback<void(base::DictValue)> callback);

 private:
  friend class aux::NativeStopInputEndpoint;
  static base::WeakPtr<AuxRuntimeHost> ExistingForMeasuredStop(Profile* profile);
  void CallApiWithMeasuredStop(std::string method, std::string params_json,
      ResponseCallback callback, std::unique_ptr<aux::NativeStopInputReceipt> original_input);
  friend class aux::NativeOrganizationWorkFixture;
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  friend class aux::NativeProcessMemorySampler;
#endif
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  friend class aux::NativeStartupRuntimeHelloStore;
  static base::WeakPtr<AuxRuntimeHost> ExistingForStartup(Profile* profile);
  void StartupHelloPublished(base::TimeTicks acknowledged, uint64_t generation,
                             aux::NativeRuntimePeerIdentity peer);
  void StartupHelloRetired(uint64_t generation);
  void ConfirmStartupHello(uint64_t generation, aux::NativeRuntimePeerIdentity peer, base::TimeTicks deadline,
                           base::OnceCallback<void(std::optional<base::TimeTicks>)> reply);
#endif
  friend class AuxRuntimeHostPerformanceTestPeer;
  friend class AuxRuntimeHostMemoryTestPeer;
  struct PerformanceProcessIdentity {
    int pid = 0;
    uint64_t connection_generation = 0;
    uint64_t live_refresh_sequence = 0;
    std::string live_folder_id;
    unsigned live_folder_units = 0;
    bool operator==(const PerformanceProcessIdentity&) const = default;
  };
  void ReadPerformanceProcessIdentity(
      base::OnceCallback<void(std::optional<PerformanceProcessIdentity>)> callback);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  struct PerformanceProcessMemory {
    PerformanceProcessIdentity identity;
    aux::NativeProcessFootprint before;
    aux::NativeProcessFootprint after;
    aux::NativeRuntimePeerIdentity peer;
  };
  struct PerformanceProcessWorkload {
    PerformanceProcessIdentity identity;
    aux::NativeRuntimePeerIdentity peer;
    base::DictValue record;
    base::TimeTicks issued;
    base::TimeTicks received;
  };
  using PerformanceWorkloadCallback = base::OnceCallback<void(std::optional<PerformanceProcessWorkload>)>;
  enum class PerformanceObservation { kWorkload, kPreparation };
  void ReadPerformanceProcessWorkload(PerformanceWorkloadCallback callback);
  void ReadPerformanceSubagentPreparation(PerformanceWorkloadCallback callback);
  void ReadPerformanceProcessMemory(
      base::OnceCallback<void(std::optional<PerformanceProcessMemory>)> callback);
#endif
  class Worker {
   public:
    Worker(base::FilePath profile_path,
           std::string profile_id,
           scoped_refptr<base::SequencedTaskRunner> ui_runner,
           base::WeakPtr<AuxRuntimeHost> owner
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
           , std::shared_ptr<aux::NativeDisposableCredentialProfile::State> credential_profile = nullptr
#endif
           );
    ~Worker();
    void CallApi(std::string method, std::string params_json,
                 std::string person_resume, ResponseCallback callback);
    void CallInternal(std::string method, std::string params_json,
                      ResponseCallback callback);
    void CallRequest(std::string method, std::string params_json,
                     bool desktop_api, std::string person_resume,
                     ResponseCallback callback);
    bool Pump();
    std::optional<PerformanceProcessIdentity> ReadPerformanceProcessIdentity();
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
    std::optional<PerformanceProcessMemory> ReadPerformanceProcessMemory();
    std::optional<base::TimeTicks> ConfirmStartupHello(uint64_t generation, aux::NativeRuntimePeerIdentity peer, base::TimeTicks deadline);
    void ReadPerformanceProcessWorkload(PerformanceWorkloadCallback callback);
    void ReadPerformanceObservation(PerformanceObservation kind, PerformanceWorkloadCallback callback);
#endif
    void SendCdpMessage(uint64_t connection_generation,
                        std::string page_id,
                        std::string message);
    void SendCdpAuthorityChanged(uint64_t connection_generation);
    void SendCdpNavigationState(uint64_t connection_generation,
        std::string page_id, std::string attachment_id, int command_id,
        std::string lease_id, bool ready);
    void SendTabsChanged();
    void SendCatalogPatch(std::string payload_json);
    void SendNavigationError(std::string payload_json);
    void SendBookmarkChanged();

   private:
    friend class AuxRuntimeHostPerformanceTestPeer;
    friend class AuxRuntimeHostMemoryTestPeer;
    bool Connect(std::string* error);
    void Disconnect();
    bool SendFrame(const std::string& frame);
    bool ReadFrame(std::string* frame, int timeout_ms);
    base::DictValue DispatchNative(const std::string& method,
                                   base::DictValue params);
    bool HandleNativeRequest(const base::DictValue& data);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
    bool PrepareDisposableCredential();
    std::shared_ptr<aux::NativeDisposableCredentialProfile::State> credential_profile_;
    std::shared_ptr<aux::NativeDisposableCredentialGrant> credential_grant_;
    bool credential_cache_checked_ = false, credential_cache_admitted_ = false;
#endif
    void ForwardNote(const base::DictValue& data);
    void HandleResponse(const base::DictValue& data);
    struct PendingRequest {
      base::TimeTicks deadline;
      ResponseCallback callback;
      std::string live_folder_id;
    };
    uint64_t live_refresh_sequence_ = 0;
    std::string live_folder_id_;
    unsigned live_folder_units_ = 0;
    std::map<uint32_t, PendingRequest> pending_requests_;

    base::FilePath profile_path_;
    std::string profile_id_;
    scoped_refptr<base::SequencedTaskRunner> ui_runner_;
    base::WeakPtr<AuxRuntimeHost> owner_;
    base::FilePath socket_path_;
    std::string token_;
    base::Process process_;
    int listener_fd_ = -1;
    int connection_fd_ = -1;
    uint32_t next_request_id_ = 1;
    uint64_t connection_generation_ = 0;
    std::string read_buffer_;
  };

  friend class AuxRuntimeHostTestPeer;
  friend class NativePersonReadHostTestPeer;
  friend class AuxCreatorCloseBrowserTestPeer;
  friend class AuxNativeInputAckBrowserTestPeer;
  using TestDispatch = base::RepeatingCallback<void(
      bool, std::string, std::string, ResponseCallback)>;
  static AuxRuntimeHost* InstallTestDispatch(Profile* profile, TestDispatch dispatch);
  static void RemoveTestDispatch(Profile* profile);
  explicit AuxRuntimeHost(Profile* profile);
  void HandleZapInstall(const base::DictValue& params,
                        base::OnceCallback<void(base::DictValue)> callback);
  void HandleCosmeticCommit(const base::DictValue& params,
                            base::OnceCallback<void(base::DictValue)> callback);
  void HandleReadableCapture(
      const base::DictValue& params,
      base::OnceCallback<void(base::DictValue)> callback);
  void HandleDownloadNamingRequest(const std::string& method,
      const base::DictValue& params,
      base::OnceCallback<void(base::DictValue)> callback);
  void HandleHistoryMutation(
      const std::string& method,
      const base::DictValue& params,
      base::OnceCallback<void(base::DictValue)> callback);
  void HandleCredentialFill(const base::DictValue& params,
                            std::shared_ptr<std::atomic_bool> cancelled,
                            base::OnceCallback<void(base::DictValue)> callback);
  void HandleRecoveryOwnerAuth(const base::DictValue& params,
                               std::shared_ptr<std::atomic_bool> cancelled,
                               base::OnceCallback<void(base::DictValue)> callback);
  std::unique_ptr<aux::PowerActivityMac> power_activity_;
  base::DictValue HandleNativePowerCall(const std::string& method, const base::DictValue& params);
  base::DictValue HandleNativeCall(const std::string& method,
                                   const base::DictValue& params,
                                   uint64_t connection_generation);
  base::DictValue HandleNativeLibraryCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation);
  base::DictValue HandleNativeBlockingCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation);
  base::DictValue HandleNativeCdpCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation);
  base::DictValue HandleNativeTabsCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation);
  base::DictValue HandleNativePageControlsCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation);
  void OnRuntimeNote(std::string type, std::string payload_json);
  void OnCdpMessage(uint64_t connection_generation,
                    const std::string& page_id,
                    const std::string& message);
  void OnCdpAuthorityChanged();
  void OnCdpNavigationState(uint64_t connection_generation,
      const std::string& page_id, const std::string& attachment_id,
      int command_id, const std::string& lease_id, bool ready);
  void SchedulePump();
  void PumpOnce();
  void OnPumpDone(bool connected);
  void NativeConnectionPublished(uint64_t generation);
  void NativeConnectionRetired(uint64_t generation);
  void HandleNativeCdpAttachment(
      const base::DictValue& params, uint64_t connection_generation,
      std::shared_ptr<std::atomic_bool> cancelled,
      base::OnceCallback<void(base::DictValue)> callback);
  void HandleNativeCdpNavigationReceipt(
      const base::DictValue& params, uint64_t connection_generation,
      std::shared_ptr<std::atomic_bool> cancelled,
      base::OnceCallback<void(base::DictValue)> callback);
  void HandleNativePersonReadCall(
      const std::string& method, const base::DictValue& params, uint64_t connection_generation,
      base::OnceCallback<void(base::DictValue)> callback);
  void FailNativeCreatorCreation(base::DictValue original_failure,
      base::DictValue original_proof, uint64_t connection_generation,
      std::shared_ptr<std::atomic_bool> cancelled,
      base::OnceCallback<void(base::DictValue)> done);
  void HandleNativeCreatorCreateCall(const base::DictValue& params,
      uint64_t connection_generation, std::shared_ptr<std::atomic_bool> cancelled,
      base::OnceCallback<void(base::DictValue)> done);
  void HandleNativeCreatorCloseCall(const base::DictValue& params,
      uint64_t connection_generation, std::shared_ptr<std::atomic_bool> cancelled,
      base::OnceCallback<void(base::DictValue)> done);
  void HandleNativeRecorderCall(
      const std::string& method, const base::DictValue& params,
      uint64_t connection_generation,
      base::OnceCallback<void(base::DictValue)> callback);
  void FinishOwnerMutation(const std::string& token, bool success);
  void FailOwnerMutations();

  TestDispatch test_dispatch_;
  raw_ptr<Profile> profile_;
  std::unique_ptr<base::Thread> worker_thread_;
  base::SequenceBound<Worker> worker_;
  std::unique_ptr<aux::CdpBroker> cdp_broker_;
  base::CallbackListSubscription cdp_authority_subscription_;
  std::unique_ptr<aux::ProfileLibrary> profile_library_;
  std::unique_ptr<aux::CredentialFill> credential_fill_;
  std::unique_ptr<aux::NativeFind> native_find_;
  std::unique_ptr<device_reauth::DeviceAuthenticator> recovery_authenticator_;
  bool recovery_auth_pending_ = false;
  std::map<std::string, int> staged_pages_;
  base::CallbackListSubscription tab_catalog_subscription_;
  base::RepeatingCallbackList<void(const std::string&, const std::string&)>
      observers_;
  bool pump_scheduled_ = false;
  bool runtime_connected_ = false;
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  std::shared_ptr<aux::NativeDisposableCredentialGrant> credential_grant_;
#endif
  const std::string native_owner_incarnation_ = base::UnguessableToken::Create().ToString();
  base::WeakPtr<aux::EgressController> native_connection_egress_;
  uint64_t admitted_native_generation_ = 0;
  uint64_t retired_native_generation_ = 0;
  uint64_t native_recorder_session_generation_ = 0;
  std::string native_recorder_page_id_;
  base::WeakPtr<aux::NativeRecorderController> native_recorder_;
  std::map<std::string, base::WeakPtr<aux::NativePersonObserverController>>
      native_person_reads_;
  std::map<std::string, base::WeakPtr<aux::NativePersonCaptureController>> native_person_captures_;
  std::string native_person_connection_id_;
  bool shutting_down_ = false;
  base::WeakPtr<aux::EgressController> owner_mutation_egress_;
  std::set<std::string> owner_mutation_tokens_;
  base::WeakPtrFactory<AuxRuntimeHost> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_AUX_RUNTIME_HOST_H_
