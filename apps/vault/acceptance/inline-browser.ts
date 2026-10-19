/** Synthetic browser actor integration; deliberately has no native/daemon connection. */

import type { VaultItem } from '../src/client';
import type { InlineTarget } from '../src/inline-autofill';
import { createInlineAutofill } from '../src/inline-autofill';

const state = { secretReads: 0, metadataReads: 0, submits: 0 };
const item = {
  id: 'fixture-login',
  title: 'Synthetic inline login',
  revision: 1,
  category: 'login',
  state: 'active',
  reprompt: false,
  urls: [location.origin],
  loginFields: {
    username: 'fixture-user',
    password: 'synthetic-field-fixture',
  },
  sections: [],
} as VaultItem;
type Listener = (
  message: unknown,
  sender: { id: string },
  respond: (value: unknown) => void,
) => void;
const listeners: Listener[] = [];
const target = (): InlineTarget => ({
  tabId: 1,
  frameId: 0,
  documentId: 'fixture-document',
  documentUrl: location.href,
  topLevelUrl: location.href,
  createdAt: Date.now(),
});
const actor = createInlineAutofill({
  incognito: false,
  resolveAccount: async () => ({
    accountId: 0,
    profile: {
      accountId: 0,
      profileId: 'disposable-fixture-profile',
      browserMode: 'default',
      isCurrent: true,
      isLocked: false,
    },
  }),
  rpc: async <T>(method: string) => {
    if (method === 'settings.get') return 'light' as T;
    if (method === 'passwordManager.auth.status') return { locked: false } as T;
    if (method === 'vault.getAutofillCandidates') {
      state.metadataReads++;
      return {
        items: [
          {
            id: item.id,
            title: item.title,
            username: item.loginFields?.username,
            revision: item.revision,
            reprompt: false,
          },
        ],
      } as T;
    }
    if (method === 'vault.getItem') {
      state.secretReads++;
      return item as T;
    }
    throw new Error('Unsupported fixture RPC');
  },
  live: async () => {},
  openPopup: async () => {
    throw new Error('This fixture has no native popup');
  },
  send: async <T>(_target, message) =>
    new Promise<T>((resolve, reject) => {
      for (const listener of listeners)
        listener(message, { id: 'fixture-extension' }, (reply: unknown) => {
          const response = reply as { result?: T; error?: string };
          if (response.error) reject(new Error(response.error));
          else resolve(response.result as T);
        });
    }),
});
(globalThis as unknown as { chrome: unknown }).chrome = {
  runtime: {
    id: 'fixture-extension',
    onMessage: {
      addListener: (listener: Listener) => listeners.push(listener),
    },
    sendMessage: async (message: { type: string }) => {
      if (message.type === 'aux.vault.focus') return { result: true };
      if (!message.type.startsWith('aux.vault.inline.'))
        return {
          error: 'Fixture cannot open native UI or persist credentials',
        };
      try {
        return { result: await actor.handle(message, target()) };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Fixture error',
        };
      }
    },
  },
};
document.querySelector('form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  state.submits++;
});
(globalThis as unknown as { fixture: unknown }).fixture = {
  get state() {
    return { ...state };
  },
  filled() {
    return (
      (document.querySelector('#username') as HTMLInputElement).value ===
        item.loginFields?.username &&
      (document.querySelector('#password') as HTMLInputElement).value ===
        item.loginFields?.password
    );
  },
  unrelatedUntouched() {
    return (
      (document.querySelector('#other-password') as HTMLInputElement).value ===
        '' &&
      (document.querySelector('#hidden-password') as HTMLInputElement).value ===
        'unchanged'
    );
  },
  genericTextOmitsSuggestions() {
    return !document.body.innerText.includes(item.title);
  },
};
await import('../src/content');
document.documentElement.dataset.actorReady = 'true';
