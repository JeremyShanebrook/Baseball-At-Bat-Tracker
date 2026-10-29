const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
const team={id:'t1',name:'Eagles',level:'kid',players:[
  {id:'pA',name:'Ana',number:'7',isMine:true,active:true},
  {id:'pB',name:'Bo',number:'3',isMine:false,active:true},
]};
const ctx={console,db:{teams:[team],activeGames:[],archivedGames:[]},_walkup:null,_announce:null};
vm.createContext(ctx);
for(const prefix of ['function findTeamPlayer','function announcementTextFor','function cancelAnnouncement','function walkupPlaying']) vm.runInContext(lineStarting(prefix),ctx);

// announcement text: MLB-inflection shape, number + name from the roster
assert.equal(ctx.announcementTextFor({name:'Joseph',number:'11'}),'Now batting... number 11... Joseph!','number+name shape');
assert.equal(ctx.announcementTextFor({name:'Ana',number:''}),'Now batting... Ana!','no number falls back to name only');
assert.equal(ctx.announcementTextFor({name:'',number:'7'}),'','no name means no announcement');
assert.equal(ctx.announcementTextFor(null),'','null player means no announcement');

// roster lookup by player id (Play button only carries the id)
assert.equal(ctx.findTeamPlayer('pB').name,'Bo','finds roster player by id');
assert.equal(ctx.findTeamPlayer('nope'),null,'unknown id returns null');

// Play/Stop button state covers both music and announcement
ctx._walkup={playerId:'pA'};ctx._announce=null;
assert.equal(ctx.walkupPlaying('pA'),true,'playing music shows Stop');
assert.equal(ctx.walkupPlaying('pB'),false,'other player still shows Play');
ctx._walkup=null;ctx._announce={playerId:'pB'};
assert.equal(ctx.walkupPlaying('pB'),true,'announcing shows Stop too');
assert.equal(ctx.walkupPlaying('pA'),false,'non-announcing player still shows Play');
ctx._walkup=null;ctx._announce=null;
assert.equal(ctx.walkupPlaying('pA'),false,'idle shows Play');

// cancelling an announcement runs its cancel hook and clears state
let cancelled=false;
ctx._announce={playerId:'pA',cancel(){cancelled=true}};
ctx.cancelAnnouncement();
assert.equal(cancelled,true,'cancel hook runs');
assert.equal(ctx._announce,null,'announce state cleared');

// banner: solid navy + white text, no more translucent background
assert.ok(html.includes('.batting-now{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;background:#0b1f33;color:#fff;'),'banner is solid navy with white text');
assert.ok(html.includes('.batting-now button{color:#18202a}'),'banner button text stays dark on its light button');
assert.ok(!html.includes('background:#ffffff12'),'old translucent banner background is gone');

// Play press chains announcement before music and warms the audio context
assert.ok(html.includes('playAnnouncement(findTeamPlayer(playerId))'),'playWalkup announces before music');
assert.ok(html.includes("case'play-music':{try{const Ctx=window.AudioContext||window.webkitAudioContext;"),'play-music warms Web Audio in the tap gesture');
assert.ok(html.includes('d1.delayTime.value=0.09'),'PA echo first tap at 90ms');
assert.ok(html.includes('d2.delayTime.value=0.18'),'PA echo second tap at 180ms');

console.log('beta12 tests PASS');
