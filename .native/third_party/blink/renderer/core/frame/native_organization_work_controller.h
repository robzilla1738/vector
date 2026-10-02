// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_ORGANIZATION_WORK_CONTROLLER_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_ORGANIZATION_WORK_CONTROLLER_H_
#include <memory>
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "third_party/blink/public/mojom/widget/native_organization_work.mojom-blink.h"
#include "third_party/blink/renderer/core/core_export.h"
#include "third_party/blink/renderer/platform/heap/persistent.h"
namespace blink {
class Document;
class NativeOrganizationWorkWitness;
// Owned by actual WebFrameWidget, never script-bound. Measures only current shell.
class CORE_EXPORT NativeOrganizationWorkController final
    : public mojom::blink::NativeOrganizationWorkLease {
 public:
  NativeOrganizationWorkController(Document&, mojom::blink::NativeOrganizationWorkScopePtr,
      mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease>);
  ~NativeOrganizationWorkController() override;
  bool armed() const;
  void Read(ReadCallback) override;
 private:
  bool Current() const;
  void TryRead();
  void Cancel();
  WeakPersistent<Document> document_;
  mojom::blink::NativeOrganizationWorkScopePtr scope_;
  std::unique_ptr<NativeOrganizationWorkWitness> witness_;
  mojo::Receiver<mojom::blink::NativeOrganizationWorkLease> receiver_{this};
  ReadCallback pending_;
  base::TimeTicks deadline_;
  bool consumed_ = false;
  base::WeakPtrFactory<NativeOrganizationWorkController> weak_factory_{this};
};
}  // namespace blink
#endif
