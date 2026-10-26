# Record errors before the run reaches running state

Actual YdXhaOu0fRyR3Ncq failure was logged by AgentSessionServer's run callback catch, not createAndPrompt initialization. The supplied catch updated status only when already running. A browser-context refusal before that transition could emit a transient error but leave durable status idle, so the safe reconnect fallback correctly had no errored state to present. Pending input preservation remains intact.

This counted repair captures the existing exact idle attempt snapshot immediately before MCP/prompt preparation. In the later catch, a non-running task is marked errored only when account incarnation/auth identity and the full unchanged idle attempt (queued input, model, binding, permission, transcript revision/latest turn) still match. Check and original status write are synchronous; no retry can overwrite a replacement account, edited queue, newer run or transcript. Existing running reconciliation and transient publication remain unchanged. No transcript is fabricated, and no underlying stack or error detail is added to UI.

Recipes start from initial-prompt-preservation a1 current/future pairs. Focused guard checks and four complete-resource syntax checks passed. Actual reopened error presentation remains integrator-owned acceptance. No live state, app, model or signing operation performed.
