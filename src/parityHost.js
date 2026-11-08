import './leaveWellXplayerFlow.css';
import {DECISION_PHASES,ballot,tally,choiceLabel} from './leaveWellXplayerFlow.js';
import {evaluationHTML} from './xplayerFlowViews.js';
import {isPreview} from './xplayerBackend.js';
import {responseEligibility} from './xplayerRules.js';
import "./parityEvent.css";
import "./parityFacilitator.css";
import { normalizePhase } from "./onboardingRuntime.js";
import QRCode, { QRErrorCorrectLevel as L } from "./qr-bundle.js";
import { createRoom, load, all, phase, move, reveal, sub, advanceRoom, evaluate } from "./parityEngine.js";
import { FLOW, NEEDS, CAPABILITIES, RESPONSES, asset, selection } from "./leaveWellExperience.js";
let root, s, d, voteEndsAt = 0, voteTimer = null, facilitatorView = "story";
const E = (x) => String(x ?? "").replace(/[&<>]/g, (c2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c2]);
function qr(t) {
  let z = new QRCode(-1, L.M);
  z.addData(t);
  z.make();
  let n = z.getModuleCount(), q = "";
  for (let r = 0; r < n; r++) for (let c2 = 0; c2 < n; c2++) if (z.isDark(r, c2)) q += `M${c2 + 3} ${r + 3}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 6} ${n + 6}"><rect width="100%" height="100%" fill="white"/><path d="${q}"/></svg>`;
}
function url() {
  let u = new URL(location.href);
  u.search = "";
  u.hash = "";
  u.searchParams.set("mode", "join");
  u.searchParams.set("room", s.code)
  if(isPreview)u.searchParams.set("preview","1");
  return u.toString();
}
function selected() {
  let completed = d.teams.map(selection).find(Boolean);
  if (completed) return completed;
  let pending = d.teams.find((t) => t.locked_capability && CAPABILITIES[t.locked_capability]);
  return pending ? { i: null, c: CAPABILITIES[pending.locked_capability], o: null } : null;
}
function teamCurrent(team) {
  let inv = (team.investments || []).at(-1), capId = team.locked_capability || inv?.capabilityId, c2 = CAPABILITIES[capId], o = inv && c2?.options?.[inv.commitmentId];
  return { team, inv, capId, c: c2, o };
}
function roomActivation() {
  let rows = d.teams.filter((t) => d.players.some((p) => p.team_id === t.id)).map(teamCurrent).filter((x) => x.c);
  return `<section class="table-comparison"><span>TABLE REVEALS \xB7 INVESTMENT</span><h1>DIFFERENT TABLES. DIFFERENT BETS.</h1><p>Each player sees their own table\u2019s reveal on their phone.</p><div class="comparison-grid">${rows.map((x) => `<article><small>${E(x.team.table_name)}</small><img src="${asset(x.c.activated)}"><h2>${x.c.title}</h2><p>${x.c.arthur}</p></article>`).join("")}</div></section>`;
}
function roomDesign() {
  let rows = d.teams.filter((t) => d.players.some((p) => p.team_id === t.id)).map(teamCurrent).filter((x) => x.c);
  return `<section class="table-comparison"><span>NOW DESIGN AROUND IT</span><h1>EACH TABLE DESIGNS ITS OWN INVESTMENT.</h1><p>Phones show the three design choices for that table\u2019s locked capability.</p><div class="comparison-grid">${rows.map((x) => `<article><small>${E(x.team.table_name)}</small><img src="${asset(x.c.image)}"><h2>${x.c.title}</h2><p>${x.c.question}</p></article>`).join("")}</div></section>`;
}
function roomDesignReveal() {
  let rows = d.teams.filter((t) => d.players.some((p) => p.team_id === t.id)).map(teamCurrent).filter((x) => x.c && x.o);
  return `<section class="table-comparison"><span>TABLE REVEALS \xB7 DESIGN</span><h1>WHAT DID EACH TABLE DESIGN?</h1><div class="comparison-grid">${rows.map((x) => `<article><small>${E(x.team.table_name)}</small><img src="${asset(x.o[1])}"><h2>${x.o[0]}</h2><p>${x.o[2]}</p></article>`).join("")}</div></section>`;
}
function phaseDecision(t){return ballot(t,s.phase)?.key||null}
function statusModel(){const decisionPhase=DECISION_PHASES.includes(s.phase),rows=d.teams.map(t=>{const x=tally(t,s.phase,d.players,d.votes);return {t,people:x.people,key:x.ballot?.key,votes:x.cast,applicable:!!x.ballot,ready:!decisionPhase||!x.ballot||x.ready,runoff:x.ballot?.runoff}}),activeRows=rows.filter(x=>x.people.length&&x.applicable);return {rows,activeRows,decisionPhase,allReady:!decisionPhase||activeRows.length>0&&activeRows.every(x=>x.ready)}}
function participantLabel(p) {
  return p.participant_alias || p.initials || "PLAYER";
}
function facilitatorPanel() {
  let m = statusModel(), joined = d.players.length;
  return `<section class="facilitator-status"><div class="facilitator-status-head"><div><small>LIVE SESSION</small><strong>${joined} ${joined === 1 ? "PLAYER" : "PLAYERS"} JOINED</strong></div>${m.decisionPhase ? `<div class="advance-signal ${m.allReady ? "ready" : "waiting"}">${m.allReady ? "ALL ACTIVE TABLES READY" : "WAITING FOR VOTES"}</div>` : ""}</div><div class="table-status-grid">${m.rows.length ? m.rows.map((x) => `<article class="table-status ${x.ready ? "ready" : ""}"><div><b>${E(x.t.table_name)}</b><span>${x.people.length} joined</span></div><p>${x.people.length ? x.people.map((p) => `<span>${E(participantLabel(p))}</span>`).join("") : "<em>Waiting for players</em>"}</p>${x.key ? `<div class="vote-meter"><i style="width:${x.people.length ? Math.min(100, x.votes / x.people.length * 100) : 0}%"></i></div><small>${x.votes}/${x.people.length} voted</small>` : ""}</article>`).join("") : '<article class="table-status"><b>NO TABLES JOINED YET</b><p>Players will appear here as soon as they select a table.</p></article>'}</div></section>`;
}
function voteOptionsFor(row, p) {
  const b=ballot(row.t,p);if(b?.runoff)return b.options.map(id=>[id,choiceLabel(row.t,p,id),null]);
  if(p==="impact")return [["ready","READY FOR RESPONSE",null]];
  if (p === "invest") return Object.entries(CAPABILITIES).filter(([id]) => !(row.t.investments || []).some((i) => i.capabilityId === id)).map(([id, c2]) => [id, c2.title, c2.image]);
  if (p === "design") {
    let c2 = CAPABILITIES[row.t.locked_capability];
    return c2 ? Object.entries(c2.options).map(([id, o]) => [id, o[0], o[1]]) : [];
  }
  if (p === "adapt") return [["strengthen", "STRENGTHEN THIS DESIGN", null], ["extend", "EXTEND THE JOURNEY", null]];
  if (p === "event") return [["YES", "YES", null], ["NOT SURE", "NOT SURE", null], ["NO", "NO", null]];
  if (p === "respond") return Object.entries(RESPONSES).map(([id, x]) => [id, x[0], null]);
  return [];
}
function liveVoteBoard() {
  let p = normalizePhase(s.phase), m = statusModel(), remaining = Math.max(0, Math.ceil((voteEndsAt - Date.now()) / 1e3)), title = p === "invest" ? "WHERE IS THE ROOM INVESTING?" : p === "design" ? "HOW IS EACH TABLE DESIGNING AROUND IT?" : p === "adapt" ? "GO DEEPER OR GO BROADER?" : p === "event" ? "WILL THE DESIGNS HOLD?" : "HOW WILL THE TABLES RESPOND?";
  return `<section class="live-vote-room"><header><div><span>LIVE ROOM VIEW</span><h1>${title}</h1><p>Votes update in real time. Each table remains independent.</p></div><div class="vote-clock"><small>TIME TO VOTE</small><strong id="vote-clock">${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}</strong></div></header><div class="live-table-grid">${m.rows.filter((r) => r.people.length).map((r) => {
    let opts = voteOptionsFor(r, p);
    return `<article class="${r.applicable ? "" : "table-complete"}"><div class="table-head"><h2>${E(r.t.table_name)}</h2><b>${r.applicable ? `${r.votes}/${r.people.length} VOTED` : "PATH COMPLETE"}</b></div><div class="live-options">${opts.map(([id, title2, img]) => {
      let n = r.key ? d.votes.filter((v) => v.team_id === r.t.id && v.decision === r.key && v.choice === id).length : 0;
      return `<div class="live-option ${n ? "has-votes" : ""}">${img ? `<img src="${asset(img)}">` : ""}<span>${title2}</span><b>${n}</b></div>`;
    }).join("")}</div></article>`;
  }).join("")}</div></section>`;
}
function startVoteClock() {
  if (!voteEndsAt || voteEndsAt < Date.now()) voteEndsAt = Date.now() + 9e4;
  clearInterval(voteTimer);
  voteTimer = setInterval(() => {
    let el = document.querySelector("#vote-clock");
    if (!el) return;
    let n = Math.max(0, Math.ceil((voteEndsAt - Date.now()) / 1e3));
    el.textContent = `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
    if (!n) clearInterval(voteTimer);
  }, 250);
}
function body() {
  let p = normalizePhase(s.phase), x = selected();
  if (statusModel().decisionPhase && facilitatorView === "live_vote") return liveVoteBoard();
  const runoffs=d.teams.filter(t=>ballot(t,p)?.runoff);
  if(runoffs.length)return `<section><span>TABLE VOTING</span><h1>RUNOFF IN PROGRESS</h1><p>No table is charged until this decision is resolved. If a runoff ties again, a random choice is recorded and disclosed.</p>${runoffs.map(t=>`<article><h2>${E(t.table_name)}</h2><p>${ballot(t,p).options.map(id=>E(choiceLabel(t,p,id))).join(' / ')}</p></article>`).join('')}</section>`;
  if(p==='principles'){const entries=d.votes.filter(v=>v.decision==='reflection:condition'||v.decision==='reflection:takeaway');return `<section><span>LEAVE WELL · YOUR NEXT CONVERSATION</span><h1>WHAT DOES OUR TEAM NEED TO RESOLVE?</h1><p>These optional reflections are not scored. Bring one to a project discussion with your team or Stantec.</p>${entries.map(v=>{const player=d.players.find(p=>p.id===v.player_id),team=d.teams.find(t=>t.id===v.team_id);return `<article><small>${E(team?.table_name)} · ${E(player?.role_type)} · ${v.decision==='reflection:condition'?'REQUIRED CONDITION':'QUESTION TO INVESTIGATE'}</small><p>${E(v.choice)}</p></article>`}).join('')||'<p>Discuss: which assumption did the disruption challenge, who owns the remaining gap, and what would you test next?</p>'}</section>`}
  if(p==='impact')return `<section><span>AFTER YOUR PREDICTION</span><h1>YOUR DESIGNS HAVE BEEN TESTED.</h1><p>Read your table’s impact on your phone, then select Continue to response. The facilitator advances when everyone is ready.</p><div class="comparison-grid">${d.teams.filter(t=>t.status!=='inactive'&&d.players.some(p=>p.team_id===t.id)).map(t=>`<article><h2>${E(t.table_name)}</h2><p>PREDICTION · ${E(t.game_state?.prediction||'Not recorded')}</p><h2>${evaluate(t).outcome}</h2>${evaluationHTML(evaluate(t))}</article>`).join('')}</div></section>`;
  if (p === "meet") {
    let teams = (d.teams || []).map((t) => {
      let n = (d.players || []).filter((x2) => x2.team_id === t.id).length;
      return n ? `<span>${E(t.table_name)} \xB7 ${n} JOINED</span>` : "";
    }).join("");
    return `<section class="xwelcome"><div class="xwelcome-kicker">ARTHUR: BY DESIGN \xB7 LIVE DESIGN STUDIO</div><div class="xwelcome-grid"><div><h1>WELCOME TO THE<br>DESIGN STUDIO.</h1><p class="xwelcome-lede">Today, your table becomes a design team.</p><div class="xwelcome-steps"><article><b>01</b><div><strong>SCAN THE QR CODE</strong><span>Open the invitation on your phone.</span></div></article><article><b>02</b><div><strong>ENTER YOUR INFO</strong><span>Join with email or continue anonymously.</span></div></article><article><b>03</b><div><strong>FIND YOUR TABLE</strong><span>Select the number displayed on your table.</span></div></article><article><b>04</b><div><strong>STAY WITH US</strong><span>Keep your phone open. We begin together.</span></div></article></div><p class="xwelcome-close">Same challenge. Different design teams.<br><b>What will your table make possible?</b></p></div><div class="xwelcome-join"><div class="xwelcome-qr">${qr(url())}</div><span>SCAN TO JOIN</span><h2>ROOM ${s.code}</h2><p>${d.players.length} ${d.players.length === 1 ? "PLAYER" : "PLAYERS"} JOINED</p><div class="xwelcome-teams"><b>DESIGN TEAMS FORMING</b>${teams || "<em>Waiting for the first table\u2026</em>"}</div></div></div></section>`;
  }
  if (p === "opening") return page("BEFORE WE BEGIN", "WHAT IS THE BIGGEST CHALLENGE ARTHUR FACES GETTING HOME SAFELY?", "On your phone, enter a few words. Skipping does not affect gameplay.", "arthur-leave-well.png");
  if (p === "reflection") {
    let a = d.votes.filter((v) => v.decision === "opening_challenge" && v.choice !== "[SKIPPED]").map((v) => v.choice);
    if (!a.length) a = ["keeping all the instructions straight before leaving"];
    let zones = ["UNDERSTAND", "MOVE", "CONNECT", "TRUST"];
    let tone = ["teal", "clay", "charcoal", "gold"];
    let tiles = a.map((x2, i) => `<blockquote class="response-tile ${tone[i % tone.length]} s${i % 4}" style="--r:${i * 7 % 9 - 4}deg"><small>${zones[i % 4]}</small><span>\u201C${E(x2)}\u201D</span></blockquote>`).join("");
    return `<section class="room-reflection-design"><div class="reflection-brand"><small>ARTHUR: BY DESIGN</small><small>STUDIO WALL \xB7 LIVE</small></div><div class="reflection-heading"><span>WHAT THE ROOM SEES</span><h1>ARTHUR\u2019S CHALLENGE,<br>IN YOUR WORDS.</h1><p>Different perspectives are becoming a shared design brief.</p></div><div class="response-canvas"><div class="canvas-grid"></div>${tiles}<div class="zone-label z1">UNDERSTAND</div><div class="zone-label z2">MOVE</div><div class="zone-label z3">CONNECT</div><div class="zone-label z4">TRUST</div></div><div class="reflection-close"><b>THE ROOM IS STARTING HERE.</b><span>Keep this picture in mind. Now let\u2019s design Arthur\u2019s journey.</span></div></section>`;
  }
  if (p === "journey") return `<section class="journey-locked"><div class="visual-brand"><small>ARTHUR: BY DESIGN</small><small>STANTEC</small></div><h1>A JOURNEY OF CARE.<br>A LIFETIME OF POSSIBILITY.</h1><p>Arthur moves through three connected environments. What you design today can shape what\u2019s possible tomorrow.</p><div class="journey-triptych">${[["arthur-leave-well.png", "\u2197", "LEAVE WELL", "Hospital \u2192 Home", "Can Arthur understand the plan, navigate the transition and arrive home with confidence?"], ["arthur-recover-well.png", "\u2302", "RECOVER WELL", "At Home", "Can Arthur recover safely, recognize change and get the right help when needed?"], ["arthur-live-well.png", "\u25CE", "LIVE WELL", "In the Community", "Can Arthur regain independence, reconnect and participate in everyday life?"]].map((a, i) => `<article class="${i === 0 ? "active" : ""}"><img src="${asset(a[0])}"><div><i>${a[1]}</i><h2>${a[2]}</h2><strong>${a[3]}</strong><p>${a[4]}</p></div></article>`).join("")}</div><div class="today-bar">TODAY WE BEGIN HERE: LEAVE WELL</div></section>`;
  if (p === "needs") return `<section class="needs-locked"><div class="needs-hero"><img src="${asset("arthur-leave-well.png")}"><div><small>ARTHUR: BY DESIGN</small><h2>What does leaving well require for Arthur?</h2></div></div><div class="needs-panel"><span>LEAVE WELL \xB7 THE CHALLENGE</span><h1>FOUR THINGS MATTER.</h1><div class="arthur-lens"><strong>WHAT MATTERS TO ARTHUR</strong><b><i>?</i>UNDERSTAND</b><b><i>\u2192</i>MOVE</b><b><i>\u221E</i>CONNECT</b><b><i>\u2713</i>TRUST</b></div><div class="needs-four">${Object.entries(NEEDS).map(([n, c2]) => `<article><h2>${n}</h2><p>${c2}</p></article>`).join("")}</div><div class="challenge-locked"><strong>YOUR<br>CHALLENGE</strong><span>Design an environment that helps Arthur leave well.</span></div></div></section>`;
  if (p === "rules") return `<section class="instruction-locked"><div class="instruction-hero"><img src="${asset("arthur-leave-well.png")}"><div><small>ARTHUR: BY DESIGN</small><h2>Design for what comes next.</h2></div></div><div class="instruction-panel"><b class="instruction-pill">HOW TO PLAY</b><span>INSTRUCTION \xB7 HOW THE GAME WORKS</span><h1>WE DISCOVER TOGETHER.</h1><p>Same Arthur. Same challenge. Different tables. Different designs.</p><h2>HOW WILL WE DESIGN ARTHUR\u2019S PATH?</h2><div class="action-thread"><article><i>\u25CE</i><h2>CHOOSE</h2><p>Invest in AI-powered options.</p></article><em>\u2192</em><article><i>\u25C7</i><h2>DESIGN</h2><p>Make it work here.</p></article><em>\u2192</em><article><i>\u2197</i><h2>ADAPT</h2><p>Strengthen or extend.</p></article><em>\u2192</em><article><i>\u03DF</i><h2>RESPOND</h2><p>Conditions change.</p></article></div><div class="arthur-lens"><strong>WHAT MATTERS TO ARTHUR</strong><b><i>?</i>UNDERSTAND</b><b><i>\u2192</i>MOVE</b><b><i>\u221E</i>CONNECT</b><b><i>\u2713</i>TRUST</b></div><div class="resource-locked"><small>YOUR RESOURCES</small><b>\u25C6 7 CAPITAL</b><b>\u25CF 6 CHANGE</b><p>Capital funds what you build. Change is the capacity to implement it. Invest in up to 2 AI-powered options.</p></div><div class="learn-next">LEARN HOW TO READ A CARD \u2192</div></div></section>`;
  if (p === "card") return `<section class="instruction-locked card-instruction-locked"><div class="instruction-panel solo-card-guide"><b class="instruction-pill">HOW TO PLAY</b><span>INSTRUCTION \xB7 SAMPLE CARD</span><h1>HOW TO READ AN<br>INVESTMENT CARD.</h1><p class="card-guide-thesis"><b>Technology creates the capability.</b> Design determines Arthur\u2019s experience.</p><div class="arthur-lens"><strong>WHAT MATTERS TO ARTHUR</strong><b><i>?</i>UNDERSTAND</b><b class="muted"><i>\u2192</i>MOVE</b><b><i>\u221E</i>CONNECT</b><b class="muted"><i>\u2713</i>TRUST</b></div><div class="sample-investment-card"><img src="${asset("capability-ambient.png")}"><div class="sample-investment-copy"><div class="sample-meta"><b>SAMPLE CARD</b><strong>\u25C6 3 \xB7 \u25CF 2</strong></div><h2>SMART DISCHARGE</h2><p class="capability-line">AI turns the discharge conversation into a plan Arthur can take home.</p><dl><div><dt>WHAT IT DOES</dt><dd>Creates one take-home plan.</dd></div><div><dt>WHY ARTHUR CARES</dt><dd>Arthur knows what changed and what comes next.</dd></div><div><dt>TO MAKE IT WORK</dt><dd>Someone must confirm and own the plan.</dd></div></dl><div class="design-consideration"><small>DESIGN CONSIDERATION</small><b>Give Arthur privacy and a place to review the plan before leaving.</b></div><details class="guide-more"><summary>LEARN MORE</summary><div class="guide-detail-grid"><p><b>TECHNOLOGY CAN</b><br>Turn the discharge conversation into a plan Arthur can take home.</p><p><b>BUILT ENVIRONMENT</b><br>Support privacy, participation and verification.</p><p><b>PEOPLE + DELIVERY</b><br>Clarify who confirms and carries the plan forward.</p><p><b>WHY ARTHUR CARES</b><br>Arthur knows what changed and what comes next.</p></div></details></div></div></div></section>`;
  if (p === "invest") {
    let round = d.teams.some((t) => (t.investments || []).length > 0) ? 2 : 1;
    return `<section class="investment-stage"><span>ROUND ${round} \xB7 AI-POWERED INVESTMENT</span><h1>${round === 1 ? "WHAT WILL YOU INVEST FIRST?" : "WHAT WILL YOU ADD NEXT?"}</h1><p class="investment-help">Each card shows what technology makes possible, what Arthur gains, the design challenge, and the Capital / Change required.</p><div class="cards">${Object.values(CAPABILITIES).map((c2) => card(c2.image, c2.title, c2.line, c2.arthur, c2.challenge, `\u25C6${c2.cost[0]} \xB7 \u25CF${c2.cost[1]}`)).join("")}</div></section>`;
  }
  if (p === "activation") return roomActivation();
  if (p === "design") return roomDesign();
  if (p === "designReveal") return roomDesignReveal();
  if (p === "adapt") return `<section><span>YOUR ROUND 1 DESIGN</span><h1>GO DEEPER OR GO BROADER?</h1><div class="cards two"><article><h2>STRENGTHEN THIS DESIGN</h2><p>Add backup support and improve existing intervention points.</p></article><article><h2>EXTEND THE JOURNEY</h2><p>Add another AI capability and integrate its spatial requirements.</p></article></div></section>`;
  if (p === "event") {
    let rows = d.teams.filter((t) => d.players.some((x2) => x2.team_id === t.id)).map((t) => ({ t, e: evaluate(t, "handoff_changed") }));
    return `<section class="macro-event"><header><span>MACRO EVENT \xB7 HANDOFF CHANGED</span><h1>THREE THINGS CHANGE AT ONCE.</h1><p>Arthur is ready. The handoff system is not aligned.</p></header><div class="event-collisions"><article><b>01 \xB7 TRANSPORT</b><h2>Transportation arrives 20 minutes early.</h2><p>The departure window moves before the care team is ready.</p></article><article><b>02 \xB7 SUPPORT</b><h2>Arthur\u2019s family contact is unavailable.</h2><p>The person expected to hear the plan cannot join the handoff.</p></article><article><b>03 \xB7 INFORMATION</b><h2>The receiving team has the original plan.</h2><p>Medication and follow-up changes have not reached the next setting.</p></article></div><div class="event-table-strip"><b>THE SAME EVENT NOW HITS EVERY TABLE.</b>${rows.map((x2) => `<span>${E(x2.t.table_name)} \xB7 ${x2.e.exposures.length} EXPOSURE${x2.e.exposures.length === 1 ? "" : "S"}</span>`).join("")}</div><div class="event-vote-callout"><div><small>TABLE PREDICTION</small><h2>WILL YOUR DESIGN HOLD?</h2><p>Every player votes on the phone: <b>YES</b>, <b>NOT SURE</b>, or <b>NO</b>.</p></div><div class="event-readiness">${statusModel().activeRows.map((r) => `<span>${E(r.t.table_name)} \xB7 ${r.votes}/${r.people.length} VOTED</span>`).join("")}</div></div></section>`;
  }
  if(p==='respond')return `<section><span>RESPOND · HANDOFF CHANGED</span><h1>HOW WILL THE TABLES RESPOND?</h1><p>Transport is early. Family support is unavailable. The receiving team has the old plan.</p><div class="cards three">${Object.entries(RESPONSES).map(([id,r])=>`<article><h2>${r[0]}</h2><p>${r[1]}</p><b>${id==='use'?'◆0 / ●0':id==='adapt'?'◆0 / ●1':'◆1 / ●1'}</b></article>`).join('')}</div><div class="table-status-grid">${d.teams.filter(t=>t.status!=='inactive'&&d.players.some(p=>p.team_id===t.id)).map(t=>{const el=responseEligibility(t);return `<article><h2>${E(t.table_name)}</h2><p>◆${t.capital} CAPITAL · ●${t.change_budget} CHANGE</p><p>ADAPT ${el.adapt.ok?'AVAILABLE':'UNAVAILABLE'} · ESCALATE ${el.escalate.ok?'AVAILABLE':'UNAVAILABLE'}</p></article>`}).join('')}</div></section>`;
  if (p === "result") {
    let rows = d.teams.filter((t) => t.status!=="inactive"&&d.players.some((x2) => x2.team_id === t.id)).map((t) => ({ t, e: t.game_state?.evaluation || evaluate(t, "handoff_changed"), response: t.game_state?.responseId || "use" }));
    return `<section class="room-results"><span>PERFORMANCE UNDER PRESSURE</span><h1>SAME EVENT. DIFFERENT DESIGNS.</h1><p>Each table is evaluated against the design it funded, the response it selected and the dependencies still exposed.</p><div class="result-grid">${rows.map((x2) => `<article class="outcome-${x2.e.outcome.toLowerCase()}"><small>${E(x2.t.table_name)}</small><h2>${x2.e.outcome}</h2><b>RESPONSE \xB7 ${E(RESPONSES[x2.response]?.[0] || x2.response)}</b><div><strong>WHAT HELD</strong>${(x2.e.reasons || []).map((r) => `<p>\u2713 ${E(r)}</p>`).join("") || "<p>\u2014 No funded dependency fully held.</p>"}</div><div><strong>WHAT REMAINED EXPOSED</strong>${(x2.e.exposures || []).map((r) => `<p>\u25B3 ${E(r)}</p>`).join("") || "<p>\u2713 No material exposure remained.</p>"}</div></article>`).join("")}</div></section>`;
  }
  return `<section><span>LEAVE WELL \xB7 YOUR DESIGN RESULT</span><h1>THIS IS WHAT YOU DESIGNED.</h1><div class="lens"><b>USEFUL</b><b>RESILIENT</b><b>HUMAN</b></div><h2>AI CHANGED WHAT THE HOSPITAL COULD DO.<br>ARCHITECTURE MADE IT USEFUL, RESILIENT AND HUMAN.</h2></section>`;
}
function page(e, h, c2, i) {
  return `<section class="split"><img src="${asset(i)}"><div><span>${e}</span><h1>${h}</h1><p>${c2}</p></div></section>`;
}
function card(i, h, c2, a, q, k) {
  return `<article><img src="${asset(i)}"><h2>${h}</h2><p>${c2}</p>${a ? `<p><b>ARTHUR GAINS</b><br>${a}</p>` : ""}${q ? `<p><b>DESIGN CHALLENGE</b><br>${q}</p>` : ""}<b>${k}</b></article>`;
}
let refreshing=false,pendingRefresh=false,advancing=false;
async function refresh(){if(refreshing){pendingRefresh=true;return}refreshing=true;try{do{pendingRefresh=false;const next=await load(s.code),data=await all(next);s=next;d=data;render()}while(pendingRefresh)}catch(err){console.error(err)}finally{refreshing=false}}
function review(){const box=document.createElement('dialog');box.className='flow-review';box.innerHTML=`<h1>YOUR TABLES’ PREVIOUS CHOICES</h1><p>This review does not rewind the room or spend resources.</p>${d.teams.map(t=>`<article><h2>${E(t.table_name)}</h2><p>◆${t.capital} Capital · ●${t.change_budget} Change</p>${Object.values(t.game_state?.applied_decisions||{}).map(v=>`<p>${E(v.key)} · ${E(v.choice)} · ${E(v.source)}</p>`).join('')}</article>`).join('')}<button>CLOSE REVIEW</button>`;document.body.appendChild(box);box.querySelector('button').onclick=()=>{box.close();box.remove()};box.showModal()}
async function advance(force=false){if(advancing)return;advancing=true;try{render();const old=s.phase;if(old==='designReveal'&&d.teams.some(t=>(t.investments||[]).length>=2))s=await phase(s,'event');else s=await advanceRoom(s,{force});facilitatorView='story';await refresh()}catch(err){alert(err.message);await refresh()}finally{advancing=false;render()}}
function render() {
  root.innerHTML = `<main class="host"><header><b>ARTHUR: BY DESIGN</b><nav class="host-journey-map"><span class="active"><b>01</b> LEAVE WELL<small>${{ meet: "WELCOME", opening: "FIRST INSTINCT", reflection: "ROOM VIEW", journey: "JOURNEY", needs: "ARTHUR NEEDS", rules: "HOW TO PLAY", card: "READ A CARD", invest: "CHOOSE", activation: "REVEAL", design: "DESIGN", designReveal: "DESIGN REVEAL", adapt: "ADAPT", event: "DISRUPTION", respond: "RESPOND", impact:"IMPACT", result: "RESULT", principles: "DEBRIEF" }[normalizePhase(s.phase)] || "PLAY"}</small></span><i></i><span><b>02</b> RECOVER WELL<small>UP NEXT</small></span><i></i><span><b>03</b> LIVE WELL<small>LATER</small></span></nav><span>ROOM ${s.code}</span></header><div class="stage">${body()}</div><aside>${qr(url())}<b>JOIN \xB7 ${s.code}</b><small>Players join on their phones.</small></aside>${facilitatorPanel()}<footer><button id="b">BACK</button><button id="r">REVEAL</button><button id="force" class="force-control" hidden>CONTINUE WITH VOTES RECEIVED</button><button id="n">NEXT</button></footer></main>`;
  const backButton = root.querySelector("#b"), revealButton = root.querySelector("#r"), forceButton = root.querySelector("#force"), nextButton = root.querySelector("#n");
  let current = statusModel();
  forceButton.hidden = !current.decisionPhase;
  revealButton.textContent = current.decisionPhase ? "LIVE TABLE VIEW" : "REVEAL";
  backButton.textContent='REVIEW CHOICES';backButton.onclick=review;
  nextButton.disabled=advancing||s.phase==='principles';forceButton.disabled=advancing;
  nextButton.textContent=s.phase==='impact'?'CONTINUE TO RESPONSE':s.phase==='principles'?'COMPLETE':'NEXT';
  revealButton.onclick=()=>{if(statusModel().decisionPhase){facilitatorView=facilitatorView==='live_vote'?'story':'live_vote';if(facilitatorView==='live_vote')startVoteClock();render()}};
  forceButton.onclick=()=>{if(confirm('Continue with valid votes received? Tables with no valid votes become inactive. Ties still require a runoff.'))advance(true)};
  nextButton.onclick=()=>advance();
  if(isPreview)root.insertAdjacentHTML('afterbegin','<div class="flow-preview-badge">ISOLATED TEST ROOM · browser-only data · no live Supabase connection</div>');
}
async function start(m) {
  root = m;
  let code = new URLSearchParams(location.search).get("room");
  if (!code) {
    root.innerHTML = '<main><h1>HOST A ROOM</h1><button id="c">CREATE SESSION</button></main>';
    document.querySelector("#c").onclick = async () => {
      let x = await createRoom();
      location.search = `?mode=host&room=${x.code}${isPreview?"&preview=1":""}`;
    };
    return;
  }
  s = await load(code);
  d = await all(s);
  await sub(s, refresh);
  render();
}
export {
  start
};
