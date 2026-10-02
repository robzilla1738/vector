// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_startup_first_hardware_retention.h"
#include <utility>
#include "base/functional/bind.h"
namespace viz {
NativeStartupShellFootprint::Placement::Placement() = default;
NativeStartupShellFootprint::Placement::~Placement() = default;
NativeStartupShellFootprint::NativeStartupShellFootprint(FrameSinkId shell) : shell_(shell) {}
NativeStartupShellFootprint::~NativeStartupShellFootprint() = default;
void NativeStartupShellFootprint::BindShellPlacement(const SurfaceId& surface, uint32_t token,
    const gfx::Rect& full, const gfx::Transform& to_root,
    const std::optional<gfx::Rect>& clip, bool masked) {
  if (surface.frame_sink_id() != shell_) return;
  Seen(surface, token);
  if (placement_ || !surface.is_valid() || !token) { invalid_ = true; return; }
  placement_.emplace(); placement_->surface = surface; placement_->token = token;
  placement_->full = full; placement_->to_root = to_root; placement_->clip = clip; placement_->masked = masked;
}
void NativeStartupShellFootprint::RecordDrawnSurface(const SurfaceId& surface, uint32_t token) {
  if (surface.frame_sink_id() != shell_) return;
  Seen(surface, token);
  if (drawn_.size() >= 8) { invalid_ = true; return; }
  drawn_.emplace_back(surface, token);
}
void NativeStartupShellFootprint::RecordEmittedSurface(const SurfaceId& surface, uint32_t token,
    const gfx::Rect& bounds, float opacity, const gfx::Size& size) {
  if (surface.frame_sink_id() != shell_) return;
  Seen(surface, token);
  if (emitted_.size() >= 8) { invalid_ = true; return; }
  emitted_.push_back({surface, token, bounds, opacity, size});
}
void NativeStartupShellFootprint::Seen(const SurfaceId& surface, uint32_t token) {
  const auto actual = std::make_pair(surface, token);
  if (!identity_) identity_ = actual;
  else if (*identity_ != actual) { ambiguous_ = true; invalid_ = true; }
}
std::optional<std::pair<SurfaceId, uint32_t>> NativeStartupShellFootprint::Identity() const {
  // A drawn-but-clipped/intermediate shell is still its first presentation.
  // Preserve that identity and refuse coverage; never replace it with a later
  // full redraw because the placement proof was absent in the first group.
  return identity_;
}
NativeGuestInclusionResult NativeStartupShellFootprint::Validate(const NativeGuestInclusionScope& expected,
    const SurfaceId& display, base::TimeTicks draw, const gfx::SwapTimings& swap,
    const gfx::PresentationFeedback& feedback, base::TimeTicks observed) const {
  // The input/mutation stamps are admitted browser receipts. Every footprint
  // fact and timing below is retained from the original aggregation/group.
  NativeGuestInclusionReceipt receipt(expected);
  if (!invalid_ && placement_) {
    receipt.BindShellPlacement(placement_->surface, placement_->token, placement_->full,
        placement_->to_root, placement_->clip, placement_->masked);
    for (const auto& [surface, token] : drawn_) receipt.RecordDrawnSurface(surface, token);
    for (const auto& emitted : emitted_) receipt.RecordEmittedSurface(emitted.surface, emitted.token,
        emitted.bounds, emitted.opacity, emitted.size);
  }
  return receipt.Present(display, draw, swap, feedback, observed);
}
NativeStartupFirstHardwareRetention::OriginalGroup::OriginalGroup() = default;
NativeStartupFirstHardwareRetention::OriginalGroup::~OriginalGroup() = default;
NativeStartupFirstHardwareRetention::NativeStartupFirstHardwareRetention(base::UnguessableToken nonce,
    FrameSinkId display, FrameSinkId shell)
    : nonce_(nonce), display_(display), shell_(shell), registered_(base::TimeTicks::Now()) {
  if (nonce.is_empty() || !display.is_valid() || !shell.is_valid() || display == shell ||
      registered_.is_null() || !base::TimeTicks::IsConsistentAcrossProcesses()) { active_ = false; return; }
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
      &NativeStartupFirstHardwareRetention::Cancel, weak_factory_.GetWeakPtr()));
}
NativeStartupFirstHardwareRetention::~NativeStartupFirstHardwareRetention() { Finish(std::nullopt); }
base::WeakPtr<NativeStartupFirstHardwareRetention> NativeStartupFirstHardwareRetention::GetWeakPtr() {
  return weak_factory_.GetWeakPtr();
}
std::optional<uint64_t> NativeStartupFirstHardwareRetention::RegisterFrame(
    std::unique_ptr<NativeStartupShellFootprint> footprint, const SurfaceId& display, base::TimeTicks draw) {
  if (!active_ || !footprint) return std::nullopt;
  if (footprint->ambiguous()) { Cancel(); return std::nullopt; }
  const auto identity = footprint->Identity();
  if (!identity) return std::nullopt;  // This aggregation contained no owned shell placement.
  if (!display.is_valid() || display.frame_sink_id() != display_ || identity->first.frame_sink_id() != shell_ ||
      !identity->first.is_valid() || !identity->second || draw.is_null() || draw < registered_ || draw > base::TimeTicks::Now()) {
    Cancel(); return std::nullopt;
  }
  if (first_.contains(*identity)) return std::nullopt;  // Preserve the original group, even before its callback.
  if (groups_.size() >= 64) { Cancel(); return std::nullopt; }  // Never evict and count a later presentation.
  const auto ticket = ++next_ticket_;
  auto group = std::make_unique<OriginalGroup>(); group->footprint = std::move(footprint);
  group->display = display; group->draw = draw;
  first_.emplace(*identity, ticket); groups_.emplace(ticket, std::move(group));
  return ticket;
}
void NativeStartupFirstHardwareRetention::Presented(uint64_t ticket, const gfx::SwapTimings& swap,
    const gfx::PresentationFeedback& feedback) {
  if (!active_) return;
  const auto found = groups_.find(ticket);
  if (found == groups_.end() || found->second->feedback) { Cancel(); return; }
  found->second->swap = swap; found->second->feedback = feedback;
  found->second->observed = base::TimeTicks::Now();
  TryJoin();
}
void NativeStartupFirstHardwareRetention::Join(const base::UnguessableToken& nonce,
    NativeGuestInclusionScope expected, Reply reply) {
  if (reply.is_null()) return;
  if (nonce != nonce_) { std::move(reply).Run(std::nullopt); return; }
  if (!active_ || used_ || expected.kind != NativeInclusionScopeKind::kShellStartup ||
      expected.display_sink != display_ || expected.shell_sink != shell_ ||
      !expected.startup_shell || expected.startup_shell->frame_sink_id() != shell_ ||
      !expected.mutation_shell_token || !expected.guests.empty() || !expected.shapes.empty() ||
      expected.input.is_null() || expected.input > registered_ || registered_ > expected.mutation ||
      expected.mutation > expected.shell_submission || expected.shell_submission > base::TimeTicks::Now()) {
    Cancel(); std::move(reply).Run(std::nullopt); return;
  }
  used_ = true; expected_ = std::move(expected); reply_ = std::move(reply); TryJoin();
}
void NativeStartupFirstHardwareRetention::TryJoin() {
  if (!active_ || !reply_ || !expected_) return;
  const auto key = std::make_pair(*expected_->startup_shell, expected_->mutation_shell_token);
  const auto first = first_.find(key);
  if (first == first_.end()) return;  // Await genuine aggregation or bounded native timeout.
  const auto group = groups_.find(first->second);
  if (group == groups_.end()) { Cancel(); return; }
  if (!group->second->feedback || !group->second->swap) return;
  const auto& actual = *group->second;
  auto result = actual.footprint->Validate(*expected_, actual.display, actual.draw,
      *actual.swap, *actual.feedback, actual.observed);
  if (!result.measured) { Finish(std::nullopt); return; }
  Finish(std::move(result));
}
void NativeStartupFirstHardwareRetention::Cancel() { Finish(std::nullopt); }
void NativeStartupFirstHardwareRetention::Finish(std::optional<NativeGuestInclusionResult> result) {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); active_ = false;
  expected_.reset(); first_.clear(); groups_.clear();
  if (reply_) std::move(reply_).Run(std::move(result));
}
}  // namespace viz
