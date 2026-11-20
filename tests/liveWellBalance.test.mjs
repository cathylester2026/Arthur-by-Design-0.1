import test from 'node:test';
import assert from 'node:assert/strict';
import {BALANCE_PROFILES,PLAY_PROFILES,STRESS_PROFILES,balanceProfile,scenarioProfiles,selectPlayProfile} from '../src/liveWell/liveBalance.js';
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

test('Player-facing profile pool retains attainable solutions; hard failures are explicit stress cases',()=>{
 assert.equal(PLAY_PROFILES.length,11);
 assert.equal(STRESS_PROFILES.length,3);
 assert.ok(PLAY_PROFILES.every(p=>p.difficulty!=='stress'));
 assert.ok(STRESS_PROFILES.every(p=>p.difficulty==='stress'));
 for(const p of STRESS_PROFILES)assert.equal(rows.filter(r=>r.profile===p.id&&r.outcome==='HOLDS').length,0,p.id+' should never be an ordinary random roll');
 const routine=PLAY_PROFILES.filter(p=>p.difficulty==='routine');
 assert.equal(routine.length,10);
 assert.ok(routine.every(p=>rows.some(r=>r.profile===p.id&&r.outcome==='HOLDS')),'Every routine case should have a viable, earned portfolio outcome');
});
test('Strengthen reduces verified effort or improves genuine contingency versus Extend without inventing service capacity',()=>{
 const fixtures=[
  ['1A','2A','S1-detour-confirmed'],['1B','2A','S1-detour-confirmed'],['1C','2A','S1-ride-accepted'],
  ['2A','1A','S2-pod-accepted'],['2B','1A','S2-network-accepted'],['2C','1A','S2-mobile-accepted'],
  ['3A','1A','S2-network-accepted'],['3B','1A','S2-pod-accepted'],['3C','1A','S3-remote-participation'],
  ['4A','1A','S2-participation-not-advised'],['4B','2A','S3-event-confirmed'],['4C','2A','S3-concierge-confirmed']
 ];
 for(const [id,other,pid] of fixtures){
  const p=balanceProfile(pid);
  const strong=evaluateLiveWell({start,scenarioId:p.scenarioId,facts:p.facts,response:'use',strategy:'strengthen',investments:[{designId:id,strengthened:true}]});
  const wide=evaluateLiveWell({start,scenarioId:p.scenarioId,facts:p.facts,response:'use',strategy:'extend',investments:[{designId:id,strengthened:false},{designId:other,strengthened:false}]});
  assert.equal(strong.route.designId,id,'Strengthen scenario must exercise '+id+' rather than its fallback');
  assert.equal(wide.route.designId,id,'Extend comparison must choose same '+id+' route');
  assert.ok(strong.metrics.burden<wide.metrics.burden,id+' did not earn its incremental dependability');
  assert.equal(strong.route.contributedStrength,true,id+' had an uncredited Strengthen contribution');
 }
});

test('Report player-oriented best available response and every design’s credited operating effect',()=>{
 const order={HOLDS:3,STRAINED:2,EXPOSED:1},grade={high:3,medium:2,low:1};
 const best=[];
 for(const profile of BALANCE_PROFILES){
  for(const p of portfolios){
   const option=rows.filter(x=>x.profile===profile.id&&x.investment===p.investments.map(i=>i.designId).join('+')&&x.strategy===p.strategy)
    .sort((a,b)=>order[b.outcome]-order[a.outcome]||grade[b.agency]-grade[a.agency]||a.burden-b.burden||Number(a.response==='ordinary')-Number(b.response==='ordinary'))[0];
   assert.ok(option,'No legal response for '+profile.id);
   best.push(option);
  }
 }
 const relevant=best.filter(x=>PLAY_PROFILES.some(p=>p.id===x.profile));
 const report={
  allConditions:count(best,'outcome'),
  playerConditions:count(relevant,'outcome'),
  playerFutures:count(relevant,'future'),
  byStrategy:{
   strengthen:{cases:relevant.filter(x=>x.strategy==='strengthen').length,wins:relevant.filter(x=>x.strategy==='strengthen'&&x.outcome==='HOLDS').length},
   extend:{cases:relevant.filter(x=>x.strategy==='extend').length,wins:relevant.filter(x=>x.strategy==='extend'&&x.outcome==='HOLDS').length}
  },
  creditedDesigns:[...new Set(rows.filter(x=>x.design).map(x=>x.design))].sort(),
  profilesExcludedFromOrdinaryPlay:STRESS_PROFILES.map(p=>p.id)
 };
 console.log('LIVE_PLAYER_BALANCE '+JSON.stringify(report));
 assert.deepEqual(report.creditedDesigns,Object.keys(DESIGNS).sort(),'Every investment design needs at least one real bounded contribution');
 assert.equal(relevant.length,PLAY_PROFILES.length*portfolios.length);
 assert.ok(report.playerConditions.HOLDS>0);
 assert.ok(report.playerConditions.STRAINED>0);
 assert.ok(report.byStrategy.strengthen.wins>0&&report.byStrategy.extend.wins>0);
});

test('Seeded player scenario selection is deterministic and cannot select stress-only conditions',()=>{
 for(const scenarioId of ['S1','S2','S3']){
  const variants=new Set();
  for(let i=0;i<160;i++){
   const a=selectPlayProfile(scenarioId,'table-'+i);
   const b=selectPlayProfile(scenarioId,'table-'+i);
   assert.deepEqual(a,b);
   assert.equal(a.scenarioId,scenarioId);
   assert.ok(PLAY_PROFILES.some(p=>p.id===a.id));
   assert.ok(!STRESS_PROFILES.some(p=>p.id===a.id));
   variants.add(a.id);
  }
  assert.equal(variants.size,PLAY_PROFILES.filter(p=>p.scenarioId===scenarioId).length);
 }
 assert.throws(()=>selectPlayProfile('S0','a'),/Unknown/);
 assert.throws(()=>selectPlayProfile('S1',''),/stable/);
});
