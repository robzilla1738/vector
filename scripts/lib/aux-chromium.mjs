import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

// Same default as scripts/aux_chromium.py; AUX_CHROMIUM_SRC overrides it.
export const chromiumSrc = process.env.AUX_CHROMIUM_SRC
  ? resolve(process.env.AUX_CHROMIUM_SRC)
  : '/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src';

/** Upstream bytes of a Chromium file at the checkout's HEAD, before Aux edits in the working tree. */
export const upstreamChromiumFile = relative =>
  execFileSync('git', ['-C', chromiumSrc, 'show', `HEAD:${relative}`], { encoding: 'utf8', maxBuffer: 1 << 28 });
