import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryChapterClosing} from '../src/recoverWell/recoveryChapterClosing.js';
import {applyRecoveryAction} from '../src/recoverWell/recoveryRun.js';

const base=(outcome,opts={})=>({
 investments:[{designId:'1A',strengthened:true},{designId:'4A',strengthened:false}],
 result:{
   outcome,
   path:{id:opts.pathId||'routed-assessment',designIds:opts.used||['4A']},
   inheritance:{priorContextUsable:!!opts.usable,recoveryReconciliationUsed:!!opts.reconciled,freshAssessmentContextUsed:!!opts.fresh}
 }
});
test('Arthur closing preserves all three distinct resolution states',()=>{
 for(const outcome of ['HOLDS','STRAINED','EXPOSED']){
   const c=recoveryChapterClosing(base(outcome,{usable:true}));
   assert.equal(c.outcome,outcome);
   assert.ok(c.status.includes('Arthur'));
   assert.ok(c.next.length>40);
   assert.equal(c.used[0],'4A');
   assert.equal(c.unused[0],'1A');
 }
});
test('An exposed pathway never claims recovery or completed assessment',()=>{
 const c=recoveryChapterClosing(base('EXPOSED'));
 assert.match(c.experience,/not established every required step/);
 assert.match(c.next,/missing link/);
});
test('Prior verified discharge is described only if relevant to actual result',()=>{
 const inherited=recoveryChapterClosing(base('HOLDS',{usable:true}));
 const rebuilt=recoveryChapterClosing(base('HOLDS',{fresh:true}));
 assert.match(inherited.prior,/at discharge/);
 assert.match(rebuilt.prior,/did not.*change the hospital discharge record|original discharge record is unchanged/);
});
test('Unused technology is not awarded credit for an ordinary route',()=>{
 const c=recoveryChapterClosing(base('HOLDS',{used:[],pathId:'explicit-ordinary-assessment'}));
 assert.match(c.route,/ordinary pathway/);
 assert.equal(c.unused.length,2);
});
test('Result advances to closing, then to journey, without spending resources',()=>{
 const run={phase:'result',capital:2,change:1,investments:[],actions:[],revision:0};
 const first=applyRecoveryAction(run,{id:'a',type:'next'});
 const last=applyRecoveryAction(first,{id:'b',type:'next'});
 assert.equal(first.phase,'chapterClose');
 assert.equal(last.phase,'journey');
 assert.equal(last.capital,2);
 assert.equal(last.change,1);
 assert.equal(run.phase,'result');
});
