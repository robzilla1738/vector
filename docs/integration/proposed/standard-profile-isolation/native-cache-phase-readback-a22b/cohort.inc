bool AuxUiCacheCohort::ObserveHeldPhase(const base::UnguessableToken& request, bool target) const {
  if (request_ != request || pending_ || !prepared_ || recovery_plan_set_ || !SameEndpoints()) return false;
  if (nodes_.empty())
    return zero_endpoint_phase_published_ && *zero_endpoint_phase_published_ == target;
  for (const auto& [id, node] : nodes_) {
    if (node.custody != Custody::kHeld || !node.token || !node.original || !node.report) return false;
    const auto& report = *node.report;
    if (!report.ok || !report.held || report.tainted || report.request_id != request_ ||
        report.token != node.token || report.published != target ||
        !SameDocuments(report, *node.original) ||
        !SameEntries(report.source_entries, node.original->source_entries) ||
        !SameEntries(report.staged_entries, expected_target_)) return false;
  }
  return true;
}
