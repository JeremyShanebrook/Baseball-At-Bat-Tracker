const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
let n=0;
const ctx={console,db:{playerName:'Coach',myPlayers:[],teams:[],games:[]},window:{}};
ctx.makeId=()=>'m'+(++n);
vm.createContext(ctx);
vm.runInContext(lineStarting('function stats'),ctx);
vm.runInContext(lineStarting('function findTeamPlayer'),ctx);
vm.runInContext(lineStarting('function profileForRosterPlayer'),ctx);
vm.runInContext(lineStarting('function profileIdForAbs'),ctx);
vm.runInContext(lineStarting('function rosterIdsForProfile'),ctx);
vm.runInContext(lineStarting('function profileCardStats'),ctx);
vm.runInContext(lineStarting('function ensureMyPlayers'),ctx);

const team={id:'t1',name:'Eagles',level:'kid',players:[
  {id:'pA',name:'Ana',number:'7',isMine:true,active:true,myPlayerId:'mp1'},
  {id:'pB',name:'Bo',number:'3',isMine:true,active:true},
  {id:'pC',name:'Cy',number:'9',isMine:false,active:true},
]};
ctx.db={playerName:'Coach',myPlayers:[{id:'mp1',name:'Ana'},{id:'mp2',name:'Bo'}],teams:[team],games:[
  {date:'2026-04-01',abs:[
    {result:'1B',playerId:'pA',playerName:'Ana'},
    {result:'BB',playerId:'pA',playerName:'Ana'},
    {result:'SO',playerId:'pB',playerName:'Bo'},
    {result:'2B',playerId:'pB',playerName:'Bo'},
    {result:'HR',playerId:'pC',playerName:'Cy'},
    {result:'1B'},
  ]},
]};
// roster player resolves to its profile: by link, then by flagged name
assert.equal(ctx.profileForRosterPlayer(team.players[0]).id,'mp1','linked roster player resolves by myPlayerId');
assert.equal(ctx.profileForRosterPlayer(team.players[1]).id,'mp2','legacy flagged player resolves by name');
assert.equal(ctx.profileForRosterPlayer(team.players[2]),null,'unflagged player resolves to no profile');
// at-bat attribution: roster link, name fallback, untagged stays out
assert.equal(ctx.profileIdForAbs({playerId:'pA'}),'mp1','at-bat follows roster link');
assert.equal(ctx.profileIdForAbs({playerId:'pB'}),'mp2','at-bat follows flagged name');
assert.equal(ctx.profileIdForAbs({playerId:'pC'}),null,'non-kid at-bat has no profile');
assert.equal(ctx.profileIdForAbs({playerName:'Bo'}),'mp2','at-bat falls back to profile name');
assert.equal(ctx.profileIdForAbs({}),null,'untagged at-bat has no profile');
// profile roster ids span teams (joined: vm arrays fail strict prototype checks)
assert.equal(ctx.rosterIdsForProfile('mp1').join(','),'pA','profile roster ids for Ana');
assert.equal(ctx.rosterIdsForProfile('mp2').join(','),'pB','profile roster ids for Bo');
// card stats: Ana 1 hit + 1 walk in 1 at-bat; Bo 1 hit + 1 strikeout in 2 at-bats
let s=ctx.profileCardStats('mp1');
assert.equal(s.H,1,'Ana card hits');assert.equal(s.BB,1,'Ana card walks');assert.equal(s.SO,0,'Ana card strikeouts');assert.equal(s.AVG,1,'Ana card average');
s=ctx.profileCardStats('mp2');
assert.equal(s.H,1,'Bo card hits');assert.equal(s.BB,0,'Bo card walks');assert.equal(s.SO,1,'Bo card strikeouts');assert.equal(s.AVG,0.5,'Bo card average');
// migration: legacy data seeds profiles from the old name + flagged roster names, links both
ctx.db={playerName:'Ana',teams:[{id:'t1',players:[{id:'pA',name:'Ana',isMine:true},{id:'pB',name:'Bo',isMine:true}]}]};
let profs=ctx.ensureMyPlayers();
assert.equal(profs.map(x=>x.name).join(','),'Ana,Bo','migration seeds one profile per kid');
assert.ok(ctx.db.teams[0].players[0].myPlayerId,'migration links first kid');
assert.ok(ctx.db.teams[0].players[1].myPlayerId,'migration links second kid');
// deleting the last profile stays deleted: no reseed from the old single name
ctx.db={playerName:'Ana',myPlayers:[],teams:[]};
assert.equal(ctx.ensureMyPlayers().length,0,'empty profile list is not reseeded');
// the default placeholder name never becomes a profile
ctx.db={playerName:'My Player',teams:[]};
assert.equal(ctx.ensureMyPlayers().length,0,'default player name seeds no profile');

// top banner shows the app name, not a player name
assert.ok(html.includes('<h1>⚾ Baseball AB Tracker</h1>'),'banner shows the app name');
assert.ok(!html.includes('<h1>⚾ ${esc(db.playerName)}</h1>'),'banner no longer shows a player name');
// My Player tab: add + cards + delete
assert.ok(html.includes('id=new-my-player'),'my player tab has an add input');
assert.ok(html.includes('data-action=add-my-player'),'my player tab can add a player');
assert.ok(html.includes('data-action=myplayer-card'),'my player tab has tappable cards');
assert.ok(html.includes('Tap for full stats'),'cards say they open full stats');
assert.ok(html.includes('data-action=delete-my-player'),'profiles can be removed');
// card click goes to that player's full stats
assert.ok(html.includes("window._statsKid=b.dataset.id;window._page='stats'"),'card tap opens stats for that player');
// Team dropdown links + fills the roster name
assert.ok(html.includes('data-my-player-link'),'team rows have a my-player dropdown');
assert.ok(html.includes('My Player…'),'dropdown has a my-player placeholder');
assert.ok(html.includes('p.name=prof.name'),'picking a profile fills the roster name');
assert.ok(!html.includes('toggle-mine'),'old my-player toggle is gone');
// start modal keeps its own working name editor
assert.ok(html.includes("case'save-player':"),'start modal name editor still works');
// stats picker is profile-based
assert.ok(html.includes('profileIdForAbs(a)===mp.id'),'stats picker lists profiles with stats');
assert.ok(html.includes('profileIdForAbs(a)===kid'),'stats filter uses the profile');

console.log('beta15 tests PASS');
