// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {ShellHostClientReceiver, ShellHostFactory, ShellHostRemote, WindowKind} from './shell_host.mojom-webui.js';
import {featureStagesFor} from './aux_feature_stages.js';
import {SuggestInventory} from '//resources/mojo/components/omnibox/browser/fusebox_action.mojom-webui.js';
import {InputMethod, PageCallbackRouter, PageHandlerFactory, PageHandlerRemote} from '//resources/mojo/components/omnibox/browser/searchbox.mojom-webui.js';
import type {AutocompleteResult} from '//resources/mojo/components/omnibox/browser/searchbox.mojom-webui.js';

interface Port {
  host: 'chromium-fork';
  windowId: string;
  profileId: string;
  platform: string;
  privateMode: boolean;
  windowKind: 'normal'|'private'|'little'|'quick-ask';
  capabilities: {buildId: string; sourceCommit: string; methods: string[];
                 qualifiedFeatures: string[]; testClockScale?: number};
  featureStages: ReturnType<typeof featureStagesFor>;
  testClockScale?: number;
  request(method: string, args: unknown[]): Promise<unknown>;
  subscribe(event: string, callback: (...args: unknown[]) => void): () => void;
}

declare global {
  interface Window {
    auxChromiumHost?: Port;
    auxChromiumHostReady?: Promise<void>;
  }
}

const remote = new ShellHostRemote();
// Fixture-only receipt from the genuine native registered input. It exists
// solely while the original first event callback runs synchronously. It is not
// a global bridge field, command argument, capability or permission grant.
let warmInvocation: {receipt: string; active: boolean}|undefined;
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
const hostEvents = new Set([
  'onEvent', 'onTabsPatch', 'onDictation', 'onSidebarEdge', 'onToolbarEdge',
  'onOrganizationChanged', 'onShortcut', 'onSiteZoomChanged',
  'onRuntimeStatus', 'onLoading', 'onAudio', 'onDownload',
  'onHttpAuthChanged', 'onTabsPlacement', 'onQuickAskState',
  'onPageAction', 'onVaultOffer', 'onLinkStatus', 'onTranslationChanged',
  'onRunAttentionActivated',
  'onPictureInPicture', 'onExtensionActionsChanged', 'onSidePanel',
  'onFocusSpace', 'onRoutedOpen', 'onRoutePrompt',
]);
type Match = {id: string; type: 'history'|'bookmark'|'search'|'typed'; title: string; url: string; description?: string};
let searchbox: PageHandlerRemote|undefined;
let queryId = 0;
let pending: {id: number; resolve: (matches: Match[]) => void; reject: (error: Error) => void; timer: number; matches: Match[]}|undefined;

function mapMatches(result: AutocompleteResult): Match[] {
  return result.matches.filter(match => !match.isHidden).flatMap(match => {
    const url = match.destinationUrl;
    let scheme: string;
    try { scheme = new URL(url).protocol; } catch { return []; }
    if (!['https:', 'http:', 'chrome:', 'about:'].includes(scheme)) return [];
    const type = match.isSearchType ? 'search' : match.type.includes('bookmark') ? 'bookmark' :
        match.type.includes('history') ? 'history' : 'typed';
    const title = match.contents || match.fillIntoEdit || url;
    if (!title) return [];
    return [{id: `${type}:${url}:${title}`, type, title, url,
             ...(match.description ? {description: match.description} : {})} as Match];
  }).slice(0, 12);
}

function finishAutocomplete() {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  const {resolve, matches} = pending;
  pending = undefined;
  resolve(matches);
}

function failAutocomplete(message: string) {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  const {reject} = pending;
  pending = undefined;
  reject(new Error(message));
}

function onAutocompleteResult(result: AutocompleteResult) {
  if (!pending || result.queryId !== pending.id) return;
  pending.matches = mapMatches(result);
  window.clearTimeout(pending.timer);
  if (pending.matches.some(match => match.type !== 'search')) {
    finishAutocomplete();
    return;
  }
  // Keep a short window for Chromium's local History and Bookmark update,
  // then return without waiting for later network suggestions.
  pending.timer = window.setTimeout(finishAutocomplete, 40);
}

function autocomplete(query: string): Promise<Match[]> {
  if (!query.trim() || query.length > 300) return Promise.resolve([]);
  finishAutocomplete();
  if (!searchbox) {
    const handler = new PageHandlerRemote();
    const router = new PageCallbackRouter();
    PageHandlerFactory.getRemote().createPageHandler(
        router.$.bindNewPipeAndPassRemote(),
        handler.$.bindNewPipeAndPassReceiver());
    router.autocompleteResultChanged.addListener(onAutocompleteResult);
    handler.onConnectionError.addListener(() => {
      searchbox = undefined;
      failAutocomplete('Chromium autocomplete disconnected. Try again.');
    });
    searchbox = handler;
  }
  const id = ++queryId;
  return new Promise((resolve, reject) => {
    pending = {id, resolve, reject, matches: [],
               timer: window.setTimeout(() => failAutocomplete(
                   'Chromium autocomplete did not respond. Try again.'), 900)};
    try {
      searchbox!.queryAutocomplete(id, null, query, false,
          query.length, SuggestInventory.kDefault, false, '',
          InputMethod.kKeyboard);
    } catch (error) {
      failAutocomplete(error instanceof Error ? error.message : String(error));
    }
  });
}
const client = new ShellHostClientReceiver({
  onEvent(eventName: string, payloadJson: string) {
    // Every nested delivery retires the outer invocation, including malformed
    // or unknown events. A callback must never resume a borrowed receipt.
    if (warmInvocation) warmInvocation.active = false;
    warmInvocation = undefined;
    if (!hostEvents.has(eventName)) return;
    let payload: unknown;
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      return;
    }
    let receipt: string|undefined;
    if (eventName === 'onShortcut' && payload && typeof payload === 'object' &&
        !Array.isArray(payload)) {
      const shortcut = payload as Record<string, unknown>;
      if (shortcut['commandId'] === 'new-window' &&
          typeof shortcut['warmInputReceipt'] === 'string' &&
          /^[0-9A-F]{32}$/.test(shortcut['warmInputReceipt']) &&
          !/^0{32}$/.test(shortcut['warmInputReceipt'])) {
        receipt = shortcut['warmInputReceipt'];
      }
      // The ordinary typed shortcut payload never sees private metadata.
      delete shortcut['warmInputReceipt'];
    }
    let first = true;
    for (const listener of listeners.get(eventName) ?? []) {
      const context = first && receipt ? {receipt, active: true} : undefined;
      first = false;
      warmInvocation = context;
      try {
        listener(payload);
      } finally {
        if (context) context.active = false;
        warmInvocation = undefined;
      }
    }
  },
});
ShellHostFactory.getRemote().createShellHost(
    remote.$.bindNewPipeAndPassReceiver(), client.$.bindNewPipeAndPassRemote());

window.auxChromiumHostReady = remote.getIdentity().then(async identity => {
  if (!identity.windowId || !identity.profileId) {
    throw new Error('The Aux browser rejected this shell document.');
  }
  const capabilityResponse = await remote.request('capabilities', '[]');
  if (!capabilityResponse.ok) {
    throw new Error(`Aux capabilities are unavailable: ${capabilityResponse.errorCode}`);
  }
  const capabilities = JSON.parse(capabilityResponse.resultJson) as
      {buildId: string; sourceCommit: string; methods: string[];
       qualifiedFeatures: string[]; developmentAcceptanceRequested?: boolean;
       testClockScale?: number};
  if (!capabilities.buildId || !/^[a-f0-9]{40}(\+dirty)?$/.test(capabilities.sourceCommit) ||
      !Array.isArray(capabilities.methods) ||
      !capabilities.methods.every(method => typeof method === 'string') ||
      !Array.isArray(capabilities.qualifiedFeatures) ||
      !capabilities.qualifiedFeatures.every(feature => typeof feature === 'string') ||
      (capabilities.testClockScale !== undefined &&
       (typeof capabilities.testClockScale !== 'number' ||
        !Number.isFinite(capabilities.testClockScale) ||
        capabilities.testClockScale < 1 || capabilities.testClockScale > 100000))) {
    throw new Error('The Aux browser returned invalid capabilities.');
  }
  const featureStages = featureStagesFor(capabilities.methods, capabilities.qualifiedFeatures);
  // A disposable acceptance Profile may activate reviewed previews only after the
  // runtime validates its owner-only, source-bound marker. The shell never
  // reads a test token or interprets a marker itself.
  if (!identity.privateMode && capabilities.developmentAcceptanceRequested === true &&
      Object.values(featureStages).some(stage => stage === 'preview')) {
    // The first host connection can time out before the helper authenticates.
    // Memory saver reads these stages once, so keep asking until the runtime
    // answers or the shell has to mount with the production preview gate.
    const deadline = Date.now() + 20_000;
    for (;;) {
      let answered = false;
      try {
        const runtimeResponse = await remote.request('invoke',
            JSON.stringify(['runtime.describe', {}]));
        if (runtimeResponse.ok) {
          answered = true;
          const runtime = JSON.parse(runtimeResponse.resultJson) as
              {featureStages?: Partial<typeof featureStages>};
          for (const feature of Object.keys(featureStages) as Array<keyof typeof featureStages>) {
            if (featureStages[feature] === 'preview' &&
                runtime.featureStages?.[feature] === 'on') {
              featureStages[feature] = 'on';
            }
          }
        }
      } catch {
        // A refused describe is retried until the deadline, then preview stays closed.
      }
      if (answered || Date.now() >= deadline) break;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  const windowKinds: Record<WindowKind, Port['windowKind']> = {
    [WindowKind.kNormal]: 'normal',
    [WindowKind.kPrivate]: 'private',
    [WindowKind.kLittle]: 'little',
    [WindowKind.kQuickAsk]: 'quick-ask',
  };
  window.auxChromiumHost = {
    host: 'chromium-fork',
    windowId: identity.windowId,
    profileId: identity.profileId,
    platform: 'darwin',
    privateMode: identity.privateMode,
    windowKind: windowKinds[identity.windowKind],
    capabilities,
    featureStages,
    ...(capabilities.testClockScale !== undefined ?
        {testClockScale: capabilities.testClockScale} : {}),
    async request(method, args) {
      if (method === 'autocomplete') {
        if (args.length !== 1 || typeof args[0] !== 'string') {
          throw new Error('Invalid autocomplete query');
        }
        return autocomplete(args[0]);
      }
      // Optional versions are omitted on activation. JSON arrays encode an
      // explicit undefined as null, which is not a valid catalog version.
      const commandArgs = args.length === 2 && args[1] === undefined ?
          args.slice(0, 1) : args;
      const requestArgs = method === 'tabCommand' ?
          [crypto.randomUUID(), ...commandArgs] : args;
      const context = warmInvocation;
      const warmReceipt = method === 'dispatchCommand' && requestArgs.length === 1 &&
          requestArgs[0] === 'new-window' && context?.active ? context.receipt : undefined;
      // Consume before invoking remote.request: it can reenter client code.
      if (warmReceipt && context) context.active = false;
      const encodedArgs = warmReceipt ?
          {args: requestArgs, warmInputReceipt: warmReceipt} : requestArgs;
      const response = await remote.request(method, JSON.stringify(encodedArgs));
      if (!response.ok) {
        throw new Error(`${response.errorCode}: ${response.errorMessage}`);
      }
      return JSON.parse(response.resultJson);
    },
    subscribe(event, callback) {
      if (!hostEvents.has(event)) return () => {};
      const callbacks = listeners.get(event) ?? new Set();
      callbacks.add(callback);
      listeners.set(event, callbacks);
      return () => {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listeners.delete(event);
        }
      };
    },
  };
});
