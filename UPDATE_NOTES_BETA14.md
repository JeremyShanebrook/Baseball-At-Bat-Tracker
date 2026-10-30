# 1.3.1-beta.14 — multiple My Players + grand slam sound removed

## More than one My Player (no maximum)

For families with more than one kid playing:

- The roster "My Player" toggle no longer clears the other players, so
  every kid can be flagged. Each flagged kid still shows a ★.
- The Start Game menu has a new "Kids playing" section: checkboxes for
  every flagged kid on the team, all checked by default. Uncheck a kid
  who is sitting this one out. More than one can be checked at once.
- Tracking follows the game's selection, not just the flag: an at-bat
  counts toward personal stats only when the batter is one of the
  game's selected kids. The in-game My Player button still works as a
  per-at-bat override.
- Mirrored at-bats are now tagged with the kid they belong to, and the
  Stats page shows a player picker whenever two or more tracked kids
  exist ("All my players" plus one entry per kid). At-bats recorded
  before this update carry no tag, so they appear under "All my
  players" only.
- Games from before this update default to all flagged kids, matching
  the old single-kid behavior. A game with every kid unchecked tracks
  nobody.

## Grand slam sound removed

The grand slam audio clip (a large embedded recording) is deleted from
the app, along with its player code, and the grand slam event no longer
plays any sound — a copyright precaution before release. Scoring, the
on-screen "GRAND SLAM!" text, and all other sounds are unchanged. The
app is about 119 KB smaller as a side effect.

## Hype (intermission) music

A playlist separate from walk-up music, for inning changes:

- A new Music tab in the sidebar manages the playlist: add songs (no
  length limit, several at once) and remove them. Songs live in the
  same on-device music database as walk-up clips, in a new "hype"
  store (the database moved to version 2; existing walk-up clips
  upgrade untouched).
- The top of the game page has Hype Music controls: Play/Pause, Next,
  and Stop. Songs advance automatically and wrap around to the start.
  Hype volume follows the phone volume, independent of in-app sounds,
  exactly like walk-up music.
- Stop fades out over 3 seconds, like walk-up Stop.
- Pressing Play on a player's walk-up music fades the hype music out
  over 3 seconds first, then plays the announcement and walk-up music
  as normal. Pressing hype Play likewise fades out any walk-up music
  so the two never overlap.
- Hype playback is manual: it does not auto-start on inning changes.

## Version

versionCode 19 / 1.3.1-beta.14. No other gameplay changes.
