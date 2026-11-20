import test from 'node:test';
import assert from 'node:assert/strict';
import {BALANCE_PROFILES,balanceProfile,scenarioProfiles} from '../src/liveWell/liveBalance.js';
import {legalPortfolios,evaluateLiveWell,makeLiveStart,DESIGNS} from '../src/liveWell/liveResolver.js';

const start=makeLiveStart();
const portfolios=legalPortfolios();
const modes=['use','adapt','coordinate','ordinary'];
const rows=[];
for(const authored of BALANCE_PROFILES){
 const p=balanceProfile(authored.id);
 for(const investment of portfolios)for(const response of modes){
  let result;
  try{result=evaluateLiveWell({start,...investment,scenarioId:p.scenarioId,facts:p.facts,response})}
  catch(err){if(/exceeds remaining resources/.test(err.message))continue;throw err}
  rows.push({profile:p.id,scenario:p.scenarioId,strategy:investment.strategy,
   investment:investment.investments.map(i=>i.designId).join('+'),response,
   outcome:result.metrics.outcome,future:result.metrics.future,participation:result.metrics.participation,
   design:result.route.designId,route:result.route.id,burden:result.metrics.burden,
   agency:result.metrics.agency,strengthUsed:result.route.contributedStrength});
 }
}
const count=(items,key)=>Object.fromEntries([...new Set(items.map(x=>x[key]))].map(x=>[x,items.filter(r=>r[key]===x).length]));
const unique=rows=>new Set(rows.map(x=>x.investment)).size;
test('Balance profiles are valid, grounded variations rather than invented rewards',()=>{
 assert.equal(BALANCE_PROFILES.length,14);
 assert.deepEqual(Object.keys(count(BALANCE_PROFILES,'scenarioId')).sort(),['S1','S2','S3']);
 assert.equal(new Set(BALANCE_PROFILES.map(p=>p.id)).size,14);
 for(const p of BALANCE_PROFILES){
  assert.ok(p.title&&p.description);
  const parsed=balanceProfile(p.id);
  assert.equal(parsed.scenarioId,p.scenarioId);
  assert.ok(parsed.facts);
 }
 for(const id of ['S1','S2','S3'])assert.ok(scenarioProfiles(id).length>=4);
 assert.throws(()=>balanceProfile('unknown'),/Unknown/);
});

test('All 14 profiles × legal portfolios × affordable responses complete and preserve community safety',()=>{
 assert.equal(rows.length,14*portfolios.length*4);
 for(const row of rows){
  assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(row.outcome));
  assert.ok(['ADAPTABLE_ACCOUNTABLE','CONNECTED_FRAGILE','FRAGMENTED'].includes(row.future));
  assert.equal(row.outcome==='HOLDS',row.participation);
  assert.ok(row.burden>=0);
  if(row.strengthUsed)assert.equal(row.strategy,'strengthen');
 }
 const metrics={runs:rows.length,portfolioCount:portfolios.length,scenarios:count(rows,'scenario'),
  results:count(rows,'outcome'),futures:count(rows,'future'),profiles:[]};
 for(const p of BALANCE_PROFILES){
  const r=rows.filter(x=>x.profile===p.id);
  metrics.profiles.push({id:p.id,results:count(r,'outcome'),futures:count(r,'future'),
   winningPortfolios:unique(r.filter(x=>x.outcome==='HOLDS')),
   strengthenedWins:r.filter(x=>x.outcome==='HOLDS'&&x.strategy==='strengthen').length,
   extendedWins:r.filter(x=>x.outcome==='HOLDS'&&x.strategy==='extend').length});
 }
 console.log('LIVE_BALANCE_MATRIX '+JSON.stringify(metrics));
 const successes=rows.filter(x=>x.outcome==='HOLDS').length;
 assert.ok(successes>rows.length*.08&&successes<rows.length*.65,'Profile mix must include meaningful wins and setbacks');
 assert.ok(rows.some(x=>x.outcome==='EXPOSED'),'Clinical risk outcomes should be observed in credible authored conditions');
 assert.ok(Object.keys(count(rows,'future')).length===3);
 assert.ok(BALANCE_PROFILES.some(p=>rows.some(x=>x.profile===p.id&&x.outcome==='HOLDS')));
 assert.ok(BALANCE_PROFILES.some(p=>rows.every(x=>x.profile!==p.id||x.outcome!=='HOLDS')));
});
test('A care pod is beneficial only when clinical acceptance is genuine',()=>{
 const invest={strategy:'strengthen',investments:[{designId:'2A',strengthened:true}]};
 const happy=balanceProfile('S2-pod-accepted'),bad=balanceProfile('S2-no-qualified-response');
 const yes=evaluateLiveWell({start,...invest,scenarioId:happy.scenarioId,facts:happy.facts,response:'use'});
 const no=evaluateLiveWell({start,...invest,scenarioId:bad.scenarioId,facts:bad.facts,response:'use'});
 assert.equal(yes.metrics.outcome,'HOLDS');
 assert.equal(no.metrics.outcome,'EXPOSED');
});
test('Caring for Arthur can succeed while participation appropriately does not',()=>{
 const scenario=balanceProfile('S2-participation-not-advised');
 const invest={strategy:'strengthen',investments:[{designId:'2A',strengthened:true}]};
 const result=evaluateLiveWell({start,...invest,scenarioId:scenario.scenarioId,facts:scenario.facts,response:'use'});
 assert.equal(result.metrics.safetyEstablished,true);
 assert.equal(result.metrics.participation,false);
 assert.equal(result.metrics.outcome,'STRAINED');
});
test('Autonomous delivery is not allowed to complete an outing or be treated as clinical care',()=>{
 for(const p of BALANCE_PROFILES){
  const result=evaluateLiveWell({start,strategy:'strengthen',investments:[{designId:'4A',strengthened:true}],scenarioId:p.scenarioId,facts:p.facts,response:'use'});
  assert.notEqual(result.metrics.outcome,'HOLDS',p.id);
 }
});
test('Every card is credited in its intended domain, not generically across all disruptions',()=>{
 const scope={
  '1A':['S1','S3'],'1B':['S1','S3'],'1C':['S1','S2','S3'],
  '2A':['S2'],'2B':['S2'],'2C':['S2'],
  '3A':['S1','S2'],'3B':['S2'],'3C':['S2','S3'],
  '4A':['S2'],'4B':['S3'],'4C':['S1','S2','S3']
 };
 for(const row of rows.filter(x=>x.design)){
  assert.ok(scope[row.design]?.includes(row.scenario),row.design+' unexpectedly credited for '+row.scenario);
 }
});
