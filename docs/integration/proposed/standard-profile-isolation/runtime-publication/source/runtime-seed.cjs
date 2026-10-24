'use strict';
// The native owner selects source/task FDs, validates every pin/relocation,
// creates/copies/chmods/links/cleans staging and atomically publishes it. JS has
// no staging path, handle or mutation/cleanup route to bypass its native lease.
const path = require('node:path');
async function seedBundledRuntime({home, seedNativeRuntime, inspectRetainedRuntime}) {
  if (typeof home !== 'string' || !path.isAbsolute(home) || path.resolve(home) !== home ||
      typeof seedNativeRuntime !== 'function' || typeof inspectRetainedRuntime !== 'function')
    throw Error('Authenticated native runtime seed required');
  const result = await seedNativeRuntime();
  const runtime = path.join(home, 'runtime');
  if (result.status === 'retained' && result.renamed === false)
    return {retained:true,seeded:false,runtime,inspection:await inspectRetainedRuntime()};
  if (result.status === 'published' && result.renamed === true)
    return {retained:false,seeded:true,runtime,relocatedTextFiles:result.relocatedTextFiles};
  const unknown = result.status === 'unknown' || result.renamed;
  throw Object.assign(Error(unknown ? 'Runtime publication outcome is unknown; retained state needs reconciliation' :
    'Runtime publication was refused or cancelled'), {code:unknown?'AUX_RUNTIME_PUBLICATION_UNKNOWN':'AUX_RUNTIME_PUBLICATION_REFUSED'});
}
module.exports = {seedBundledRuntime};
