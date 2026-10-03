import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PERSON_OBSERVER_SOURCE } from '../dist/person-observer-script.js';

const output = resolve(import.meta.dirname, '../../../.native/chrome/common/native_person_observer_script.h');
const source = `((request) => JSON.stringify(${PERSON_OBSERVER_SOURCE}(request)))`;
if (source.includes(')AUX_READ"')) throw new Error('Fixed observer literal delimiter collision');
const header = `// Generated from the fixed person observer; run gen-native-person-observer.mjs.
#ifndef CHROME_COMMON_NATIVE_PERSON_OBSERVER_SCRIPT_H_
#define CHROME_COMMON_NATIVE_PERSON_OBSERVER_SCRIPT_H_
namespace aux::person_observer_script {
inline constexpr char kProducerSha256[] = "${createHash('sha256').update(source).digest('hex')}";
inline constexpr char16_t kRead[] = uR"AUX_READ(${source})AUX_READ";
}  // namespace aux::person_observer_script
#endif
`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== header) throw new Error('Fixed native person observer is stale');
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, header);
}
