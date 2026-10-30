# Beta.19 — Image scoreboard share, batter cycling, undo, lineup jump

## Share sends an image now

The Share button no longer sends the scoreboard as text. It
shares an actual image of the linescore board: team names,
one column per inning, runs and hits at the far right, on a
clean board layout. It goes out through the system share
sheet as a PNG; if image sharing is unavailable, the board
is shown on screen so it can be long-pressed to save or
share. Text sharing remains only as a last-resort fallback
if the image cannot be drawn.

## Every resolved at-bat cycles to the next batter

Fixed two advance bugs:

- A hit with runners on where every runner move was forced
  applied the runners but never advanced the batter, leaving
  the game stuck on the hitter. Runner resolutions now
  always finish with exactly one advance.
- A scoring hit advanced twice, skipping a batter. Scoring
  plays now advance exactly once like every other result.

## Undo goes to the correct batter

Recording a hit used to take two snapshots (opening the
hit menu, then choosing the result), so one undo landed
mid-result instead of on a clean hitter. Now a hit is one
logical action: one undo puts the hitter back at the plate
with a fresh count. Undoing a strike leaves the same batter
up with one fewer strike; undoing a walk puts the walked
batter back at the plate, since that at-bat is undone.

## Lineup tap jumps to that batter

In the Lineup menu, tapping a player's name now jumps
straight to that batter in the order — for when a kid
misses his turn, for example. The jump starts a fresh
count for the new batter and can itself be undone. Tapping
a name while the opponents bat repositions the team's next
turn without touching the live count.

## Version

versionCode 24 / 1.3.1-beta.19. No other gameplay changes.
