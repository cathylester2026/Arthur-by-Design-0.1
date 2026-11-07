// Arthur: By Design - canonical onboarding lock v1
// Shared story for solo, XPlayer phone and facilitator host.
export const ONBOARDING=['meet','opening','reflection','journey','needs','rules','card','invest'];
export const ONBOARDING_LOCK_VERSION='canonical-v1';
export const ONBOARDING_COPY={
 meet:{eyebrow:'MEET ARTHUR',title:'ARTHUR IS GOING HOME.',copy:'Cardiac surgery is behind Arthur. The harder part may be what comes next.',image:'arthur-intro.png'},
 opening:{eyebrow:'YOUR FIRST INSTINCT',title:'WHAT IS THE BIGGEST CHALLENGE ARTHUR FACES GETTING HOME SAFELY?',copy:'A few words is enough. Skipping does not affect gameplay.',image:'opening-question-hero.jpg'},
 reflection:{eyebrow:'WHAT THE ROOM SEES',title:'ARTHUR’S CHALLENGE, IN YOUR WORDS.',copy:'Keep this picture in mind. Now let’s design Arthur’s journey.'},
 journey:{eyebrow:'ARTHUR: BY DESIGN',title:'A JOURNEY OF CARE. A LIFETIME OF POSSIBILITY.',copy:'Today we begin with Leave Well.'},
 needs:{eyebrow:'LEAVE WELL · THE CHALLENGE',title:'FOUR THINGS MATTER.',copy:'Design an environment that helps Arthur leave well.'},
 rules:{eyebrow:'HOW TO PLAY',title:'HOW WILL WE DESIGN ARTHUR’S PATH?'},
 card:{eyebrow:'INSTRUCTION · SAMPLE CARD',title:'HOW TO READ AN INVESTMENT CARD.'}
};
export const PARTICIPATION_COPY={solo:{decision:'YOU DECIDE.',challenge:'Your choices will determine what Arthur can rely on.'},join:{decision:'YOUR TABLE DECIDES.',challenge:'Your table’s choices will determine what Arthur can rely on.'},host:{decision:'WE DISCOVER TOGETHER.',challenge:'Same Arthur. Same challenge. Different tables. Different designs.'}};
export function normalizePhase(p){return({arrive:'meet','opening-question':'opening',opening_cloud:'reflection','opening-cloud':'reflection',cloud:'reflection',how_to_play:'rules',card_guide:'card',capability_intro:'invest',capability:'invest'}[p]||p)};
export function isOnboarding(p){return ONBOARDING.includes(normalizePhase(p))};
export function nextOnboarding(p){let i=ONBOARDING.indexOf(normalizePhase(p));return ONBOARDING[Math.min(ONBOARDING.length-1,Math.max(0,i)+1)]};
export function prevOnboarding(p){let i=ONBOARDING.indexOf(normalizePhase(p));return ONBOARDING[Math.max(0,i-1)]};
