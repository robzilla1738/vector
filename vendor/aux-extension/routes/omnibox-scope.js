/* Aux-owned source: the omnibox scopes (assets/omnibox-scope-DGFEg60F.js, after its imports): the
 * bookmark, Gemini, history and tabs scopes by id, and the lookup.
 * Names the rest of the chunk uses keep their chunk names: p scopeFor (exported).
 * Chunk names used: t/s/m/a the scope definitions. */
var SCOPES = {bookmark: t, gemini: s, history: m, tabs: a} /** scopeFor: the omnibox scope with this id, or null. */,
  p = o => (Object.hasOwn(SCOPES, o) ? SCOPES[o] : null);
