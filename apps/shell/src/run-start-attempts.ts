import { MethodSchemas, type MethodParams, type MethodResult, type Run } from "@aux/contracts";
import { bridge } from "./bridge";

const PREFIX = "aux.pending-run-start.v1:";
type Request = MethodParams<"runs.reconcileStart">;
export type StartAttempt = { request: Request; intent: string };
type Delivery = { run: Run; recovered: boolean; changed: boolean };
const removedChats = new Set<string>();
export class RemovedRunStartError extends Error {
  constructor() {
    super("The original chat was removed. Start a new chat to send this draft.");
  }
}
const removedError = () => new RemovedRunStartError();
const attempts = new Map<string, StartAttempt>();
const inFlight = new Map<string, { intent: string; promise: Promise<Delivery> }>();

export function isRunStartRemoved(key: string): boolean {
  if (removedChats.has(key)) return true;
  if (!bridge.privateMode) {
    try {
      if (localStorage.getItem(PREFIX + key) === '{"removed":true}') {
        removedChats.add(key);
        return true;
      }
    } catch {
      /* In-memory ownership remains available. */
    }
  }
  return false;
}

/** Delete the request payload, retaining only a non-replayable chat marker. */
export function removeRunStart(key: string): boolean {
  let pendingKey = key;
  let attempt = readStartAttempt(key);
  if (!attempt && key !== "new") {
    const newChat = readStartAttempt("new");
    if (newChat?.request.chatId === key) {
      attempt = newChat;
      pendingKey = "new";
    }
  }
  removedChats.add(key);
  attempts.delete(pendingKey);
  if (!attempt || bridge.privateMode || attempt.request.privateTask) return true;
  try {
    localStorage.removeItem(PREFIX + pendingKey);
    localStorage.setItem(PREFIX + key, '{"removed":true}');
    return true;
  } catch {
    return false;
  }
}

export function readStartAttempt(key: string): StartAttempt | null {
  if (isRunStartRemoved(key)) return null;
  const current = attempts.get(key);
  if (bridge.privateMode || current?.request.privateTask) return current ?? null;
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(PREFIX + key) ?? "null");
    if (
      !raw ||
      typeof raw !== "object" ||
      !("request" in raw) ||
      !("intent" in raw) ||
      typeof raw.intent !== "string"
    )
      return null;
    const parsed = MethodSchemas["runs.reconcileStart"].safeParse(raw.request);
    if (!parsed.success || parsed.data.privateTask || (key !== "new" && parsed.data.chatId !== key))
      return null;
    if (current?.request.requestId === parsed.data.requestId) return current;
    const attempt = { request: parsed.data, intent: raw.intent };
    attempts.set(key, attempt);
    return attempt;
  } catch {
    return null;
  }
}

function remember(key: string, attempt: StartAttempt) {
  if (!bridge.privateMode && !attempt.request.privateTask) {
    // A normal send must have its identity saved before it can reach the runtime.
    localStorage.setItem(PREFIX + key, JSON.stringify(attempt));
  }
  attempts.set(key, attempt);
}
function forget(key: string, attempt: StartAttempt) {
  if (attempts.get(key) !== attempt) return;
  if (!bridge.privateMode && !attempt.request.privateTask) {
    const saved = localStorage.getItem(PREFIX + key);
    // Another Aux window may already be composing the next turn of this chat.
    if (saved && JSON.parse(saved).request?.requestId === attempt.request.requestId)
      localStorage.removeItem(PREFIX + key);
  }
  attempts.delete(key);
}

export async function reconcileStartAttempt(
  key: string,
): Promise<{ attempt: StartAttempt; result: MethodResult<"runs.reconcileStart"> } | null> {
  const attempt = readStartAttempt(key);
  if (!attempt) return null;
  if (inFlight.has(key)) return null;
  const result = await bridge.invoke("runs.reconcileStart", attempt.request);
  // A foreground Send or another window may have already resolved this attempt.
  if (inFlight.has(key) || readStartAttempt(key) !== attempt) return null;
  if (result.status === "removed") removeRunStart(attempt.request.chatId ?? key);
  else forget(key, attempt);
  return { attempt, result };
}

/** A new send reconciles any unacknowledged predecessor before it can mint another identity. */
export function deliverRunStart(key: string, request: MethodParams<"runs.start">): Promise<Delivery> {
  if (isRunStartRemoved(key)) return Promise.reject(removedError());
  const intent = JSON.stringify(request);
  const pending = inFlight.get(key);
  if (pending)
    return pending.promise.then((delivery) => ({
      ...delivery,
      recovered: true,
      changed: delivery.changed || pending.intent !== intent,
    }));
  const original = readStartAttempt(key);
  const operation = Promise.resolve()
    .then(async (): Promise<Delivery> => {
      if (isRunStartRemoved(key)) throw removedError();
      if (original) {
        const result = await bridge.invoke("runs.reconcileStart", original.request);
        if (result.status === "removed") removeRunStart(original.request.chatId ?? key);
        if (isRunStartRemoved(key) || isRunStartRemoved(original.request.chatId ?? key)) throw removedError();
        forget(key, original);
        if (result.status === "accepted")
          return { run: result.run, recovered: true, changed: original.intent !== intent };
      }
      const attempt: StartAttempt = {
        intent,
        request: {
          ...request,
          requestId: crypto.randomUUID(),
          chatId: request.chatId ?? crypto.randomUUID(),
        },
      };
      remember(key, attempt);
      try {
        const run = await bridge.invoke("runs.start", attempt.request);
        if (isRunStartRemoved(key) || isRunStartRemoved(attempt.request.chatId ?? key)) throw removedError();
        forget(key, attempt);
        return { run, recovered: false, changed: false };
      } catch (error) {
        if (isRunStartRemoved(key) || isRunStartRemoved(attempt.request.chatId ?? key)) throw removedError();
        let result: MethodResult<"runs.reconcileStart">;
        try {
          result = await bridge.invoke("runs.reconcileStart", attempt.request);
        } catch {
          throw error;
        }
        if (result.status === "removed") removeRunStart(attempt.request.chatId ?? key);
        if (isRunStartRemoved(key) || isRunStartRemoved(attempt.request.chatId ?? key)) throw removedError();
        forget(key, attempt);
        if (result.status === "accepted") return { run: result.run, recovered: true, changed: false };
        throw error;
      }
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, { intent, promise: operation });
  return operation;
}
