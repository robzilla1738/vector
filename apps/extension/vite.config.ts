import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const identities = JSON.parse(
  readFileSync(
    new URL('../../docs/design/extension-identities.json', import.meta.url),
    'utf8',
  ),
);
export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'aux-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(
            {
              manifest_version: 3,
              incognito: 'split',
              name: 'Aux',
              version: '0.1.0',
              key: identities.agent.key,
              description: 'Local tasks and browsing in Aux.',
              permissions: [
                'tabs',
                'debugger',
                'tabGroups',
                'storage',
                'sidePanel',
                'scripting',
                'sessions',
                'history',
                'bookmarks',
                'downloads',
                'alarms',
                'dev.aux.ext.private.account',
                'dev.aux.ext.private.omnibox',
                'dev.aux.ext.private.browserPreferences',
                'dev.aux.ext.private.browserImport',
                'dev.aux.ext.private.miniPopup',
              ],
              host_permissions: [
                'http://127.0.0.1:21520/*',
                'http://localhost:21520/*',
                '<all_urls>',
              ],
              background: { service_worker: 'background.js', type: 'module' },
              chrome_url_overrides: { newtab: 'index.html' },
              side_panel: { default_path: 'index.html#/chat' },
              options_page: 'index.html#/settings/general',
              action: { default_title: 'Open Aux' },
              content_scripts: [
                {
                  matches: ['http://*/*', 'https://*/*'],
                  js: ['content.js'],
                  run_at: 'document_idle',
                },
              ],
              content_security_policy: {
                extension_pages:
                  "script-src 'self'; object-src 'none'; connect-src 'self' http://127.0.0.1:21520 ws://127.0.0.1:21520; frame-src 'self' blob:",
              },
            },
            null,
            2,
          ),
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        app: new URL('./index.html', import.meta.url).pathname,
        background: new URL('./src/background.ts', import.meta.url).pathname,
        content: new URL('./src/content.ts', import.meta.url).pathname,
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
});
