  enum class AuxUiCacheOperation { kRead, kValidate, kStage, kPublish, kRestore, kRelease };
  struct AuxUiCacheDocument {
    base::Token source_id;
    blink::LocalFrameToken frame;
    blink::DocumentToken document;
  };
  struct AuxUiCacheView {
    std::string namespace_id;
    std::vector<AuxUiCacheDocument> documents;
    std::map<std::u16string, std::u16string> source;
    std::map<std::u16string, std::u16string> staged;
    bool published = false;
  };
  struct AuxUiMapSnapshot;
