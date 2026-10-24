export const ROOT='/Users/rcourson/Documents/Vibe/web';
export const PREFIX='docs/integration/proposed/standard-profile-isolation/';
export const STAGES=Object.freeze([
 {name:'claude-code-login',module:PREFIX+'claude-code-login/source/transform.mjs',export:'transformAuxClaudeCodeLogin',count:6},
 {name:'meta-login',module:PREFIX+'meta-login/source/transform.mjs',export:'transformAuxMetaLogin',count:3},
 {name:'chatgpt-login',module:PREFIX+'chatgpt-login/source/transform.mjs',export:'transformAuxChatGPTLogin',count:7}
]);
export const APPENDED_COUNT=16;
export const OVERLAYS=Object.freeze([
 {name:'claude-code-login',sha256:'ac29f8c7b389c730d1602737fbd160ed331dd66d5e05a1d7dbc0260ea5fdef74',sourceFiles:['source/transform.mjs','source/anchors.json','source/claude-code-login.js']},
 {name:'meta-login',sha256:'14194bf2445b21b8cb7ead128d7cdc74490cca6eac563b5bde0dd167fad4ef1a',sourceFiles:['source/transform.mjs','source/anchors.json','source/meta-login.js']},
 {name:'chatgpt-login',sha256:'2ce643624134497a39f45cace040e7215d969afecb7a342fe06740980d53e557',sourceFiles:['source/transform.mjs','source/anchors.json','source/chatgpt-lifetimes.js','source/shim-anchors.json','source/aux-chatgpt.cjs']}
]);
export const SHIM=Object.freeze({kind:'chatgpt-shim',stage:'chatgpt-login',module:PREFIX+'chatgpt-login/source/transform.mjs',export:'transformAuxChatGPTShim',count:4,input:'vendor/aside/shims/aux-chatgpt.cjs',packageRelativePath:'Contents/Resources/native/aux-chatgpt.cjs'});
export const PREVIOUS=Object.freeze({source:'3ee2471769470b820bfaf16d64f6dfc7aa0bef1b8ad54493c7d2a0bffe725802',entry:'ba6194fbe579dec43ccaa2a7b788e58bc0a1cb9a0ff52ab5b5cfcea334890804',loader:'ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663'});
export const PREVIOUS_STAGES=Object.freeze(['features','async-runtime-inspection','research-v1','background-writers','daemon-shutdown','runtime-coordination','refresh-and-skill','managed-producers','interactive-oauth']);
export const PRODUCER_FILES=Object.freeze(['freeze.mjs','produce.mjs','immutable-inputs.json','README.md','prepare-review.mjs','review.json','contract.mjs']);
