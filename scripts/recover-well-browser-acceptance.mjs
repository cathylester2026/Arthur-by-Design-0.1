// Browser acceptance smoke: real clicks, responsive layout, and chapter handoff.
// Uses the application's Vite dev server. No workshop records or Supabase writes.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.ARTHUR_BASE_URL||'http://127.0.0.1:4177/';
const artifacts=process.env.ARTHUR_BROWSER_ARTIFACTS||'/tmp/arthur-browser-artifacts';
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0;
function monitor(page,label){
 const faults=[];page.on('pageerror',err=>faults.push(err.message));
 return ()=>{assert.deepEqual(faults,[],label+': uncaught browser error');};
}
async function checkWidth(page,label){
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 assert.ok(dims.scroll<=dims.client+3,label+' horizontal overflow '+JSON.stringify(dims));
}
async function playRecovery(page,{caseName='supported',connected=false,choice='4A',strategy='strengthen',second=null,view='reading',label='standalone',sourceJourney=null,scenario='S2'}={}){
 const check=monitor(page,label);
 const scenarioRandom={S1:0.05,S2:0.4,S3:0.8}[scenario];
 await page.addInitScript(value=>{Math.random=()=>value;},scenarioRandom);
 if(!connected){
  await page.goto(base+'?mode=recover-standalone');
  await page.getByRole('link',{name:caseName==='supported'?'Play with a checked plan':'Play with a plan to check'}).click();
 }else{
  await page.goto(base+'?mode=journey&journey='+sourceJourney);
  const button=page.locator('a.journey-primary');await button.click();
  if(await page.locator('#reflection-skip').count())await page.locator('#reflection-skip').click();
 }
 await page.locator('[data-recovery-phase="brief"]',{}).waitFor();
 await page.locator('[data-next]').click();
 const family={'1':'personalized','2':'rehab','3':'warning','4':'response'};
 async function invest(id){
  await page.locator('button[data-invest="'+family[id[0]]+'"]').click();
  await page.locator('button[data-design="'+id+'"]').click();
  await page.locator('[data-recovery-phase="designReveal"]').waitFor();
  await page.locator('[data-next]').click();
 }
 await invest(choice);
 if(strategy==='strengthen')await page.locator('button[data-strategy="strengthen"]').click();
 else {await page.locator('button[data-strategy="extend"]').click();await invest(second);}
 await page.locator('[data-disruption="'+scenario+'"] #meet-change').waitFor();
 if(await page.locator('#meet-change').count())await page.locator('#meet-change').click();
 await page.locator('button[data-prediction="NOT SURE"]').click();
 await page.locator('#reveal-impact').click();
 await page.locator('button[data-next]').click();
 await page.locator('button[data-response="ordinary"]').click();
 await page.locator('[data-recovery-phase="result"]').waitFor();
 const outcome=await page.locator('section.result h1').first().textContent();
 assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(outcome.trim()),label+': missing status');
 await page.locator('button[data-next]').last().click();
 if(await page.locator('#reflection-skip').count())await page.locator('#reflection-skip').click();
 await page.locator('[data-recovery-phase="chapterClose"]').waitFor();
 assert.ok(await page.locator('.recovery-investment-status-grid article').count()=== (strategy==='extend'?2:1));
 await page.getByRole('heading',{name:'Arthur’s recovery continues.'}).waitFor();
 const image=await page.locator('.recovery-close-hero img').evaluate(x=>({ok:x.complete&&x.naturalWidth>0,src:x.getAttribute('src')}));
 assert.ok(image.ok,label+': original Arthur image failed: '+image.src);
 assert.ok(image.src.includes('recover-arthur-final.webp'),label+': Arthur image changed');
 await checkWidth(page,label+' closing');
 await page.screenshot({path:artifacts+'/'+label+'-closing.png',fullPage:true});
 await page.locator('.recovery-chapter-close button[data-next]').click();
 if(connected){
  await page.locator('.journey-chapters').waitFor();
  assert.ok((await page.locator('.journey-chapters').innerText()).includes('Your recovery choices are saved'));
 }else{
  await page.getByRole('heading',{name:'Play Recover Well.'}).waitFor();
 }
 check();passed++;
 return outcome.trim();
}
try {
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});
 const home=await desktop.newPage();const homeCheck=monitor(home,'landing');
 await home.goto(base);
 await home.getByRole('link',{name:/Play Recover Well/}).first().waitFor();
 await checkWidth(home,'landing desktop');
 const imgs=await home.locator('.opening img').evaluateAll(nodes=>nodes.map(x=>({src:x.getAttribute('src'),ok:x.complete&&x.naturalWidth>0})));
 assert.ok(imgs.every(x=>x.ok),'Landing Arthur imagery must load: '+JSON.stringify(imgs));
 homeCheck();passed++;
 const checked=await desktop.newPage();
 await playRecovery(checked,{caseName:'supported',choice:'4A',label:'desktop-checked',scenario:'S2'});
 const open=await desktop.newPage();
 await playRecovery(open,{caseName:'open',choice:'2B',label:'desktop-open',scenario:'S1'});
 const narrow=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const mobile=await narrow.newPage();
 await mobile.goto(base);
 await checkWidth(mobile,'landing mobile');
 await playRecovery(mobile,{caseName:'supported',choice:'2C',label:'mobile-robot',scenario:'S3'});
 const linked=await desktop.newPage();
 await linked.goto(base);
 const journeyId=await linked.evaluate(async()=>{
  const {evaluatePortfolio}=await import('/src/causalEngine.js');
  const {connectLeaveWell}=await import('/src/journeyBridge.js');
  const investments=[{capabilityId:'ambient',commitmentId:'shared',strengthened:false},{capabilityId:'meds',commitmentId:'pharmacy',strengthened:false}];
  const details=['route','information','coordination'].map(id=>({id,...evaluatePortfolio({activations:investments},id,'use')}));
  const evaluation={model:'causal-composite-readiness-v2',eventId:'handoff_changed',responseId:'use',outcome:details.some(d=>d.outcome==='EXPOSED')?'EXPOSED':details.some(d=>d.outcome==='STRAINED')?'STRAINED':'HOLDS',details};
  const entry=connectLeaveWell({runId:'browser-acceptance-leave-1',team:{id:'browser-table-1',investments,game_state:{evaluation,responseId:'use',applied_decisions:{}}},completed:true,completedAt:'2026-11-20T19:30:00Z',experienceMode:'independent',sourceReturn:{mode:'studio-solo',preview:'1'}},{uuid:()=> 'browser-acceptance-journey-1'});
  return entry.id;
 });
 await playRecovery(linked,{connected:true,sourceJourney:journeyId,choice:'4A',label:'connected-leave-to-recover',scenario:'S2'});
 await narrow.close();await desktop.close();
 console.log('BROWSER_ACCEPTANCE '+JSON.stringify({passed,scenarios:['landing','desktop checked plan','desktop open plan','mobile robot outage path','connected Leave Well → Recover Well'],artifacts}));
} finally {await browser.close();}
