// Shared fixed packaged diagnostic expression; never used for product activation.
export const nativeDiagnosticExpression = 'import(`node:module`).then(({createRequire:Cn})=>{let ei=Cn(process.execPath),ti=ei(`node:path`);return ei(ti.resolve(ti.dirname(process.execPath),`../Resources/native/native-load-diagnostic.cjs`))()})';
export const nativeDiagnosticPredicate = 'process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY===`1`||process.env.AUX_PROVIDED_DP_PROBE===`1`';
