// Exact production filenames. Missing dedicated reveal art deliberately uses its selection drawing.
export const OPTION_ARTWORK={
 ambient:{bedside:['design-discharge-ai-plan-first.png','design-discharge-ai-plan-first-reveal.png'],shared:['design-discharge-review-together.png','design-discharge-review-together-reveal.png'],dedicated:['design-discharge-transition-guide.png',null]},
 wayfinding:{digital:['design-routes-app-first.png','design-routes-app-first-reveal.png'],layered:['design-routes-layered-guidance.png','design-routes-layered-guidance-reveal.png'],escort:['design-routes-guided-transition.png','design-routes-guided-transition-reveal.png']},
 meds:{nurse:['design-meds-ai-check-first.png','design-meds-ai-check-first-reveal.png'],pharmacy:['design-meds-review-together.png','design-meds-review-together-reveal.png'],huddle:['design-meds-plan-follows.png','design-meds-plan-follows-reveal.png']},
 command:{unit:['design-response-alert.png',null],center:['design-response-coordinated.png',null],liaison:['design-response-guide.png',null]}
};
export const optionArtworkNames=new Set(Object.values(OPTION_ARTWORK).flatMap(options=>Object.values(options).flat().filter(Boolean)));
export function optionArtwork(capabilityId,commitmentId,{reveal=false}={}){const pair=OPTION_ARTWORK[capabilityId]?.[commitmentId];return pair?(reveal&&pair[1]||pair[0]):null}
// Bypass older optimized copies for the replacement artwork; keep original PNG bytes intact.
export function artworkPath(name){return `${import.meta.env?.BASE_URL||'./'}assets/${name}?v=lw-art-ba321dc5`}
