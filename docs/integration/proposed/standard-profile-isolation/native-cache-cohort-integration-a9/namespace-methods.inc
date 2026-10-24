bool SessionStorageNamespaceImpl::CanFreezeAuxUiMigrationNamespace() const {
  return !aux_ui_namespace_request_ && run_after_population_.empty() &&
      !bind_waiting_on_population_ && child_namespaces_waiting_for_clone_call_.empty() &&
      state_ != State::kNotPopulatedAndPendingClone;
}
bool SessionStorageNamespaceImpl::FreezeAuxUiMigrationNamespace(
    const base::UnguessableToken& request) {
  if (request.is_empty() || !CanFreezeAuxUiMigrationNamespace()) return false;
  aux_ui_namespace_request_ = request;
  aux_ui_namespace_last_resumed_.reset();
  aux_ui_namespace_receivers_ = receivers_.TakeReceivers();
  return true;
}
bool SessionStorageNamespaceImpl::ResumeAuxUiMigrationNamespace(
    const base::UnguessableToken& request) {
  if (!CanResumeAuxUiMigrationNamespace(request)) return false;
  auto receivers = std::move(aux_ui_namespace_receivers_);
  aux_ui_namespace_request_.reset();
  aux_ui_namespace_last_resumed_ = request;
  for (auto& receiver : receivers) receivers_.Add(this, std::move(receiver));
  return true;
}
bool SessionStorageNamespaceImpl::CanResumeAuxUiMigrationNamespace(
    const base::UnguessableToken& request) const {
  if (aux_ui_namespace_request_ != request) return false;
  for (const auto& receiver : aux_ui_namespace_receivers_)
    if (!receiver.is_valid()) return false;
  return true;
}
bool SessionStorageNamespaceImpl::ReholdAuxUiMigrationNamespaceAfterFailedResume(
    const base::UnguessableToken& request) {
  if (aux_ui_namespace_request_ || aux_ui_namespace_last_resumed_ != request) return false;
  // The concrete service calls this in the same owning stack as a failed
  // all-namespace resume, before any queued incoming method can dispatch.
  aux_ui_namespace_receivers_ = receivers_.TakeReceivers();
  aux_ui_namespace_request_ = request;
  aux_ui_namespace_last_resumed_.reset();
  return true;
}
