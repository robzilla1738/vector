import type { NextConfig } from 'next';

const config: NextConfig = {
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
  async rewrites() {
    return ['auth', 'profile', 'billing', 'sync', 'drive', 'shared-sessions', 'projects', 'routines', 'users', 'ai', 'stt', 'tts', 'speech', 'attachments', 'attachment-sessions'].map(prefix => ({
      source: `/${prefix}/:path*`, destination: `/api/v1/${prefix}/:path*`,
    }));
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }, { source: '/builtin-skills/v1/:path*', headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Content-Security-Policy', value: "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox" },
    ] }];
  },
};
export default config;
