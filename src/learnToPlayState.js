export const OPTIONS=['bedside','shared','dedicated'];
export const fresh=()=>({step:0,invested:false,choice:null,reflection:''});
export const budget=s=>({capital:7-(s.invested?3:0),change:6-(s.invested?2:0)});
export function transition(s,action,value){
 if(action==='reset')return fresh();
 if(action==='reflection')return {...s,reflection:String(value||'').slice(0,500)};
 if(action==='back')return {...s,step:Math.max(0,s.step-1)};
 if(action==='invest'&&s.step===4)return {...s,invested:true,step:5};
 if(action==='choose'&&s.step===5&&s.invested&&OPTIONS.includes(value))return {...s,choice:value};
 if(action==='next'&&s.step<4)return {...s,step:s.step+1};
 if(action==='next'&&s.step===5&&s.invested&&OPTIONS.includes(s.choice))return {...s,step:6};
 return s;
}
