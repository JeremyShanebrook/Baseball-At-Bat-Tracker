const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
const team={id:'t1',name:'Eagles',level:'kid',players:[
  {id:'pA',name:'Ana',number:'7',isMine:true,active:true},
  {id:'pB',name:'Bo',number:'3',isMine:true,active:true},
  {id:'pC',name:'Cy',number:'9',isMine:false,active:true},
]};
const ctx={console,db:{teams:[team],activeGames:[],archivedGames:[]},_batter:null};
ctx.currentBatter=()=>ctx._batter;
vm.createContext(ctx);
vm.runInContext(lineStarting('function syncMyPlayer'),ctx);

function gameWith(ids){
  const g={teamId:'t1',myPlayerLocked:false};
  if(ids!==undefined)g.myPlayerIds=ids;
  return g;
}
// selected kid batting -> tracked
ctx._batter={kind:'team',player:{id:'pB'}};
let g=gameWith(['pA','pB']);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,true,'selected kid batting is tracked');
// unselected roster player batting -> not tracked
ctx._batter={kind:'team',player:{id:'pC'}};
g=gameWith(['pA','pB']);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,false,'unselected player batting is not tracked');
// deliberately empty selection -> nobody tracked, even a my-player
ctx._batter={kind:'team',player:{id:'pA'}};
g=gameWith([]);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,false,'empty selection tracks nobody');
// old game without a selection -> defaults to all flagged my-players
g=gameWith(undefined);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,true,'legacy game defaults to flagged kids');
assert.deepEqual(g.myPlayerIds,['pA','pB'],'legacy default records both kids');
ctx._batter={kind:'team',player:{id:'pC'}};
g=gameWith(undefined);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,false,'legacy default does not track non-kid');
// locked -> never tracked
ctx._batter={kind:'team',player:{id:'pA'}};
g=gameWith(['pA','pB']);g.myPlayerLocked=true;ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,false,'locked never tracks');
// opponent batter -> never tracked
ctx._batter={kind:'opp',player:{id:'opp1'}};
g=gameWith(['pA','pB']);ctx.syncMyPlayer(g);
assert.equal(g.myPlayer,false,'opponent batter never tracked');

// roster toggle no longer clears other my-players
assert.ok(!html.includes('t.players.forEach(x=>x.isMine=false)'),'toggle-mine no longer clears other kids');
// start-game picker exists and confirm reads it
assert.ok(html.includes('Kids playing'),'start menu has Kids playing section');
assert.ok(html.includes('data-playing-kid'),'start menu has kid checkboxes');
assert.ok(html.includes("[data-playing-kid]:checked"),'confirm reads checked kids');
// mirrored at-bats carry the kid they belong to
assert.ok(html.includes('sb:0,result,playerId:'),'mirrored at-bats are tagged with playerId');
// stats picker exists
assert.ok(html.includes('stats-kid-picker'),'stats page has kid picker');
assert.ok(html.includes('All my players'),'stats picker has an All option');
assert.ok(html.includes('window._statsKid'),'stats picker selection is remembered');
// grand slam sound is gone, banner/scoring text untouched
assert.ok(!html.includes('GRAND_SALAMI_AUDIO'),'grand slam audio blob is gone');
assert.ok(!html.includes('grandSalamiAudio'),'grand slam player variable is gone');
assert.ok(!html.includes("kind==='grand'"),'grand sound kind is gone');
assert.ok(html.includes("title!=='GRAND SLAM!'"),'grand slam event plays no sound');
assert.ok(html.includes('GRAND SLAM!'),'grand slam banner/scoring text stays');

// hype playlist index: wraps, starts at 0 from idle, -1 when empty
vm.runInContext(lineStarting('function hypeNextIndex'),ctx);
assert.equal(ctx.hypeNextIndex(0,3),1,'next from first is second');
assert.equal(ctx.hypeNextIndex(2,3),0,'next from last wraps to first');
assert.equal(ctx.hypeNextIndex(-1,3),0,'next from idle starts at first');
assert.equal(ctx.hypeNextIndex(0,0),-1,'next with no tracks is -1');

// hype music wiring
assert.ok(html.includes('Hype Music'),'game page has Hype Music controls');
assert.ok(html.includes('data-action=hype-play'),'hype Play control exists');
assert.ok(html.includes('data-action=hype-next'),'hype Next control exists');
assert.ok(html.includes('data-action=hype-stop'),'hype Stop control exists');
assert.ok(html.includes('data-target=music'),'sidebar has a Music tab');
assert.ok(html.includes('renderMusicPage'),'music page renders');
assert.ok(html.includes('hype-picker'),'hype file picker exists');
assert.ok(html.includes("objectStore('hype'"),'hype store exists in the music database');
assert.ok(html.includes("indexedDB.open('abt-music',2)"),'music database is version 2 for the hype store');
assert.ok(html.includes('await fadeStopHype()'),'walk-up Play fades hype out first');
assert.ok(html.includes('data-action=hype-add'),'music tab can add songs');
assert.ok(html.includes('data-action=hype-del'),'music tab can remove songs');

console.log('beta14 tests PASS');
