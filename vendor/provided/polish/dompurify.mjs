/** The Agent extension's Mermaid chunk embeds DOMPurify 3.4.12. It's taken out here and the chunk
 * imports the current release instead, aux-dompurify.js, the unmodified npm build of 3.4.17 (from
 * npm integrity sha512-B/pSlYVHQ58kqISD/yDjuJ1yfzI34m1gF4lAod2bwSRhiN4K5Cl3H8Af7hqB2PmTL911tdEudnnXn5FnhRoz0w==).
 * Everything between the markers is DOMPurify and its helpers; nothing else in the chunk uses them
 * but the one instance. */
export const DOMPURIFY_CHUNK = 'assets/chunk-KMA2NSDO-BQuQnxRu.js';
const FIRST = 'function Gi(t,i){(i==null||i>t.length)', INSTANCE = 'var Vt=Zi(),', VERSION = 'i.version="3.4.12"';

export function integrateDomPurify(text) {
  for (const marker of [FIRST, INSTANCE, VERSION])
    if (text.split(marker).length !== 2) throw Error(`DOMPurify integration drift: expected one ${marker}`);
  return `import auxDomPurify from"./aux-dompurify.js";${text.slice(0, text.indexOf(FIRST))}var Vt=auxDomPurify,${text.slice(text.indexOf(INSTANCE) + INSTANCE.length)}`;
}
