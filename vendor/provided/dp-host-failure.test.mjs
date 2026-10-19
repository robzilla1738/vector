import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeDpHostFailure } from './run-approved-dp-probe.mjs';
test('failed cleanup retains exact four public statuses without forwarding native text or arbitrary fields', () => {
  const result = sanitizeDpHostFailure({ok:false, operation:'cleanup', exactRows:{statuses:[-34018,-34018,-34018,-34018],accessGroupHashes:[null,null,null,null],data:'never log'},error:'never log',secret:'never log'},1);
  assert.deepEqual(result,{ok:false,code:'approved-host-refused',statuses:[-34018,-34018,-34018,-34018],hostExitCode:1,operation:'cleanup',exactRows:{statuses:[-34018,-34018,-34018,-34018],accessGroupHashes:[null,null,null,null]}});
  const unknown = sanitizeDpHostFailure({code:'never log',statuses:['never log'],exactRows:{statuses:[-34018,-34018,-34018,'never log']}},1);
  assert.deepEqual(unknown,{ok:false,code:'approved-host-refused',statuses:[],hostExitCode:1});
  assert.deepEqual(sanitizeDpHostFailure({code:'original-native-error',statuses:[]},1),{ok:false,code:'original-native-error',statuses:[],hostExitCode:1});
});
