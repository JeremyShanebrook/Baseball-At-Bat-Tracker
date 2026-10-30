# Beta.18 — Team hub, scoreboards, share

## Team page cleanup

The Team page is now a hub:

- Top card "My Teams" with the Add Team button.
- Each team gets its own card, cycling through background colors
  drawn from the selected theme's palette (tints of its two theme
  colors).
- Each card shows the team name, its win-loss record underneath
  (ties shown as a third number when there are any), and two
  buttons:
  - Roster & Lineup: a page to edit that team's roster, lineup,
    and walk-up music. Same rows, same layout, same My Player
    dropdowns and Add Player button as before, plus level of play
    and Delete team.
  - Team Stats: the full team page for that team — win-loss
    record, individual member stats, and game history. Tapping a
    finished game opens its scoreboard.

## Scoreboards (no errors column, per your call)

A traditional linescore: one column per inning, team rows, and
runs (R) and hits (H) at the far right. There is no errors column
and no error option, as you decided.

- In a game: the live scoreboard header has a Share button.
- Team Stats game history: tap a finished game for its scoreboard
  and a Share button.
- Games History tab: games that have a full archived game behind
  them get a Scoreboard button, opening the same view with Share.

Sharing sends the scoreboard as text through the system share
sheet (new native bridge method; falls back to the web share
sheet, then copy-to-clipboard).

## Inning tracking (new)

Completed half-innings are now recorded as games progress, so
scoreboards show real per-inning runs. Games finished before this
update have totals (R/H) but no per-inning columns; their
scoreboards say so instead of inventing innings. Hits come from
recorded at-bats on each side.

## Version

versionCode 23 / 1.3.1-beta.18. No other gameplay changes.
