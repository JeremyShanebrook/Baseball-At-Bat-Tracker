const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'app','src','main','assets','index.html'),'utf8');
const lines=html.split(/\r?\n/);
function lineStarting(prefix){const s=lines.find(x=>x.startsWith(prefix));assert.ok(s,`source function ${prefix}`);return s}
const fadeState={faded:false};
const ctx={console,db:{teams:[],activeGames:[],archivedGames:[]},fadeStopMusic(){fadeState.faded=true}};
vm.createContext(ctx);
for(const prefix of ['function currentSide','function battingTeam','function teamName','function ensureTeamShape','function teamLineup','function playerLabel','function currentBatter','function batterKey','function advanceBatter','function syncMyPlayer','function movePlayerInLineup','function afterBenchChange','function stats(','function teamStatsFor','function musicClipValid']) vm.runInContext(lineStarting(prefix),ctx);

const team={id:'t1',name:'Eagles',level:'kid',players:[
  {id:'pA',name:'Ana',number:'7',isMine:true,active:true},
  {id:'pB',name:'Bo',number:'3',isMine:false,active:true},
  {id:'pC',name:'Cy',number:'12',isMine:false,active:false},
]};
ctx.db.teams=[team];
const g={id:'g1',teamId:'t1',teamName:'Eagles',half:'top',batterIndex:0,oppBatterIndex:0,oppLineup:[{id:'o1',number:'5',name:'Rex'}],myPlayer:false,myPlayerLocked:false};

// lineup + current batter + my-player sync
assert.equal(ctx.teamLineup(team).map(p=>p.id).join(','),'pA,pB','benched player excluded from lineup');
assert.equal(ctx.currentBatter(g).player.id,'pA','first batter is roster order first');
ctx.syncMyPlayer(g);assert.equal(g.myPlayer,true,'flagged player auto-sets myPlayer');
ctx.advanceBatter(g);assert.equal(g.batterIndex,1,'batter advances');
ctx.syncMyPlayer(g);assert.equal(g.myPlayer,false,'non-flagged batter clears myPlayer');
assert.equal(fadeState.faded,true,'batter change fades walk-up music');
ctx.advanceBatter(g);assert.equal(g.batterIndex,0,'lineup wraps to top');
ctx.syncMyPlayer(g);assert.equal(g.myPlayer,true,'wrap returns to flagged player');

// opponent half
g.half='bottom';assert.equal(ctx.currentBatter(g).kind,'opp','bottom half bats opponent lineup');
assert.equal(ctx.playerLabel(ctx.currentBatter(g).player),'#5 Rex','opponent label from number+name');
ctx.syncMyPlayer(g);assert.equal(g.myPlayer,false,'opponent batter never sets myPlayer');
ctx.advanceBatter(g);assert.equal(g.oppBatterIndex,0,'single opponent wraps to 0');
g.half='top';

// move in lineup keeps benched players at the end
ctx.movePlayerInLineup(team,'pB',-1);
assert.equal(team.players.map(p=>p.id).join(','),'pB,pA,pC','move up swaps lineup order, benched stays last');
assert.equal(ctx.teamLineup(team).map(p=>p.id).join(','),'pB,pA','lineup reflects move');
// bench adjustment: bench pB (pos 0) while batterIndex is 1 -> index drops to 0
g.batterIndex=1;
const oldLineup=ctx.teamLineup(team);
team.players.find(p=>p.id==='pB').active=false;
ctx.afterBenchChange(g,team,'pB',true,oldLineup);
assert.equal(g.batterIndex,0,'benching a batter ahead of the current index shifts it down');
assert.equal(ctx.currentBatter(g).player.id,'pA','current batter unchanged after bench shift');
// unbench: pB returns at roster front, index shifts up to keep the same batter
team.players.find(p=>p.id==='pB').active=true;
ctx.afterBenchChange(g,team,'pB',false,ctx.teamLineup(team).filter(p=>p.id!=='pB'));
assert.equal(g.batterIndex,1,'unbenching ahead of current batter shifts index up');
assert.equal(ctx.currentBatter(g).player.id,'pA','same batter after unbench shift');

// team stats from active + archived games
ctx.db.activeGames=[{id:'g1',teamId:'t1',log:[
  {playerId:'pA',result:'1B'},{playerId:'pA',result:'SO'},
  {playerId:'pB',result:'HR'},{playerId:'pB',result:'BB'},
]}];
ctx.db.archivedGames=[{id:'g0',teamId:'t1',log:[{playerId:'pA',result:'2B'}]}];
const rows=ctx.teamStatsFor(team);
const a=rows.find(r=>r.player.id==='pA').s, b=rows.find(r=>r.player.id==='pB').s, c=rows.find(r=>r.player.id==='pC').s;
assert.equal(a.PA,3,'flagged player PA counts active + archived games');
assert.equal(a.G,2,'G counts distinct games');
assert.equal(a.H,2,'hits counted');assert.equal(a.AVG,2/3,'AVG math');
assert.equal(b.AVG,1,'HR counts as hit');assert.equal(b.SLG,4,'HR slugging');
assert.equal(b.OBP,1,'HR+BB OBP');
assert.equal(c.PA,0,'benched player with no at-bats has zero PA');

// music clip length rule
assert.equal(ctx.musicClipValid(60),true,'exactly 60s allowed');
assert.equal(ctx.musicClipValid(60.01),false,'over 60s rejected');
assert.equal(ctx.musicClipValid(0),false,'zero rejected');
assert.equal(ctx.musicClipValid(NaN),false,'NaN rejected');

// labels + empty lineup fallback
assert.equal(ctx.playerLabel({number:'7',name:'Ana'}),'#7 Ana');
assert.equal(ctx.playerLabel({name:'Ana'}),'Ana');
assert.equal(ctx.playerLabel({number:'7'}),'#7');
assert.equal(ctx.playerLabel({}),'');
const noRoster={id:'g2',teamId:'tX',half:'top',batterIndex:0,oppBatterIndex:0,oppLineup:[],myPlayer:true,myPlayerLocked:false};
assert.equal(ctx.currentBatter(noRoster),null,'team with no roster has no current batter');
ctx.syncMyPlayer(noRoster);assert.equal(noRoster.myPlayer,true,'no batter leaves the manual toggle alone');

console.log('PASS: lineup order/wrap, opponent lineup, my-player auto-sync, bench index shifts, team stats, music 60s rule, labels, no-roster fallback');
