import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const identity = JSON.parse(
  readFileSync(
    new URL('../../docs/design/extension-identities.json', import.meta.url),
    'utf8',
  ),
).vault;
export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'aux-vault-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(
            {
              manifest_version: 3,
              name: 'Aux Vault',
              version: '0.2.0',
              description: 'Encrypted credentials in your local Aux account.',
              key: identity.key,
              incognito: 'split',
              permissions: [
                'tabs',
                'activeTab',
                'storage',
                'downloads',
                'offscreen',
                'alarms',
                'clipboardRead',
                'clipboardWrite',
                'dev.aux.ext.private.account',
                'dev.aux.ext.private.credentials',
              ],
              host_permissions: [
                'http://127.0.0.1:21520/*',
                'http://*/*',
                'https://*/*',
              ],
              background: { service_worker: 'background.js', type: 'module' },
              action: {
                default_title: 'Aux Vault',
                default_popup: 'index.html',
              },
              content_scripts: [
                {
                  matches: ['http://*/*', 'https://*/*'],
                  js: ['content.js'],
                  all_frames: true,
                  run_at: 'document_idle',
                },
              ],
              content_security_policy: {
                extension_pages:
                  "script-src 'self'; object-src 'none'; connect-src 'self' http://127.0.0.1:21520",
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
        offscreen: new URL('./offscreen.html', import.meta.url).pathname,
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
