import {navigateStudio} from './studioClient.js';
import './studioControls.css';
import {clockHTML,tickClock,decisionNoticeHTML} from './studioViews.js';
import {votingOpen} from './studioPolicy.js';
import {operatingConditionsHTML} from './xplayerFlowViews.js';
import {openingInputs} from './studioInputs.js';
import {mountPhoneStory} from './phoneFinalReveal.js';
import './leaveWellXplayerFlow.css';
import {ballot, openRunoff,choiceLabel} from './leaveWellXplayerFlow.js';
import {runoffHTML,impactHTML,responseHTML,strategyHTML,resultHTML} from './xplayerFlowViews.js';
import {perspectiveHTML,escapeHTML} from './perspectivePrompts.js';
import "./parityEvent.css";
import "./parityPhoneVisual.css";
import "./portfolioImpact.css";
import { capabilityImpact, designImpact, combinedImpact, strengthenImpact } from "./portfolioImpact.js";
import { normalizePhase, ONBOARDING_COPY, PARTICIPATION_COPY } from "./onboardingRuntime.js";
import { bindPlayer, resolveBoundPlayer, cleanJoinUrl, clearBoundPlayer } from "./playerIdentity.js";
import { canAfford, budgetOf, budgetConsequence } from "./xplayerRules.js";
import { load, all, join, vote, sub, PLAYER, ROOM, evaluate } from "./parityEngine.js";
import { CAPABILITIES, RESPONSES, asset, decision } from "./leaveWellExperience.js";
import './phoneMediaFit.css';
let root, s, d, p, t, refreshing = false, refreshAgain = false;
const q = (x) => document.querySelector(x), E = escapeHTML;
function soloUrl(){const u=new URL(location.href);u.search=new URLSearchParams({mode:'studio-solo',room:s.code,...(new URLSearchParams(location.search).get('preview')==='1'?{preview:'1'}:{})}).toString();return u.href}
function entry(){const reserved=d.players.filter(p=>p.seat_active!==false).length,open=s.studio_control?.registrationOpen!==false&&reserved<40;root.innerHTML=`<main class="phone studio-entry"><span>ARTHUR: BY DESIGN · DESIGN STUDIO</span><h1>HOW WILL YOU PLAY?</h1><p>Up to eight design teams, five players each. Independent players make their own choices.</p><div class="studio-entry-actions"><button id="choose-team" ${open?'':'disabled'}>JOIN YOUR DESIGN TEAM<small>${open?'I have a table number · '+(40-reserved)+' seats available':'Team places are full or registration is closed'}</small></button><button id="choose-independent">EXPLORE ON MY OWN<small>Independent choices · your own Arthur reveal</small></button></div><p>We record choices, your selected perspective and optional reflections for workshop insights. Anonymous participation is available.</p></main>`;root.querySelector('#choose-team').onclick=reg;root.querySelector('#choose-independent').onclick=()=>navigateStudio({mode:'studio-solo',room:s.code})}
function reg() {
  root.innerHTML = `<main class="phone registration studio-phone"><span>ARTHUR: BY DESIGN \xB7 LIVE DESIGN STUDIO</span><h1>WELCOME TO THE DESIGN STUDIO.</h1><p class="studio-phone-lede">You\u2019re joining a table design team.</p><div class="studio-phone-note"><b>ON YOUR PHONE</b><p>Join with your email or anonymously, then choose the table number displayed in front of you.</p><p>Add a few words, discuss choices with your table, and make decisions together.</p></div><label>YOUR PERSPECTIVE<select id="role"><option value="">Select your perspective</option><option>Architecture / Interior Design</option><option>Engineering</option><option>Clinical Care</option><option>Healthcare Operations</option><option>Digital / Technology / AI</option><option>Patient Experience</option><option>Strategy / Leadership</option><option>Research / Education</option><option>Other</option></select></label><label>EMAIL <small>Optional if you continue anonymously</small><input id="email" type="email" placeholder="you@company.com"></label><label class="consent-line"><input id="consent" type="checkbox"> <span><b>Send me the design imagery created from my decisions after the workshop.</b><small>Optional. This applies only if you join with an email.</small></span></label><button id="e">CONTINUE WITH EMAIL</button><button id="a" class="secondary">CONTINUE ANONYMOUSLY</button><p class="studio-phone-stay">Keep your phone open. We\u2019ll begin together.</p><p id="err"></p></main>`;
  q("#e").onclick = () => tables("email");
  q("#a").onclick = () => tables("anonymous");
}
function tables(mode) {
  let role = q("#role").value, email = q("#email").value.trim(), consent = !!q("#consent")?.checked;
  if (!role) return q("#err").textContent = "Select your perspective.";
  if (mode === "email" && !/^\S+@\S+\.\S+$/.test(email)) return q("#err").textContent = "Enter a valid email or continue anonymously.";
  let alias = mode === "anonymous" ? "ARTHUR-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 5).toUpperCase() : null;
  root.innerHTML = `<main class="phone"><h1>CHOOSE YOUR TABLE</h1>${alias ? `<p>You are <b>${alias}</b></p>` : ""}<div class="tablegrid">${[1,2,3,4,5,6,7,8].map(i=>{const team=d.teams.find(t=>t.table_name==='Table '+i),count=d.players.filter(p=>p.team_id===team?.id&&p.seat_active!==false).length;return `<button data-t="Table ${i}" ${count>=5||s.studio_control?.registrationOpen===false?'disabled':''}>TABLE ${i} · ${count}/5</button>`}).join('')}</div><button id="join" disabled>JOIN TABLE</button><p id="err"></p><button id="instead-solo">EXPLORE ON MY OWN</button></main>`;
  root.querySelector('#instead-solo').onclick=()=>navigateStudio({mode:'studio-solo',room:s.code});
  let table;
  document.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => {
    table = b.dataset.t;
    document.querySelectorAll("[data-t]").forEach((x) => x.classList.toggle("on", x === b));
    q("#join").disabled = false;
  });
  q("#join").onclick = async () => {
    try {
      let x = await join({ session: s, table, email: mode === "email" ? email : null, alias, role, consent: mode === "email" && consent });
      p = x.player;
      t = x.team;
      bindPlayer(s.code, p.id);
      cleanJoinUrl();
      await refresh();
    } catch (e) {
      q("#err").textContent = e.message;
    }
  };
}
function mine(k) {
  return d.votes.find((v) => v.player_id === p.id && v.decision === k);
}
async function cast(k,c){try{await vote({session:s,team:t,player:p,key:k,choice:c});await refresh()}catch(err){showError(err.message)}}
function showError(message){document.querySelector('.flow-error')?.remove();const box=document.createElement('p');box.className='flow-error';box.setAttribute('role','alert');box.textContent=message;box.onclick=()=>box.remove();document.body.appendChild(box)}
function wait(h, c, i) {
  return `<main class="phone wait">${i ? `<img src="${asset(i)}">` : ""}<h1>${h}</h1><p>${c}</p></main>`;
}
function journeyMap() {
  let f = normalizePhase(s?.phase), leave = ["meet", "opening", "reflection", "journey", "needs", "rules", "card", "invest", "activation", "design", "designReveal", "adapt", "event", "impact", "respond", "result", "finalReveal", "principles"].includes(f);
  return `<nav class="journey-map" aria-label="Arthur journey"><span class="${leave ? "active" : ""}"><b>01</b> LEAVE WELL<small>Hospital \u2192 Home</small></span><i></i><span><b>02</b> RECOVER WELL<small>At Home</small></span><i></i><span><b>03</b> LIVE WELL<small>In the Community</small></span></nav>`;
}
function applyPhoneChrome() {
  let main = root?.querySelector?.("main.phone");
  if (main && !main.querySelector(":scope > .journey-map")) main.insertAdjacentHTML("afterbegin", journeyMap());
  if(main&&p&&!main.querySelector('[data-player-reference]'))main.insertAdjacentHTML('beforeend',`<small data-player-reference>PLAYER REFERENCE · ${E(p.id.slice(0,8))}</small>`);
}
function renderScreen(forceReflection=false) {
  if(p.seat_active===false)return root.innerHTML=`<main class="phone"><h1>YOUR TEAM SEAT WAS RELEASED</h1><p>Your previous votes remain in the record. You can play independently.</p><a href="${E(soloUrl())}">EXPLORE ON MY OWN</a></main>`;
  if(t.game_state?.ballot_pending?.phase===s.phase)return root.innerHTML=wait("YOUR TABLE’S VOTE IS RECORDED","Other tables are discussing a runoff. Your received votes remain frozen until the facilitator reveals the decision.");
  if(t.status==="inactive"&&normalizePhase(s.phase)!=="journey")return root.innerHTML=wait("YOUR TABLE IS PAUSED","The facilitator continued without a vote from your table. Follow the room screen for the discussion.");
  let f = forceReflection?'principles':normalizePhase(s.phase);
  if(openRunoff(t,f))return root.innerHTML=runoffHTML(t,f,p,d.votes);
  if(f==='impact')return root.innerHTML=impactHTML(t,p,d.votes);
  if(f==='respond')return root.innerHTML=responseHTML(t,p,d.votes);
  if(f==='adapt')return root.innerHTML=strategyHTML(t,p,d.votes);
  if(f==='result')return root.innerHTML=resultHTML(t);

  if (f === "meet") return root.innerHTML = `<main class="phone team-standby"><span>ARTHUR: BY DESIGN \xB7 LIVE DESIGN STUDIO</span><small>YOU JOINED</small><h1>${E(t?.table_name || "YOUR DESIGN TEAM")}</h1><div class="standby-mark"><i></i><i></i><i></i></div><h2>YOU\u2019RE IN.</h2><p>Keep this phone open. The facilitator will begin the shared story when every design team is ready.</p><div class="standby-note"><b>WHAT HAPPENS NEXT</b><p>You\u2019ll add a few words, discuss choices with your table and vote together.</p></div></main>`;
  if (f === "opening") {
    let v = mine("opening_challenge");
    root.innerHTML = `<main class="phone"><img src="${asset("arthur-leave-well.png")}"><h1>WHAT IS THE BIGGEST CHALLENGE ARTHUR FACES GETTING HOME SAFELY?</h1>${v ? "<p>Your response is saved.</p>" : '<textarea id="thought" placeholder="Enter a few words\u2026"></textarea><button id="send">SUBMIT MY THOUGHT</button><button id="skip">SKIP FOR NOW</button>'}</main>`;
    if (!v) {
      q("#send").onclick = () => {
        let text = q("#thought").value.trim();
        if (text) cast("opening_challenge", text);
      };
      q("#skip").onclick = () => cast("opening_challenge", "[SKIPPED]");
    }
    return;
  }
  if (f === "reflection") {
    let all2 = d.votes.filter((v) => v.decision === "opening_challenge" && v.choice !== "[SKIPPED]"), mineText = all2.find((v) => v.player_id === p.id)?.choice, phrases = openingInputs(d.votes).slice(0, 25);
    return root.innerHTML = `<main class="phone phone-reflection-design"><span>YOUR FIRST INSTINCT IS NOW PART OF THE ROOM.</span><h1>ARTHUR\u2019S CHALLENGE,<br>IN YOUR WORDS.</h1><div class="phone-response-field">${phrases.map((v, i) => `<b class="${v.player_id === p.id ? "mine" : ""} p${i % 4}">\u201C${E(v.choice)}\u201D</b>`).join("") || '<b class="mine">The room is starting here.</b>'}</div>${mineText ? `<div class="my-instinct"><small>YOUR RESPONSE</small><strong>\u201C${E(mineText)}\u201D</strong></div>` : ""}<p><b>Different perspectives. One Arthur.</b><br>Keep yours in mind as your table begins to design.</p></main>`;
  }
  if (f === "journey") return root.innerHTML = `<main class="phone journey-phone-locked"><span>ARTHUR: BY DESIGN</span><h1>A JOURNEY OF CARE.<br>A LIFETIME OF POSSIBILITY.</h1><p>${t.game_state?.journey_complete?"Leave Well is complete. The facilitator can start a fresh Leave Well room. Recover Well and Live Well are coming later.":"Today we begin with Leave Well."}</p><div class="phone-journey-locked">${[["arthur-leave-well.png", "\u2197", "LEAVE WELL", "Hospital \u2192 Home"], ["arthur-recover-well.png", "\u2302", "RECOVER WELL", "At Home"], ["arthur-live-well.png", "\u25CE", "LIVE WELL", "In the Community"]].map((a, i) => `<article class="${i === 0 ? "active" : ""}"><img src="${asset(a[0])}"><div><i>${a[1]}</i><h2>${a[2]}</h2><p>${a[3]}</p></div></article>`).join("")}</div><div class="today-bar">${t.game_state?.journey_complete?"LEAVE WELL COMPLETE · FOLLOW THE FACILITATOR":"TODAY: LEAVE WELL"}</div></main>`;
  if (f === "needs") return root.innerHTML = `<main class="phone needs-phone-locked"><img class="phone-hero-locked" src="${asset("arthur-leave-well.png")}"><span>LEAVE WELL \xB7 THE CHALLENGE</span><h1>FOUR THINGS MATTER.</h1><div class="phone-lens"><b><i>?</i>UNDERSTAND</b><b><i>\u2192</i>MOVE</b><b><i>\u221E</i>CONNECT</b><b><i>\u2713</i>TRUST</b></div>${Object.entries({ UNDERSTAND: "Does Arthur know what happened, what changed and what comes next?", MOVE: "Can Arthur move safely and confidently from hospital to home?", CONNECT: "Can Arthur stay connected to medications, people and follow-up?", TRUST: "Does Arthur trust what to do next and who will respond?" }).map(([n, c]) => `<article><h2>${n}</h2><p>${c}</p></article>`).join("")}<div class="phone-challenge"><b>YOUR CHALLENGE</b><p>Design an environment that helps Arthur leave well.</p></div></main>`;
  if (f === "rules") return root.innerHTML = `<main class="phone rules-phone-locked"><img class="phone-hero-locked" src="${asset("arthur-leave-well.png")}"><b class="instruction-pill">HOW TO PLAY</b><span>INSTRUCTION \xB7 HOW THE GAME WORKS</span><h1>${PARTICIPATION_COPY.join.decision}</h1><p>${PARTICIPATION_COPY.join.challenge}</p><h2>HOW WILL WE DESIGN ARTHUR\u2019S PATH?</h2><div class="phone-action-thread">${[["\u25CE", "CHOOSE", "Invest in AI-powered options."], ["\u25C7", "DESIGN", "Make it work here."], ["\u2197", "ADAPT", "Strengthen or extend."], ["\u03DF", "RESPOND", "Conditions change."]].map((x) => `<article><i>${x[0]}</i><h2>${x[1]}</h2><p>${x[2]}</p></article>`).join("")}</div><div class="phone-lens"><b><i>?</i>UNDERSTAND</b><b><i>\u2192</i>MOVE</b><b><i>\u221E</i>CONNECT</b><b><i>\u2713</i>TRUST</b></div><div class="phone-resource-locked"><small>YOUR RESOURCES</small><b>\u25C6 7 CAPITAL</b><b>\u25CF 6 CHANGE</b><p>Capital funds what you build. Change is the capacity to implement it. Invest in up to 2 AI-powered options.</p></div></main>`;
  if (f === "card") return root.innerHTML = `<main class="phone card-phone-solo"><b class="instruction-pill">HOW TO PLAY</b><span>INSTRUCTION \xB7 SAMPLE CARD</span><h1>HOW TO READ AN<br>INVESTMENT CARD.</h1><p class="card-guide-thesis"><b>Technology creates the capability.</b> Design determines Arthur\u2019s experience.</p><article class="phone-sample-investment"><img src="${asset("capability-ambient.png")}"><div class="sample-meta"><b>SAMPLE CARD</b><strong>\u25C6 3 \xB7 \u25CF 2</strong></div><h2>SMART DISCHARGE</h2><p>AI turns the discharge conversation into a plan Arthur can take home.</p><p><small>WHAT IT DOES</small><br><b>Creates one take-home plan.</b></p><p><small>WHY ARTHUR CARES</small><br>Arthur knows what changed and what comes next.</p><p><small>TO MAKE IT WORK</small><br>Someone must confirm and own the plan.</p><div class="design-consideration"><small>DESIGN CONSIDERATION</small><b>Give Arthur privacy and a place to review the plan before leaving.</b></div><details class="learn-more"><summary>LEARN MORE</summary><p><b>Technology can</b><br>Turn the discharge conversation into a plan Arthur can take home.</p><p><b>Design must</b><br>Support privacy, participation, understanding and follow-through.</p></details></article></main>`;
  if (f === "invest") {
    let used = (t.investments || []).map((i) => i.capabilityId), round = used.length + 1;
    if (used.length >= 1 && t.status !== "extend") return root.innerHTML = wait("YOUR TABLE’S RECORDED PATH: STRENGTHEN", "Your current design is being reinforced. Follow the room screen while other tables complete their path.");
    let k = decision("capability", t), v = mine(k);
    root.innerHTML = `<main class="phone investment-phone"><span>ROUND ${round} \xB7 YOUR TABLE</span><h1>${round === 1 ? "WHAT WILL YOU INVEST FIRST?" : "WHAT WILL YOU ADD NEXT?"}</h1><div class="phone-budget"><b>\u25C6 ${t.capital} CAPITAL</b><b>\u25CF ${t.change_budget} CHANGE</b></div><p class="investment-help">Choose an affordable AI-powered capability. Each card shows Arthur\u2019s gain, the design challenge and cost.</p>${Object.entries(CAPABILITIES).filter(([id]) => !used.includes(id)).map(([id, c]) => `<article><img src="${asset(c.image)}"><h2>${c.title}</h2><p>${c.line}</p><p><b>ARTHUR GAINS</b><br>${c.arthur}</p><p><b>DESIGN CHALLENGE</b><br>${c.challenge}</p><b>\u25C6${c.cost[0]} \xB7 \u25CF${c.cost[1]}</b><p class="budget-consequence">${E(budgetConsequence(t,'invest',id))}</p><button data-c="${id}" ${!canAfford(t, id) ? "disabled" : ""} class="${v?.choice === id ? "selected-vote" : ""}">${v?.choice === id ? "VOTED" : canAfford(t, id) ? "INVEST" : `NEEDS ${c.cost[0]} \u25C6 \xB7 ${c.cost[1]} \u25CF`}</button></article>`).join("")}</main>`;
    document.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => cast(k, b.dataset.c));
    return;
  }
  if (f === "activation") {
    if(t.status==="ready")return root.innerHTML=`<main class="phone">${strengthenImpact(t.investments?.at(-1),CAPABILITIES)}<p>Follow the facilitator while other tables complete their second investment.</p></main>`;
    let investments = t.investments || [], inv = investments.at(-1), capId = t.locked_capability || inv?.capabilityId, c = CAPABILITIES[capId], round = investments.length + 1, impact = capabilityImpact(capId, investments);
    return c ? root.innerHTML = `<main class="phone table-reveal-phone capability-impact-phone"><span>${E(t.table_name)} \xB7 ROUND ${round} \xB7 YOUR TABLE CHOSE</span><img src="${asset(c.activated)}"><h1>${c.title}</h1><p><b>ARTHUR GAINS</b><br>${c.arthur}</p><p><b>WHAT THIS MAKES POSSIBLE</b><br>${c.line}</p>${impact}<div class="reveal-next">Next, your table will decide how this capability changes the space, systems and delivery model.</div></main>` : root.innerHTML = wait("WAITING FOR YOUR TABLE", "Your investment is being confirmed.");
  }
  if (f === "design") {
    if (t.status === "ready") return root.innerHTML = wait("YOUR TABLE’S RECORDED PATH: STRENGTHEN", "Your design is locked and reinforced. Other tables are completing their second investment. Follow the room screen for the comparison.");
    let c = CAPABILITIES[t.locked_capability];
    if (!c) return root.innerHTML = wait("WAITING FOR THE TABLE RESULT", "The investment vote is locking.");
    let k = decision("design", t), v = mine(k);
    root.innerHTML = `<main class="phone"><h1>${c.question}</h1><div class="lens"><b>USEFUL</b><b>RESILIENT</b><b>HUMAN</b></div>${Object.entries(c.options).map(([id, o]) => `<article><img src="${asset(o[1])}"><h2>${o[0]}</h2><p>${o[2]}</p><p><b>DESIGN CONSIDERATION</b><br>${o[3]}</p><button data-c="${id}" class="${v?.choice === id ? "selected-vote" : ""}">${v?.choice === id ? "VOTED" : "CHOOSE"}</button></article>`).join("")}</main>`;
    document.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => cast(k, b.dataset.c));
    return;
  }
  if (f === "designReveal") {
    if(t.investments?.length===1&&t.investments[0].strengthened)return root.innerHTML=`<main class="phone">${strengthenImpact(t.investments[0],CAPABILITIES)}</main>`;
    let investments = t.investments || [], inv = investments.at(-1), c = inv && CAPABILITIES[inv.capabilityId], o = c?.options?.[inv.commitmentId], impact = inv ? designImpact(inv.capabilityId, inv.commitmentId) : "", combined = investments.length > 1 ? combinedImpact(investments, CAPABILITIES) : "";
    return o ? root.innerHTML = `<main class="phone table-reveal-phone design-impact-phone"><span>${E(t.table_name)} \xB7 YOUR TABLE DESIGNED</span><img src="${asset(o[1])}"><h1>${o[0]}</h1><p>${o[2]}</p><p><b>DESIGN CONSIDERATION</b><br>${o[3]}</p><p><b>WHY THIS MATTERS</b><br>${c.insight}</p>${impact}${combined}</main>` : root.innerHTML = wait("WAITING FOR YOUR TABLE", "Your design decision is being confirmed.");
  }
  if (f === "event") {
    let e = evaluate(t, "handoff_changed"), portfolio = (t.investments || []).map((i) => CAPABILITIES[i.capabilityId]?.title).filter(Boolean), k = "prediction", v = mine(k);
    root.innerHTML = `<main class="phone macro-event-phone"><span>MACRO EVENT \xB7 HANDOFF CHANGED</span><h1>THREE THINGS CHANGE AT ONCE.</h1><div class="phone-event-collisions"><article><b>01</b><p>Transportation arrives 20 minutes early.</p></article><article><b>02</b><p>Arthur\u2019s family contact is unavailable.</p></article><article><b>03</b><p>The receiving team has the original plan.</p></article></div>${operatingConditionsHTML()}<section class="prediction-vote"><small>YOUR PREDICTION</small><h2>WILL YOUR DESIGN HOLD?</h2><div>${["YES", "NOT SURE", "NO"].map((x) => `<button data-prediction="${x}" class="${v?.choice === x ? "selected-vote" : ""}">${v?.choice === x ? "VOTED \xB7 " : ""}${x}</button>`).join("")}</div><p>${v ? "Your opinion is saved. It does not change the outcome; you can change it until the facilitator advances." : "Your opinion does not change the outcome. The facilitator can continue with any number of predictions."}</p></section></main>`;
    document.querySelectorAll("[data-prediction]").forEach((b) => b.onclick = () => cast(k, b.dataset.prediction));
    return;
  }
  if (f === "principles") return root.innerHTML = `<main class="phone principles-phone"><span>ARTHUR: BY DESIGN</span><h1>WHAT WILL ARTHUR BE ABLE TO RELY ON?</h1><p>Technology created possibilities. Your table\u2019s design, operating commitments and response determined what held.</p><div><b>UNDERSTAND</b><b>MOVE</b><b>CONNECT</b><b>TRUST</b></div></main>`;
}
let showReflection=false;
function render(){
 if(p.seat_active===false){renderScreen();applyPhoneChrome();return}
 const f=normalizePhase(s.phase),finished=['result','finalReveal','principles'].includes(f)&&t.status!=='inactive';
 if(finished&&!showReflection){mountPhoneStory(root,{team:t,player:p,session:s,votes:d.votes,onReflect:()=>{showReflection=true;render()}});applyPhoneChrome();return}
 if(!finished)showReflection=false;
 renderScreen(finished&&showReflection);applyPhoneChrome();const main=root.querySelector('main');if(main){main.insertAdjacentHTML('afterbegin',clockHTML(s)+decisionNoticeHTML(t));tickClock(root,s)}
 if(main){main.dataset.capability=t.locked_capability||t.investments?.at(-1)?.capabilityId||'';main.insertAdjacentHTML('beforeend',f==='impact'?`<aside class="perspective-prompt"><small>YOUR PERSPECTIVE · ${E(p.role_type||'Other')}</small><p>Consider what Arthur still needs. Follow the facilitator; no action is required on this screen.</p></aside>`:perspectiveHTML(p,f,d.votes,t));const save=root.querySelector('#save-perspective');if(save)save.onclick=()=>cast(save.dataset.key,root.querySelector('#perspective-thought').value.trim())}
 if(finished&&showReflection){const button=document.createElement('button');button.id='replay-table-reveal';button.textContent='BACK TO MY STORY';button.onclick=()=>{showReflection=false;render()};main?.appendChild(button)}
 root.querySelectorAll('[data-flow-choice]').forEach(b=>b.onclick=()=>cast(ballot(t,f).key,b.dataset.flowChoice));
 const source=t.game_state?.last_decision?.source;if(source==='random_after_runoff_tie'&&main){const n=document.createElement('p');n.className='flow-notice';n.textContent='A tied runoff was resolved by a disclosed random selection.';main.prepend(n)}
}
function updateDiagnostic() {
  if(new URLSearchParams(location.search).get("debug")!=="1")return;
  if (!root || !s) return;
  let f = normalizePhase(s.phase), type = f === "invest" ? "capability" : f === "design" ? "design" : f === "adapt" ? "strategy" : f === "event" ? "prediction" : f === "respond" ? "response" : null, key = type && t ? decision(type, t) : null, myVote = key && p ? d?.votes?.find((v) => v.player_id === p.id && v.decision === key) : null, el = document.querySelector("#xplayer-diagnostic");
  if (!el) {
    el = document.createElement("aside");
    el.id = "xplayer-diagnostic";
    el.style.cssText = "position:fixed;top:6px;right:6px;width:min(46vw,190px);max-height:118px;overflow:auto;z-index:2147483647;background:#111;color:#fff;padding:6px;border:2px solid #f0b487;font:8px/1.2 monospace;word-break:break-all;opacity:.88;box-sizing:border-box";
    document.body.appendChild(el);
  }
  el.innerHTML = `<b style="color:#f0b487">XPLAYER DIAG</b><br>ROOM ${E(s?.code || "-")} \xB7 PHASE ${E(f || "-")}<br>PLAYER ${E(p?.id || "-")}<br>PLAYER TEAM_ID ${E(p?.team_id || "-")}<br>RESOLVED TABLE ${E(t?.id || "-")} \xB7 ${E(t?.table_name || "-")}<br>KEY ${E(key || "-")} \xB7 MY VOTE ${E(myVote?.choice || "-")}<br>TABLE LOCK ${E(t?.locked_capability || t?.locked_commitment || "-")} \xB7 STATUS ${E(t?.status || "-")}<br>PLAYERS ${d?.players?.length || 0} \xB7 TEAMS ${d?.teams?.length || 0} \xB7 VOTES ${d?.votes?.length || 0}`;
}
function futureDraft() {
  let el = document.querySelector("#thought") || document.querySelector("#perspective-thought");
  return el ? { id:el.id, key:el.dataset.reflectionKey, open:el.closest("details")?.open, value: el.value, start: el.selectionStart, end: el.selectionEnd, focused: document.activeElement === el } : null;
}
function restoreDraft(draft) {
  if (!draft) return;
  let el = document.querySelector("#thought") || document.querySelector("#perspective-thought");
  if (!el) return;
  if(el.id!==draft.id||el.dataset.reflectionKey!==draft.key)return;
  if(draft.open&&el.closest("details"))el.closest("details").open=true;
  el.value = draft.value;
  if (draft.focused) {
    el.focus();
    try {
      el.setSelectionRange(draft.start, draft.end);
    } catch {
    }
  }
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let refreshVersion = 0, retryTimer = null;
async function coherentSnapshot(code, boundPlayerId, attempts = 6) {
  let last = null;
  for (let i = 0; i < attempts; i++) {
    let session = await load(code), data = await all(session);
    last = { session, data };
    if (!boundPlayerId) return last;
    let player = data.players.find((x) => x.id === boundPlayerId && x.session_id === session.id), team = player && data.teams.find((x) => x.id === player.team_id);
    if (player && team) return { session, data, player, team };
    await pause(120 * (i + 1));
  }
  return last;
}
function scheduleRefresh() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => refresh(), 500);
}
async function refresh() {
  if (refreshing) {
    refreshAgain = true;
    return;
  }
  refreshing = true;
  let version = ++refreshVersion;
  try {
    do {
      refreshAgain = false;
      let bound = resolveBoundPlayer(s.code, d.players, s.id), snapshot = await coherentSnapshot(s.code, bound?.id || p?.id || null);
      if (version !== refreshVersion) continue;
      if (!snapshot) {
        scheduleRefresh();
        continue;
      }
      let nextSession = snapshot.session, nextData = snapshot.data;
      if (!p) {
        s = nextSession;
        d = nextData;
        if(root.querySelector('.studio-entry'))entry();
        root.querySelectorAll('[data-t]').forEach(b=>{const team=d.teams.find(t=>t.table_name===b.dataset.t),count=d.players.filter(x=>x.team_id===team?.id&&x.seat_active!==false).length;b.textContent=b.dataset.t.toUpperCase()+' · '+count+'/5';b.disabled=count>=5||s.studio_control?.registrationOpen===false;if(b.classList.contains('on')&&b.disabled&&root.querySelector('#join'))root.querySelector('#join').disabled=true});
        updateDiagnostic();
        continue;
      }
      let current = snapshot.player || resolveBoundPlayer(nextSession.code, nextData.players, nextSession.id), resolvedTeam = snapshot.team || current && nextData.teams.find((x) => x.id === current.team_id);
      if (!current || !resolvedTeam) {
        updateDiagnostic();
        scheduleRefresh();
        continue;
      }
      let draft = futureDraft(), previous = { s, d, p, t };
      s = nextSession;
      d = nextData;
      p = current;
      t = resolvedTeam;
      try {
        render();
        restoreDraft(draft);
        updateDiagnostic();
      } catch (err) {
        console.error("Phone render failed; keeping last valid state", err);
        s = previous.s;
        d = previous.d;
        p = previous.p;
        t = previous.t;
        updateDiagnostic();
        scheduleRefresh();
      }
    } while (refreshAgain);
  } catch (err) {
    console.error("Phone snapshot refresh failed; keeping last valid screen", err);
    scheduleRefresh();
  } finally {
    refreshing = false;
  }
}
async function start(m) {
  root = m;
  setInterval(()=>{if(s)tickClock(root,s)},250);
  // Recover from missed realtime notifications without rebuilding an active draft on every tick.
  setInterval(async()=>{if(!s||refreshing||document.visibilityState==='hidden')return;try{const next=await load(s.code);if(!p||next.phase!==s.phase||Number(next.xplayer_revision||0)!==Number(s.xplayer_revision||0))await refresh();else s._clockOffset=next._clockOffset||0}catch{/* Keep the last valid screen and retry. */}},10000);
  document.addEventListener('visibilitychange',()=>{if(s&&document.visibilityState!=='hidden')refresh()});
  globalThis.addEventListener?.('online',()=>{if(s)refresh()});
  let code = new URLSearchParams(location.search).get("room");
  if (!code) {
    root.innerHTML = '<main class="phone"><h1>JOIN A ROOM</h1><input id="code"><button id="go">CONTINUE</button></main>';
    q("#go").onclick = () => location.search = `?mode=join&room=${encodeURIComponent(q("#code").value.trim().toUpperCase())}${new URLSearchParams(location.search).get("preview")==="1"?"&preview=1":""}`;
    return;
  }
  let initialSession = await load(code), initialData = await all(initialSession);
  s = initialSession;
  d = initialData;
  cleanJoinUrl();
  let bound = resolveBoundPlayer(s.code, d.players, s.id);
  if (bound) {
    let snapshot = await coherentSnapshot(s.code, bound.id);
    if (snapshot?.player && snapshot?.team) {
      s = snapshot.session;
      d = snapshot.data;
      p = snapshot.player;
      t = snapshot.team;
    }
  }
  sub(s, refresh);
  setInterval(() => {
    updateDiagnostic();
    applyPhoneChrome();
  }, 300);
  if (!p) {
    entry();
    updateDiagnostic();
    return;
  }
  render();
  updateDiagnostic();
}
export {
  start
};
