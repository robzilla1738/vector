// Copyright 2026 The Aux Authors
#ifndef CHROME_RENDERER_AUX_RECORDER_AGENT_H_
#define CHROME_RENDERER_AUX_RECORDER_AGENT_H_

#include <optional>
#include <memory>
#include <string>
#include "base/memory/weak_ptr.h"
#include "chrome/common/aux_recorder.mojom.h"
#include "content/public/renderer/render_frame_observer.h"
#include "mojo/public/cpp/bindings/associated_receiver_set.h"
#include "mojo/public/cpp/bindings/associated_remote.h"
#include "third_party/blink/public/common/tokens/tokens.h"
namespace gin { class Arguments; }
namespace chrome {
// Owned by RenderFrame; only the browser's closed associated endpoint can arm.
class AuxRecorderAgent final : public content::RenderFrameObserver,
                               public mojom::AuxRecorder {
 public:
  explicit AuxRecorderAgent(content::RenderFrame* frame);
  ~AuxRecorderAgent() override;
 private:
  void Bind(mojo::PendingAssociatedReceiver<mojom::AuxRecorder> receiver);
  void Prepare(PrepareCallback callback) override;
  void Start(const std::string& id, uint64_t generation,
             mojo::PendingAssociatedRemote<mojom::AuxRecorderSink> sink,
             StartCallback callback) override;
  void Stop(const std::string& id, uint64_t generation,
            StopCallback callback) override;
  void Capture(const std::string& id, uint64_t generation,
               const blink::DocumentToken& document, gin::Arguments* args);
  bool Current(const std::string& id, uint64_t generation,
               const blink::DocumentToken& document) const;
  void Retire(bool notify);
  void DidCreateNewDocument() override;
  void WillDetach(blink::DetachReason reason) override;
  void OnDestruct() override;
  std::string id_;
  std::string retired_id_;
  uint64_t retired_generation_ = 0;
  uint64_t generation_ = 0;
  uint64_t sequence_ = 0;
  size_t bytes_ = 0;
  size_t pending_events_ = 0;
  std::optional<blink::DocumentToken> document_;
  struct ReceiverScope {
    explicit ReceiverScope(blink::DocumentToken token) : document(token) {}
    const blink::DocumentToken document;
    bool prepared = false;
  };
  mojo::AssociatedReceiverSet<mojom::AuxRecorder, std::shared_ptr<ReceiverScope>> receivers_;
  mojo::AssociatedRemote<mojom::AuxRecorderSink> sink_;
  base::WeakPtrFactory<AuxRecorderAgent> weak_factory_{this};
};
}  // namespace chrome
#endif
