import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.ARTHUR_BASE_URL||'http://127.0.0.1:4177/';
const artifacts=process.env.ARTHUR_BROWSER_ARTIFACTS||'/tmp/arthur-live-browser';
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0;
const errors=[];
function monitor(page,name){page.on('pageerror',err=>errors.push(name+': '+err.message))}
async function width(page,name){const rect=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(rect.scroll<=rect.client+3,name+': overflow '+JSON.stringify(rect))}
async function step(page,selector){
 const button=page.locator(selector).first();
 for(let i=0;i<10;i++){
  if(await button.isVisible()){await button.click();return}
  const next=page.locator('.mobile-choice-pager:not([hidden]) button').last();
  if(!(await next.isVisible())||await next.isDisabled())break;
  await next.click();
 }
 throw Error('Could not access selection '+selector);
}
async function play(page,{name,widthPx,extend=false,connected=false}={}){
 monitor(page,name);
 if(!connected)await page.goto(base+'?mode=live-standalone');
 await page.locator('[data-live-phase="intro"]').waitFor();
 await width(page,name+' intro');
 await page.screenshot({path:artifacts+'/'+name+'-intro.png',fullPage:true});
 await step(page,'[data-next]');
 await page.locator('[data-live-phase="family"]').waitFor();
 await step(page,'[data-family="services"]');
 await page.locator('[data-live-phase="design"]').waitFor();
 assert.equal(await page.locator('.lw-paged > article:visible').count(),widthPx<=700?1:3);
 await step(page,'[data-design="4A"]');
 await page.locator('[data-live-phase="strategy"]').waitFor();
 await width(page,name+' strategy');
 await page.screenshot({path:artifacts+'/'+name+'-strategy.png',fullPage:true});
 if(extend){
  await step(page,'[data-strategy="extend"]');
  await page.locator('[data-live-phase="secondFamily"]').waitFor();
  await step(page,'[data-family="wellness"]');
  await page.locator('[data-live-phase="secondDesign"]').waitFor();
  await step(page,'[data-design="3C"]');
 }else await step(page,'[data-strategy="strengthen"]');
 await page.locator('[data-live-phase="event"]').waitFor();
 await width(page,name+' event');
 const budget=await page.locator('.lw-budget').innerText();
 assert.ok(budget.includes('Capital')&&budget.includes('Change'));
 await page.screenshot({path:artifacts+'/'+name+'-event.png',fullPage:true});
 await page.reload();
 await page.locator('[data-live-phase="event"]').waitFor();
 await step(page,'[data-next]');
 await page.locator('[data-live-phase="response"]').waitFor();
 assert.equal(await page.locator('.lw-paged > article:visible').count(),widthPx<=700?1:4);
 await step(page,'[data-response="use"]');
 await page.locator('[data-live-phase="outcome"]').waitFor();
 await width(page,name+' outcome');
 await page.screenshot({path:artifacts+'/'+name+'-outcome.png',fullPage:true});
 await step(page,'[data-next]');
 await page.locator('[data-live-phase="futures"]').waitFor();
 assert.equal(await page.locator('.lw-futures article.chosen').count(),1);
 await width(page,name+' futures');
 await page.screenshot({path:artifacts+'/'+name+'-futures.png',fullPage:true});
 await step(page,'[data-next]');
 await page.locator('[data-live-phase="finale"]').waitFor();
 await width(page,name+' finale');
 await page.screenshot({path:artifacts+'/'+name+'-finale.png',fullPage:true});
 await page.reload();
 await page.locator('[data-live-phase="finale"]').waitFor();
 const saved=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('arthur-live-')));
 assert.ok(saved.length>0);
 passed++;
}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 await play(page,{name:'desktop-standalone',widthPx:1440});
 const phone=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await play(await phone.newPage(),{name:'phone-390-extend',widthPx:390,extend:true});
 const smaller=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
 await play(await smaller.newPage(),{name:'phone-375-strengthen',widthPx:375});
 const connected=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const cp=await connected.newPage();monitor(cp,'connected');await cp.goto(base);
 const id=await cp.evaluate(async()=>{
  const {evaluatePortfolio}=await import('/src/causalEngine.js');
  const {connectLeaveWell,recoveryStorageKey}=await import('/src/journeyBridge.js');
  const {createRecoveryRun,applyRecoveryAction,serializeRun}=await import('/src/recoverWell/recoveryRun.js');
  const investments=[{capabilityId:'ambient',commitmentId:'shared',strengthened:false},{capabilityId:'meds',commitmentId:'pharmacy',strengthened:false}];
  const details=['route','information','coordination'].map(id=>({id,...evaluatePortfolio({activations:investments},id,'use')}));
  const evaluation={model:'causal-composite-readiness-v2',eventId:'handoff_changed',responseId:'use',outcome:details.some(x=>x.outcome==='EXPOSED')?'EXPOSED':details.some(x=>x.outcome==='STRAINED')?'STRAINED':'HOLDS',details};
  const entry=connectLeaveWell({runId:'live-browser-leave-1',team:{id:'live-browser-team-1',investments,game_state:{evaluation,responseId:'use',applied_decisions:{}}},completed:true,completedAt:'2026-11-20T19:30:00Z',experienceMode:'independent',sourceReturn:{mode:'studio-solo',preview:'1'}},{uuid:()=> 'live-browser-journey-1'});
  let r=createRecoveryRun({runId:'live-browser-recovery-1',handoff:entry.handoff,lineage:entry.lineage,scenarioId:'S2'});
  const actions=[['next',{}],['invest',{capabilityId:'response'}],['next',{}],['design',{designId:'4A'}],['next',{}],['strategy',{choice:'strengthen'}],['revealImpact',{}],['next',{}],['respond',{choice:'use'}],['next',{}],['next',{}]];
  for(const [i,[type,props]]of actions.entries())r=applyRecoveryAction(r,{id:'browser-'+i,type,...props});
  localStorage.setItem(recoveryStorageKey(entry.id),serializeRun(r));
  return entry.id;
 });
 await cp.goto(base+'?mode=journey&journey='+id);
 await cp.locator('a[href*="mode=live-well"]').waitFor();
 await cp.locator('a[href*="mode=live-well"]').click();
 await cp.locator('[data-live-phase="intro"]').waitFor();
 assert.ok((await cp.locator('main').innerText()).includes('Recover Well outcome'));
 await width(cp,'connected intro');
 await play(cp,{name:'connected-phone-390',widthPx:390,connected:true});
 assert.deepEqual(errors,[]);
 console.log('LIVE_BROWSER_ACCEPTANCE '+JSON.stringify({passed,checks:['desktop standalone','390px Extend','375px Strengthen','connected Leave→Recover→Live'],artifacts}));
}finally{await browser.close()}
