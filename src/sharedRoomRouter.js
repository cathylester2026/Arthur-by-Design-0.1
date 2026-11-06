const root=document.getElementById('app')
const params=new URLSearchParams(location.search),mode=params.get('mode')
function go(next){let p=new URLSearchParams(location.search);p.set('mode',next);location.search=p}
function error(e){root.innerHTML=`<main style="max-width:780px;margin:60px auto;font-family:Arial;padding:24px"><h1>Unable to open Arthur: By Design</h1><p>${String(e||'Unknown error')}</p><button onclick="location.href=location.pathname">RETURN HOME</button></main>`}
if(mode==='host'){
  Promise.all([import('./sharedRoomHost.js'),import('./sharedRoom.css')]).then(([m])=>m.startSharedHost({mount:root})).catch(e=>error(e.message))
}else if(mode==='join'){
  Promise.all([import('./sharedRoomPhone.js'),import('./sharedRoom.css')]).then(([m])=>m.startSharedPhone({mount:root})).catch(e=>error(e.message))
}else if(mode==='solo'){
  import('./main.js').catch(e=>error(e.message))
}else{
  import('./sharedRoom.css').then(()=>{
    root.innerHTML=`<main class="clean-landing"><div class="clean-landing-copy"><span>ARTHUR: BY DESIGN</span><h1>AI CHANGES WHAT CARE CAN DO.</h1><p>Architecture makes it useful, resilient and human.</p><div class="landing-principles"><b>USEFUL<small>Can Arthur do what Arthur needs?</small></b><b>RESILIENT<small>Will the design work when plans change?</small></b><b>HUMAN<small>Does Arthur retain dignity and confidence?</small></b></div><div class="landing-actions"><button id="host">HOST A ROOM</button><button id="join">JOIN A ROOM</button><button id="solo">EXPLORE ON MY OWN</button></div></div></main>`
    document.getElementById('host').onclick=()=>go('host')
    document.getElementById('join').onclick=()=>go('join')
    document.getElementById('solo').onclick=()=>go('solo')
  })
}
