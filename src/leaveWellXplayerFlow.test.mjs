import assert from 'node:assert/strict';
import {tally} from './leaveWellXplayerFlow.js';
const team={id:'A',status:'joining',investments:[],capital:7,change_budget:6};
const players=[{id:'p1',team_id:'A'},{id:'p2',team_id:'A'}];
const votes=[{player_id:'outsider',team_id:'A',decision:'capability1',choice:'meds'},{player_id:'p1',team_id:'A',decision:'capability1',choice:'ambient'},{player_id:'p1',team_id:'A',decision:'capability1',choice:'meds'}];
const result=tally(team,'invest',players,votes);assert.equal(result.cast,1);assert.equal(result.ready,false);assert.deepEqual(result.counts,{meds:1});
console.log('PASS: tally counts distinct registered players and rejects outsider votes');
