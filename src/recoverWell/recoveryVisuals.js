const families={personalized:'personalized',rehab:'rehab',warning:'warning',response:'response'};
const numbers={'1':'personalized','2':'rehab','3':'warning','4':'response'};
const captions={
 personalized:'An empty home setting with daily guidance, routine support and a place for a remote conversation.',
 rehab:'An empty activity space showing movement guidance, adaptable home supports and a bounded assistive device.',
 warning:'Wearable readings, discreet home sensors and a clear forecast shown as different ways to notice change.',
 response:'Ways to contact care, space for a home visit and a private place to talk with a navigator.',
 '1A':'A tablet and voice speaker provide digital daily guidance beside an empty chair.',
 '1B':'Reachable storage, task lighting and simple home controls support everyday routines.',
 '1C':'A remote coach appears on a screen in a private, empty conversation nook.',
 '2A':'A wearable and tablet provide movement feedback in an existing activity space.',
 '2B':'Clear circulation, rest points and adaptable physical supports make a home easier to use.',
 '2C':'A small non-humanoid assistive device helps with one tabletop task, with room to stop and disengage.',
 '3A':'A wearable, its charging place and selected digital readings.',
 '3B':'Discreet room sensors and a reachable privacy control in an ordinary empty living room.',
 '3C':'A tablet shows a forecast and uncertainty, ready for a person to review.',
 '4A':'A reachable phone and tablet provide a clear way to request care.',
 '4B':'Clear access, visit equipment and privacy make room for care in person at home.',
 '4C':'A human navigator appears remotely on a tablet beside a phone and appointment information.'
};
export function visualFor(id){const family=families[id]||numbers[id?.[0]];if(!family||!captions[id])throw Error('Unknown recovery visual');return {family,tile:families[id]?0:'ABC'.indexOf(id[1])+1,src:(import.meta.env?.BASE_URL||'./')+'assets/recover-'+family+'-board.webp',alt:captions[id],personInRoom:false};}
export function visualHTML(id){const v=visualFor(id),pos=['0% 0%','100% 0%','0% 100%','100% 100%'][v.tile];return `<div class="recovery-art" role="img" aria-label="${v.alt}" data-visual="${id}" style="background-image:url('${v.src}');background-position:${pos}"></div>`;}
export function disruptionVisualFor(scenarioId){
 const scenes={S1:{position:'0% 50%',alt:'A home activity area with an exercise mat, everyday shoes and a place to rest.'},S2:{position:'50% 50%',alt:'A reachable phone, a note and glasses beside an empty chair, ready to ask for help.'},S3:{position:'100% 50%',alt:'A home router with an amber status light beside a disconnected tablet; the home still has power.'}};
 if(!scenes[scenarioId])throw Error('Unknown recovery disruption visual');
 return {...scenes[scenarioId],src:(import.meta.env?.BASE_URL||'./')+'assets/recover-disruptions-board.webp'};
}
