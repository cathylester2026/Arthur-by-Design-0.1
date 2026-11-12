import {CHOICES} from './recoveryContent.js';

// A catalogue of outputs is not evidence that another selected design consumed them.
// Only these two authored interfaces supply additional pair-specific enablement.
const outputs={
 '1A':['Plan guidance'], '1B':['Routine setup'], '1C':['Bounded coaching'],
 '2A':['Approved movement guidance','Selected approved movement observations'],
 '2B':['Task-specific rehabilitation setup'], '2C':['Bounded device assistance'],
 '3A':['Selected wearable observations'], '3B':['Selected ambient observations'],
 '3C':['Forecast from legitimate available inputs'], '4A':['Response routing'],
 '4B':['Selected home-care episode'], '4C':['Bounded navigation']
};
export function pairContract(designIds){
 const ids=[...designIds].sort();
 if(ids.length!==2||ids.some(id=>!CHOICES[id])||ids[0][0]===ids[1][0])throw Error('A pair contract needs two different capability families.');
 const home=ids.includes('2B')&&ids.includes('4B'),movement=ids.includes('2A')&&ids.includes('3C');
 return {pair:ids.join('+'),contributions:ids.map(id=>({designId:id,outputs:outputs[id]})),
  interface:home?{id:'homeEpisodeSetup',from:'2B',to:'4B',output:'Task-specific spatial setup',input:'A suitable setup for the selected home-care episode',requirements:['homeCanAccommodateEpisode'],neverSupplies:['eligibility','staff','equipment','clinical acceptance','timely assessment']}
   :movement?{id:'consentedMovementInputs',from:'2A',to:'3C',output:'Selected approved movement observations',input:'Legitimate movement evidence for a forecast',requirements:['approvedRoutine','shareMovement'],neverSupplies:['new sensors','clinical interpretation','accepted clinical responsibility','completed assessment']}
   :null,
  rule:home||movement?'Explicit interface; all separate service and task gates still apply.':'Independent contributions only. No additional A-to-B connection is inferred from selecting both.'};
}
export function connectionEvidence(investments,facts,shareMovement){
 if(investments.length!==2)return [];
 const contract=pairContract(investments.map(i=>i.designId));
 if(!contract.interface)return [{...contract,enabled:false,reason:contract.rule}];
 const missing=contract.interface.requirements.filter(k=>k==='shareMovement'?shareMovement!==true:facts[k]!==true);
 return [{...contract,enabled:missing.length===0,missing,reason:missing.length?'The required connection facts are not established.':'The explicitly authored interface is available; this does not establish the downstream service.'}];
}
