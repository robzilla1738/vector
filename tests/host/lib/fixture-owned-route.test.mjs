import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFixture} from './fixture.mjs';
test('exclusive route cannot acquire an existing original owner',async()=>{
 const fixture=await createFixture();try{fixture.route('/owned',{owner:'original'});assert.throws(()=>fixture.claimRoute('/owned',{owner:'foreign'}),/already has an owner/);assert.deepEqual(await(await fetch(`${fixture.url}/owned`)).json(),{owner:'original'});}finally{await fixture.close();}
});
test('retained route remover refuses replacement without deleting it',async()=>{
 const fixture=await createFixture();try{const lease=fixture.claimRoute('/owned',{owner:'original'});assert.equal(lease.current(),true);fixture.route('/owned',{owner:'replacement'});assert.equal(lease.current(),false);assert.throws(()=>lease.remove(),/cleanup debt/);assert.deepEqual(await(await fetch(`${fixture.url}/owned`)).json(),{owner:'replacement'});}finally{await fixture.close();}
});
test('successful exact route removal is idempotent and method-scoped',async()=>{
 const fixture=await createFixture();try{fixture.route('/owned',{owner:'post'},{method:'POST'});const lease=fixture.claimRoute('/owned',{owner:'get'});lease.remove();lease.remove();assert.equal(lease.current(),false);assert.equal((await fetch(`${fixture.url}/owned`)).status,404);assert.deepEqual(await(await fetch(`${fixture.url}/owned`,{method:'POST'})).json(),{owner:'post'});}finally{await fixture.close();}
});
