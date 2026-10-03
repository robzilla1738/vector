// Copyright 2026 The Aux Authors
#ifndef CHROME_RENDERER_AUX_STOP_INPUT_AGENT_H_
#define CHROME_RENDERER_AUX_STOP_INPUT_AGENT_H_
#include <map>
#include <memory>
#include <optional>
#include "base/memory/weak_ptr.h"
#include "chrome/common/aux_stop_input.mojom.h"
#include "content/public/renderer/render_frame_observer.h"
#include "mojo/public/cpp/bindings/associated_receiver.h"
#include "mojo/public/cpp/bindings/associated_remote.h"
#include "third_party/blink/public/common/tokens/tokens.h"
#include "v8/include/v8-persistent-handle.h"
namespace gin { class Arguments; }
namespace chrome {
// The agent exposes no page binding until browser-owned fixture Prepare.
// Prepare binds one original shell document; no generic page RPC is installed.
class AuxStopInputAgent final : public content::RenderFrameObserver,
                                public mojom::AuxStopInput {
 public:
  explicit AuxStopInputAgent(content::RenderFrame* frame);
  ~AuxStopInputAgent() override;
 private:
  void Bind(mojo::PendingAssociatedReceiver<mojom::AuxStopInput> receiver);
  void Prepare(mojo::PendingAssociatedRemote<mojom::AuxStopInputSink> sink,
               PrepareCallback callback) override;
  void Retire() override;
  bool Current(const blink::DocumentToken& original_document) const;
  void Stop(const blink::DocumentToken& original_document, gin::Arguments* args);
  void Complete(uint64_t original_call, const blink::DocumentToken& original_document,
                bool accepted, const std::string& original_result_json);
  void DidCreateNewDocument() override;
  void WillDetach(blink::DetachReason reason) override;
  void OnDestruct() override;
  struct Pending;
  std::map<uint64_t, std::unique_ptr<Pending>> pending_;
  uint64_t sequence_ = 0;
  std::optional<blink::DocumentToken> document_;
  mojo::AssociatedReceiver<mojom::AuxStopInput> receiver_{this};
  mojo::AssociatedRemote<mojom::AuxStopInputSink> sink_;
  base::WeakPtrFactory<AuxStopInputAgent> weak_factory_{this};
};
}  // namespace chrome
#endif
