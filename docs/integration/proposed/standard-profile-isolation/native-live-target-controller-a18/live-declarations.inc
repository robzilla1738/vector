  enum class LiveAction {
    kExtensionAttempt, kExtensionCommit, kExtensionRead, kDomAttempt, kDomCommit, kDomRead,
    kBackendsObserved, kPublishAttempt, kPublish, kPublishRead, kPublishAck, kComplete,
    kRestoreDomAttempt, kRestoreDom, kRestoreDomRead,
    kRestoreExtensionAttempt, kRestoreExtension, kRestoreExtensionRead, kRestored
  };
  bool LiveOwners(bool restoration);
  bool AcceptLiveDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  bool LiveStores(size_t, const base::DictValue&) const;
  base::DictValue LiveFacts() const;
  void StartLive();
  void RunLive();
  void ValidateLive();
  void LiveWorker(base::DictValue);
  void LiveFrameNext();
  void LiveFrame(size_t, std::optional<base::DictValue>, std::string);
  void LiveFrontend(Frontend::AuxUiMigrationReadbackResult);
  void LiveDomNext();
  void LiveDomValidated(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void ActLive();
  void RecordLive(uint8_t, LiveAction);
  void StepLiveRecord();
  void LiveExtensionStatus(value_store::ValueStore::Status);
  void LiveExtensionRead(Frontend::AuxUiMigrationReadbackResult);
  void LiveDomStatus(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void LiveDomRead(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void LiveLost();
  void RollbackLive(std::string);
  void HoldLive(std::string);
