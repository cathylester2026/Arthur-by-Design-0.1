import test from 'node:test';
import assert from 'node:assert/strict';
import {familyVisual,designVisual,eventVisual,outcomeVisual,futureVisual} from '../src/liveWell/liveVisuals.js';
import {DESIGNS} from '../src/liveWell/liveResolver.js';
test('Every Live Well investment has distinct accessible conceptual visual',()=>{
 const all=Object.keys(DESIGNS);
 assert.equal(all.length,12);
 const scenes=all.map(id=>designVisual(id));
 assert.equal(new Set(scenes).size,12);
 for(let i=0;i<all.length;i++){
  assert.match(scenes[i],/class="lw-design-diagram"/);
  assert.match(scenes[i],/role="img"/);
  assert.match(scenes[i],/aria-label=/);
  assert.match(scenes[i],/lw-visual-step/);
 }
});
test('Visual sequence covers family, event, outcome and three futures',()=>{
 for(const family of ['mobility','care','wellness','services'])assert.match(familyVisual(family),/<img/);
 for(const id of ['S1','S2','S3'])assert.match(eventVisual(id),/lw-event-visual/);
 for(const out of ['HOLDS','STRAINED','EXPOSED']){
  const result={scenarioId:'S2',route:{designId:null,reason:'No qualifying service was established.'},metrics:{outcome:out,participation:out==='HOLDS'}};
  assert.match(outcomeVisual(result),/role="group"/);
 }
 for(const id of ['FRAGMENTED','CONNECTED_FRAGILE','ADAPTABLE_ACCOUNTABLE']){
  const html=futureVisual(id);
  assert.equal((html.match(/lw-future-tile /g)||[]).length,3);
  assert.equal((html.match(/lw-future-tile selected/g)||[]).length,1);
 }
});
