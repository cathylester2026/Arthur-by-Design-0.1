// A downloadable, isolated run-through of the final host / phone code.
import './parity.css';
import './parityRefine.css';
const q=new URLSearchParams(location.search),root=document.querySelector('#app');
const go=async()=>{if(q.get('mode')==='studio-solo')return (await import('./studioSolo.js')).start(root);if(q.get('mode')==='host'){await import('./designDepth.js');return (await import('./parityHost.js')).start(root)}if(q.get('mode')==='join'){await import('./designDepth.js');return (await import('./parityPhone.js')).start(root)}return (await import('./xplayerTestDrive.js')).start(root)};
go().catch(err=>{root.textContent='Unable to open the test drive: '+err.message});
