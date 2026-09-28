import type { TaskReceipt } from "@aux/contracts";

const status = { in_progress: "In progress", uncertain: "Outcome uncertain", accepted: "Accepted by you", not_met: "Criteria not met", needs_review: "Needs review" };
const text = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\\`*_{}[\]()#+!|]/g, "\\$&").replace(/^([-=>])/gm, "\\$1");
const time = (value: number) => new Date(value).toISOString();

/** Portable review snapshot. Untrusted evidence is text, never embedded HTML/images. */
export function taskReceiptMarkdown(receipt: TaskReceipt, includeSnapshots = false): string {
  const historical = receipt.currentTaskRevision !== undefined && receipt.currentTaskRevision !== receipt.taskRevision;
  const lines = [historical ? "# Aux task receipt — earlier revision" : "# Aux task receipt", "", `**${status[receipt.status]}**`, "",
    `Task: ${text(receipt.taskId)} · Revision ${receipt.taskRevision}`,
    `Generated: ${time(receipt.generatedAt)}`, "",
    ...(historical ? [`Earlier revision ${receipt.taskRevision}; current task revision is ${receipt.currentTaskRevision}. This receipt does not establish the current task’s outcome.`, "",
      "Evidence freshness and run outcomes are assessed at export time. This is not a reconstruction of status at the time this revision was saved.", ""] : []),
    "This is a dated review snapshot. User acceptance records a human assessment, not independent verification. Captured evidence is historical; unresolved actions are not confirmed outcomes.", "",
    "## Objective", "", text(receipt.objective), ""];
  if(receipt.childTasks.length){lines.push('## Coordinated task outcomes','');for(const child of receipt.childTasks)lines.push(`${'  '.repeat(Math.max(0,child.depth-1))}- ${text(child.title)} — revision ${child.revision}; ${status[child.status]}${child.state==='archived'?'; archived':''}; ${child.modelCalls} model calls; $${child.knownCostUsd.toFixed(4)} ${child.costComplete?'recorded cost':'known cost'}`);lines.push('','Parent acceptance requires every descendant receipt to be accepted.','');}
  lines.push("## Criteria and evidence", "");
  for (const item of receipt.criteria) {
    lines.push(`### ${text(item.criterion.description)}`, "", `Status: ${item.status === "accepted" ? "Accepted by you" : item.status.replaceAll("_", " ")}`,
      `Criterion: ${text(item.criterion.criterionId)} · Verification method: ${item.criterion.verification}`, "");
    if (item.review) lines.push(`Review by you: ${item.review.outcome} · ${time(item.review.recordedAt)}`, text(item.review.note),
      `Evidence reviewed: ${item.review.evidenceIds.map(text).join(", ")}`, "");
    if (!item.evidence.length) lines.push("No evidence recorded.", "");
    for (const {record, stale, reason} of item.evidence) {
      lines.push(`#### Evidence ${text(record.evidenceId)}`, "", text(record.summary), "",
        `Provenance: ${record.kind === "command_snapshot" ? "Saved local command result selected by user" : record.kind === "document_snapshot" ? "Document selected by user" : record.actor === "runtime" ? "Captured by Aux" : record.actor === "desktop_user" ? "User note" : "Client-submitted claim"}`,
        `Observed: ${time(record.observedAt)} · Recorded: ${time(record.recordedAt)}`,
        `Task revision: ${record.taskRevision} · Run sequence: ${record.runSequence}`,
        stale ? `**Stale evidence:** ${text(reason ?? "The subject has changed.")}` : "Evidence is not marked stale in this receipt.");
      if (record.source.url) lines.push(`Source URL: ${text(record.source.url)}`);
      if (record.source.pageId) lines.push(`Page: ${text(record.source.pageId)}`);
      if (record.source.documentEpoch !== undefined) lines.push(`Document epoch: ${record.source.documentEpoch}`);
      if (record.source.observationRevision !== undefined) lines.push(`Observation revision: ${record.source.observationRevision}`);
      if (record.source.filename) lines.push(`Document: ${text(record.source.filename)}`, `Saved bytes: ${record.source.byteLength}`, `SHA-256: ${record.source.sha256}`,
        "Saved local snapshot; original file changes are not tracked. The fingerprint identifies saved bytes, not the truth of document claims.");
      if (record.snapshot) {
        const label = record.kind === "command_snapshot" ? "Saved command and output" : record.kind === "document_snapshot" ? "Saved document text" : "Captured page text";
        if (includeSnapshots) lines.push("", `${label}:`, "", text(record.snapshot.title), "", text(record.snapshot.text));
        else lines.push(`${label} omitted from this export.`);
      }
      lines.push("");
    }
  }
  lines.push("## Browser form changes", "");
  if (!receipt.browserChanges.length) lines.push("No browser form changes recorded in this receipt.", "");
  for (const change of receipt.browserChanges) {
    lines.push(`- ${text(change.op)} — ${change.status === "ok" ? "completed" : "outcome uncertain"}${change.undoneAt ? `; undone ${time(change.undoneAt)}` : ""}; run ${text(change.runId)}; page ${text(change.pageId)}; task revision ${change.taskRevision}; ${time(change.startedAt)}`);
    if (change.target) lines.push(`  Target: ${text(change.target)}`);
    if (includeSnapshots) lines.push(`  Before: ${text(change.before?.checked !== undefined ? String(change.before.checked) : change.before?.selected ?? change.before?.value ?? "unavailable")}`);
    else lines.push("  Before-state omitted from this export.");
    if (includeSnapshots) lines.push(`  After: ${text(change.after?.checked !== undefined ? String(change.after.checked) : change.after?.selected ?? change.after?.value ?? "unavailable")}`);
    else lines.push("  After-state omitted from this export.");
  }
  lines.push("", "## Agent tab changes", "");
  if (!receipt.tabChanges.length) lines.push("No agent tab changes recorded in this receipt.", "");
  for (const change of receipt.tabChanges) {
    lines.push(`- ${change.op === "tab.open" ? "Opened" : "Closed"} tab — ${change.status === "ok" ? "completed" : "outcome uncertain"}${change.undoneAt ? `; undone ${time(change.undoneAt)}` : ""}; run ${text(change.runId)}; page ${text(change.pageId)}; ${time(change.startedAt)}`);
    if (includeSnapshots && change.url) lines.push(`  URL: ${text(change.url)}`);
    else lines.push("  URL omitted from this export.");
  }
  lines.push("", "## Agent bookmark changes", "");
  if (!receipt.bookmarkChanges.length) lines.push("No agent bookmark changes recorded in this receipt.", "");
  for (const change of receipt.bookmarkChanges) {
    lines.push(`- Saved bookmark — ${change.status === "ok" ? "completed" : "outcome uncertain"}${change.undoneAt ? `; undone ${time(change.undoneAt)}` : ""}; run ${text(change.runId)}; page ${text(change.pageId)}; ${time(change.startedAt)}`);
    if (includeSnapshots && change.url) lines.push(`  URL: ${text(change.url)}`);
    else lines.push("  URL omitted from this export.");
    if (includeSnapshots && change.title) lines.push(`  Title: ${text(change.title)}`);
    else lines.push("  Title omitted from this export.");
  }
  lines.push("", "## Downloads during agent runs", "",
    "These downloads occurred in run-controlled tabs. Moving an unchanged managed file to Trash is recoverable; an interrupted download needs review.", "");
  if (!receipt.downloadChanges.length) lines.push("No run-controlled downloads recorded in this receipt.", "");
  for (const change of receipt.downloadChanges) {
    lines.push(`- Download — ${change.status}${change.undoneAt ? `; moved to Trash ${time(change.undoneAt)}` : change.cleanupAvailable ? "; cleanup available" : "; manual review"}; run ${text(change.runId)}; page ${text(change.pageId)}; ${time(change.startedAt)}`);
    if (includeSnapshots && change.filename) lines.push(`  Filename: ${text(change.filename)}`);
    else lines.push("  Filename omitted from this export.");
    if (includeSnapshots && change.sourceUrl) lines.push(`  Source: ${text(change.sourceUrl)}`);
    else lines.push("  Source omitted from this export.");
    if (includeSnapshots && change.path) lines.push(`  Local path: ${text(change.path)}`);
    else lines.push("  Local path omitted from this export.");
  }
  lines.push("", "## History visits during agent runs", "",
    "An exact recorded history visit can be removed after review. Removal cannot be undone.", "");
  if (!receipt.historyChanges.length) lines.push("No run-controlled history visits recorded in this receipt.", "");
  for (const change of receipt.historyChanges) {
    lines.push(`- History visit${change.undoneAt ? `; removed ${time(change.undoneAt)}` : ""}; run ${text(change.runId)}; page ${text(change.pageId)}; ${time(change.startedAt)}`);
    if (includeSnapshots && change.url) lines.push(`  URL: ${text(change.url)}`);
    else lines.push("  URL omitted from this export.");
    if (includeSnapshots && change.title) lines.push(`  Title: ${text(change.title)}`);
    else lines.push("  Title omitted from this export.");
  }
  lines.push("", "## Consequential page actions", "",
    "Browser observations do not prove that a remote service committed a change. These actions cannot be reversed by browser undo.", "");
  if (!receipt.remoteActions.length) lines.push("No consequential page actions recorded in this receipt.", "");
  for (const action of receipt.remoteActions) {
    lines.push(`- ${text(action.op)} — ${action.uncertain ? "outcome uncertain" : action.status === "ok" ? "browser step completed" : "step failed"}; ${action.remoteConfirmed ? "remote confirmation recorded" : "no remote confirmation"}; run ${text(action.runId)}; page ${text(action.pageId)}; ${time(action.startedAt)}`);
    if (includeSnapshots && action.browserObserved) lines.push(`  Browser observed: ${text(action.browserObserved)}`);
    else lines.push("  Browser observation omitted from this export.");
  }
  lines.push("", "## Unresolved actions", "");
  if (!receipt.unresolvedActions.length) lines.push("No unresolved actions recorded in this receipt.", "");
  for (const action of receipt.unresolvedActions) lines.push(`- ${text(action.intentId)} — ${action.status}; run ${text(action.runId)}; page ${text(action.pageId)}`);
  lines.push('', '## Unresolved operations', '');
  if(!receipt.unresolvedOperations.length)lines.push('No unresolved operations recorded in this receipt.','');
  for(const operation of receipt.unresolvedOperations)lines.push(`- ${text(operation.invocationId)} — ${text(operation.operation)}; ${operation.effectClass}; ${text(operation.status)} / ${text(operation.effectOutcome)}${operation.runId?`; run ${text(operation.runId)}`:''}; started ${time(operation.startedAt)}${operation.error?`; error ${text(operation.error)}`:''}`);
  lines.push('', '## Local criterion checks', '');
  if (!receipt.verifications.length) lines.push('No local criterion checks recorded in this receipt.', '');
  else lines.push('These local matches are not human acceptance and do not prove a business outcome.', '');
  for (const verification of receipt.verifications) lines.push(`- ${text(verification.criterionId)} — ${verification.method}; ${verification.status}; local match ${verification.localMatch}; ${text(verification.reason)}; ${time(verification.recordedAt)}`);
  lines.push("", "## Runs", "");
  if (!receipt.runs.length) lines.push("No runs recorded.");
  for (const run of receipt.runs) {
    lines.push(`- ${text(run.runId)} — ${text(run.status)}; task revision ${run.taskRevision}${run.currentRevision ? " (receipt revision)" : " (earlier)"}${run.durationMs !== undefined ? `; duration ${(run.durationMs / 1000).toFixed(1)} seconds` : ""}`);
    if (run.error) lines.push(`  Error: ${text(run.error).replace(/\n/g, "\n  ")}`);
  }
  lines.push("", "## Recorded usage", "", `${receipt.modelCalls} model calls`,
    `$${receipt.knownCostUsd.toFixed(4)} ${receipt.costComplete ? "recorded model cost" : "known model cost; some costs are unknown or estimated"}`,
    `Providers: ${receipt.providers.length ? receipt.providers.map(text).join(", ") : "not recorded"}`,
    `Models: ${receipt.modelIds.length ? receipt.modelIds.map(text).join(", ") : "not recorded"}`,
    `Destinations: ${receipt.destinations.length ? receipt.destinations.map(text).join(", ") : "not recorded"}`, "");
  if(receipt.childTasks.length){const calls=receipt.modelCalls+receipt.childTasks.reduce((total,child)=>total+child.modelCalls,0),cost=receipt.knownCostUsd+receipt.childTasks.reduce((total,child)=>total+child.knownCostUsd,0),complete=receipt.costComplete&&receipt.childTasks.every(child=>child.costComplete);lines.push(`Coordinated total: ${calls} model calls`,`$${cost.toFixed(4)} ${complete?'recorded model cost':'known model cost; some descendant costs are unknown or estimated'}`,'');}
  return lines.join("\n");
}
