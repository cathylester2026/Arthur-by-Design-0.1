import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveryRun,applyRecoveryAction,serializeRun,restoreRun} from '../src/recoverWell/recoveryRun.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';
const oldS1={routineAlternativeAvailable:false,routineAlternativeFits:false,rehabAlternativeAvailable:false,rehabAlternativeFits:false,homeTaskFits:true,rehabEnvironmentFits:true};
const act=(r,type,fields={},index=0)=>applyRecoveryAction(r,{id:'evt-'+index,type,...fields});
test('A new saved recovery run records all scenario facts at start',()=>{
 const run=createRecoveryRun({handoff:standaloneHandoff('supported'),runId:'new-default-facts',scenarioId:'S1'});
 assert.equal(run.facts.homeTaskFits,false);
 assert.equal(run.facts.routineAlternativeAvailable,true);
 assert.equal(restoreRun(serializeRun(run)).facts.homeTaskFits,false);
});
test('An older S1 completed run can be restored without silently adopting new defaults',()=>{
 let run=createRecoveryRun({handoff:standaloneHandoff('supported'),runId:'prior-balanced-rules',scenarioId:'S1',facts:oldS1});
 run=act(run,'next',{},1);
 run=act(run,'invest',{capabilityId:'personalized'},2);
 run=act(run,'next',{},3);
 run=act(run,'design',{designId:'1B'},4);
 run=act(run,'next',{},5);
 run=act(run,'strategy',{choice:'strengthen'},6);
 run=act(run,'revealImpact',{},7);
 run=act(run,'next',{},8);
 run=act(run,'respond',{choice:'use'},9);
 assert.equal(run.result.outcome,'HOLDS');
 const saved=JSON.parse(serializeRun(run));
 saved.entry.facts={}; // Historical saves recorded overrides, not the complete scenario default snapshot.
 const recovered=restoreRun(JSON.stringify(saved));
 assert.equal(recovered.result.outcome,'HOLDS');
 assert.equal(recovered.facts.homeTaskFits,true);
 assert.equal(recovered.facts.routineAlternativeAvailable,false);
 assert.equal(restoreRun(serializeRun(recovered)).result.outcome,'HOLDS');
});
