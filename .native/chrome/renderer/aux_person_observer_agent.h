// Copyright 2026 The Aux Authors
#ifndef CHROME_RENDERER_AUX_PERSON_OBSERVER_AGENT_H_
#define CHROME_RENDERER_AUX_PERSON_OBSERVER_AGENT_H_

#include <memory>
#include <string>
#include "base/memory/weak_ptr.h"
#include "chrome/common/aux_person_observer.mojom.h"
#include "content/public/renderer/render_frame_observer.h"
#include "mojo/public/cpp/bindings/associated_receiver_set.h"
#include "third_party/blink/public/common/tokens/tokens.h"

namespace chrome {
class AuxPersonObserverAgent final : public content::RenderFrameObserver,
                                     public mojom::AuxPersonObserver {
 public:
  explicit AuxPersonObserverAgent(content::RenderFrame* frame);
  ~AuxPersonObserverAgent() override;
 private:
  struct Scope {
    explicit Scope(blink::DocumentToken token) : document(token) {}
    const blink::DocumentToken document;
    std::string prepared_id;
  };
  void Bind(mojo::PendingAssociatedReceiver<mojom::AuxPersonObserver> receiver);
  bool Current(const blink::DocumentToken& document) const;
  void Prepare(const std::string& read_id, PrepareCallback callback) override;
  void Read(const std::string& read_id, const std::string& request_json,
            ReadCallback callback) override;
  void DidCreateNewDocument() override;
  void WillDetach(blink::DetachReason reason) override;
  void OnDestruct() override;
  mojo::AssociatedReceiverSet<mojom::AuxPersonObserver, std::shared_ptr<Scope>> receivers_;
  base::WeakPtrFactory<AuxPersonObserverAgent> weak_factory_{this};
};
}  // namespace chrome
#endif
