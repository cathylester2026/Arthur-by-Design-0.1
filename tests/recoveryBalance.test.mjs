import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRecovery} from '../src/recoverWell/recoveryResolver.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';
import {CAPABILITIES} from '../src/recoverWell/recoveryContent.js';
import {recoveryInvestmentLedger} from '../src/recoverWell/recoveryInvestmentLedger.js';
const h=standaloneHandoff('supported'),open=standaloneHandoff('open');
const run=(id,scenarioId='S1',strengthened=false,handoff=h,response='use',facts={})=>
 resolveRecovery({handoff,investments:[{designId:id,strengthened}],scenarioId,response,facts});
test('S1 environment gap makes an unstrengthened local setup incomplete; tested fallback closes it',()=>{
 for(const id of ['1B','2B']){
  const ordinary=run(id,'S1');
  const strong=run(id,'S1',true);
  assert.equal(ordinary.outcome,'EXPOSED',id);
  assert.equal(strong.outcome,'HOLDS',id);
  assert.equal(strong.strengthUses.length,1,id);
 }
});
test('S3 robot purchase does not automatically buy safe-deferral activation',()=>{
 const bare=run('2C','S3'),strong=run('2C','S3',true);
 assert.equal(bare.outcome,'EXPOSED');
 assert.equal(strong.outcome,'HOLDS');
 assert.equal(strong.path.localTaskMode,'safe-deferral');
 assert.match(strong.path.benefit,/safely wait six hours/);
});
test('S2 same-day ordinary assessment stays viable but records repeated-history work',()=>{
 const funded=run('4A','S2');
 const ordinary=run('4A','S2',false,h,'ordinary');
 const missing=run('4A','S2',false,open);
 const fresh=run('4A','S2',false,open,'ordinary');
 assert.equal(funded.outcome,'HOLDS');
 assert.equal(ordinary.outcome,'STRAINED');
 assert.match(ordinary.burdenEvidence[0].fact,/ordinaryAssessmentNeedsRepeatedHistory/);
 assert.equal(missing.outcome,'EXPOSED');
 assert.equal(fresh.outcome,'STRAINED');
 assert.ok(fresh.contextReconstruction);
});
test('Investment ledger distinguishes purchased, available, actual use, and a missing dependency',()=>{
 const inv=[{designId:'4A',strengthened:false}];
 const base=run('4A','S2');
 const ordinary=run('4A','S2',false,h,'ordinary');
 const unused=recoveryInvestmentLedger(inv,ordinary,base)[0];
 assert.equal(unused.status,'AVAILABLE, NOT USED');
 assert.equal(unused.readyForEvent,true);
 assert.equal(unused.used,false);
 const purchased=recoveryInvestmentLedger(inv,base)[0];
 assert.equal(purchased.status,'USED IN THIS RESPONSE');
 const exposed=recoveryInvestmentLedger(inv,run('4A','S2',false,open))[0];
 assert.equal(exposed.status,'RESPONSE DEPENDENCY MISSING');
 const irrelevant=recoveryInvestmentLedger([{designId:'3A',strengthened:false}],run('3A','S3'))[0];
 assert.equal(irrelevant.status,'NOT TESTED BY THIS EVENT');
});
test('All twelve investments produce valid bounded results for both discharge starting cases and all three events',()=>{
 for(const handoff of [h,open])for(const id of CAPABILITIES.flatMap(c=>c.choices.map(x=>x.id)))for(const scenarioId of ['S1','S2','S3']){
  const result=run(id,scenarioId,false,handoff);
  assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(result.outcome),id+' '+scenarioId);
  assert.ok(result.chain.length>=3);
  assert.ok(result.path);
 }
});
