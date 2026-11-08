export const ONBOARDING=['meet','opening','reflection','journey','needs','rules','card','invest'];
export function normalizePhase(p){return({arrive:'meet','opening-question':'opening',opening_cloud:'reflection','opening-cloud':'reflection',cloud:'reflection',how_to_play:'rules',card_guide:'card',capability_intro:'invest',capability:'invest'}[p]||p)}
// 'invest' is the handoff into gameplay, not an onboarding phase.
// Keeping it in ONBOARDING lets nextOnboarding('card') reach it, while excluding
// it here lets move('invest', 1) advance through the gameplay FLOW.
export function isOnboarding(p){let n=normalizePhase(p);return n!=='invest'&&ONBOARDING.includes(n)}
export function nextOnboarding(p){let i=ONBOARDING.indexOf(normalizePhase(p));return ONBOARDING[Math.min(ONBOARDING.length-1,Math.max(0,i)+1)]}
export function prevOnboarding(p){let i=ONBOARDING.indexOf(normalizePhase(p));return ONBOARDING[Math.max(0,i-1)]}
