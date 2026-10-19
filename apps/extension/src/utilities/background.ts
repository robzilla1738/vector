import { resolveAccount, rpc } from '../daemon';
import { requireAccount } from '../native';
import {
  record,
  requestFrom,
  type UtilityRequest,
  utilityPort,
} from './contracts';
import { UtilityRequestRunner } from './runner';
export function validUtilitySender(
  sender: chrome.runtime.MessageSender | undefined,
  extensionId: string,
  incognito: boolean,
) {
  if (
    sender?.id !== extensionId ||
    !Number.isInteger(sender.tab?.id) ||
    !Number.isInteger(sender.frameId) ||
    (sender.frameId ?? -1) < 0 ||
    !sender.documentId ||
    sender.documentId.length > 128 ||
    sender.tab?.incognito !== incognito ||
    (sender.documentLifecycle && sender.documentLifecycle !== 'active')
  )
    return false;
  try {
    return ['http:', 'https:'].includes(new URL(sender.url ?? '').protocol);
  } catch {
    return false;
  }
}
/** Each port belongs to one browser-verified tab/frame/committed document. */
export function installPageUtilityBackground() {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== utilityPort) return;
    const sender = port.sender,
      tabId = sender?.tab?.id,
      documentId = sender?.documentId;
    if (
      !validUtilitySender(
        sender,
        chrome.runtime.id,
        chrome.extension.inIncognitoContext,
      )
    ) {
      port.disconnect();
      return;
    }
    let current: UtilityRequestRunner | undefined,
      closed = false;
    let bound: { accountId: number; profileId: string } | undefined;
    async function verify(request: UtilityRequest) {
      if (closed) throw new Error('The selected frame disconnected.');
      const profile = await requireAccount().getProfileContext();
      const mode = chrome.extension.inIncognitoContext
        ? 'incognito'
        : 'default';
      if (
        profile.isCurrent !== true ||
        profile.isLocked !== false ||
        profile.browserMode !== mode ||
        !Number.isInteger(profile.accountId) ||
        !profile.profileId ||
        (bound &&
          (bound.accountId !== profile.accountId ||
            bound.profileId !== profile.profileId))
      )
        throw new Error(
          'Page utilities require this current unlocked account and browser profile.',
        );
      bound ??= {
        accountId: profile.accountId as number,
        profileId: profile.profileId,
      };
      const tab = await chrome.tabs.get(tabId as number);
      if (tab.incognito !== chrome.extension.inIncognitoContext)
        throw new Error('The browsing mode changed.');
      const response = await chrome.tabs.sendMessage(
        tabId as number,
        {
          type: 'aux.utility.verify',
          documentToken: request.documentToken,
          documentUrl: request.documentUrl,
        },
        { documentId },
      );
      if (
        !response?.ok ||
        response.documentToken !== request.documentToken ||
        response.documentUrl !== request.documentUrl
      )
        throw new Error(
          'The selected document changed. Select its text again.',
        );
    }
    port.onMessage.addListener((raw) => {
      try {
        const message = record(raw);
        if (message.type === 'open-session') {
          if (
            !current?.hasSession ||
            message.sessionId !== current.sessionId ||
            message.requestId !== current.request.requestId ||
            message.documentToken !== current.request.documentToken
          )
            throw new Error(
              'This task does not belong to the selected document.',
            );
          const selected = current;
          void verify(selected.request)
            .then(() => {
              if (closed || current !== selected)
                throw new Error('The temporary task changed.');
              return chrome.tabs.create({
                windowId: sender?.tab?.windowId,
                url: chrome.runtime.getURL(
                  `index.html#/chat/${selected.sessionId}`,
                ),
              });
            })
            .catch((error) => {
              if (!closed)
                port.postMessage({
                  type: 'invalid',
                  error:
                    error instanceof Error
                      ? error.message
                      : 'The task could not be opened.',
                });
            });
          return;
        }
        if (message.type === 'release') {
          if (
            current &&
            message.requestId === current.request.requestId &&
            message.documentToken === current.request.documentToken
          ) {
            void current.dispose();
            current = undefined;
          }
          return;
        }
        if (message.type === 'cancel') {
          if (
            current &&
            message.requestId === current.request.requestId &&
            message.documentToken === current.request.documentToken
          )
            void current.cancel();
          return;
        }
        const request = requestFrom(raw);
        void current?.dispose();
        current = new UtilityRequestRunner(request, {
          rpc,
          context: async () => {
            const context = await resolveAccount();
            if (
              !bound ||
              context.accountId !== bound.accountId ||
              context.profile.profileId !== bound.profileId
            )
              throw new Error(
                'The utility account or browser profile changed.',
              );
            return {
              ...context,
              incognito: chrome.extension.inIncognitoContext,
            };
          },
          verify,
          update: (message) => {
            if (!closed) port.postMessage(message);
          },
        });
        void current.run();
      } catch (error) {
        if (!closed)
          port.postMessage({
            type: 'invalid',
            error:
              error instanceof Error
                ? error.message
                : 'Invalid page utility request.',
          });
      }
    });
    port.onDisconnect.addListener(() => {
      closed = true;
      void current?.dispose();
    });
  });
}
